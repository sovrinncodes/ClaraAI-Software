import { Building2, Boxes, Bell, FlaskConical } from 'lucide-react'
import type { PlatformStats } from '@/types/admin'

interface PlatformKpiCardProps {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  icon: React.ReactNode
}

function PlatformKpiCard({ label, value, sub, icon }: PlatformKpiCardProps) {
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
      {sub && (
        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {sub}
        </div>
      )}
    </div>
  )
}

export function PlatformKpiRow({ stats }: { stats: PlatformStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <PlatformKpiCard
        label="Tenants"
        value={stats.tenants}
        sub={`${stats.demoTenants} demo · ${stats.users} users`}
        icon={<Building2 className="w-4 h-4" />}
      />
      <PlatformKpiCard
        label="Facilities"
        value={stats.facilities}
        sub="across all tenants"
        icon={<Boxes className="w-4 h-4" />}
      />
      <PlatformKpiCard
        label="Monitored Assets"
        value={stats.assets}
        sub="across all tenants"
        icon={<FlaskConical className="w-4 h-4" />}
      />
      <PlatformKpiCard
        label="Active Alerts"
        value={
          <span style={stats.criticalAlerts > 0 ? { color: 'var(--status-critical)' } : undefined}>
            {stats.activeAlerts}
          </span>
        }
        sub={
          stats.criticalAlerts > 0 ? (
            <span style={{ color: 'var(--status-critical)' }}>
              {stats.criticalAlerts} critical
            </span>
          ) : (
            'no critical alerts'
          )
        }
        icon={<Bell className="w-4 h-4" />}
      />
    </div>
  )
}
