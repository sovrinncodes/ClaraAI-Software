import { headers } from 'next/headers'
import { AlertTriangle } from 'lucide-react'
import { ExitImpersonationButton } from '@/components/layout/exit-impersonation-button'

/**
 * Full-width amber banner shown while a staff member is viewing the app
 * as a tenant. Driven by headers set in proxy.ts from the signed cookie.
 */
export async function ImpersonationBanner() {
  const headerList = await headers()
  if (headerList.get('x-impersonating') !== 'true') return null

  const encodedName = headerList.get('x-impersonating-tenant-name')
  const tenantName = encodedName ? decodeURIComponent(encodedName) : 'tenant'

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-2 border-b shrink-0"
      style={{
        backgroundColor: 'rgba(245,166,35,0.12)',
        borderColor: 'rgba(245,166,35,0.35)',
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: 'var(--status-advisory)' }} />
        <span className="text-sm truncate" style={{ color: 'var(--status-advisory)' }}>
          <span className="font-semibold">Viewing as {tenantName}</span> — staff session, all
          actions affect this tenant&apos;s data
        </span>
      </div>
      <ExitImpersonationButton />
    </div>
  )
}
