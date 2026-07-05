import { prisma } from '@/lib/db/client'
import type { Prisma } from '@prisma/client'

export interface AuditEventInput {
  actorId: string
  actorEmail: string
  action: string
  targetType: string
  targetId: string
  tenantId?: string
  metadata?: Record<string, unknown>
}

/** Every admin mutation and impersonation start/stop goes through here. */
export async function recordAuditEvent(input: AuditEventInput) {
  return prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      actorEmail: input.actorEmail,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      tenantId: input.tenantId ?? null,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  })
}

export interface AuditListFilters {
  action?: string
  tenantId?: string
  actorEmail?: string
  from?: Date
  to?: Date
  limit?: number
}

const DEFAULT_AUDIT_PAGE_SIZE = 50

export async function adminListAuditEvents(filters: AuditListFilters = {}) {
  return prisma.auditLog.findMany({
    where: {
      ...(filters.action && { action: filters.action }),
      ...(filters.tenantId && { tenantId: filters.tenantId }),
      ...(filters.actorEmail && { actorEmail: { contains: filters.actorEmail, mode: 'insensitive' } }),
      ...((filters.from || filters.to) && {
        createdAt: {
          ...(filters.from && { gte: filters.from }),
          ...(filters.to && { lte: filters.to }),
        },
      }),
    },
    orderBy: { createdAt: 'desc' },
    take: filters.limit ?? DEFAULT_AUDIT_PAGE_SIZE,
  })
}
