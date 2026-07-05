import type { Metadata } from 'next'
import { adminListAuditEvents } from '@/lib/db/queries/admin/audit'
import { formatUtcTime } from '@/lib/utils/format'

export const metadata: Metadata = { title: 'Audit Log' }
export const dynamic = 'force-dynamic'

const KNOWN_ACTIONS = [
  'IMPERSONATE_START',
  'IMPERSONATE_END',
  'TENANT_RESEED',
  'TENANT_CLONE',
  'TENANT_STATUS_CHANGE',
]

const TH_CLASS = 'px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest'
const TD_CLASS = 'px-4 py-3 text-sm'

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; tenantId?: string }>
}) {
  const { action, tenantId } = await searchParams
  const events = await adminListAuditEvents({
    action: action || undefined,
    tenantId: tenantId || undefined,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Audit Log
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Every staff action — impersonations, reseeds, and tenant changes.
        </p>
      </div>

      {/* Filters (GET form keeps state in the URL) */}
      <form method="get" className="flex items-center gap-2 flex-wrap">
        <select
          name="action"
          defaultValue={action ?? ''}
          className="rounded-md border px-3 py-1.5 text-sm outline-none"
          style={{
            borderColor: 'var(--border-default)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">All actions</option>
          {KNOWN_ACTIONS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover]"
          style={{ borderColor: 'var(--border-default)' }}
        >
          Filter
        </button>
      </form>

      <div
        className="rounded-[10px] border overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ color: 'var(--text-muted)' }}>
                <th className={TH_CLASS}>Time</th>
                <th className={TH_CLASS}>Actor</th>
                <th className={TH_CLASS}>Action</th>
                <th className={TH_CLASS}>Target</th>
                <th className={TH_CLASS}>Details</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="border-t"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <td className={`${TD_CLASS} font-mono text-xs whitespace-nowrap`} style={{ color: 'var(--text-secondary)' }}>
                    {event.createdAt.toISOString().slice(0, 10)} {formatUtcTime(event.createdAt.toISOString())}
                  </td>
                  <td className={`${TD_CLASS} font-mono text-xs`} style={{ color: 'var(--text-primary)' }}>
                    {event.actorEmail}
                  </td>
                  <td className={TD_CLASS}>
                    <span
                      className="inline-flex rounded border px-1.5 py-0.5 text-[10px] font-mono font-medium"
                      style={{
                        borderColor: 'rgba(139,92,246,0.25)',
                        backgroundColor: 'rgba(139,92,246,0.10)',
                        color: 'var(--chart-5)',
                      }}
                    >
                      {event.action}
                    </span>
                  </td>
                  <td className={`${TD_CLASS} font-mono text-xs`} style={{ color: 'var(--text-secondary)' }}>
                    {event.targetType}:{event.targetId}
                  </td>
                  <td className={`${TD_CLASS} font-mono text-[10px] max-w-[280px] truncate`} style={{ color: 'var(--text-muted)' }}>
                    {event.metadata ? JSON.stringify(event.metadata) : '—'}
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    No audit events yet.
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
