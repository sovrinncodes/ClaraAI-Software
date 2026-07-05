import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { calcTotalEmissions, calcEnergyMetrics } from '@/lib/esg/calculators'
import { computeEsgScore } from '@/lib/esg/score-engine'
import {
  getLatestEsgScore,
  getWaterUsage,
  upsertEsgScore,
  getAssetHealthSummary,
} from '@/lib/db/queries/esg'
import { extractTenantFromHeaders } from '@/lib/utils/tenant'
import { esgScoreQuerySchema } from '@/lib/validation/schemas'
import type { AssetHealthInput, EnergyConsumptionInput, WaterUsageInput } from '@/types/esg'

// GET /api/esg/score?facilityId=...&refresh=true
// tenantId is derived from the authenticated session header — never trusted from the client.

export async function GET(request: NextRequest) {
  const tenantId = extractTenantFromHeaders(request.headers)
  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const queryParsed = esgScoreQuerySchema.safeParse({
    facilityId: searchParams.get('facilityId') ?? undefined,
    refresh: searchParams.get('refresh') ?? undefined,
  })

  if (!queryParsed.success) {
    return NextResponse.json(
      { success: false, error: queryParsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const facilityId = queryParsed.data.facilityId
  const refresh = queryParsed.data.refresh === 'true'

  // Return cached score unless refresh requested
  if (!refresh) {
    const cached = await getLatestEsgScore(tenantId, facilityId)
    if (cached) {
      return NextResponse.json({ success: true, data: cached })
    }
  }

  // ── Compute fresh score ───────────────────────────────────────────────────

  const now = new Date()
  const periodEnd = now
  const periodStart = new Date(now.getFullYear(), 0, 1) // YTD

  // Pull facilities in scope
  const facilities = await prisma.facility.findMany({
    where: { tenantId, ...(facilityId && { id: facilityId }) },
    select: {
      id: true,
      country: true,
      region: true,
      totalAreaSqm: true,
      type: true,
      energyBaselines: {
        where: { recordedAt: { gte: periodStart, lte: periodEnd } },
        select: { actualKwh: true, baselineKwh: true },
      },
    },
  })

  if (facilities.length === 0) {
    return NextResponse.json({ success: false, error: 'No facilities found' }, { status: 404 })
  }

  // Aggregate energy across all in-scope facilities
  const energyInputs: EnergyConsumptionInput[] = facilities.map((f: any) => {
    const totalKwh = f.energyBaselines.reduce((s: number, b: any) => s + b.actualKwh, 0)
    const renewableKwh = totalKwh * 0.425 // 42.5% renewable (seed assumption)
    return {
      facilityId: f.id,
      totalKwh: totalKwh || defaultEnergyKwh(f.type),
      renewableKwh,
      periodStart,
      periodEnd,
    }
  })

  // Water usage
  const waterRecords = await Promise.all(
    facilities.map((f: any) => getWaterUsage(tenantId, f.id, periodStart, periodEnd)),
  )

  const waterInputs: WaterUsageInput[] = waterRecords.flat().map((w: any) => ({
    facilityId: w.facilityId,
    usageKl: w.usageKl,
    source: (w.source ?? 'municipal') as WaterUsageInput['source'],
    periodStart: w.periodStart,
    periodEnd: w.periodEnd,
  }))

  // Asset health data for Equipment Sustainability dimension
  const facilityIds = facilities.map((f: any) => f.id)
  const assetHealthRows = await getAssetHealthSummary(tenantId, facilityIds)
  const assetHealthInputs: AssetHealthInput[] = assetHealthRows.map((r: any) => ({
    assetId: r.assetId,
    healthScore: r.healthScore,
    operatingLoad: r.operatingLoad,
    isCritical: r.isCritical,
  }))

  const primaryFacility = facilities[0]
  const country = primaryFacility.country ?? 'ZA'
  const region = primaryFacility.region ?? undefined

  const emissions = calcTotalEmissions({
    energyInputs,
    fuelInputs: [],        // Phase 2: pull from asset metadata
    refrigerantInputs: [], // Phase 2: pull from asset refrigerant events
    waterInputs,
    country,
    region,
  })

  // Average PUE across data centre facilities (seed value; replace with Timestream avg)
  const dcFacilities = facilities.filter((f: any) => f.type === 'DATA_CENTER')
  const pueRatio = dcFacilities.length > 0 ? 1.24 : null

  const totalAreaSqm = facilities.reduce((s: number, f: any) => s + (f.totalAreaSqm ?? 0), 0)

  const metrics = calcEnergyMetrics(
    energyInputs,
    totalAreaSqm > 0 ? totalAreaSqm : null,
    pueRatio,
    null, // WUE: Phase 2 from water meter integration
  )

  const scoreResult = computeEsgScore({
    tenantId,
    facilityId: facilityId ?? null,
    metrics,
    emissions,
    yoyImprovementPct: -4.2, // seed: -4.2% Scope 1 vs prior year
    dataCompletePct: 87,
    assetHealthInputs,
    periodStart,
    periodEnd,
  })

  // Persist
  await upsertEsgScore({
    tenantId,
    facilityId: facilityId ?? null,
    compositeScore: scoreResult.compositeScore,
    energyDimScore: scoreResult.dimensions.find((d: any) => d.dimension === 'energy_efficiency')?.score ?? 0,
    carbonDimScore: scoreResult.dimensions.find((d: any) => d.dimension === 'carbon_performance')?.score ?? 0,
    equipmentDimScore: scoreResult.dimensions.find((d: any) => d.dimension === 'equipment_sustainability')?.score ?? 0,
    renewableDimScore: scoreResult.dimensions.find((d: any) => d.dimension === 'renewable_mix')?.score ?? 0,
    waterDimScore: scoreResult.dimensions.find((d: any) => d.dimension === 'water_efficiency')?.score ?? 0,
    reportingDimScore: scoreResult.dimensions.find((d: any) => d.dimension === 'operational_reliability')?.score ?? 0,
    scope1Tco2e: emissions.scope1Tco2e,
    scope2Tco2e: emissions.scope2Tco2e,
    scope3Tco2e: emissions.scope3Tco2e,
    renewablePct: metrics.renewablePct,
    pueAverage: pueRatio ?? undefined,
    totalKwh: metrics.totalKwh,
    periodStart,
    periodEnd,
  })

  return NextResponse.json({ success: true, data: scoreResult })
}

// ─── Synthetic energy fallback (PoC seed data) ────────────────────────────────

function defaultEnergyKwh(facilityType: string): number {
  const map: Record<string, number> = {
    DATA_CENTER:   15_768_000,    // 1.8MW × 8760h
    MANUFACTURING: 36_792_000,    // 4.2MW × 8760h
    COMMERCIAL:     5_606_400,    // 640kW × 8760h
    LOGISTICS:      7_358_400,    // 840kW × 8760h
  }
  return map[facilityType] ?? 10_000_000
}
