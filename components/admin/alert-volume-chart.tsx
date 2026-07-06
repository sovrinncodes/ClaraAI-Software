'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { AlertVolumePoint } from '@/lib/db/queries/admin/analytics'

const CHART_DEFAULTS = {
  gridColor: 'rgba(255,255,255,0.05)',
  axisColor: 'rgba(255,255,255,0.15)',
  tooltipBg: '#1C2438',
  tooltipBorder: 'rgba(255,255,255,0.10)',
}

export function AlertVolumeChart({ data }: { data: AlertVolumePoint[] }) {
  const chartData = data.map((point) => ({
    ...point,
    label: point.date.slice(5),
  }))

  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="alert-volume-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART_DEFAULTS.gridColor} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text-muted)' }}
            stroke={CHART_DEFAULTS.axisColor}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text-muted)' }}
            stroke={CHART_DEFAULTS.axisColor}
            width={28}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: CHART_DEFAULTS.tooltipBg,
              border: `1px solid ${CHART_DEFAULTS.tooltipBorder}`,
              borderRadius: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
            }}
            labelStyle={{ color: 'var(--text-secondary)' }}
          />
          <Area
            type="monotone"
            dataKey="count"
            name="Alerts"
            stroke="var(--accent-primary)"
            strokeWidth={1.5}
            fill="url(#alert-volume-fill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
