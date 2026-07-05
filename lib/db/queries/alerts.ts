import { prisma } from '@/lib/db/client'
import type { AlertSeverity, AlertStatus, Prisma } from '@prisma/client'

export interface AlertFilters {
  facilityId?: string
  assetId?: string
  severity?: AlertSeverity
  status?: AlertStatus
  limit?: number
}

export async function getAlerts(tenantId: string, filters: AlertFilters = {}) {
  const where: Prisma.AlertWhereInput = {
    tenantId,
    ...(filters.facilityId && { facilityId: filters.facilityId }),
    ...(filters.assetId && { assetId: filters.assetId }),
    ...(filters.severity && { severity: filters.severity }),
    ...(filters.status && { status: filters.status }),
  }

  return prisma.alert.findMany({
    where,
    include: {
      facility: { select: { name: true, externalId: true } },
      asset: { select: { name: true, externalId: true } },
    },
    orderBy: [
      { severity: 'asc' }, // CRITICAL sorts first (alphabetically it doesn't, handled in app layer)
      { createdAt: 'desc' },
    ],
    take: filters.limit ?? 50,
  })
}

export async function getActiveAlerts(tenantId: string) {
  return getAlerts(tenantId, { status: 'ACTIVE' })
}

export async function getCriticalAlerts(tenantId: string) {
  return getAlerts(tenantId, { severity: 'CRITICAL', status: 'ACTIVE' })
}

export async function acknowledgeAlert(tenantId: string, alertId: string) {
  return prisma.alert.update({
    where: { id: alertId, tenantId },
    data: {
      status: 'ACKNOWLEDGED',
      acknowledgedAt: new Date(),
      updatedAt: new Date(),
    },
  })
}

export async function resolveAlert(tenantId: string, alertId: string) {
  return prisma.alert.update({
    where: { id: alertId, tenantId },
    data: {
      status: 'RESOLVED',
      resolvedAt: new Date(),
      updatedAt: new Date(),
    },
  })
}

export interface AlertCounts {
  critical: number
  advisory: number
  watch: number
  total: number
}

export async function getAlertCounts(tenantId: string): Promise<AlertCounts> {
  const [critical, advisory, watch] = await Promise.all([
    prisma.alert.count({ where: { tenantId, severity: 'CRITICAL', status: 'ACTIVE' } }),
    prisma.alert.count({ where: { tenantId, severity: 'ADVISORY', status: 'ACTIVE' } }),
    prisma.alert.count({ where: { tenantId, severity: 'WATCH', status: 'ACTIVE' } }),
  ])
  return { critical, advisory, watch, total: critical + advisory + watch }
}
