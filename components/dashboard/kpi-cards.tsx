'use client'

import { TrendingUp, TrendingDown, Activity, Zap, Leaf, Bell } from 'lucide-react'
import { Sparkline } from '@/components/charts/sparkline'
import { cn } from '@/lib/utils/cn'
import { formatZar, formatEnergyKwh } from '@/lib/utils/format'
import {
  PORTFOLIO_KPIS,
  ESG_SPARKLINE,
  HEALTH_SPARKLINE,
  ENERGY_SPARKLINE,
  ALERTS_SPARKLINE,
} from '@/lib/data/seed'

interface KpiCardProps {
  label: string
  value: React.ReactNode
  trend?: number
  trendLabel?: string
  icon: React.ReactNode
  sparklineData?: number[]
  sparklineColor?: string
  footer?: React.ReactNode
}

function TrendArrow({ value }: { value: number }) {
  const positive = value >= 0
  const Icon = positive ? TrendingUp : TrendingDown
  return (
    <span className={cn('flex items-center gap-0.5 text-xs font-mono', positive ? 'text-green-400' : 'text-red-400')}>
      <Icon className="w-3 h-3" />
      {positive ? '+' : ''}{value.toFixed(1)}
    </span>
  )
}

function KpiCard({ label, value, trend, trendLabel, icon, sparklineData, sparklineColor, footer }: KpiCardProps) {
  return (
    <div
      className="rounded-[10px] border p-5 flex flex-col"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
    >
      <div className="flex justify-between items-start mb-3">
        <span
          className="text-[10px] font-medium uppercase tracking-widest"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </span>
        <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
      </div>

      <div className="font-mono text-3xl font-light mb-1" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>

      <div className="flex items-center gap-2 min-h-[18px]">
        {trend !== undefined && <TrendArrow value={trend} />}
        {trendLabel && (
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{trendLabel}</span>
        )}
      </div>

      {footer && <div className="mt-2">{footer}</div>}

      {sparklineData && (
        <Sparkline
          data={sparklineData}
          color={sparklineColor ?? 'var(--accent-primary)'}
          height={32}
          className="mt-3"
        />
      )}
    </div>
  )
}

export function EsgScoreCard() {
  return (
    <KpiCard
      label="ESG Insight Score"
      value={PORTFOLIO_KPIS.esgInsightScore.toFixed(1)}
      trend={PORTFOLIO_KPIS.esgTrend}
      trendLabel="vs last week"
      icon={<Leaf className="w-4 h-4" />}
      sparklineData={ESG_SPARKLINE}
      sparklineColor="var(--status-optimal)"
    />
  )
}

export function PortfolioHealthCard() {
  return (
    <KpiCard
      label="Portfolio Health Index"
      value={`${PORTFOLIO_KPIS.portfolioHealthIndex.toFixed(1)}%`}
      trend={PORTFOLIO_KPIS.healthTrend}
      trendLabel="7-day trend"
      icon={<Activity className="w-4 h-4" />}
      sparklineData={HEALTH_SPARKLINE}
      sparklineColor="var(--status-advisory)"
    />
  )
}

export function EnergyOptimisedCard() {
  return (
    <KpiCard
      label="Energy Optimised MTD"
      value={`${PORTFOLIO_KPIS.energyOptimisedMwhMtd.toFixed(1)} MWh`}
      trend={undefined}
      trendLabel={`≈ ${formatZar(PORTFOLIO_KPIS.energySavingsZar)} saved`}
      icon={<Zap className="w-4 h-4" />}
      sparklineData={ENERGY_SPARKLINE}
      sparklineColor="var(--chart-4)"
    />
  )
}

export function ActiveAlertsCard() {
  const { activeAlertCount, criticalAlertCount, advisoryAlertCount } = PORTFOLIO_KPIS
  return (
    <KpiCard
      label="Active Alerts"
      value={activeAlertCount}
      icon={<Bell className="w-4 h-4" />}
      sparklineData={ALERTS_SPARKLINE}
      sparklineColor="var(--status-critical)"
      footer={
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            {criticalAlertCount} Critical
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {advisoryAlertCount} Advisory
          </span>
        </div>
      }
    />
  )
}
