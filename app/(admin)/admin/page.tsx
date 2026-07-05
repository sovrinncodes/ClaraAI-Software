import type { Metadata } from 'next'
import { adminGetPlatformStats } from '@/lib/db/queries/admin/stats'
import { adminListTenantOverviews } from '@/lib/db/queries/admin/tenants'
import { PlatformKpiRow } from '@/components/admin/platform-kpi-row'
import { TenantTable } from '@/components/admin/tenant-table'
import type { TenantOverview } from '@/types/admin'

export const metadata: Metadata = { title: 'Overview' }
export const dynamic = 'force-dynamic'

export default async function AdminOverviewPage() {
  const [stats, tenants] = await Promise.all([
    adminGetPlatformStats(),
    adminListTenantOverviews(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Platform Overview
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          All tenants, facilities, and alerts across Clara AI.
        </p>
      </div>

      <PlatformKpiRow stats={stats} />

      <TenantTable tenants={tenants as TenantOverview[]} />
    </div>
  )
}
