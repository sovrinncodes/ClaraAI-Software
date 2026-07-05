import Link from 'next/link'
import { TenantStatusBadge, DemoBadge } from '@/components/admin/tenant-badges'
import { ViewAsButton } from '@/components/admin/view-as-button'
import type { TenantOverview } from '@/types/admin'

const TH_CLASS = 'px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest'
const TD_CLASS = 'px-4 py-3 text-sm'

export function TenantTable({ tenants }: { tenants: TenantOverview[] }) {
  return (
    <div
      className="rounded-[10px] border overflow-hidden"
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
          Tenants
        </span>
        <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
          {tenants.length} total
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ color: 'var(--text-muted)' }}>
              <th className={TH_CLASS}>Tenant</th>
              <th className={TH_CLASS}>Plan</th>
              <th className={TH_CLASS}>Status</th>
              <th className={`${TH_CLASS} text-right`}>Users</th>
              <th className={`${TH_CLASS} text-right`}>Facilities</th>
              <th className={`${TH_CLASS} text-right`}>Assets</th>
              <th className={`${TH_CLASS} text-right`}>Active Alerts</th>
              <th className={TH_CLASS}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr
                key={tenant.id}
                className="border-t transition-colors hover:bg-[--bg-hover]"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <td className={TD_CLASS}>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/tenants/${tenant.id}`}
                      className="font-medium hover:underline"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {tenant.name}
                    </Link>
                    {tenant.isDemo && <DemoBadge />}
                  </div>
                  <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {tenant.slug} · {tenant.industry}
                  </span>
                </td>
                <td className={TD_CLASS}>
                  <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {tenant.plan}
                  </span>
                </td>
                <td className={TD_CLASS}>
                  <TenantStatusBadge status={tenant.status} />
                </td>
                <td className={`${TD_CLASS} text-right font-mono`} style={{ color: 'var(--text-secondary)' }}>
                  {tenant.counts.users}
                </td>
                <td className={`${TD_CLASS} text-right font-mono`} style={{ color: 'var(--text-secondary)' }}>
                  {tenant.counts.facilities}
                </td>
                <td className={`${TD_CLASS} text-right font-mono`} style={{ color: 'var(--text-secondary)' }}>
                  {tenant.counts.assets}
                </td>
                <td className={`${TD_CLASS} text-right font-mono`}>
                  <span
                    style={{
                      color:
                        tenant.counts.activeAlerts > 0
                          ? 'var(--status-advisory)'
                          : 'var(--text-secondary)',
                    }}
                  >
                    {tenant.counts.activeAlerts}
                  </span>
                </td>
                <td className={TD_CLASS}>
                  <ViewAsButton
                    tenantId={tenant.id}
                    tenantName={tenant.name}
                    disabled={tenant.status !== 'ACTIVE'}
                  />
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  No tenants yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
