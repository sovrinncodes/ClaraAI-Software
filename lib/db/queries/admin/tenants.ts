import { prisma } from '@/lib/db/client'
import type { Prisma, TenantStatus } from '@prisma/client'
import type { TenantFeatureFlags } from '@/types/admin'

export const DEFAULT_FEATURE_FLAGS: TenantFeatureFlags = {
  acousticMonitor: true,
  hotSpotTracker: true,
}

export function getTenantFeatureFlags(metadata: Prisma.JsonValue | null): TenantFeatureFlags {
  const flags =
    metadata && typeof metadata === 'object' && !Array.isArray(metadata)
      ? (metadata as Record<string, unknown>).featureFlags
      : undefined
  if (!flags || typeof flags !== 'object' || Array.isArray(flags)) return DEFAULT_FEATURE_FLAGS
  const record = flags as Record<string, unknown>
  return {
    acousticMonitor:
      typeof record.acousticMonitor === 'boolean'
        ? record.acousticMonitor
        : DEFAULT_FEATURE_FLAGS.acousticMonitor,
    hotSpotTracker:
      typeof record.hotSpotTracker === 'boolean'
        ? record.hotSpotTracker
        : DEFAULT_FEATURE_FLAGS.hotSpotTracker,
  }
}

// Staff-only cross-tenant queries. This directory is the ONLY place allowed
// to query without a tenantId scope — never import from tenant-facing code.

export async function adminListTenantOverviews() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { users: true, facilities: true, assets: true } },
    },
  })

  const activeAlertCounts = await prisma.alert.groupBy({
    by: ['tenantId'],
    where: { status: 'ACTIVE' },
    _count: { _all: true },
  })
  const alertsByTenant = new Map(activeAlertCounts.map((row) => [row.tenantId, row._count._all]))

  return tenants.map((tenant) => ({
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    industry: tenant.industry,
    plan: tenant.plan,
    status: tenant.status,
    isDemo: tenant.isDemo,
    createdAt: tenant.createdAt.toISOString(),
    counts: {
      users: tenant._count.users,
      facilities: tenant._count.facilities,
      assets: tenant._count.assets,
      activeAlerts: alertsByTenant.get(tenant.id) ?? 0,
    },
  }))
}

export async function adminGetTenantDetail(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      users: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          platformRole: true,
          createdAt: true,
        },
      },
      facilities: {
        orderBy: { name: 'asc' },
        include: { _count: { select: { assets: true } } },
      },
    },
  })
  if (!tenant) return null

  const recentAlerts = await prisma.alert.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      facility: { select: { name: true, externalId: true } },
      asset: { select: { externalId: true } },
    },
  })

  const activeAlerts = await prisma.alert.count({ where: { tenantId, status: 'ACTIVE' } })

  return { tenant, recentAlerts, activeAlerts }
}

export async function adminUpdateTenantStatus(tenantId: string, status: TenantStatus) {
  return prisma.tenant.update({
    where: { id: tenantId },
    data: { status },
  })
}

export interface AdminCreateTenantInput {
  name: string
  slug: string
  industry: string
  plan: string
}

/** Creates an empty (non-demo) tenant — real customer onboarding. */
export async function adminCreateTenant(input: AdminCreateTenantInput) {
  return prisma.tenant.create({
    data: { ...input, isDemo: false },
  })
}

export interface AdminTenantSettingsInput {
  plan?: string
  featureFlags?: TenantFeatureFlags
}

export async function adminUpdateTenantSettings(tenantId: string, input: AdminTenantSettingsInput) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) return null

  const existingMetadata =
    tenant.metadata && typeof tenant.metadata === 'object' && !Array.isArray(tenant.metadata)
      ? (tenant.metadata as Record<string, unknown>)
      : {}

  return prisma.tenant.update({
    where: { id: tenantId },
    data: {
      ...(input.plan !== undefined && { plan: input.plan }),
      ...(input.featureFlags !== undefined && {
        metadata: { ...existingMetadata, featureFlags: input.featureFlags } as Prisma.InputJsonValue,
      }),
    },
  })
}
