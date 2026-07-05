'use client'

import { useSession } from 'next-auth/react'
import type { TenantContext, UserRole } from '@/types/tenant'

export function useTenant(): TenantContext | null {
  const { data: session, status } = useSession()

  if (status !== 'authenticated' || !session?.user) return null

  return {
    tenantId: session.user.tenantId ?? '',
    tenantName: session.user.name ?? '',
    plan: 'enterprise',
    userId: session.user.id ?? '',
    userRole: (session.user.userRole ?? 'READ_ONLY') as UserRole,
    userEmail: session.user.email ?? '',
  }
}

export function useRequiredTenant(): TenantContext {
  const ctx = useTenant()
  if (!ctx) throw new Error('No authenticated tenant session')
  return ctx
}
