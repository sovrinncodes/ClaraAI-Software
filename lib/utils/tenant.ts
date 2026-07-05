import type { TenantContext } from '@/types/tenant'

export function extractTenantFromHeaders(headers: Headers): string | null {
  return headers.get('x-tenant-id')
}

export function assertTenantContext(ctx: TenantContext | null): asserts ctx is TenantContext {
  if (!ctx) throw new Error('Tenant context not available')
}
