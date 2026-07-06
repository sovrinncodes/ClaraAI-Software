export type PlatformRole = 'SUPER_ADMIN' | 'SUPPORT' | 'ANALYST'

export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED'

export type AuditAction =
  | 'IMPERSONATE_START'
  | 'IMPERSONATE_END'
  | 'TENANT_RESEED'
  | 'TENANT_CLONE'
  | 'TENANT_CREATE'
  | 'TENANT_STATUS_CHANGE'
  | 'TENANT_SETTINGS_CHANGE'
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'ROLE_GRANT'
  | 'ROLE_REVOKE'
  | 'ALERT_STATUS_CHANGE'

// Type alias (not interface) so it satisfies Prisma's InputJsonValue index signature
export type TenantFeatureFlags = {
  acousticMonitor: boolean
  hotSpotTracker: boolean
}

export interface AdminUserRow {
  id: string
  email: string
  name: string | null
  role: 'TENANT_ADMIN' | 'FACILITY_MANAGER' | 'READ_ONLY'
  platformRole: PlatformRole | null
  isDisabled: boolean
  createdAt: string
  tenant: { id: string; name: string; slug: string }
}

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
