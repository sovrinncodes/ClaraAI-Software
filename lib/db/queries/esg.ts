import { prisma } from '@/lib/db/client'
import type { ReportFramework } from '@prisma/client'

// ─── ESG Reports ──────────────────────────────────────────────────────────────

export async function getEsgReports(
  tenantId: string,
  facilityId?: string,
  limit = 50,
) {
  return prisma.esgReport.findMany({
    where: {
      tenantId,
      ...(facilityId && { facilityId }),
    },
    include: {
      facility: { select: { name: true, externalId: true } },
    },
    orderBy: { generatedAt: 'desc' },
    take: limit,
  })
}

export async function getEsgReportById(tenantId: string, reportId: string) {
  return prisma.esgReport.findFirst({
    where: { tenantId, id: reportId },
    include: {
      facility: true,
      tenant: { select: { name: true, slug: true } },
    },
  })
}

export async function createEsgReport(data: {
  tenantId: string
  facilityId: string
  framework: ReportFramework
  periodStart: Date
  periodEnd: Date
  totalKwh: number
  scope1Tco2e: number
  scope2Tco2e: number
  scope3Tco2e?: number
  pueAverage?: number
  dataCompletePct: number
  reportName?: string
  status?: string
  payload?: object
}) {
  return prisma.esgReport.create({ data })
}

export async function updateEsgReportStatus(
  tenantId: string,
  reportId: string,
  status: 'ready' | 'failed',
  payload?: object,
) {
  return prisma.esgReport.updateMany({
    where: { tenantId, id: reportId },
    data: { status, ...(payload && { payload }) },
  })
}

// ─── ESG Scores ───────────────────────────────────────────────────────────────

export async function getLatestEsgScore(tenantId: string, facilityId?: string) {
  return prisma.esgScore.findFirst({
    where: {
      tenantId,
      facilityId: facilityId ?? null,
    },
    orderBy: { recordedAt: 'desc' },
  })
}

export async function getEsgScoreTrend(
  tenantId: string,
  facilityId?: string,
  days = 30,
) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return prisma.esgScore.findMany({
    where: {
      tenantId,
      facilityId: facilityId ?? null,
      recordedAt: { gte: since },
    },
    select: { recordedAt: true, compositeScore: true },
    orderBy: { recordedAt: 'asc' },
  })
}

export async function upsertEsgScore(data: {
  tenantId: string
  facilityId: string | null
  compositeScore: number
  energyDimScore: number
  carbonDimScore: number
  equipmentDimScore?: number
  renewableDimScore: number
  waterDimScore: number
  reportingDimScore: number
  scope1Tco2e?: number
  scope2Tco2e?: number
  scope3Tco2e?: number
  renewablePct?: number
  pueAverage?: number
  totalKwh?: number
  periodStart: Date
  periodEnd: Date
}) {
  return prisma.esgScore.create({ data })
}

// ─── Asset Health Summary (for Equipment Sustainability dimension) ─────────────

export interface AssetHealthRow {
  assetId: string
  healthScore: number
  operatingLoad: number | null
  isCritical: boolean
}

export async function getAssetHealthSummary(
  tenantId: string,
  facilityIds: string[],
): Promise<AssetHealthRow[]> {
  const assets = await prisma.asset.findMany({
    where: {
      tenantId,
      facilityId: { in: facilityIds },
    },
    select: {
      id: true,
      isCritical: true,
      healthScores: {
        orderBy: { recordedAt: 'desc' },
        take: 1,
        select: { score: true, operatingLoad: true },
      },
    },
  })

  return assets
    .filter((a: any) => a.healthScores.length > 0)
    .map((a: any) => ({
      assetId: a.id,
      healthScore: a.healthScores[0].score,
      operatingLoad: a.healthScores[0].operatingLoad,
      isCritical: a.isCritical,
    }))
}

// ─── Energy Baselines ─────────────────────────────────────────────────────────

export async function getEnergyBaselines(
  tenantId: string,
  facilityId: string,
  periodStart: Date,
  periodEnd: Date,
) {
  return prisma.energyBaseline.findMany({
    where: {
      tenantId,
      facilityId,
      recordedAt: { gte: periodStart, lte: periodEnd },
    },
    orderBy: { recordedAt: 'asc' },
  })
}

