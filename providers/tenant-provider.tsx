'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { TenantContext } from '@/types/tenant'

const TenantCtx = createContext<TenantContext | null>(null)

interface TenantProviderProps {
  value: TenantContext
  children: ReactNode
}

export function TenantProvider({ value, children }: TenantProviderProps) {
  return <TenantCtx.Provider value={value}>{children}</TenantCtx.Provider>
}

export function useTenantContext(): TenantContext {
  const ctx = useContext(TenantCtx)
  if (!ctx) throw new Error('useTenantContext must be used within TenantProvider')
  return ctx
}
