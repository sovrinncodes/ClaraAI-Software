import { prisma } from '@/lib/db/client'
import type { FacilityStatus, FacilityType, Prisma } from '@prisma/client'

export interface FacilityFilters {
  status?: FacilityStatus
  type?: FacilityType
  search?: string
}

export async function getFacilities(tenantId: string, filters: FacilityFilters = {}) {
  const where: Prisma.FacilityWhereInput = {
    tenantId,
    ...(filters.status && { status: filters.status }),
    ...(filters.type && { type: filters.type }),
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { externalId: { contains: filters.search, mode: 'insensitive' } },
        { city: { contains: filters.search, mode: 'insensitive' } },
      ],
    }),
  }

  return prisma.facility.findMany({
    where,
    include: {
      _count: { select: { assets: true, alerts: true } },
    },
    orderBy: { name: 'asc' },
  })
}

export async function getFacilityById(tenantId: string, facilityId: string) {
  return prisma.facility.findFirst({
    where: { tenantId, id: facilityId },
    include: {
      assets: {
        orderBy: { externalId: 'asc' },
      },
      alerts: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      _count: { select: { assets: true } },
    },
  })
}
