import { prisma } from '@/lib/db/client'

export interface TenantUsageRow {
  tenantId: string
  tenantName: string
  isDemo: boolean
  facilities: number
  assetsMonitored: number
  alertsGenerated: number
  reportsGenerated: number
  lastActivityAt: string | null
}

/**
 * Per-tenant usage summary for the platform analytics page.
 * "Last activity" is the most recent alert timestamp — the closest signal
 * to live tenant activity available without telemetry ingestion (Phase 2).
 */
export async function adminGetTenantUsage(): Promise<TenantUsageRow[]> {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { facilities: true, assets: true, alerts: true, esgReports: true } },
    },
  })

  const lastAlerts = await prisma.alert.groupBy({
    by: ['tenantId'],
    _max: { createdAt: true },
  })
  const lastActivityByTenant = new Map(
    lastAlerts.map((row) => [row.tenantId, row._max.createdAt])
  )

  return tenants.map((tenant) => ({
    tenantId: tenant.id,
    tenantName: tenant.name,
    isDemo: tenant.isDemo,
    facilities: tenant._count.facilities,
    assetsMonitored: tenant._count.assets,
    alertsGenerated: tenant._count.alerts,
    reportsGenerated: tenant._count.esgReports,
    lastActivityAt: lastActivityByTenant.get(tenant.id)?.toISOString() ?? null,
  }))
}

export interface AlertVolumePoint {
  date: string
  count: number
}

/** Daily alert volume across the platform for the last N days — the trend line. */
export async function adminGetAlertVolumeTrend(days = 14): Promise<AlertVolumePoint[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const alerts = await prisma.alert.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  })

  const counts = new Map<string, number>()
  for (let i = 0; i < days; i++) {
    const d = new Date(since)
    d.setDate(d.getDate() + i)
    counts.set(d.toISOString().slice(0, 10), 0)
  }
  for (const alert of alerts) {
    const key = alert.createdAt.toISOString().slice(0, 10)
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }))
}
