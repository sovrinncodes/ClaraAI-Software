'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { formatEnergy, getHealthColor } from '@/lib/utils/format'
import type { Facility } from '@/types/facility'

interface FacilityCardProps {
  facility: Facility
}

export function FacilityCard({ facility }: FacilityCardProps) {
  const {
    id,
    externalId,
    name,
    type,
    status,
    healthScore,
    pueRatio,
    energyDrawKw,
    activeAlerts,
    monitoredAssets,
    uptimeMtdPct,
  } = facility

  // Status color for the health block in top-right
  const getHealthBorderColor = (score: number) => {
    if (score >= 90) return 'border-[--status-optimal] text-[--status-optimal]'
    if (score >= 70) return 'border-[--status-advisory] text-[--status-advisory]'
    return 'border-[--status-critical] text-[--status-critical]'
  }

  const getHealthBgBar = (score: number) => {
    if (score >= 90) return 'bg-[--status-optimal]'
    if (score >= 70) return 'bg-[--status-advisory]'
    return 'bg-[--status-critical]'
  }

  // Alerts breakdown
  const critCount = activeAlerts.critical
  const warnCount = activeAlerts.advisory + activeAlerts.watch
  const okCount = Math.max(0, monitoredAssets.total - critCount - warnCount)

  // Format type label
  const typeLabels: Record<string, string> = {
    DATA_CENTER: 'Data Center',
    MANUFACTURING: 'Manufacturing',
    COMMERCIAL: 'Commercial',
    LOGISTICS: 'Logistics',
    AGRICULTURE: 'Agriculture',
  }

  return (
    <Link
      href={`/facilities/${id}`}
      className="rounded-[10px] border p-5 flex flex-col justify-between transition-all hover:border-[--border-strong] group"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
    >
      <div>
        {/* Top Row: Name and Health Box */}
        <div className="flex justify-between items-start gap-4 mb-1">
          <div>
            <h4 className="font-mono text-sm font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>
              {name}
            </h4>
            <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {typeLabels[type]} • {monitoredAssets.total} Assets
            </p>
          </div>

          {/* Health Score Box */}
          <div
            className={cn(
              'w-8 h-8 rounded border flex items-center justify-center font-mono text-xs font-bold shrink-0',
              getHealthBorderColor(healthScore)
            )}
            style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
          >
            {healthScore}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-6 mb-3">
          {type === 'COMMERCIAL' ? (
            <>
              <div>
                <span className="text-[9px] uppercase tracking-wider block font-mono" style={{ color: 'var(--text-muted)' }}>
                  HVAC Eff
                </span>
                <span className="font-mono text-xs font-semibold block mt-1" style={{ color: 'var(--text-primary)' }}>
                  86%
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider block font-mono" style={{ color: 'var(--text-muted)' }}>
                  Energy Draw
                </span>
                <span className="font-mono text-xs font-semibold block mt-1" style={{ color: 'var(--text-primary)' }}>
                  {formatEnergy(energyDrawKw)}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider block font-mono" style={{ color: 'var(--text-muted)' }}>
                  Comfort Idx
                </span>
                <span className="font-mono text-xs font-semibold block mt-1" style={{ color: 'var(--text-primary)' }}>
                  92%
                </span>
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="text-[9px] uppercase tracking-wider block font-mono" style={{ color: 'var(--text-muted)' }}>
                  Energy Draw
                </span>
                <span className="font-mono text-xs font-semibold block mt-1" style={{ color: 'var(--text-primary)' }}>
                  {formatEnergy(energyDrawKw)}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider block font-mono" style={{ color: 'var(--text-muted)' }}>
                  PUE Ratio
                </span>
                <span className="font-mono text-xs font-semibold block mt-1" style={{ color: 'var(--text-primary)' }}>
                  {pueRatio ? pueRatio.toFixed(2) : '--'}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider block font-mono" style={{ color: 'var(--text-muted)' }}>
                  Uptime
                </span>
                <span className="font-mono text-xs font-semibold block mt-1" style={{ color: 'var(--text-primary)' }}>
                  {uptimeMtdPct.toFixed(1)}%
                </span>
              </div>
            </>
          )}
        </div>

        {/* Color status bar */}
        <div className="h-1 w-full rounded-full overflow-hidden mb-4" style={{ backgroundColor: 'var(--bg-elevated)' }}>
          <div className={cn('h-full rounded-full', getHealthBgBar(healthScore))} style={{ width: `${healthScore}%` }} />
        </div>
      </div>

      {/* Footer Alert Dots */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1">
            <span className={cn('w-1.5 h-1.5 rounded-full', critCount > 0 ? 'bg-[--status-critical]' : 'bg-red-950 border border-red-500/20')} />
            <span style={{ color: critCount > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{critCount} Crit</span>
          </span>
          <span className="flex items-center gap-1">
            <span className={cn('w-1.5 h-1.5 rounded-full', warnCount > 0 ? 'bg-[--status-advisory]' : 'bg-amber-950 border border-amber-500/20')} />
            <span style={{ color: warnCount > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{warnCount} Warn</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[--status-optimal]" />
            <span style={{ color: 'var(--text-muted)' }}>{okCount} OK</span>
          </span>
        </div>

        <span className="text-[10px] font-medium tracking-wide transition-colors group-hover:text-[--accent-primary]" style={{ color: 'var(--text-muted)' }}>
          View Facility Dashboard →
        </span>
      </div>
    </Link>
  )
}
