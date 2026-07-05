'use client'

import { useState } from 'react'
import {
  ComposedChart,
  Area,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Calendar, Filter } from 'lucide-react'
import { TELEMETRY_24H } from '@/lib/data/seed'
import { getHealthColor } from '@/lib/utils/format'

interface ChartDataPoint {
  timestamp: string
  timeLabel: string
  timeTooltip: string
  energy: number
  baseline: number
  health: number
  anomaly: number | null
}

const chartData: ChartDataPoint[] = TELEMETRY_24H.map((item, index) => {
  const date = new Date(item.timestamp)
  const hrs = date.getHours().toString().padStart(2, '0')
  const mins = date.getMinutes().toString().padStart(2, '0')
  
  // Health score starts around 92.4% (from seed) and fluctuates slightly
  // matching the healthTrend of -1.4% in the seed.
  const healthBase = 92.4 - (index / 95) * 1.8
  const healthNoise = Math.sin((index / 95) * Math.PI * 5) * 0.4
  const health = Number((healthBase + healthNoise).toFixed(1))

  return {
    timestamp: item.timestamp,
    timeLabel: index === 95 ? 'NOW' : (date.getMinutes() === 0 && date.getHours() % 4 === 0 ? `${hrs}:${mins}` : ''),
    timeTooltip: `${hrs}:${mins} UTC`,
    energy: Number(item.actualKwh.toFixed(2)),
    baseline: Number(item.baselineKwh.toFixed(2)),
    health,
    anomaly: item.anomalyFlag ? item.actualKwh : null,
  }
})

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload as ChartDataPoint
  const isAnomaly = data.anomaly !== null

  return (
    <div
      className="p-3 rounded-[10px] border shadow-xl font-mono text-[11px]"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-strong)',
      }}
    >
      <div className="text-[10px] mb-1.5 font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
        {data.timeTooltip}
      </div>
      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between items-center gap-5">
          <span style={{ color: 'var(--text-secondary)' }}>Health:</span>
          <span className={getHealthColor(data.health)}>{data.health.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center gap-5">
          <span style={{ color: 'var(--text-secondary)' }}>Energy Draw:</span>
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{data.energy.toFixed(1)} MW</span>
        </div>
        {isAnomaly && (
          <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[9px] font-semibold text-red-400 uppercase tracking-widest">
              Anomaly Detected
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export function TelemetryOverviewChart() {
  const [timeRange, setTimeRange] = useState('24h')

  return (
    <div
      className="rounded-[10px] border p-5 flex flex-col mb-6"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Telemetry Overview
            </h3>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
              24H AGGREGATE
            </span>
          </div>
        </div>

        {/* Legend / Actions */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {/* Custom Legend */}
          <div className="flex items-center gap-4 text-[10px] font-mono tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'var(--accent-primary)' }} />
              <span>Total Energy Draw (MW)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: 'var(--text-secondary)' }} />
              <span>Avg Health Score (%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--status-critical)' }} />
              <span>Anomalies</span>
            </div>
          </div>

          {/* Time Picker Action */}
          <button
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium transition-colors hover:border-[--border-strong] font-mono"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-secondary)',
            }}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Last 24 Hours</span>
          </button>
        </div>
      </div>

      {/* Chart Wrapper */}
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-geist-mono)' }}
            />
            
            {/* Left Y-axis (Energy Draw) */}
            <YAxis
              yAxisId="energy"
              domain={[5, 10]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-geist-mono)' }}
            />
            
            {/* Right Y-axis (Health Index) */}
            <YAxis
              yAxisId="health"
              orientation="right"
              domain={[80, 100]}
              tickLine={false}
              axisLine={false}
              tick={false} // Hidden to match screenshot aesthetics
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />

            {/* Total Energy Draw (MW) Area */}
            <Area
              yAxisId="energy"
              type="monotone"
              dataKey="energy"
              stroke="var(--accent-primary)"
              strokeWidth={1.5}
              fill="url(#energyGrad)"
              dot={false}
              isAnimationActive={false}
            />

            {/* Average Health Score (%) Line */}
            <Line
              yAxisId="health"
              type="monotone"
              dataKey="health"
              stroke="var(--text-secondary)"
              strokeWidth={1.2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />

            {/* Anomalies Scatter Dots */}
            <Scatter
              yAxisId="energy"
              dataKey="anomaly"
              fill="var(--status-critical)"
              shape="circle"
              r={3}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
