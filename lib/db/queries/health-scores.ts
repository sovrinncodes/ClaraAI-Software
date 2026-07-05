import { prisma } from '@/lib/db/client'

export async function getLatestHealthScore(tenantId: string, assetId: string) {
  return prisma.healthScore.findFirst({
    where: { tenantId, assetId },
    orderBy: { recordedAt: 'desc' },
  })
}

export async function getHealthScoreHistory(
  tenantId: string,
  assetId: string,
  days = 7
) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  return prisma.healthScore.findMany({
    where: {
      tenantId,
      assetId,
      recordedAt: { gte: since },
    },
    orderBy: { recordedAt: 'asc' },
  })
}

export async function getPortfolioHealthIndex(tenantId: string): Promise<number> {
  const result = await prisma.healthScore.groupBy({
    by: ['assetId'],
    where: { tenantId },
    _max: { recordedAt: true },
  })

  if (result.length === 0) return 100

  // Get the latest score per asset then average
  const latestScores = await Promise.all(
    result.map(({ assetId }: any) =>
      prisma.healthScore.findFirst({
        where: { tenantId, assetId },
        orderBy: { recordedAt: 'desc' },
        select: { score: true },
      })
    )
  )

  const valid = latestScores.filter(Boolean).map((s: any) => s!.score)
  if (valid.length === 0) return 100
  return valid.reduce((sum: number, s: any) => sum + s, 0) / valid.length
}

export async function getEnergyBaselines(
  tenantId: string,
  facilityId: string,
  hours = 24
) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)

  return prisma.energyBaseline.findMany({
    where: {
      tenantId,
      facilityId,
      recordedAt: { gte: since },
    },
    orderBy: { recordedAt: 'asc' },
  })
}

// SA Eskom City Power industrial tariff (ZAR per kWh)
const TARIFF_ZAR_PER_KWH = 1.5
// SA DFFE 2023 national grid emission factor (kgCO2e/kWh)
const SA_GRID_FACTOR_KG_PER_KWH = 0.9006

export interface EnergyKpis {
  totalKwh: number
  peakDemandKw: number
  peakDemandAt: string | null
  carbonTco2e: number
  estimatedCostZar: number
  chart: Array<{
    recordedAt: string
    actualKwh: number
    baselineKwh: number
    deviationPct: number
    anomalyFlag: boolean
  }>
  anomalies: Array<{
    recordedAt: string
    actualKwh: number
    baselineKwh: number
    deviationPct: number
  }>
}

export async function getEnergyKpis(
  tenantId: string,
  facilityId: string,
  start: Date,
  end: Date
): Promise<EnergyKpis | null> {
  const rows = await prisma.energyBaseline.findMany({
    where: {
      tenantId,
      facilityId,
      recordedAt: { gte: start, lte: end },
    },
    orderBy: { recordedAt: 'asc' },
  })

  if (rows.length === 0) return null

  let totalKwh = 0
  let peakDemandKw = 0
  let peakDemandAt: string | null = null

  for (const row of rows) {
    totalKwh += row.actualKwh
    // Each row is a 15-min interval; kW = kWh / 0.25h
    const kw = row.actualKwh / 0.25
    if (kw > peakDemandKw) {
      peakDemandKw = kw
      peakDemandAt = row.recordedAt.toISOString()
    }
  }

  const carbonTco2e = (totalKwh * SA_GRID_FACTOR_KG_PER_KWH) / 1000
  const estimatedCostZar = totalKwh * TARIFF_ZAR_PER_KWH

  const chart = rows.map((r: any) => ({
    recordedAt: r.recordedAt.toISOString(),
    actualKwh: r.actualKwh,
    baselineKwh: r.baselineKwh,
    deviationPct: r.deviationPct,
    anomalyFlag: r.anomalyFlag,
  }))

  const anomalies = rows
    .filter((r: any) => r.anomalyFlag)
    .map((r: any) => ({
      recordedAt: r.recordedAt.toISOString(),
      actualKwh: r.actualKwh,
      baselineKwh: r.baselineKwh,
      deviationPct: r.deviationPct,
    }))

  return {
    totalKwh: Math.round(totalKwh * 10) / 10,
    peakDemandKw: Math.round(peakDemandKw * 10) / 10,
    peakDemandAt,
    carbonTco2e: Math.round(carbonTco2e * 10) / 10,
    estimatedCostZar: Math.round(estimatedCostZar),
    chart,
    anomalies,
  }
}
