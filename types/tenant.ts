export type UserRole = 'TENANT_ADMIN' | 'FACILITY_MANAGER' | 'READ_ONLY'

export interface TenantContext {
  tenantId: string
  tenantName: string
  plan: string
  userId: string
  userRole: UserRole
  userEmail: string
}