export async function getEnergyBaselineSummary(
  tenantId: string,
  facilityId: string,
  periodStart: Date,
  periodEnd: Date,
) {
  const records = await getEnergyBaselines(tenantId, facilityId, periodStart, periodEnd)

  const totalActual = records.reduce((s: number, r: any) => s + r.actualKwh, 0)
  const totalBaseline = records.reduce((s: number, r: any) => s + r.baselineKwh, 0)
  const anomalyCount = records.filter((r: any) => r.anomalyFlag).length

  return {
    totalActualKwh: totalActual,
    totalBaselineKwh: totalBaseline,
    overallDeviationPct:
      totalBaseline > 0 ? ((totalActual - totalBaseline) / totalBaseline) * 100 : 0,
    anomalyCount,
    recordCount: records.length,
  }
}

// ─── Water Usage ──────────────────────────────────────────────────────────────

export async function getWaterUsage(
  tenantId: string,
  facilityId: string,
  periodStart: Date,
  periodEnd: Date,
) {
  return prisma.waterUsage.findMany({
    where: {
      tenantId,
      facilityId,
      periodStart: { gte: periodStart },
      periodEnd: { lte: periodEnd },
    },
    orderBy: { recordedAt: 'desc' },
  })
}

export async function getPortfolioWaterTotal(tenantId: string, periodStart: Date, periodEnd: Date) {
  const records = await prisma.waterUsage.findMany({
    where: {
      tenantId,
      periodStart: { gte: periodStart },
      periodEnd: { lte: periodEnd },
    },
    select: { usageKl: true },
  })
  return records.reduce((s: number, r: any) => s + r.usageKl, 0)
}

// ─── Portfolio KPIs (dashboard ESG card) ─────────────────────────────────────

export interface PortfolioEsgKpis {
  scope1Tco2e: number
  scope2Tco2e: number
  scope3Tco2e: number
  renewablePct: number
  waterUsageKl: number
  esgScore: number | null
  dataAsOf: Date | null
}

// Returns cross-facility kWh saved MTD (sum of intervals where actual < baseline).
export async function getPortfolioEnergySavingsMtd(
  tenantId: string,
  periodStart: Date,
  periodEnd: Date,
) {
  const rows = await prisma.energyBaseline.findMany({
    where: {
      tenantId,
      recordedAt: { gte: periodStart, lte: periodEnd },
    },
    select: { actualKwh: true, baselineKwh: true },
  })

  const savedKwh = rows.reduce((sum: number, r: any) => {
    const saved = r.baselineKwh - r.actualKwh
    return sum + (saved > 0 ? saved : 0)
  }, 0)

  return Math.round(savedKwh * 10) / 10
}

export async function getPortfolioEsgKpis(
  tenantId: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<PortfolioEsgKpis> {
  const [latestScore, waterTotal, recentReports] = await Promise.all([
    getLatestEsgScore(tenantId),
    getPortfolioWaterTotal(tenantId, periodStart, periodEnd),
    prisma.esgReport.findMany({
      where: {
        tenantId,
        periodStart: { gte: periodStart },
        periodEnd: { lte: periodEnd },
        status: 'ready',
      },
      select: {
        scope1Tco2e: true,
        scope2Tco2e: true,
        scope3Tco2e: true,
        pueAverage: true,
      },
    }),
  ])

  return {
    scope1Tco2e: recentReports.reduce((s: number, r: any) => s + r.scope1Tco2e, 0),
    scope2Tco2e: recentReports.reduce((s: number, r: any) => s + r.scope2Tco2e, 0),
    scope3Tco2e: recentReports.reduce((s: number, r: any) => s + (r.scope3Tco2e ?? 0), 0),
    renewablePct: latestScore?.renewablePct ?? 0,
    waterUsageKl: waterTotal,
    esgScore: latestScore?.compositeScore ?? null,
    dataAsOf: latestScore?.recordedAt ?? null,
  }
}
