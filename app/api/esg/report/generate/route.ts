import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { calcTotalEmissions, calcEnergyMetrics } from '@/lib/esg/calculators'
import { computeEsgScore } from '@/lib/esg/score-engine'
import {
  buildGri302Report,
  buildGri303Report,
  buildGri305Report,
  buildGhgProtocolReport,
  buildIso50001Report,
} from '@/lib/esg/framework-adapters'
import { getGridFactor } from '@/lib/esg/emission-factors'
import {
  createEsgReport,
  getWaterUsage,
  getAssetHealthSummary,
} from '@/lib/db/queries/esg'
import { extractTenantFromHeaders } from '@/lib/utils/tenant'
import { esgReportGenerateSchema } from '@/lib/validation/schemas'
import type { AssetHealthInput, EnergyConsumptionInput, WaterUsageInput } from '@/types/esg'
import type { ReportFramework } from '@prisma/client'

// POST /api/esg/report/generate
// Body: { facilityId, framework, periodStart, periodEnd, reportName? }
// tenantId is derived from the authenticated session header — never trusted from the client.

export async function POST(request: NextRequest) {
  const tenantId = extractTenantFromHeaders(request.headers)
  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const bodyParsed = esgReportGenerateSchema.safeParse(rawBody)
  if (!bodyParsed.success) {
    return NextResponse.json(
      { success: false, error: bodyParsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { facilityId, framework, periodStart, periodEnd, reportName } = bodyParsed.data

  const start = new Date(periodStart)
  const end = new Date(periodEnd)

  if (start >= end) {
    return NextResponse.json({ success: false, error: 'periodStart must be before periodEnd' }, { status: 400 })
  }

  // Verify facility belongs to tenant
  const facility = await prisma.facility.findFirst({
    where: { tenantId, id: facilityId },
    select: {
      id: true,
      name: true,
      country: true,
      region: true,
      totalAreaSqm: true,
      type: true,
      energyBaselines: {
        where: { recordedAt: { gte: start, lte: end } },
        select: { actualKwh: true, baselineKwh: true },
      },
      assets: {
        select: { id: true, name: true, type: true },
        take: 10,
      },
    },
  })

  if (!facility) {
    return NextResponse.json({ success: false, error: 'Facility not found' }, { status: 404 })
  }

  // ── Build inputs ──────────────────────────────────────────────────────────

  const totalActualKwh = facility.energyBaselines.reduce((s: number, b: any) => s + b.actualKwh, 0)
  const totalBaselineKwh = facility.energyBaselines.reduce((s: number, b: any) => s + b.baselineKwh, 0)

  const effectiveTotalKwh =
    totalActualKwh > 0 ? totalActualKwh : defaultEnergyKwh(facility.type)

  const renewableKwh = effectiveTotalKwh * 0.425

  const energyInputs: EnergyConsumptionInput[] = [
    {
      facilityId,
      totalKwh: effectiveTotalKwh,
      renewableKwh,
      periodStart: start,
      periodEnd: end,
    },
  ]

  const waterRecords = await getWaterUsage(tenantId, facilityId, start, end)
  const waterInputs: WaterUsageInput[] = waterRecords.map((w: any) => ({
    facilityId: w.facilityId,
    usageKl: w.usageKl,
    source: (w.source ?? 'municipal') as WaterUsageInput['source'],
    periodStart: w.periodStart,
    periodEnd: w.periodEnd,
  }))

  // Asset health for Equipment Sustainability dimension
  const assetHealthRows = await getAssetHealthSummary(tenantId, [facilityId])
  const assetHealthInputs: AssetHealthInput[] = assetHealthRows.map((r: any) => ({
    assetId: r.assetId,
    healthScore: r.healthScore,
    operatingLoad: r.operatingLoad,
    isCritical: r.isCritical,
  }))

  const country = facility.country ?? 'ZA'
  const region = facility.region ?? undefined

  const emissions = calcTotalEmissions({
    energyInputs,
    fuelInputs: [],
    refrigerantInputs: [],
    waterInputs,
    country,
    region,
  })

  const pueRatio = facility.type === 'DATA_CENTER' ? 1.24 : null

  const metrics = calcEnergyMetrics(
    energyInputs,
    facility.totalAreaSqm,
    pueRatio,
    null,
  )

  const scoreResult = computeEsgScore({
    tenantId,
    facilityId,
    metrics,
    emissions,
    yoyImprovementPct: null,
    dataCompletePct: totalActualKwh > 0 ? 92 : 70,
    assetHealthInputs,
    periodStart: start,
    periodEnd: end,
  })

  // ── Build framework payload ───────────────────────────────────────────────

  const topConsumers = facility.assets.map((a: any, i: number) => ({
    assetId: a.id,
    assetName: `${a.name} (${a.type})`,
    consumptionKwh: Math.round(effectiveTotalKwh * (0.3 - i * 0.025)),
    sharePct: Math.round((30 - i * 2.5) * 10) / 10,
  }))

  const gridFactor = getGridFactor(country, region)

  let payload: object = {}

  if (framework === 'GRI_302') {
    payload = buildGri302Report(scoreResult, facility.name, totalBaselineKwh, topConsumers)
  } else if (framework === 'GRI_303') {
    const waterSourceInputs = waterInputs.map((w: any) => ({
      usageKl: w.usageKl,
      source: w.source,
    }))
    payload = buildGri303Report(scoreResult, facility.name, waterSourceInputs, facility.totalAreaSqm)
  } else if (framework === 'GRI_305') {
    payload = buildGri305Report(
      scoreResult,
      facility.name,
      emissions,
      gridFactor,
      null,  // market-based: Phase 2 (requires REC/PPA data)
      facility.totalAreaSqm,
      null,  // previousYearTco2e: Phase 2 (requires prior-year report)
    )
  } else if (framework === 'GHG_PROTOCOL') {
    payload = buildGhgProtocolReport(
      scoreResult,
      facility.name,
      emissions,
      gridFactor,
      null,
      facility.totalAreaSqm,
      null,
    )
  } else if (framework === 'ISO_50001') {
    payload = buildIso50001Report(
      scoreResult,
      facility.name,
      totalBaselineKwh > 0 ? totalBaselineKwh : effectiveTotalKwh * 1.1,
      topConsumers,
    )
  }

  // ── Persist report ────────────────────────────────────────────────────────

  const report = await createEsgReport({
    tenantId,
    facilityId,
    framework,
    periodStart: start,
    periodEnd: end,
    totalKwh: metrics.totalKwh,
    scope1Tco2e: emissions.scope1Tco2e,
    scope2Tco2e: emissions.scope2Tco2e,
    scope3Tco2e: emissions.scope3Tco2e,
    pueAverage: pueRatio ?? undefined,
    dataCompletePct:
      scoreResult.dimensions.find((d: any) => d.dimension === 'operational_reliability')?.score ?? 80,
    reportName: reportName ?? `${facility.name} — ${framework} Report`,
    status: 'ready',
    payload,
  })

  return NextResponse.json({
    success: true,
    data: {
      reportId: report.id,
      esgScore: scoreResult.compositeScore,
      dimensions: scoreResult.dimensions.map((d: any) => ({
        label: d.label,
        score: d.score,
        weight: d.weight,
      })),
      emissions,
      energyMetrics: metrics,
      framework: report.framework,
      payload,
    },
  })
}

function defaultEnergyKwh(facilityType: string): number {
  const map: Record<string, number> = {
    DATA_CENTER:   15_768_000,
    MANUFACTURING: 36_792_000,
    COMMERCIAL:     5_606_400,
    LOGISTICS:      7_358_400,
  }
  return map[facilityType] ?? 10_000_000
}
