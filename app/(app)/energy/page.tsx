'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  Zap,
  TrendingUp,
  TrendingDown,
  Download,
  SlidersHorizontal,
  Play,
  Pause,
  ArrowRight,
  Activity,
  Leaf,
  DollarSign,
  Sun,
  Calendar,
  Lightbulb,
  Check,
  AlertTriangle,
  Target,
  Building,
  Wind
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Cell,
  ReferenceLine,
  ComposedChart
} from 'recharts'
import { cn } from '@/lib/utils/cn'

// Reusable Sparkline component for KPI cards
function Sparkline({ data, stroke = '#00D4AA', strokeWidth = 1.2 }: { data: number[], stroke?: string, strokeWidth?: number }) {
  const chartData = useMemo(() => data.map((v, idx) => ({ id: idx, v })), [data])
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="v" stroke={stroke} strokeWidth={strokeWidth} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Static Overview Data
const OVERVIEW_METRICS = {
  totalConsumption: { val: '14.2', unit: 'MWh', trend: '+2.4%', sub: 'vs ML Baseline (13.8 MWh)' },
  peakDemand: { val: '1,000', unit: 'kW', trend: '+15.0%', sub: 'Recorded at 16:00 UTC' },
  carbon: { val: '12.5', unit: 'tCO2e', trend: '+2.1%', sub: 'Scope 2 Emissions' },
  cost: { val: '18.4', unit: 'k', prefix: 'ZAR ', trend: '-0.0%', sub: 'Based on City Power G-3' }
}

const CONSUMPTION_VS_BASELINE_DATA = [
  { time: '00:00', actual: 400, expected: 410, isAnomaly: false },
  { time: '04:00', actual: 390, expected: 395, isAnomaly: false },
  { time: '08:00', actual: 550, expected: 540, isAnomaly: false },
  { time: '12:00', actual: 810, expected: 780, isAnomaly: true, anomalyVal: 810 },
  { time: '16:00', actual: 990, expected: 820, isAnomaly: true, anomalyVal: 990 },
  { time: '20:00', actual: 600, expected: 580, isAnomaly: true, anomalyVal: 600 },
  { time: '24:00', actual: 420, expected: 415, isAnomaly: false }
]

const TOP_CONSUMERS = [
  { name: 'Main Chiller (CHL-01)', value: '4.6 MWh', pct: 32, color: '#00D4AA' },
  { name: 'Secondary Chiller (CHL-02)', value: '3.9 MWh', pct: 27, color: '#00D4AA' },
  { name: 'Cooling Unit A (CRAC-01)', value: '2.0 MWh', pct: 14, color: '#00D4AA' },
  { name: 'Cooling Unit B (CRAC-02)', value: '2.0 MWh', pct: 14, color: '#00D4AA' },
  { name: 'Lighting & Misc', value: '1.9 MWh', pct: 13, color: '#5A6478' }
]

const ANOMALIES_LIST = [
  { time: '16:00', asset: 'CRAC-02 Cooling Unit', deviation: '+25.0%', severity: 'High', status: 'active' },
  { time: '14:00', asset: 'CHL-01 Main Chiller', deviation: '+12.4%', severity: 'Medium', status: 'active' },
  { time: '08:15', asset: 'AHU-04 Air Handler', deviation: '+8.2%', severity: 'Low', status: 'investigated' },
  { time: '02:30', asset: 'CHL-02 Secondary Chiller', deviation: '+6.5%', severity: 'Low', status: 'investigated' }
]

const PUE_CHART_DATA = {
  '7D': [
    { label: 'Mon', pue: 1.40 },
    { label: 'Tue', pue: 1.42 },
    { label: 'Wed', pue: 1.43 },
    { label: 'Thu', pue: 1.44 },
    { label: 'Fri', pue: 1.41 },
    { label: 'Sat', pue: 1.39 },
    { label: 'Sun', pue: 1.34 }
  ],
  '30D': [
    { label: '05/01', pue: 1.42 },
    { label: '05/05', pue: 1.44 },
    { label: '05/10', pue: 1.39 },
    { label: '05/15', pue: 1.41 },
    { label: '05/20', pue: 1.38 },
    { label: '05/23', pue: 1.34 }
  ],
  '12M': [
    { label: 'Jun', pue: 1.45 },
    { label: 'Jul', pue: 1.43 },
    { label: 'Aug', pue: 1.41 },
    { label: 'Sep', pue: 1.39 },
    { label: 'Oct', pue: 1.38 },
    { label: 'Nov', pue: 1.36 },
    { label: 'Dec', pue: 1.35 },
    { label: 'Jan', pue: 1.34 },
    { label: 'Feb', pue: 1.34 },
    { label: 'Mar', pue: 1.35 },
    { label: 'Apr', pue: 1.33 },
    { label: 'May', pue: 1.34 }
  ]
}

// Sparklines dummy arrays
const sparklineConsumption = [13.5, 13.8, 13.9, 14.0, 14.1, 14.1, 14.2]
const sparklinePeak = [850, 890, 910, 920, 940, 950, 1000]
const sparklineCarbon = [11.9, 12.1, 12.2, 12.3, 12.4, 12.4, 12.5]
const sparklineCost = [18.4, 18.5, 18.4, 18.4, 18.4, 18.4, 18.4]

// Generate 30 initial points representing T-60m to Now
const generateInitialRealtimePoints = () => {
  const points = []
  for (let i = 0; i < 30; i++) {
    const minOffset = (30 - i) * 2
    // Generates a mock load curve between 650 kW and 900 kW
    const baseVal = 700 + Math.sin(i / 4.5) * 80 + Math.random() * 20
    points.push({
      time: `T-${minOffset}m`,
      val: parseFloat(baseVal.toFixed(1))
    })
  }
  return points
}

export default function EnergyPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'realtime' | 'forecast' | 'pue'>('overview')

  // Real-time Stream States
  const [isStreaming, setIsStreaming] = useState(true)
  const [instDemand, setInstDemand] = useState(842)
  const [apparentPower, setApparentPower] = useState(877)
  const [powerFactor, setPowerFactor] = useState(0.96)
  const [frequency, setFrequency] = useState(50.02)
  const [realtimeData, setRealtimeData] = useState(() => generateInitialRealtimePoints())

  // New tab state variables for interactions
  const [shiftApplied, setShiftApplied] = useState(false)
  const [activeConsumers, setActiveConsumers] = useState<string[]>(['it', 'cooling', 'power'])
  const [showActionPlan, setShowActionPlan] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [pueRange, setPueRange] = useState<'7D' | '30D' | '12M'>('7D')

  // Auto-hide toast notification
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  // Streaming Interval Logic
  useEffect(() => {
    if (!isStreaming || activeTab !== 'realtime') return

    const interval = setInterval(() => {
      // Calculate minor variations
      const demandVar = (Math.random() - 0.5) * 5
      const newDemand = Math.max(820, Math.min(870, instDemand + demandVar))
      setInstDemand(parseFloat(newDemand.toFixed(1)))
      setApparentPower(parseFloat((newDemand / 0.96).toFixed(1)))

      const pfVar = (Math.random() - 0.5) * 0.008
      setPowerFactor(parseFloat(Math.max(0.94, Math.min(0.98, powerFactor + pfVar)).toFixed(2)))

      const freqVar = (Math.random() - 0.5) * 0.01
      setFrequency(parseFloat(Math.max(49.95, Math.min(50.05, frequency + freqVar)).toFixed(2)))

      // Update Chart list
      setRealtimeData((prev) => {
        const next = [...prev.slice(1)]
        const nextList = next.map((pt, idx) => {
          const minutesAgo = (next.length - idx) * 2
          return {
            ...pt,
            time: minutesAgo === 0 ? 'Now' : `T-${minutesAgo}m`
          }
        })

        nextList.push({
          time: 'Now',
          val: parseFloat(newDemand.toFixed(1))
        })
        return nextList
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isStreaming, activeTab, instDemand, powerFactor, frequency])

  // Custom tooltips
  const renderOverviewTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null
    const data = payload[0].payload
    return (
      <div
        className="p-3 rounded-[10px] border shadow-xl font-mono text-[11px]"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-strong)',
        }}
      >
        <div className="text-[10px] mb-1.5 font-bold uppercase tracking-wider text-[--text-secondary]">
          Time: {data.time}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center gap-5">
            <span className="text-[--text-secondary]">Actual Load:</span>
            <span className="font-bold text-[#00D4AA]">{data.actual} kW</span>
          </div>
          <div className="flex justify-between items-center gap-5">
            <span className="text-[--text-secondary]">Expected Baseline:</span>
            <span className="font-bold text-[--text-secondary]">{data.expected} kW</span>
          </div>
          {data.isAnomaly && (
            <div className="flex justify-between items-center gap-5 text-[#E5484D] font-bold mt-1 text-[10px]">
              <span>Anomaly Detected:</span>
              <span>+{((data.actual - data.expected) / data.expected * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderRealtimeTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null
    const pt = payload[0].payload
    return (
      <div
        className="p-3 rounded-[10px] border shadow-xl font-mono text-[11px]"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-strong)',
        }}
      >
        <div className="text-[10px] mb-1 font-bold text-[--text-secondary]">
          Time: {pt.time}
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-[--text-secondary]">Load Demand:</span>
          <span className="font-bold text-[#00D4AA]">
            {pt.val} kW
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs & Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[--text-secondary]">
          <span className="hover:text-[--text-primary] transition-colors">Intelligence</span>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className="text-[--text-muted]">Energy Optimization</span>
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          {activeTab === 'overview' && (
            <>
              {/* Range select dropdown */}
              <div className="relative">
                <select
                  className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[6px] px-3.5 py-1.5 text-xs font-mono text-[--text-primary] outline-none appearance-none focus:border-[#00D4AA] pr-7 cursor-pointer"
                  defaultValue="today"
                >
                  <option value="today">Today (Last 24h)</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[--text-muted]">
                  ▼
                </div>
              </div>

              {/* Export Data */}
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border text-xs font-mono font-medium transition-all border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] cursor-pointer">
                <Download className="w-3.5 h-3.5 text-[--text-muted]" />
                <span>Export Data</span>
              </button>
            </>
          )}

          {activeTab === 'realtime' && (
            <>
              {/* Streaming state badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] border border-green-500/20 bg-green-500/5 text-green-400 font-mono text-xs">
                <span className={cn("w-1.5 h-1.5 rounded-full bg-green-400", isStreaming && "animate-ping")} />
                <span>Streaming (1s interval)</span>
              </div>

              {/* Pause/Play feed button */}
              <button
                onClick={() => setIsStreaming(!isStreaming)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border text-xs font-mono font-medium transition-all border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] cursor-pointer"
              >
                {isStreaming ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-[--text-muted]" />
                    <span>Pause Feed</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-[--text-muted]" />
                    <span>Resume Feed</span>
                  </>
                )}
              </button>
            </>
          )}

          {activeTab === 'forecast' && (
            <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border text-xs font-mono font-medium transition-all border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] cursor-pointer">
              <Download className="w-3.5 h-3.5 text-[--text-muted]" />
              <span>Export Model</span>
            </button>
          )}

          {activeTab === 'pue' && (
            <>
              {/* Export Data */}
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border text-xs font-mono font-medium transition-all border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] cursor-pointer">
                <Download className="w-3.5 h-3.5 text-[--text-muted]" />
                <span>Export Data</span>
              </button>

              {/* Range Toggle Buttons */}
              <div className="flex items-center rounded-[6px] border border-[--border-default] bg-[var(--bg-card)] p-0.5 font-mono text-xs">
                {(['7D', '30D', '12M'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setPueRange(r)}
                    className={cn(
                      "px-2.5 py-1 rounded-[4px] font-medium transition-all cursor-pointer",
                      pueRange === r
                        ? "bg-[var(--bg-active)] text-[--text-primary] font-semibold"
                        : "text-[--text-secondary] hover:text-[--text-primary]"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Adjust Parameters Action */}
          <Link
            href="/energy/parameters"
            className="flex items-center gap-1.5 text-[#0A0D14] hover:shadow-[0_0_15px_rgba(0,212,170,0.35)] transition-all font-mono text-xs font-bold px-3.5 py-1.5 rounded-[6px] cursor-pointer bg-[#00D4AA]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Adjust Parameters</span>
          </Link>
        </div>
      </div>

      {/* Main Title Row */}
      <div>
        <h1 className="font-mono text-2xl font-light tracking-wide text-[--text-primary] mb-1">
          Energy Analytics
        </h1>
        <p className="text-xs text-[--text-secondary]">
          Facility-wide energy telemetry, baseline comparisons, and efficiency insights.
        </p>
      </div>

      {/* Sub-tabs Selection bar */}
      <div className="flex border-b border-[--border-subtle]">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'realtime', label: 'Real-time Load' },
          { id: 'forecast', label: 'Baselines & Forecasting' },
          { id: 'pue', label: 'PUE Analysis' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'px-4 py-2 text-xs font-mono font-medium border-b-2 -mb-px transition-colors cursor-pointer',
              activeTab === tab.id
                ? 'border-[--accent-primary] text-[--text-primary]'
                : 'border-transparent text-[--text-secondary] hover:text-[--text-primary]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6">
          {/* Grid of 4 KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Consumption */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                    Total Consumption
                  </span>
                  <Leaf className="w-4 h-4 text-[--text-muted]" />
                </div>
                <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                  <span>{OVERVIEW_METRICS.totalConsumption.val} <span className="text-xs">{OVERVIEW_METRICS.totalConsumption.unit}</span></span>
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-[--status-critical]">
                    <TrendingUp className="w-2.5 h-2.5" />
                    <span>{OVERVIEW_METRICS.totalConsumption.trend}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 mt-3">
                <span className="text-[9px] font-mono text-[--text-secondary] truncate max-w-[110px]">
                  {OVERVIEW_METRICS.totalConsumption.sub}
                </span>
                <div className="w-[65px] h-3 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineConsumption.map((v) => ({ v }))}>
                      <Line type="monotone" dataKey="v" stroke="var(--status-critical)" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Peak Demand */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                    Peak Demand
                  </span>
                  <Zap className="w-4 h-4 text-[--text-muted]" />
                </div>
                <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                  <span>{OVERVIEW_METRICS.peakDemand.val} <span className="text-xs">{OVERVIEW_METRICS.peakDemand.unit}</span></span>
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-[--status-critical]">
                    <TrendingUp className="w-2.5 h-2.5" />
                    <span>{OVERVIEW_METRICS.peakDemand.trend}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 mt-3">
                <span className="text-[9px] font-mono text-[--text-secondary] truncate max-w-[110px]">
                  {OVERVIEW_METRICS.peakDemand.sub}
                </span>
                <div className="w-[65px] h-3 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklinePeak.map((v) => ({ v }))}>
                      <Line type="monotone" dataKey="v" stroke="var(--status-critical)" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Carbon Equivalent */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                    Carbon Equivalent
                  </span>
                  <Leaf className="w-4 h-4 text-[--text-muted]" />
                </div>
                <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                  <span>{OVERVIEW_METRICS.carbon.val} <span className="text-xs">{OVERVIEW_METRICS.carbon.unit}</span></span>
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-[--status-critical]">
                    <TrendingUp className="w-2.5 h-2.5" />
                    <span>{OVERVIEW_METRICS.carbon.trend}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 mt-3">
                <span className="text-[9px] font-mono text-[--text-secondary] truncate max-w-[110px]">
                  {OVERVIEW_METRICS.carbon.sub}
                </span>
                <div className="w-[65px] h-3 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineCarbon.map((v) => ({ v }))}>
                      <Line type="monotone" dataKey="v" stroke="var(--status-critical)" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Estimated Daily Cost */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                    Estimated Daily Cost
                  </span>
                  <DollarSign className="w-4 h-4 text-[--text-muted]" />
                </div>
                <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                  <span>{OVERVIEW_METRICS.cost.prefix}{OVERVIEW_METRICS.cost.val}{OVERVIEW_METRICS.cost.unit}</span>
                  <span className="text-[9px] font-mono font-semibold text-[--text-muted]">
                    {OVERVIEW_METRICS.cost.trend}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 mt-3">
                <span className="text-[9px] font-mono text-[--text-secondary] truncate max-w-[110px]">
                  {OVERVIEW_METRICS.cost.sub}
                </span>
                <div className="w-[65px] h-3 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineCost.map((v) => ({ v }))}>
                      <Line type="monotone" dataKey="v" stroke="var(--text-muted)" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Consumption vs ML Baseline Chart */}
          <div
            className="rounded-[10px] border p-5 flex flex-col"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                Consumption vs. Machine Learning Baseline
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-[--text-secondary]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 rounded-full bg-[#00D4AA]" />
                  <span>Actual Load (kW)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 border-t-2 border-dashed border-[#8B96A8]" />
                  <span>Expected Baseline</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623] border border-[#151C2C]" />
                  <span>Anomaly Detected</span>
                </div>
              </div>
            </div>

            <div className="h-[280px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CONSUMPTION_VS_BASELINE_DATA} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--text-muted)" tickLine={false} dy={8} />
                  <YAxis domain={[250, 1100]} stroke="var(--text-muted)" tickLine={false} dx={-8} />
                  <Tooltip content={renderOverviewTooltip} />
                  <Line
                    type="monotone"
                    dataKey="expected"
                    stroke="var(--text-secondary)"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#00D4AA"
                    strokeWidth={2}
                    dot={false}
                  />
                  {/* Anomaly markers */}
                  <ReferenceDot x="12:00" y={810} r={5} fill="#F5A623" stroke="#151C2C" strokeWidth={1.5} />
                  <ReferenceDot x="16:00" y={990} r={5} fill="#F5A623" stroke="#151C2C" strokeWidth={1.5} />
                  <ReferenceDot x="20:00" y={600} r={5} fill="#F5A623" stroke="#151C2C" strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Consumers by Asset */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center justify-between mb-5 border-b border-[--border-subtle] pb-3">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                  Top Consumers by Asset
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-mono text-[#00D4AA] cursor-pointer hover:underline">
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="flex flex-col gap-4.5">
                {TOP_CONSUMERS.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-mono text-[--text-primary]">
                      <span>{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span>{item.value}</span>
                        <span className="text-[10px] text-[--text-secondary] w-8 text-right">{item.pct}%</span>
                      </div>
                    </div>
                    {/* Progress Bar Track */}
                    <div className="h-1.5 w-full bg-[var(--bg-surface)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.pct}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detected Efficiency Anomalies */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center justify-between mb-4 border-b border-[--border-subtle] pb-3">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                  Detected Efficiency Anomalies
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="text-[10px] font-semibold text-[--text-muted] border-b border-[--border-subtle] pb-2">
                      <th className="pb-2.5 font-semibold">TIME</th>
                      <th className="pb-2.5 font-semibold">ASSET</th>
                      <th className="pb-2.5 font-semibold">DEVIATION</th>
                      <th className="pb-2.5 font-semibold">IMPACT</th>
                      <th className="pb-2.5 font-semibold text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ANOMALIES_LIST.map((row, idx) => (
                      <tr key={idx} className="border-b border-[--border-subtle] hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                        <td className="py-3 text-[--text-secondary]">{row.time}</td>
                        <td className="py-3 font-semibold text-[--text-primary]">{row.asset}</td>
                        <td className="py-3 text-[#E5484D] font-bold">{row.deviation}</td>
                        <td className="py-3">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider',
                              row.severity === 'High' && 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                              row.severity === 'Medium' && 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
                              row.severity === 'Low' && 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                            )}
                          >
                            {row.severity}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            className={cn(
                              "px-2.5 py-1 rounded-[4px] border text-[10px] font-bold cursor-pointer transition-colors",
                              row.status === 'active'
                                ? "border-[#00D4AA] text-[#00D4AA] hover:bg-[#00D4AA]/10"
                                : "border-[--border-default] text-[--text-muted] cursor-default"
                            )}
                          >
                            {row.status === 'active' ? 'Investigate' : 'Resolved'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'realtime' && (
        <div className="flex flex-col gap-6">
          {/* Grid of 4 Real-time KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Instantaneous Demand */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                    Instantaneous Demand
                  </span>
                  <Zap className="w-4 h-4 text-[#00D4AA]" />
                </div>
                <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                  <span>{instDemand.toLocaleString()} <span className="text-xs">kW</span></span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 mt-3">
                <span className="text-[9px] font-mono text-[--text-secondary]">
                  Peak today: 1,000 kW
                </span>
                <div className="w-[65px] h-3 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={realtimeData.map((pt) => ({ v: pt.val }))}>
                      <Line type="monotone" dataKey="v" stroke="#00D4AA" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Apparent Power */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                    Apparent Power
                  </span>
                  <Zap className="w-4 h-4 text-[--text-muted]" />
                </div>
                <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                  <span>{apparentPower.toLocaleString()} <span className="text-xs">kVA</span></span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 mt-3">
                <span className="text-[9px] font-mono text-[--text-secondary]">
                  Total complex power
                </span>
                <div className="w-[65px] h-3 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={realtimeData.map((pt) => ({ v: pt.val / 0.96 }))}>
                      <Line type="monotone" dataKey="v" stroke="#00D4AA" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Power Factor */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                    Power Factor (cos φ)
                  </span>
                  <span className="inline-flex items-center rounded border bg-green-500/10 border-green-500/20 text-green-400 font-bold px-1.5 py-0.2 text-[9px] font-mono uppercase tracking-wider shrink-0">
                    Healthy
                  </span>
                </div>
                <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                  <span>{powerFactor.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 mt-3">
                <span className="text-[9px] font-mono text-[--text-secondary]">
                  Target: &gt;= 0.95
                </span>
                <div className="w-[65px] h-3 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={realtimeData.map(() => ({ v: 0.96 + (Math.random() - 0.5) * 0.01 }))}>
                      <Line type="monotone" dataKey="v" stroke="var(--text-muted)" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Grid Frequency */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                    Grid Frequency
                  </span>
                  <Activity className="w-4 h-4 text-[--text-muted]" />
                </div>
                <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                  <span>{frequency.toFixed(2)} <span className="text-xs">Hz</span></span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 mt-3">
                <span className="text-[9px] font-mono text-[--text-secondary]">
                  Nominal: 50.00 ± 0.15
                </span>
                <div className="w-[65px] h-3 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={realtimeData.map(() => ({ v: 50.0 + (Math.random() - 0.5) * 0.05 }))}>
                      <Line type="monotone" dataKey="v" stroke="var(--text-muted)" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Live Load Curve Area Chart */}
          <div
            className="rounded-[10px] border p-5 flex flex-col"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                Live Load Curve (Last 60 Minutes)
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[--text-secondary]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00D4AA]" />
                <span>Instantaneous Load (kW)</span>
              </div>
            </div>

            <div className="h-[280px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={realtimeData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#00D4AA" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="time"
                    ticks={['T-60m', 'T-50m', 'T-40m', 'T-30m', 'T-20m', 'T-10m', 'Now']}
                    stroke="var(--text-muted)"
                    tickLine={false}
                    dy={8}
                  />
                  <YAxis
                    domain={[500, 1000]}
                    ticks={[500, 650, 800, 950]}
                    stroke="var(--text-muted)"
                    tickLine={false}
                    dx={-8}
                    width={65}
                    tickFormatter={(val) => `${val} kW`}
                  />
                  <Tooltip content={renderRealtimeTooltip} />
                  <Area
                    type="monotone"
                    dataKey="val"
                    stroke="#00D4AA"
                    fillOpacity={1}
                    fill="url(#colorDemand)"
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                  <ReferenceDot
                    x="Now"
                    y={instDemand}
                    r={8}
                    fill="#00D4AA"
                    fillOpacity={0.3}
                    stroke="none"
                  />
                  <ReferenceDot
                    x="Now"
                    y={instDemand}
                    r={4}
                    fill="#00D4AA"
                    stroke="var(--bg-card)"
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Real-time Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Phase Balance details */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center justify-between mb-5 border-b border-[--border-subtle] pb-3">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                  Phase Balance
                </h3>
                <span className="inline-flex items-center rounded border bg-[#00D4AA]/10 border-[#00D4AA]/20 text-[#00D4AA] font-bold px-1.5 py-0.2 text-[9px] font-mono uppercase tracking-wider shrink-0">
                  Symmetric
                </span>
              </div>

              <div className="flex flex-col gap-6">
                {/* L1 L2 L3 Columns Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Phase L1 */}
                  <div className="flex flex-col gap-3 p-3.5 rounded-[6px] border border-[--border-subtle] bg-[var(--bg-surface)]">
                    <span className="text-[10px] font-mono font-semibold text-[--text-secondary]">PHASE L1</span>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-baseline text-xs font-mono">
                        <span className="text-[--text-muted]">V</span>
                        <span className="font-bold text-[--text-primary]">231.4</span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs font-mono">
                        <span className="text-[--text-muted]">A</span>
                        <span className="font-bold text-[--text-primary]">1,210</span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs font-mono mt-1 border-t border-[--border-subtle] pt-1">
                        <span className="text-[--text-muted]">kW</span>
                        <span className="font-bold text-[#00D4AA]">279</span>
                      </div>
                    </div>
                  </div>

                  {/* Phase L2 */}
                  <div className="flex flex-col gap-3 p-3.5 rounded-[6px] border border-[--border-subtle] bg-[var(--bg-surface)]">
                    <span className="text-[10px] font-mono font-semibold text-[--text-secondary]">PHASE L2</span>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-baseline text-xs font-mono">
                        <span className="text-[--text-muted]">V</span>
                        <span className="font-bold text-[--text-primary]">230.1</span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs font-mono">
                        <span className="text-[--text-muted]">A</span>
                        <span className="font-bold text-[--text-primary]">1,225</span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs font-mono mt-1 border-t border-[--border-subtle] pt-1">
                        <span className="text-[--text-muted]">kW</span>
                        <span className="font-bold text-[#00D4AA]">281</span>
                      </div>
                    </div>
                  </div>

                  {/* Phase L3 */}
                  <div className="flex flex-col gap-3 p-3.5 rounded-[6px] border border-[--border-subtle] bg-[var(--bg-surface)]">
                    <span className="text-[10px] font-mono font-semibold text-[--text-secondary]">PHASE L3</span>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-baseline text-xs font-mono">
                        <span className="text-[--text-muted]">V</span>
                        <span className="font-bold text-[--text-primary]">232.0</span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs font-mono">
                        <span className="text-[--text-muted]">A</span>
                        <span className="font-bold text-[--text-primary]">1,215</span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs font-mono mt-1 border-t border-[--border-subtle] pt-1">
                        <span className="text-[--text-muted]">kW</span>
                        <span className="font-bold text-[#00D4AA]">282</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtext info */}
                <div className="flex flex-col gap-2 border-t border-[--border-subtle] pt-4 text-xs font-mono text-[--text-secondary]">
                  <div className="flex justify-between items-center">
                    <span>Max Voltage Imbalance</span>
                    <span className="font-bold text-[--text-primary]">0.82%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Max Current Imbalance</span>
                    <span className="font-bold text-[--text-primary]">1.24%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Active Loads */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center justify-between mb-4 border-b border-[--border-subtle] pb-3">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                  Top Active Loads
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-mono text-[#00D4AA] cursor-pointer hover:underline">
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="text-[10px] font-semibold text-[--text-muted] border-b border-[--border-subtle] pb-2">
                      <th className="pb-2.5 font-semibold">EQUIPMENT</th>
                      <th className="pb-2.5 font-semibold">STATE</th>
                      <th className="pb-2.5 font-semibold text-right">POWER</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { tag: 'CHL-01', desc: 'Main Chiller', state: 'Running', power: '312.4 kW' },
                      { tag: 'CHL-02', desc: 'Secondary Chiller', state: 'Running', power: '298.1 kW' },
                      { tag: 'CRAC-01', desc: 'Cooling Unit A', state: 'Running', power: '145.2 kW' },
                      { tag: 'CRAC-02', desc: 'Cooling Unit B', state: 'Standby', power: '12.0 kW' },
                      { tag: 'AHU-04', desc: 'Air Handler', state: 'Running', power: '48.5 kW' }
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-[--border-subtle] hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                        <td className="py-2.5">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[--text-primary]">{row.tag}</span>
                            <span className="text-[10px] text-[--text-muted]">{row.desc}</span>
                          </div>
                        </td>
                        <td className="py-2.5">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[10px] font-bold font-mono uppercase tracking-wider border",
                            row.state === 'Running'
                              ? "bg-[#00D4AA]/10 border-[#00D4AA]/20 text-[#00D4AA]"
                              : "bg-[#F5A623]/10 border-[#F5A623]/20 text-[#F5A623]"
                          )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", row.state === 'Running' ? "bg-[#00D4AA]" : "bg-[#F5A623]")} />
                            {row.state}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-bold text-[--text-primary]">{row.power}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'forecast' && (
        <div className="flex flex-col gap-6">
          {/* KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Actual vs Baseline (24h) */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                    Actual vs Baseline (24h)
                  </span>
                  <Activity className="w-4 h-4 text-[--text-muted]" />
                </div>
                <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                  <span>-4.2%</span>
                  <span className="px-1.5 py-0.5 rounded border border-green-500/20 bg-green-500/10 text-green-400 font-mono text-[9px] font-bold">
                    Under Baseline
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 mt-3">
                <span className="text-[9px] font-mono text-[--text-secondary] truncate max-w-[140px]">
                  Act: 14.2 MWh | Base: 14.8 MWh
                </span>
                <div className="w-[65px] h-3 shrink-0">
                  <Sparkline data={[14.8, 14.7, 14.6, 14.5, 14.4, 14.3, 14.2]} stroke="#00D4AA" />
                </div>
              </div>
            </div>

            {/* Peak Demand Forecast */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                    Peak Demand Forecast
                  </span>
                  <TrendingUp className="w-4 h-4 text-[--text-muted]" />
                </div>
                <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                  <span>1,150 <span className="text-xs">kW</span></span>
                  <span className="px-1.5 py-0.5 rounded border border-amber-500/20 bg-amber-500/10 text-amber-400 font-mono text-[9px] font-bold">
                    At 14:00 Today
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 mt-3">
                <span className="text-[9px] font-mono text-[--text-secondary] truncate max-w-[140px]">
                  Expected to exceed baseline by 58kW
                </span>
                <div className="w-[65px] h-3 shrink-0">
                  <Sparkline data={[980, 1010, 1050, 1090, 1120, 1140, 1150]} stroke="#F5A623" />
                </div>
              </div>
            </div>

            {/* Avoided Cost (MTD) */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                    Avoided Cost (MTD)
                  </span>
                  <DollarSign className="w-4 h-4 text-[--text-muted]" />
                </div>
                <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                  <span>ZAR 12.4k</span>
                  <span className="px-1.5 py-0.5 rounded border border-green-500/20 bg-green-500/10 text-green-400 font-mono text-[9px] font-bold">
                    ↗ 8%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 mt-3">
                <span className="text-[9px] font-mono text-[--text-secondary] truncate max-w-[140px]">
                  Vs predictive baseline model
                </span>
                <div className="w-[65px] h-3 shrink-0">
                  <Sparkline data={[10.1, 10.5, 11.0, 11.4, 11.8, 12.1, 12.4]} stroke="#00D4AA" />
                </div>
              </div>
            </div>

            {/* Forecast Confidence */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                    Forecast Confidence
                  </span>
                  <Target className="w-4 h-4 text-[--text-muted]" />
                </div>
                <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                  <span>94.2%</span>
                  <span className="px-1.5 py-0.5 rounded border border-[--border-strong] bg-[var(--bg-surface)] text-[--text-secondary] font-mono text-[9px] font-bold">
                    High Accuracy
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 mt-3">
                <span className="text-[9px] font-mono text-[--text-secondary] truncate max-w-[140px]">
                  Based on MAPE over last 30 days
                </span>
                <div className="w-[65px] h-3 shrink-0">
                  <Sparkline data={[93.8, 94.0, 94.1, 94.1, 94.2, 94.2, 94.2]} stroke="#8B96A8" />
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Load Forecast vs Historical Baseline Chart */}
          <div
            className="rounded-[10px] border p-5 flex flex-col"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                7-Day Load Forecast vs Historical Baseline
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-[--text-secondary]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 border-t-2 border-dashed border-[#8B96A8]" />
                  <span>Baseline</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 rounded-full bg-[#00D4AA]" />
                  <span>Actual Load</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 border-t-2 border-dashed border-[#F5A623]" />
                  <span>Forecast</span>
                </div>
              </div>
            </div>

            <div className="h-[280px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={[
                    { day: 'Mon', baseline: 740, actual: 720, forecast: null, ciRange: null },
                    { day: 'Tue', baseline: 700, actual: 680, forecast: null, ciRange: null },
                    { day: 'Wed', baseline: 750, actual: 780, forecast: null, ciRange: null },
                    { day: 'Thu', baseline: 820, actual: 850, forecast: null, ciRange: null },
                    { day: 'Fri (Today)', baseline: 780, actual: 750, forecast: 750, ciRange: [750, 750] },
                    { day: 'Sat', baseline: 550, actual: null, forecast: 500, ciRange: [430, 570] },
                    { day: 'Sun', baseline: 500, actual: null, forecast: 450, ciRange: [370, 530] }
                  ]}
                  margin={{ left: -10, right: 10, top: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--text-muted)" tickLine={false} dy={8} />
                  <YAxis
                    domain={[300, 1200]}
                    ticks={[300, 600, 900, 1200]}
                    stroke="var(--text-muted)"
                    tickLine={false}
                    dx={-8}
                    width={80}
                    tickFormatter={(val) => {
                      const num = val / 1000
                      return `${num < 1 ? '.' + Math.round(num * 10) : num.toFixed(1)} MW`
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null
                      const data = payload[0].payload
                      return (
                        <div
                          className="p-3 rounded-[10px] border shadow-xl font-mono text-[11px]"
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            borderColor: 'var(--border-strong)',
                          }}
                        >
                          <div className="text-[10px] mb-1.5 font-bold uppercase tracking-wider text-[--text-secondary]">
                            Day: {data.day}
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-center gap-5">
                              <span className="text-[--text-secondary]">Baseline:</span>
                              <span className="font-bold text-[--text-muted]">{data.baseline} kW</span>
                            </div>
                            {data.actual !== null && (
                              <div className="flex justify-between items-center gap-5">
                                <span className="text-[--text-secondary]">Actual Load:</span>
                                <span className="font-bold text-[#00D4AA]">{data.actual} kW</span>
                              </div>
                            )}
                            {data.forecast !== null && (
                              <div className="flex justify-between items-center gap-5">
                                <span className="text-[--text-secondary]">Forecast Load:</span>
                                <span className="font-bold text-[#F5A623]">{data.forecast} kW</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ciRange"
                    fill="#F5A623"
                    fillOpacity={0.08}
                    stroke="none"
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke="#8B96A8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#00D4AA"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#F5A623"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                  <ReferenceLine
                    x="Fri (Today)"
                    stroke="var(--text-muted)"
                    strokeDasharray="3 3"
                    label={{
                      value: 'NOW',
                      position: 'insideTopLeft',
                      fill: 'var(--text-secondary)',
                      fontSize: 10,
                      fontFamily: 'monospace',
                      offset: 10
                    }}
                  />
                  <ReferenceDot x="Fri (Today)" y={750} r={5} fill="#00D4AA" stroke="var(--bg-card)" strokeWidth={1.5} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Split Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Baseline Deviations Table */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-[--border-subtle] pb-3">
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                    Baseline Deviations (Last 48h)
                  </h3>
                  <span className="text-[10px] font-mono text-[--text-secondary] hover:text-[--text-primary] cursor-pointer hover:underline">
                    View All
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="text-[10px] font-semibold text-[--text-muted] border-b border-[--border-subtle] pb-2">
                        <th className="pb-2.5 font-semibold">TIME / DATE</th>
                        <th className="pb-2.5 font-semibold">EQUIPMENT / ZONE</th>
                        <th className="pb-2.5 font-semibold text-right">VARIANCE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { time: '14:30 - Today', duration: 'Duration: 45m', eq: 'HVAC Plant Room B', desc: 'Chiller short-cycling detected', variance: '+18.4%', severity: 'high' },
                        { time: '08:15 - Today', duration: 'Duration: 12m', eq: 'Data Hall 3 - CRACs', desc: 'Simultaneous staging', variance: '+9.2%', severity: 'medium' },
                        { time: '22:00 - Yesterday', duration: 'Duration: 3h 10m', eq: 'Admin Block Lighting', desc: 'Failed to enter night setback', variance: '+32.5%', severity: 'high' },
                        { time: '18:45 - Yesterday', duration: 'Duration: 25m', eq: 'Main Chiller (CHL-01)', desc: 'Load spike without demand', variance: '+11.8%', severity: 'medium' }
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-[--border-subtle] hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                          <td className="py-2.5">
                            <div className="flex flex-col">
                              <span className="font-semibold text-[--text-primary]">{row.time}</span>
                              <span className="text-[10px] text-[--text-muted]">{row.duration}</span>
                            </div>
                          </td>
                          <td className="py-2.5">
                            <div className="flex flex-col">
                              <span className="font-semibold text-[--text-primary]">{row.eq}</span>
                              <span className="text-[10px] text-[--text-muted]">{row.desc}</span>
                            </div>
                          </td>
                          <td className="py-2.5 text-right">
                            <span className={cn(
                              "inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono border",
                              row.severity === 'high' ? "bg-[#E5484D]/10 text-[#E5484D] border-[#E5484D]/20" : "bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/20"
                            )}>
                              {row.variance}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Model Drivers & Suggestions Sidebar */}
            <div
              className="rounded-[10px] border p-5 flex flex-col"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary] mb-4 border-b border-[--border-subtle] pb-3">
                Model Drivers & Suggestions
              </h3>
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-mono text-[--text-muted] font-bold uppercase tracking-wider">
                  Predictive Drivers
                </span>
                
                {/* Ambient Temperature */}
                <div className="flex items-start gap-3 p-3 rounded-[6px] border border-[--border-subtle] bg-[var(--bg-surface)]">
                  <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 mt-0.5">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-xs font-semibold font-mono text-[--text-primary]">Ambient Temperature</span>
                      <span className="px-1.5 py-0.2 rounded border border-red-500/20 bg-red-500/10 text-red-400 text-[9px] font-bold font-mono uppercase tracking-wider shrink-0">High Impact</span>
                    </div>
                    <span className="text-[10px] text-[--text-secondary] block">Expected peak of 32°C at 14:00</span>
                  </div>
                </div>

                {/* Operating Schedule */}
                <div className="flex items-start gap-3 p-3 rounded-[6px] border border-[--border-subtle] bg-[var(--bg-surface)]">
                  <div className="p-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-xs font-semibold font-mono text-[--text-primary]">Operating Schedule</span>
                      <span className="px-1.5 py-0.2 rounded border border-amber-500/20 bg-amber-500/10 text-amber-400 text-[9px] font-bold font-mono uppercase tracking-wider shrink-0">Medium Impact</span>
                    </div>
                    <span className="text-[10px] text-[--text-secondary] block">Standard Friday operations</span>
                  </div>
                </div>

                {/* AI Recommendations */}
                <span className="text-[10px] font-mono text-[--text-muted] font-bold uppercase tracking-wider mt-2">
                  AI Recommendations
                </span>
                
                <div className="p-4 rounded-[6px] border border-[#00D4AA]/20 bg-[#00D4AA]/5 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[#00D4AA]">
                    <Lightbulb className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold font-mono">Pre-cooling Opportunity</span>
                  </div>
                  <p className="text-[11px] text-[--text-secondary] leading-relaxed">
                    High temperatures forecasted for 14:00. Recommend shifting HVAC load to 11:00-13:00 to reduce peak demand charges and improve efficiency.
                  </p>
                  
                  <button
                    onClick={() => {
                      const nextVal = !shiftApplied
                      setShiftApplied(nextVal)
                      if (nextVal) {
                        setShowToast(true)
                      }
                    }}
                    className={cn(
                      "w-full py-2 rounded font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                      shiftApplied
                        ? "bg-green-500/10 border border-green-500/20 text-green-400"
                        : "bg-[#00D4AA] text-[#0A0D14] hover:shadow-[0_0_12px_rgba(0,212,170,0.3)]"
                    )}
                  >
                    {shiftApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Schedule Shift Applied</span>
                      </>
                    ) : (
                      <span>Apply Schedule Shift</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pue' && (
        <div className="flex flex-col gap-6">
          {/* KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current PUE */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                    Current PUE
                  </span>
                  <Target className="w-4 h-4 text-[--text-muted]" />
                </div>
                <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                  <span>1.34</span>
                  <span className="px-1.5 py-0.5 rounded border border-green-500/20 bg-green-500/10 text-green-400 font-mono text-[9px] font-bold">
                    Healthy
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 mt-3">
                <span className="text-[9px] font-mono text-[--text-secondary] truncate max-w-[140px]">
                  Target: &lt; 1.40
                </span>
                <div className="w-[65px] h-3 shrink-0">
                  <Sparkline data={[1.39, 1.38, 1.37, 1.36, 1.35, 1.34, 1.34]} stroke="#00D4AA" />
                </div>
              </div>
            </div>

            {/* Total Facility Load */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                    Total Facility Load
                  </span>
                  <Building className="w-4 h-4 text-[--text-muted]" />
                </div>
                <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                  <span>831 <span className="text-xs">kW</span></span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 mt-3">
                <span className="text-[9px] font-mono text-[--text-secondary] truncate max-w-[140px]">
                  7-day avg: 815 kW
                </span>
                <div className="w-[65px] h-3 shrink-0">
                  <Sparkline data={[815, 820, 825, 830, 835, 832, 831]} stroke="#00D4AA" />
                </div>
              </div>
            </div>

            {/* IT Equipment Load */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                    IT Equipment Load
                  </span>
                  <Building className="w-4 h-4 text-[--text-muted]" />
                </div>
                <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                  <span>620 <span className="text-xs">kW</span></span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 mt-3">
                <span className="text-[9px] font-mono text-[--text-secondary] truncate max-w-[140px]">
                  74.6% of total load
                </span>
                <div className="w-[65px] h-3 shrink-0">
                  <Sparkline data={[600, 610, 615, 618, 622, 621, 620]} stroke="#8B96A8" />
                </div>
              </div>
            </div>

            {/* Cooling Load */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                    Cooling Load
                  </span>
                  <Wind className="w-4 h-4 text-[--text-muted]" />
                </div>
                <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                  <span>185 <span className="text-xs">kW</span></span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 mt-3">
                <span className="text-[9px] font-mono text-[--text-secondary] truncate max-w-[140px]">
                  22.3% of total load
                </span>
                <div className="w-[65px] h-3 shrink-0">
                  <Sparkline data={[195, 190, 188, 186, 185, 184, 185]} stroke="#F5A623" />
                </div>
              </div>
            </div>
          </div>

          {/* PUE Trend (Last 7 Days) */}
          <div
            className="rounded-[10px] border p-5 flex flex-col"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                {pueRange === '7D'
                  ? 'PUE Trend (Last 7 Days)'
                  : pueRange === '30D'
                  ? 'PUE Trend (Last 30 Days)'
                  : 'PUE Trend (Last 12 Months)'}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-[--text-secondary]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00D4AA]" />
                  <span>Measured PUE</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 border-t border-dashed border-[#8B96A8]" />
                  <span>Target (1.40)</span>
                </div>
              </div>
            </div>

            <div className="h-[280px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={PUE_CHART_DATA[pueRange]}
                  margin={{ left: -10, right: 10, top: 10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorPue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#00D4AA" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--text-muted)" tickLine={false} dy={8} />
                  <YAxis
                    domain={[1.0, 2.0]}
                    ticks={[1.0, 1.2, 1.4, 1.6, 1.8, 2.0]}
                    stroke="var(--text-muted)"
                    tickLine={false}
                    dx={-8}
                    width={50}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null
                      const data = payload[0].payload
                      return (
                        <div
                          className="p-3 rounded-[10px] border shadow-xl font-mono text-[11px]"
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            borderColor: 'var(--border-strong)',
                          }}
                        >
                          <div className="text-[10px] mb-1 font-bold text-[--text-secondary]">
                            Time: {data.label}
                          </div>
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-[--text-secondary]">Measured PUE:</span>
                            <span className="font-bold text-[#00D4AA]">
                              {data.pue}
                            </span>
                          </div>
                        </div>
                      )
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pue"
                    stroke="#00D4AA"
                    fillOpacity={1}
                    fill="url(#colorPue)"
                    strokeWidth={2}
                  />
                  <ReferenceLine
                    y={1.40}
                    stroke="#8B96A8"
                    strokeDasharray="4 4"
                    strokeWidth={1}
                  />
                  <ReferenceDot
                    x={pueRange === '7D' ? 'Sun' : pueRange === '30D' ? '05/23' : 'May'}
                    y={1.34}
                    r={8}
                    fill="#00D4AA"
                    fillOpacity={0.3}
                    stroke="none"
                  />
                  <ReferenceDot
                    x={pueRange === '7D' ? 'Sun' : pueRange === '30D' ? '05/23' : 'May'}
                    y={1.34}
                    r={4}
                    fill="#00D4AA"
                    stroke="var(--bg-card)"
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Split Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Energy Distribution */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <div className="flex items-center justify-between mb-5 border-b border-[--border-subtle] pb-3">
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                    Energy Distribution
                  </h3>
                  <span className="text-[10px] font-mono text-[--text-secondary]">
                    Current Hour
                  </span>
                </div>

                {/* Calculate Dynamic Widths */}
                {(() => {
                  const rawValues = { it: 620, cooling: 185, power: 26 }
                  const totalActive = Object.keys(rawValues)
                    .filter(k => activeConsumers.includes(k))
                    .reduce((sum, k) => sum + rawValues[k as keyof typeof rawValues], 0)

                  const itWidth = activeConsumers.includes('it') ? (rawValues.it / (totalActive || 1)) * 100 : 0
                  const coolingWidth = activeConsumers.includes('cooling') ? (rawValues.cooling / (totalActive || 1)) * 100 : 0
                  const powerWidth = activeConsumers.includes('power') ? (rawValues.power / (totalActive || 1)) * 100 : 0

                  return (
                    <div className="flex flex-col gap-6">
                      <div className="flex justify-between items-baseline font-mono">
                        <span className="text-[10px] font-semibold text-[--text-secondary]">Total Output</span>
                        <span className="text-xl font-bold text-[--text-primary]">{totalActive} kW</span>
                      </div>

                      {/* Stacked Percentage Bar */}
                      <div className="h-4 w-full bg-[var(--bg-surface)] rounded-full overflow-hidden flex">
                        {itWidth > 0 && (
                          <div
                            className="h-full bg-[#00D4AA] transition-all duration-300 border-r border-[var(--bg-card)] last:border-r-0"
                            style={{ width: `${itWidth}%` }}
                          />
                        )}
                        {coolingWidth > 0 && (
                          <div
                            className="h-full bg-[#F5A623] transition-all duration-300 border-r border-[var(--bg-card)] last:border-r-0"
                            style={{ width: `${coolingWidth}%` }}
                          />
                        )}
                        {powerWidth > 0 && (
                          <div
                            className="h-full bg-white transition-all duration-300"
                            style={{ width: `${powerWidth}%` }}
                          />
                        )}
                      </div>

                      {/* Checkbox Legends */}
                      <div className="flex flex-col gap-3">
                        {/* IT Equipment Legend */}
                        <div
                          onClick={() => {
                            setActiveConsumers(prev =>
                              prev.includes('it') ? prev.filter(x => x !== 'it') : [...prev, 'it']
                            )
                          }}
                          className="flex items-center justify-between p-2.5 rounded-[6px] border border-[--border-subtle] bg-[var(--bg-surface)] hover:border-[#00D4AA]/40 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-4 h-4 rounded flex items-center justify-center border transition-colors",
                              activeConsumers.includes('it')
                                ? "bg-[#00D4AA] border-[#00D4AA] text-[#0A0D14]"
                                : "border-[--border-default] bg-transparent"
                            )}>
                              {activeConsumers.includes('it') && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-semibold font-mono text-[--text-primary]">IT Equipment</span>
                          </div>
                          <div className="flex items-center gap-4 font-mono text-xs text-[--text-secondary]">
                            <span>620 kW</span>
                            <span className="w-12 text-right">74.6%</span>
                          </div>
                        </div>

                        {/* Cooling Systems Legend */}
                        <div
                          onClick={() => {
                            setActiveConsumers(prev =>
                              prev.includes('cooling') ? prev.filter(x => x !== 'cooling') : [...prev, 'cooling']
                            )
                          }}
                          className="flex items-center justify-between p-2.5 rounded-[6px] border border-[--border-subtle] bg-[var(--bg-surface)] hover:border-[#F5A623]/40 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-4 h-4 rounded flex items-center justify-center border transition-colors",
                              activeConsumers.includes('cooling')
                                ? "bg-[#F5A623] border-[#F5A623] text-[#0A0D14]"
                                : "border-[--border-default] bg-transparent"
                            )}>
                              {activeConsumers.includes('cooling') && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-semibold font-mono text-[--text-primary]">Cooling Systems</span>
                          </div>
                          <div className="flex items-center gap-4 font-mono text-xs text-[--text-secondary]">
                            <span>185 kW</span>
                            <span className="w-12 text-right">22.3%</span>
                          </div>
                        </div>

                        {/* Power & Lighting Legend */}
                        <div
                          onClick={() => {
                            setActiveConsumers(prev =>
                              prev.includes('power') ? prev.filter(x => x !== 'power') : [...prev, 'power']
                            )
                          }}
                          className="flex items-center justify-between p-2.5 rounded-[6px] border border-[--border-subtle] bg-[var(--bg-surface)] hover:border-white/40 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-4 h-4 rounded flex items-center justify-center border transition-colors",
                              activeConsumers.includes('power')
                                ? "bg-white border-white text-[#0A0D14]"
                                : "border-[--border-default] bg-transparent"
                            )}>
                              {activeConsumers.includes('power') && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-semibold font-mono text-[--text-primary]">Power & Lighting</span>
                          </div>
                          <div className="flex items-center gap-4 font-mono text-xs text-[--text-secondary]">
                            <span>26 kW</span>
                            <span className="w-12 text-right">3.1%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>

              <div className="flex justify-between items-center border-t border-[--border-subtle] pt-4 mt-6 text-xs font-mono">
                <span className="text-[--text-secondary]">Cooling Efficiency Ratio</span>
                <span className="font-bold text-green-400">3.35 (Target &gt; 3.0)</span>
              </div>
            </div>

            {/* Optimization Insights */}
            <div
              className="rounded-[10px] border p-5 flex flex-col gap-4"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center justify-between border-b border-[--border-subtle] pb-3">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                  Optimization Insights
                </h3>
                <span className="text-[10px] font-mono text-[--text-secondary] hover:text-[--text-primary] cursor-pointer hover:underline flex items-center gap-1">
                  <span>Generate Report</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {/* Chiller Sequencing */}
                <div className="flex flex-col gap-3 p-4 rounded-[6px] border border-[--border-subtle] bg-[var(--bg-surface)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-[#E5484D]/10 border border-[#E5484D]/20 text-[#E5484D]">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold font-mono text-[--text-primary]">Suboptimal Chiller Sequencing</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded border border-[#E5484D]/20 bg-[#E5484D]/10 text-[#E5484D] text-[9px] font-bold font-mono uppercase tracking-wider">High Impact</span>
                  </div>
                  <p className="text-[11px] text-[--text-secondary] leading-relaxed">
                    CHL-02 is operating at 28% part-load ratio. Consolidating load to CHL-01 could reduce cooling power by estimated 18 kW.
                  </p>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setShowActionPlan(!showActionPlan)}
                      className="w-fit px-3 py-1.5 rounded border border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-card)] text-[--text-primary] font-mono text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      {showActionPlan ? 'Hide Action Plan' : 'View Action Plan'}
                    </button>
                    
                    {showActionPlan && (
                      <div className="p-3 mt-1 rounded bg-[var(--bg-card)] border border-[--border-subtle] flex flex-col gap-2.5 font-mono text-[10px]">
                        <span className="text-[--text-muted] font-bold uppercase tracking-wider">Consolidation checklist:</span>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-green-400">
                            <Check className="w-3.5 h-3.5" />
                            <span>1. Verify CHL-01 capacity (42% margin available)</span>
                          </div>
                          <div className="flex items-center gap-2 text-[--text-secondary]">
                            <span className="w-3.5 h-3.5 rounded-full border border-[--border-default] flex items-center justify-center text-[8px]">2</span>
                            <span>2. Lower CHL-02 stage priority in controller</span>
                          </div>
                          <div className="flex items-center gap-2 text-[--text-secondary]">
                            <span className="w-3.5 h-3.5 rounded-full border border-[--border-default] flex items-center justify-center text-[8px]">3</span>
                            <span>3. Initiate automated load transfer sequence</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            alert('Staging plan executed. Consolidation sequence has been dispatched to BMS controllers.')
                            setShowActionPlan(false)
                          }}
                          className="mt-1 py-1.5 w-full rounded bg-[#00D4AA] text-[#0A0D14] font-bold text-center hover:opacity-90 cursor-pointer"
                        >
                          Execute Consolidation
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Supply Temp Deviation */}
                <div className="flex items-start gap-3 p-4 rounded-[6px] border border-[--border-subtle] bg-[var(--bg-surface)]">
                  <div className="p-1.5 rounded bg-[#F5A623]/10 border border-[#F5A623]/20 text-[#F5A623] mt-0.5">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold font-mono text-[--text-primary]">Supply Temp Setpoint Deviation</span>
                      <span className="px-1.5 py-0.2 rounded border border-[#F5A623]/20 bg-[#F5A623]/10 text-[#F5A623] text-[9px] font-bold font-mono uppercase tracking-wider shrink-0">Medium Impact</span>
                    </div>
                    <p className="text-[11px] text-[--text-secondary] leading-relaxed">
                      CRAC-04 supply temperature setpoint is 1.5°C lower than baseline recommendation. Raising setpoint will improve economization hours.
                    </p>
                  </div>
                </div>

                {/* Unoccupied Lighting Load */}
                <div className="flex items-start gap-3 p-4 rounded-[6px] border border-[--border-subtle] bg-[var(--bg-surface)]">
                  <div className="p-1.5 rounded bg-[var(--bg-elevated)] border border-[--border-default] text-[--text-muted] mt-0.5">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold font-mono text-[--text-primary]">Unoccupied Lighting Load</span>
                      <span className="px-1.5 py-0.2 rounded border border-[--border-default] bg-[var(--bg-surface)] text-[--text-secondary] text-[9px] font-bold font-mono uppercase tracking-wider shrink-0">Low Impact</span>
                    </div>
                    <p className="text-[11px] text-[--text-secondary] leading-relaxed">
                      Hall B lighting remains active during off-peak hours (22:00 - 04:00). Estimated saving: 2.4 kW/day.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#151C2C] border border-[#00D4AA]/30 rounded-[10px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center gap-3 font-mono text-xs max-w-sm">
          <div className="p-1 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-[--text-primary]">Optimization Schedule Applied</div>
            <div className="text-[10px] text-[--text-secondary] mt-0.5">Pre-cooling sequence dispatched to BMS controllers.</div>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="text-[--text-muted] hover:text-[--text-primary] transition-colors cursor-pointer ml-2 text-xs font-sans"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
