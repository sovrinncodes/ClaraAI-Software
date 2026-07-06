import type { Metadata } from 'next'
import Link from 'next/link'
import { adminGetTenantUsage, adminGetAlertVolumeTrend } from '@/lib/db/queries/admin/analytics'
import { AlertVolumeChart } from '@/components/admin/alert-volume-chart'
import { DemoBadge } from '@/components/admin/tenant-badges'
import { formatTimeAgo } from '@/lib/utils/format'

export const metadata: Metadata = { title: 'Analytics' }
export const dynamic = 'force-dynamic'

const TH_CLASS = 'px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest'
const TD_CLASS = 'px-4 py-3 text-sm'

export default async function AdminAnalyticsPage() {
  const [usage, trend] = await Promise.all([
    adminGetTenantUsage(),
    adminGetAlertVolumeTrend(14),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Analytics
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Platform-wide alert volume and per-tenant usage.
        </p>
      </div>

      <div
        className="rounded-[10px] border p-4"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
      >
        <span
          className="text-[10px] font-medium uppercase tracking-widest"
          style={{ color: 'var(--text-secondary)' }}
        >
          Alert Volume — Last 14 Days
        </span>
        <AlertVolumeChart data={trend} />
      </div>

      <div
        className="rounded-[10px] border overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
      >
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <span
            className="text-[10px] font-medium uppercase tracking-widest"
            style={{ color: 'var(--text-secondary)' }}
          >
            Tenant Usage
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ color: 'var(--text-muted)' }}>
                <th className={TH_CLASS}>Tenant</th>
                <th className={`${TH_CLASS} text-right`}>Facilities</th>
                <th className={`${TH_CLASS} text-right`}>Assets Monitored</th>
                <th className={`${TH_CLASS} text-right`}>Alerts Generated</th>
                <th className={`${TH_CLASS} text-right`}>Reports Generated</th>
                <th className={TH_CLASS}>Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {usage.map((row) => (
                <tr
                  key={row.tenantId}
                  className="border-t"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <td className={TD_CLASS}>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/tenants/${row.tenantId}`}
                        className="font-medium hover:underline"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {row.tenantName}
                      </Link>
                      {row.isDemo && <DemoBadge />}
                    </div>
                  </td>
                  <td className={`${TD_CLASS} text-right font-mono`} style={{ color: 'var(--text-secondary)' }}>
                    {row.facilities}
                  </td>
                  <td className={`${TD_CLASS} text-right font-mono`} style={{ color: 'var(--text-secondary)' }}>
                    {row.assetsMonitored}
                  </td>
                  <td className={`${TD_CLASS} text-right font-mono`} style={{ color: 'var(--text-secondary)' }}>
                    {row.alertsGenerated}
                  </td>
                  <td className={`${TD_CLASS} text-right font-mono`} style={{ color: 'var(--text-secondary)' }}>
                    {row.reportsGenerated}
                  </td>
                  <td className={`${TD_CLASS} font-mono text-xs`} style={{ color: 'var(--text-muted)' }}>
                    {row.lastActivityAt ? formatTimeAgo(row.lastActivityAt) : 'never'}
                  </td>
                </tr>
              ))}
              {usage.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
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
    </div>
  )
}
