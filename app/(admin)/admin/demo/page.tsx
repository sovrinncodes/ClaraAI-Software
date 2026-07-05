import type { Metadata } from 'next'
import Link from 'next/link'
import { Radio } from 'lucide-react'
import { adminListTenantOverviews } from '@/lib/db/queries/admin/tenants'
import { ReseedButton, CloneTenantForm } from '@/components/admin/demo-controls'
import { ViewAsButton } from '@/components/admin/view-as-button'
import { TenantStatusBadge } from '@/components/admin/tenant-badges'
import type { TenantStatus } from '@/types/admin'

export const metadata: Metadata = { title: 'Demo Control' }
export const dynamic = 'force-dynamic'

export default async function AdminDemoPage() {
  const tenants = await adminListTenantOverviews()
  const demoTenants = tenants.filter((tenant) => tenant.isDemo)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Demo Control
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Reset demo tenants before investor sessions, or spin up a fresh one from the template.
        </p>
      </div>

      {/* Demo tenants */}
      <div
        className="rounded-[10px] border"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
      >
        <div
          className="px-4 py-3 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <span
            className="text-[10px] font-medium uppercase tracking-widest"
            style={{ color: 'var(--text-secondary)' }}
          >
            Demo Tenants
          </span>
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            {demoTenants.length}
          </span>
        </div>
        <ul>
          {demoTenants.map((tenant) => (
            <li
              key={tenant.id}
              className="px-4 py-3 border-t first:border-t-0 flex items-center justify-between gap-3 flex-wrap"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/tenants/${tenant.id}`}
                    className="text-sm font-medium hover:underline"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {tenant.name}
                  </Link>
                  <TenantStatusBadge status={tenant.status as TenantStatus} />
                </div>
                <p className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {tenant.counts.facilities} facilities · {tenant.counts.assets} assets ·{' '}
                  {tenant.counts.activeAlerts} active alerts
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ViewAsButton
                  tenantId={tenant.id}
                  tenantName={tenant.name}
                  disabled={tenant.status !== 'ACTIVE'}
                />
                <ReseedButton tenantId={tenant.id} tenantName={tenant.name} />
              </div>
            </li>
          ))}
          {demoTenants.length === 0 && (
            <li className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No demo tenants. Run the database seed first.
            </li>
          )}
        </ul>
      </div>

      {/* Clone from template */}
      <div
        className="rounded-[10px] border p-4 space-y-3"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
      >
        <span
          className="text-[10px] font-medium uppercase tracking-widest"
          style={{ color: 'var(--text-secondary)' }}
        >
          Create Demo Tenant From Template
        </span>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Clones the full canonical scenario — 4 facilities, key assets, health scores, and active
          alerts — under a new tenant name.
        </p>
        <CloneTenantForm />
      </div>

      {/* Replay engine stub — infra lands in Phase 2 */}
      <div
        className="rounded-[10px] border border-dashed p-4 flex items-start gap-3"
        style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-surface)' }}
      >
        <Radio className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Telemetry Replay Engine — coming online
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Replay speed and dataset selection controls will appear here once the synthetic
            telemetry replay engine is deployed.
          </p>
        </div>
      </div>
    </div>
  )
}
