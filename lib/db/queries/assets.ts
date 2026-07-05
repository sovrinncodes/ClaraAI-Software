import { prisma } from '@/lib/db/client'
import type { AssetType, Prisma } from '@prisma/client'

export interface AssetFilters {
  facilityId?: string
  type?: AssetType
  isCritical?: boolean
  minHealthScore?: number
  maxHealthScore?: number
  search?: string
}

export async function getAssets(tenantId: string, filters: AssetFilters = {}) {
  const where: Prisma.AssetWhereInput = {
    tenantId,
    ...(filters.facilityId && { facilityId: filters.facilityId }),
    ...(filters.type && { type: filters.type }),
    ...(filters.isCritical !== undefined && { isCritical: filters.isCritical }),
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { externalId: { contains: filters.search, mode: 'insensitive' } },
      ],
    }),
  }

  return prisma.asset.findMany({
    where,
    include: {
      healthScores: {
        orderBy: { recordedAt: 'desc' },
        take: 1,
      },
      _count: { select: { alerts: true } },
    },
    orderBy: { externalId: 'asc' },
  })
}

export async function getAssetById(tenantId: string, assetId: string) {
  return prisma.asset.findFirst({
    where: { tenantId, id: assetId },
    include: {
      facility: true,
      healthScores: {
        orderBy: { recordedAt: 'desc' },
        take: 96, // 7 days at 15-min intervals
      },
      alerts: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })
}

// Returns assets needing attention: health < 85 or active alert
export async function getWatchlistAssets(tenantId: string) {
  return prisma.asset.findMany({
    where: {
      tenantId,
      OR: [
        {
          healthScores: {
            some: {
              score: { lt: 85 },
              recordedAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
              },
            },
          },
        },
        {
          alerts: {
            some: { status: 'ACTIVE' },
          },
        },
      ],
    },
    include: {
      facility: { select: { name: true } },
      healthScores: {
        orderBy: { recordedAt: 'desc' },
        take: 1,
      },
      alerts: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: [
      { isCritical: 'desc' },
      { externalId: 'asc' },
    ],
  })
}
