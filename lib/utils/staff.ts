import type { PlatformRole } from '@/types/admin'

// Role hierarchy: higher rank includes the capabilities of lower ranks.
const ROLE_RANK: Record<PlatformRole, number> = {
  ANALYST: 1,
  SUPPORT: 2,
  SUPER_ADMIN: 3,
}

export function isPlatformRole(value: string | null | undefined): value is PlatformRole {
  return value === 'SUPER_ADMIN' || value === 'SUPPORT' || value === 'ANALYST'
}

export function extractPlatformRoleFromHeaders(headers: Headers): PlatformRole | null {
  const value = headers.get('x-platform-role')
  return isPlatformRole(value) ? value : null
}

export function hasPlatformRole(role: PlatformRole | null, minRole: PlatformRole): boolean {
  if (!role) return false
  return ROLE_RANK[role] >= ROLE_RANK[minRole]
}

/**
 * Server-side guard for /api/admin routes — independent of the proxy gate,
 * so the API stays safe even if proxy config drifts.
 * Returns the caller's role, or null when access must be denied.
 */
export function requirePlatformRole(headers: Headers, minRole: PlatformRole): PlatformRole | null {
  const role = extractPlatformRoleFromHeaders(headers)
  return hasPlatformRole(role, minRole) ? role : null
}

export interface StaffActor {
  id: string
  email: string
}

/** Identity used for audit attribution. Synthetic mode has no real user. */
export function getStaffActor(headers: Headers): StaffActor {
  return {
    id: headers.get('x-user-id') ?? 'synthetic',
    email: headers.get('x-user-email') ?? 'staff@synthetic.local',
  }
}
