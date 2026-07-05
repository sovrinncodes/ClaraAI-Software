'use client'

import { TrendingUp, TrendingDown, Building2, Cpu, Activity, Zap } from 'lucide-react'
import { Sparkline } from '@/components/charts/sparkline'
import { cn } from '@/lib/utils/cn'

interface KpiCardProps {
  label: string
  value: React.ReactNode
  subtext: React.ReactNode
  icon: React.ReactNode
  sparklineData?: number[]
  sparklineColor?: string
}

function KpiCard({ label, value, subtext, icon, sparklineData, sparklineColor }: KpiCardProps) {
  return (
    <div
      className="rounded-[10px] border p-5 flex flex-col justify-between"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
    >
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <span
            className="text-[10px] font-mono font-medium uppercase tracking-widest"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
        </div>

        {/* Value */}
        <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1" style={{ color: 'var(--text-primary)' }}>
          {value}
        </div>
      </div>

      {/* Footer / Sparkline */}
      <div className="flex items-center justify-between gap-4 mt-3 min-h-[32px]">
        <div className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
          {subtext}
        </div>
        {sparklineData && (
          <div className="w-[100px] h-6 shrink-0">
            <Sparkline
              data={sparklineData}
              color={sparklineColor ?? 'var(--accent-primary)'}
              height={24}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export function FacilityStatsBar() {
  // Sparkline data matching the trends
  const assetsSparkline = [268, 270, 272, 275, 278, 279, 280]
  const healthSparkline = [90.1, 89.8, 89.4, 89.0, 88.8, 88.6, 88.5]
  const loadSparkline = [7.1, 7.2, 7.35, 7.3, 7.42, 7.45, 7.48]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Facilities */}
      <KpiCard
        label="Total Facilities"
        value="4"
        subtext={
          <span className="flex items-center gap-1">
            <span style={{ color: 'var(--text-muted)' }}>—</span>
            <span style={{ color: 'var(--text-secondary)' }}>Stable</span>
          </span>
        }
        icon={<Building2 className="w-4 h-4" />}
      />

      {/* Total Monitored Assets */}
      <KpiCard
        label="Total Monitored Assets"
        value="280"
        subtext={
          <span className="flex items-center gap-1 text-[--status-optimal]">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12 MTD</span>
          </span>
        }
        icon={<Cpu className="w-4 h-4" />}
        sparklineData={assetsSparkline}
        sparklineColor="var(--status-optimal)"
      />

      {/* Avg Health Index */}
      <KpiCard
        label="Avg Health Index"
        value="88.5%"
        subtext={
          <span className="flex items-center gap-1 text-[--status-critical]">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-1.2%</span>
          </span>
        }
        icon={<Activity className="w-4 h-4" />}
        sparklineData={healthSparkline}
        sparklineColor="var(--status-critical)"
      />

      {/* Total Energy Load */}
      <KpiCard
        label="Total Energy Load"
        value={
          <>
            <span>7.48</span>
            <span className="text-xs ml-1 font-sans" style={{ color: 'var(--text-secondary)' }}>MW</span>
          </>
        }
        subtext=""
        icon={<Zap className="w-4 h-4" />}
        sparklineData={loadSparkline}
        sparklineColor="var(--accent-primary)"
      />
    </div>
  )
}
