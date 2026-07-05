export type PlatformRole = 'SUPER_ADMIN' | 'SUPPORT' | 'ANALYST'

export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED'

export type AuditAction =
  | 'IMPERSONATE_START'
  | 'IMPERSONATE_END'
  | 'TENANT_RESEED'
  | 'TENANT_STATUS_CHANGE'
  | 'ROLE_GRANT'
  | 'ROLE_REVOKE'

export interface AuditEvent {
  id: string
  actorId: string
  actorEmail: string
  action: string
  targetType: string
  targetId: string
  tenantId: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface PlatformStats {
  tenants: number
  demoTenants: number
  facilities: number
  assets: number
  users: number
  activeAlerts: number
  criticalAlerts: number
}

export interface TenantOverview {
  id: string
  name: string
  slug: string
  industry: string
  plan: string
  status: TenantStatus
  isDemo: boolean
  createdAt: string
  counts: {
    users: number
    facilities: number
    assets: number
    activeAlerts: number
  }
}
