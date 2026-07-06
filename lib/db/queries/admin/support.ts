import { prisma } from '@/lib/db/client'
import type { AlertStatus } from '@prisma/client'

/**
 * Support tool: change an alert's status on behalf of a tenant.
 * Cross-tenant by design — caller must audit via recordAuditEvent.
 */
export async function adminUpdateAlertStatus(alertId: string, status: AlertStatus) {
  const timestamps =
    status === 'RESOLVED' || status === 'FALSE_POSITIVE'
      ? { resolvedAt: new Date() }
      : status === 'ACKNOWLEDGED'
        ? { acknowledgedAt: new Date() }
        : {}

  return prisma.alert.update({
    where: { id: alertId },
    data: { status, ...timestamps },
    select: {
      id: true,
      tenantId: true,
      status: true,
      title: true,
      severity: true,
    },
  })
}
