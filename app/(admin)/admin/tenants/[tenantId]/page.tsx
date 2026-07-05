import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { adminGetTenantDetail } from '@/lib/db/queries/admin/tenants'
import { TenantActions } from '@/components/admin/tenant-actions'
import { TenantStatusBadge, DemoBadge } from '@/components/admin/tenant-badges'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatTimeAgo } from '@/lib/utils/format'
import type { TenantStatus } from '@/types/admin'

export const metadata: Metadata = { title: 'Tenant Detail' }
export const dynamic = 'force-dynamic'

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: 'var(--status-critical)',
  ADVISORY: 'var(--status-advisory)',
  WATCH: 'var(--status-watch)',
  INFO: 'var(--text-muted)',
}

function PanelCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-[10px] border"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
    >
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-default)' }}>
        <span
          className="text-[10px] font-medium uppercase tracking-widest"
          style={{ color: 'var(--text-secondary)' }}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  )
}

export default async function AdminTenantDetailPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params
  const detail = await adminGetTenantDetail(tenantId)
  if (!detail) notFound()

  const { tenant, recentAlerts, activeAlerts } = detail

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs mb-2 hover:underline"
          style={{ color: 'var(--text-muted)' }}
        >
          <ChevronLeft className="w-3 h-3" />
          All tenants
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {tenant.name}
          </h1>
          <TenantStatusBadge status={tenant.status as TenantStatus} />
          {tenant.isDemo && <DemoBadge />}
        </div>
        <p className="text-sm mt-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
          {tenant.slug} · {tenant.industry} · plan: {tenant.plan}
        </p>
      </div>

      <TenantActions
        tenantId={tenant.id}
        tenantName={tenant.name}
        status={tenant.status as TenantStatus}
        isDemo={tenant.isDemo}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Facilities */}
        <div className="xl:col-span-2 space-y-4">
          <PanelCard title={`Facilities (${tenant.facilities.length})`}>
            <ul>
              {tenant.facilities.map((facility) => (
                <li
                  key={facility.id}
                  className="px-4 py-3 border-t first:border-t-0 flex items-center justify-between gap-3"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {facility.name}
                    </p>
                    <p className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {facility.externalId} · {facility.city}, {facility.region} ·{' '}
                      {facility._count.assets} assets
                    </p>
                  </div>
                  <StatusBadge status={facility.status} size="sm" />
                </li>
              ))}
              {tenant.facilities.length === 0 && (
                <li className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No facilities.
                </li>
              )}
            </ul>
          </PanelCard>

          <PanelCard title={`Recent Alerts (${activeAlerts} active)`}>
            <ul>
              {recentAlerts.map((alert) => (
                <li
                  key={alert.id}
                  className="px-4 py-3 border-t first:border-t-0"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: SEVERITY_COLOR[alert.severity] ?? 'var(--text-muted)' }}
                      />
                      <p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {alert.title}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {formatTimeAgo(alert.createdAt.toISOString())}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] mt-0.5 ml-3.5" style={{ color: 'var(--text-muted)' }}>
                    {alert.facility.externalId}
                    {alert.asset ? ` · ${alert.asset.externalId}` : ''} · {alert.modelName} ·{' '}
                    {alert.status}
                  </p>
                </li>
              ))}
              {recentAlerts.length === 0 && (
                <li className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No alerts.
                </li>
              )}
            </ul>
          </PanelCard>
        </div>

        {/* Users */}
        <div className="space-y-4">
          <PanelCard title={`Users (${tenant.users.length})`}>
            <ul>
              {tenant.users.map((user) => (
                <li
                  key={user.id}
                  className="px-4 py-3 border-t first:border-t-0"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {user.name ?? user.email}
                  </p>
                  <p className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {user.email} · {user.role}
                    {user.platformRole ? ` · STAFF: ${user.platformRole}` : ''}
                  </p>
                </li>
              ))}
              {tenant.users.length === 0 && (
                <li className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No users.
                </li>
              )}
            </ul>
          </PanelCard>

          <PanelCard title="Tenant Information">
            <dl className="px-4 py-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt style={{ color: 'var(--text-secondary)' }}>Tenant ID</dt>
                <dd className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>
                  {tenant.id}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt style={{ color: 'var(--text-secondary)' }}>Created</dt>
                <dd className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>
                  {tenant.createdAt.toISOString().slice(0, 10)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt style={{ color: 'var(--text-secondary)' }}>Plan</dt>
                <dd className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>
                  {tenant.plan}
                </dd>
              </div>
            </dl>
          </PanelCard>
        </div>
      </div>
    </div>
  )
}
