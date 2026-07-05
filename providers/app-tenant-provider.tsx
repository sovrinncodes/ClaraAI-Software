'use client'

import { TenantProvider } from '@/providers/tenant-provider'
import type { TenantContext } from '@/types/tenant'

const SYNTHETIC_TENANT: TenantContext = {
  tenantId: 'tenant_cpt',
  tenantName: 'Sovrinn',
  plan: 'enterprise',
  userId: 'user_demo',
  userRole: 'TENANT_ADMIN',
  userEmail: 'demo@claraai.com',
}

export function AppTenantProvider({ children }: { children: React.ReactNode }) {
  const isSynthetic = process.env.NEXT_PUBLIC_SYNTHETIC_MODE === 'true'

  return (
    <TenantProvider value={SYNTHETIC_TENANT}>
      {children}
    </TenantProvider>
  )
}
