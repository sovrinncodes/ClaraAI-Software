import { prisma } from '@/lib/db/client'
import type { UserRole, PlatformRole } from '@prisma/client'

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  platformRole: true,
  isDisabled: true,
  createdAt: true,
  tenant: { select: { id: true, name: true, slug: true } },
} as const

export interface AdminUserFilters {
  search?: string
  tenantId?: string
}

export async function adminListUsers(filters: AdminUserFilters = {}) {
  return prisma.user.findMany({
    where: {
      ...(filters.tenantId && { tenantId: filters.tenantId }),
      ...(filters.search && {
        OR: [
          { email: { contains: filters.search, mode: 'insensitive' } },
          { name: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: [{ createdAt: 'asc' }],
    select: USER_SELECT,
  })
}

export interface AdminCreateUserInput {
  tenantId: string
  email: string
  name?: string
  role: UserRole
}

/**
 * Creates a user record directly (PoC — Cognito provisioning + SES invite
 * email land with Phase 6 auth work). cognitoSub gets a placeholder that the
 * Cognito sync replaces on first real login.
 */
export async function adminCreateUser(input: AdminCreateUserInput) {
  return prisma.user.create({
    data: {
      tenantId: input.tenantId,
      email: input.email,
      name: input.name ?? null,
      role: input.role,
      cognitoSub: `invited-${crypto.randomUUID()}`,
    },
    select: USER_SELECT,
  })
}

export interface AdminUpdateUserInput {
  role?: UserRole
  platformRole?: PlatformRole | null
  isDisabled?: boolean
}

export async function adminUpdateUser(userId: string, input: AdminUpdateUserInput) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.role !== undefined && { role: input.role }),
      ...(input.platformRole !== undefined && { platformRole: input.platformRole }),
      ...(input.isDisabled !== undefined && { isDisabled: input.isDisabled }),
    },
    select: USER_SELECT,
  })
}
