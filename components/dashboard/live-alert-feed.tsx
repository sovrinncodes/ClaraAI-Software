'use client'

import Link from 'next/link'
import { AlertOctagon, AlertTriangle, Eye, ArrowRight } from 'lucide-react'
import { DEMO_ALERTS } from '@/lib/data/seed'
import { formatTimeAgo } from '@/lib/utils/format'
import type { AlertSeverity } from '@/types/alert'

export function LiveAlertFeed() {
  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(229,72,77,0.12)' }}>
            <AlertOctagon className="w-4 h-4 text-[--status-critical]" />
          </div>
        )
      case 'ADVISORY':
        return (
          <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(245,166,35,0.12)' }}>
            <AlertTriangle className="w-4 h-4 text-[--status-advisory]" />
          </div>
        )
      case 'WATCH':
      default:
        return (
          <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(59,130,246,0.12)' }}>
            <Eye className="w-4 h-4 text-[--status-watch]" />
          </div>
        )
    }
  }

  // Get first 6 alerts to show in the widget
  const visibleAlerts = DEMO_ALERTS.slice(0, 6)

  const getFacilityName = (facilityId: string) => {
    if (facilityId === 'fac_jhb_dc_01') return 'Johannesburg'
    if (facilityId === 'fac_cpt_mfg_01') return 'Cape Town'
    if (facilityId === 'fac_pta_hq_01') return 'Pretoria HQ'
    return 'Durban'
  }

  return (
    <div
      className="rounded-[10px] border p-5 flex flex-col h-full justify-between"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
    >
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-mono text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-primary)' }}>
            Live Alert Feed
          </h3>
          <span
            className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'rgba(229,72,77,0.15)',
              color: 'var(--status-critical)',
            }}
          >
            16 Active
          </span>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {visibleAlerts.map((alert) => {
            const assetName = alert.title.split(':')[0]
            const titleMsg = alert.title.split(': ')[1] || alert.title

            return (
              <div key={alert.id} className="flex gap-3 items-start group cursor-pointer">
                {getSeverityIcon(alert.severity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold truncate group-hover:text-[--accent-primary] transition-colors" style={{ color: 'var(--text-primary)' }}>
                      {titleMsg}
                    </h4>
                    <span className="font-mono text-[9px] shrink-0 tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {formatTimeAgo(alert.createdAt)}
                    </span>
                  </div>
                  <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
                    {assetName} • {getFacilityName(alert.facilityId)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: 'var(--border-subtle)' }}>
        <Link
          href="/alerts"
          className="inline-flex items-center gap-1.5 text-xs font-medium hover:text-[--accent-primary] transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span>View All Alerts</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
