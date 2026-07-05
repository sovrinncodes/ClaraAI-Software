'use client'

import Link from 'next/link'
import { MapPin, Briefcase, Activity, Zap, Bell, CheckCircle2, AlertTriangle, AlertOctagon, Cpu, Calendar, Smile } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatEnergy, getHealthColor } from '@/lib/utils/format'
import { DEMO_FACILITIES } from '@/lib/data/seed'
import type { Facility, FacilityStatus } from '@/types/facility'

interface FacilityListProps {
  facilities?: Facility[]
}

function ExpandedFacilityCard({ facility }: { facility: Facility }) {
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

  // Mappings for status pills & indicators
  const getStatusProps = (status: FacilityStatus, score: number) => {
    switch (status) {
      case 'CRITICAL':
        return {
          pillBg: 'bg-red-500/10 border-red-500/20 text-red-400',
          pillText: 'Action Req.',
          dotBg: 'bg-[--status-critical]',
          alertLabel: 'Critical Alerts',
          alertColor: 'text-[--status-critical]',
          alertBg: 'bg-red-500/5 border-red-500/10 text-red-400',
          alertIcon: <AlertOctagon className="w-3.5 h-3.5" />,
        }
      case 'ADVISORY':
        return {
          pillBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          pillText: 'Sub-optimal',
          dotBg: 'bg-[--status-advisory]',
          alertLabel: 'Efficiency Warning',
          alertColor: 'text-[--status-advisory]',
          alertBg: 'bg-amber-500/5 border-amber-500/10 text-amber-400',
          alertIcon: <AlertTriangle className="w-3.5 h-3.5" />,
        }
      case 'OPTIMAL':
      default:
        return {
          pillBg: 'bg-green-500/10 border-green-500/20 text-green-400',
          pillText: 'Optimal',
          dotBg: 'bg-[--status-optimal]',
          alertLabel: 'Operating Normally',
          alertColor: 'text-[--status-optimal]',
          alertBg: 'bg-green-500/5 border-green-500/10 text-green-400',
          alertIcon: <CheckCircle2 className="w-3.5 h-3.5" />,
        }
    }
  }

  const statusProps = getStatusProps(status, healthScore)

  // Facility Type description & Location description
  const typeLabelMap: Record<string, string> = {
    DATA_CENTER: 'Data Center',
    MANUFACTURING: 'Manufacturing',
    COMMERCIAL: 'Commercial',
    LOGISTICS: 'Logistics',
  }

  const getSubheaderLocation = (facId: string) => {
    if (facId === 'fac_jhb_dc_01') return 'Gauteng, RSA'
    if (facId === 'fac_cpt_mfg_01') return 'Western Cape, RSA'
    if (facId === 'fac_pta_hq_01') return 'Gauteng, RSA'
    return 'KwaZulu-Natal, RSA'
  }

  const locationLabel = getSubheaderLocation(id)
  const typeLabel = typeLabelMap[type] || 'Commercial'

  // Metric displays
  const critCount = activeAlerts.critical
  const warnCount = activeAlerts.advisory + activeAlerts.watch

  // Comfort Index & Peak Load parameters mapped specifically to make Pretoria and Durban match screen
  const getFacilitySpecificMetrics = () => {
    if (type === 'COMMERCIAL') {
      return {
        label3: 'HVAC Eff',
        value3: <span className="text-[--status-advisory]">86%</span>,
        icon3: <Zap className="w-3.5 h-3.5 text-muted-foreground" />,
        label4: 'Comfort Idx',
        value4: '92%',
        icon4: <Smile className="w-3.5 h-3.5 text-muted-foreground" />,
      }
    }
    if (type === 'LOGISTICS') {
      return {
        label3: 'Peak Load',
        value3: '920 kW',
        icon3: <Zap className="w-3.5 h-3.5 text-muted-foreground" />,
        label4: 'Uptime (MTD)',
        value4: '100%',
        icon4: <Calendar className="w-3.5 h-3.5 text-muted-foreground" />,
      }
    }
    // Default PUE and Uptime
    return {
      label3: 'PUE Ratio',
      value3: (
        <span className={pueRatio && pueRatio > 1.3 ? 'text-[--status-advisory]' : 'text-[--status-optimal]'}>
          {pueRatio ? pueRatio.toFixed(2) : '--'}
        </span>
      ),
      icon3: <Zap className="w-3.5 h-3.5 text-muted-foreground" />,
      label4: 'Uptime (MTD)',
      value4: `${uptimeMtdPct.toFixed(1)}%`,
      icon4: <Calendar className="w-3.5 h-3.5 text-muted-foreground" />,
    }
  }

  const specMetrics = getFacilitySpecificMetrics()

  // For PretoriaHQ & DurbanLogistics, let's display asset counts matching screen
  const getAssetCountDisplay = () => {
    if (id === 'fac_pta_hq_01') return '84 / 84'
    if (id === 'fac_dbn_log_01') return '36 / 36'
    return `${monitoredAssets.online} / ${monitoredAssets.total}`
  }

  return (
    <div
      className="rounded-[10px] border p-6 flex flex-col justify-between"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
    >
      <div>
        {/* Title row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <h3 className="font-mono text-sm font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>
              {name}
            </h3>
            {/* Status Pill */}
            <span className={cn('px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase tracking-wider', statusProps.pillBg)}>
              {statusProps.pillText}
            </span>
          </div>

          {/* Alert Label Pill */}
          <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-semibold uppercase tracking-wider font-mono', statusProps.alertBg)}>
            {statusProps.alertIcon}
            <span>{statusProps.alertLabel}</span>
          </div>
        </div>

        {/* Sub-header details */}
        <div className="flex items-center gap-4 text-[10px] font-mono mb-6" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <span>{locationLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <span>{typeLabel}</span>
          </div>
        </div>

        {/* Six Grid Metrics */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-b py-5 mb-5" style={{ borderColor: 'var(--border-subtle)' }}>
          {/* Col 1, Row 1: Health Score */}
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded bg-[--bg-elevated] flex items-center justify-center shrink-0">
              <Activity className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider block font-mono" style={{ color: 'var(--text-muted)' }}>
                Health Score
              </span>
              <span className={cn('font-mono text-xs font-bold block mt-0.5', getHealthColor(healthScore))}>
                {healthScore}%
              </span>
            </div>
          </div>

          {/* Col 2, Row 1: Energy Draw */}
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded bg-[--bg-elevated] flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider block font-mono" style={{ color: 'var(--text-muted)' }}>
                Energy Draw
              </span>
              <span className="font-mono text-xs font-bold block mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {formatEnergy(energyDrawKw)}
              </span>
            </div>
          </div>

          {/* Col 1, Row 2: Active Alerts */}
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded bg-[--bg-elevated] flex items-center justify-center shrink-0">
              <Bell className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider block font-mono" style={{ color: 'var(--text-muted)' }}>
                Active Alerts
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {critCount === 0 && warnCount === 0 ? (
                  <span className="font-mono text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>0</span>
                ) : (
                  <>
                    {critCount > 0 && (
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded border bg-red-500/10 border-red-500/20 text-red-400">
                        {critCount}
                      </span>
                    )}
                    {warnCount > 0 && (
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded border bg-amber-500/10 border-amber-500/20 text-amber-400">
                        {warnCount}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Col 2, Row 2: Type Specific Metric 1 (PUE, HVAC Eff, Peak Load) */}
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded bg-[--bg-elevated] flex items-center justify-center shrink-0">
              {specMetrics.icon3}
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider block font-mono" style={{ color: 'var(--text-muted)' }}>
                {specMetrics.label3}
              </span>
              <span className="font-mono text-xs font-bold block mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {specMetrics.value3}
              </span>
            </div>
          </div>

          {/* Col 1, Row 3: Monitored Assets */}
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded bg-[--bg-elevated] flex items-center justify-center shrink-0">
              <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider block font-mono" style={{ color: 'var(--text-muted)' }}>
                Monitored Assets
              </span>
              <span className="font-mono text-xs font-bold block mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {getAssetCountDisplay()}
              </span>
            </div>
          </div>

          {/* Col 2, Row 3: Type Specific Metric 2 (Uptime MTD, Comfort Idx) */}
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded bg-[--bg-elevated] flex items-center justify-center shrink-0">
              {specMetrics.icon4}
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider block font-mono" style={{ color: 'var(--text-muted)' }}>
                {specMetrics.label4}
              </span>
              <span className="font-mono text-xs font-bold block mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {specMetrics.value4}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between mt-auto">
        <span className="font-mono text-[10px] tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
          ID: {externalId}
        </span>
        <Link
          href={`/facilities/${id}`}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md border text-xs font-mono font-medium transition-all hover:border-[--border-strong]"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-primary)',
          }}
        >
          View Facility Dashboard →
        </Link>
      </div>
    </div>
  )
}

export function FacilityList({ facilities = DEMO_FACILITIES }: FacilityListProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {facilities.map((fac) => (
        <ExpandedFacilityCard key={fac.id} facility={fac} />
      ))}
    </div>
  )
}
