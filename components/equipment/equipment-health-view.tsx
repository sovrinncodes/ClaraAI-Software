'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Eye,
  Filter,
  LayoutGrid,
  LayoutList,
  MapPin,
  Search,
  Shield,
  TrendingDown,
  TrendingUp,
  Wrench,
  Zap,
  ChevronRight,
  SlidersHorizontal,
  Download,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { DEMO_WATCHLIST_ASSETS, DEMO_FACILITIES } from '@/lib/data/seed'

// ─── Extended mock asset list for the overview ────────────────────────────────

const ALL_ASSETS = [
  ...DEMO_WATCHLIST_ASSETS,
  {
    id: 'asset_ct_01',
    externalId: 'CT-01',
    facilityId: 'fac_jhb_dc_01',
    name: 'CT-01 (Cooling Tower)',
    type: 'COOLING_TOWER',
    healthScore: 96,
    status: 'OPTIMAL' as const,
    predictedTtfDays: 180,
    faultType: null,
    faultConfidence: null,
    vibrationRms: 1.2,
    operatingLoadPct: 62,
    isoZone: 'A',
    isCritical: false,
    facilityName: 'Johannesburg DC-1',
    energyDrawKw: 12.8,
  },
  {
    id: 'asset_gen_01',
    externalId: 'GEN-01',
    facilityId: 'fac_jhb_dc_01',
    name: 'GEN-01 (Emergency Generator)',
    type: 'GENERATOR',
    healthScore: 91,
    status: 'OPTIMAL' as const,
    predictedTtfDays: 210,
    faultType: null,
    faultConfidence: null,
    vibrationRms: 0.8,
    operatingLoadPct: 0,
    isoZone: 'A',
    isCritical: true,
    facilityName: 'Johannesburg DC-1',
    energyDrawKw: 0,
  },
  {
    id: 'asset_pump_a',
    externalId: 'PUMP-A',
    facilityId: 'fac_dbn_log_01',
    name: 'PUMP-A (Chilled Water Pump)',
    type: 'PUMP',
    healthScore: 99,
    status: 'OPTIMAL' as const,
    predictedTtfDays: 365,
    faultType: null,
    faultConfidence: null,
    vibrationRms: 0.4,
    operatingLoadPct: 55,
    isoZone: 'A',
    isCritical: false,
    facilityName: 'Durban Logistics Hub',
    energyDrawKw: 4.1,
  },
  {
    id: 'asset_ahu_07',
    externalId: 'AHU-07',
    facilityId: 'fac_cpt_mfg_01',
    name: 'AHU-07 (Air Handling Unit)',
    type: 'AHU',
    healthScore: 76,
    status: 'ADVISORY' as const,
    predictedTtfDays: 22,
    faultType: 'Filter Clog Developing',
    faultConfidence: 0.74,
    vibrationRms: 3.8,
    operatingLoadPct: 88,
    isoZone: 'C',
    isCritical: false,
    facilityName: 'Cape Town Assembly',
    energyDrawKw: 11.2,
  },
]

// ─── Type helpers ─────────────────────────────────────────────────────────────

type Status = 'OPTIMAL' | 'WATCH' | 'ADVISORY' | 'CRITICAL'
type ViewMode = 'list' | 'grid'

const STATUS_CONFIG: Record<Status, { label: string; dot: string; badge: string; ring: string }> = {
  OPTIMAL:  { label: 'Optimal',  dot: 'bg-[#00D4AA]', badge: 'bg-green-500/10 border-green-500/20 text-green-400',  ring: 'border-[#00D4AA]/40' },
  WATCH:    { label: 'Watch',    dot: 'bg-[#3B82F6]', badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400',     ring: 'border-[#3B82F6]/40' },
  ADVISORY: { label: 'Advisory', dot: 'bg-[#F5A623]', badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400', ring: 'border-[#F5A623]/40' },
  CRITICAL: { label: 'Critical', dot: 'bg-[#E5484D]', badge: 'bg-red-500/10 border-red-500/20 text-red-400',        ring: 'border-[#E5484D]/40' },
}

const TYPE_LABELS: Record<string, string> = {
  CHILLER:       'Centrifugal Chiller',
  CRAC_UNIT:     'CRAC Unit',
  UPS:           'UPS System',
  AHU:           'Air Handling Unit',
  COOLING_TOWER: 'Cooling Tower',
  GENERATOR:     'Generator',
  PUMP:          'Pump',
}

function HealthRing({ score, status }: { score: number; status: Status }) {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (score / 100) * circumference
  const strokeColor =
    status === 'CRITICAL' ? '#E5484D' :
    status === 'ADVISORY' ? '#F5A623' :
    status === 'WATCH'    ? '#3B82F6' :
    '#00D4AA'

  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <circle
          cx="24" cy="24" r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-[11px] font-bold text-[--text-primary]">{score}%</span>
      </div>
    </div>
  )
}

// ─── Summary KPI cards ────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string
  value: string | number
  sub: string
  icon: React.ElementType
  accent: string
}) {
  return (
    <div
      className="rounded-[10px] border p-5 flex flex-col gap-3"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
    >
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
          {label}
        </span>
        <div className={cn('w-7 h-7 rounded-md flex items-center justify-center', accent)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="font-mono text-2xl font-light text-[--text-primary]">{value}</div>
      <div className="text-[10px] font-mono text-[--text-muted]">{sub}</div>
    </div>
  )
}

// ─── Asset list row ───────────────────────────────────────────────────────────

function AssetRow({ asset }: { asset: (typeof ALL_ASSETS)[0] }) {
  const status = (asset.status || 'OPTIMAL') as Status
  const cfg = STATUS_CONFIG[status]

  return (
    <tr
      className="border-b last:border-0 border-[--border-subtle] hover:bg-[rgba(255,255,255,0.015)] transition-colors group"
    >
      {/* Health Ring + Name */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-4">
          <HealthRing score={asset.healthScore} status={status} />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-[--text-primary] group-hover:text-[#00D4AA] transition-colors">
                {asset.externalId}
              </span>
              {asset.isCritical && (
                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  Key Asset
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono text-[--text-muted]">
              {TYPE_LABELS[asset.type] || asset.type}
            </span>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full shrink-0', cfg.dot)} />
          <span className={cn('px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase tracking-wider', cfg.badge)}>
            {cfg.label}
          </span>
        </div>
      </td>

      {/* Facility */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5 text-xs font-mono text-[--text-secondary]">
          <MapPin className="w-3 h-3 text-[--text-muted] shrink-0" />
          <span>{asset.facilityName}</span>
        </div>
      </td>

      {/* Fault / AI Insight */}
      <td className="px-5 py-4 max-w-[200px]">
        {asset.faultType ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-mono text-[--text-primary] truncate">{asset.faultType}</span>
            {asset.faultConfidence && (
              <span className="text-[10px] font-mono text-amber-400">
                {Math.round(asset.faultConfidence * 100)}% confidence
              </span>
            )}
          </div>
        ) : (
          <span className="text-[10px] font-mono text-[--text-muted] italic">No anomaly detected</span>
        )}
      </td>

      {/* TTF */}
      <td className="px-5 py-4">
        {asset.predictedTtfDays != null ? (
          <div className="flex flex-col gap-0.5">
            <span className={cn(
              'font-mono text-sm font-semibold',
              asset.predictedTtfDays < 15 ? 'text-[--status-critical]' :
              asset.predictedTtfDays < 45 ? 'text-amber-400' :
              'text-[--text-primary]'
            )}>
              {asset.predictedTtfDays}d
            </span>
            <span className="text-[9px] font-mono text-[--text-muted] uppercase">TTF</span>
          </div>
        ) : (
          <span className="text-[--text-muted] font-mono text-xs">—</span>
        )}
      </td>

      {/* Load */}
      <td className="px-5 py-4">
        <div className="flex flex-col gap-1.5 w-20">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-[--text-secondary]">{(asset.operatingLoadPct ?? 0)}%</span>
          </div>
          <div className="h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(asset.operatingLoadPct ?? 0)}%`,
                backgroundColor:
                  (asset.operatingLoadPct ?? 0) >= 95 ? '#E5484D' :
                  (asset.operatingLoadPct ?? 0) >= 80 ? '#F5A623' :
                  '#00D4AA'
              }}
            />
          </div>
        </div>
      </td>

      {/* Energy */}
      <td className="px-5 py-4">
        <span className="font-mono text-xs text-[--text-secondary]">
          {asset.energyDrawKw > 0 ? `${asset.energyDrawKw} kW` : <span className="text-[--text-muted]">Standby</span>}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-4 text-right">
        <Link
          href={`/equipment/${asset.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border font-mono text-[10px] font-bold text-[--text-secondary] hover:text-[--text-primary] hover:border-[--border-strong] transition-all bg-[var(--bg-elevated)] border-[--border-default]"
        >
          <Eye className="w-3 h-3" />
          <span>View</span>
        </Link>
      </td>
    </tr>
  )
}

// ─── Asset Grid card ──────────────────────────────────────────────────────────

function AssetCard({ asset }: { asset: (typeof ALL_ASSETS)[0] }) {
  const status = (asset.status || 'OPTIMAL') as Status
  const cfg = STATUS_CONFIG[status]

  return (
    <Link
      href={`/equipment/${asset.id}`}
      className={cn(
        'rounded-[10px] border p-5 flex flex-col gap-4 transition-all hover:border-[--border-strong] cursor-pointer group',
        status === 'CRITICAL' ? 'border-red-500/20 hover:border-red-500/40' : 'border-[--border-default]'
      )}
      style={{ backgroundColor: 'var(--bg-card)' }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-[--text-primary] group-hover:text-[#00D4AA] transition-colors">
              {asset.externalId}
            </span>
            {asset.isCritical && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400">
                Key
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-[--text-muted]">
            {TYPE_LABELS[asset.type] || asset.type}
          </span>
        </div>
        <HealthRing score={asset.healthScore} status={status} />
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2">
        <span className={cn('w-2 h-2 rounded-full shrink-0', cfg.dot)} />
        <span className={cn('px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase tracking-wider', cfg.badge)}>
          {cfg.label}
        </span>
        {asset.predictedTtfDays != null && asset.predictedTtfDays < 60 && (
          <span className={cn(
            'ml-auto font-mono text-xs font-semibold',
            asset.predictedTtfDays < 15 ? 'text-[--status-critical]' : 'text-amber-400'
          )}>
            TTF: {asset.predictedTtfDays}d
          </span>
        )}
      </div>

      {/* Fault */}
      {asset.faultType ? (
        <div className="rounded-md p-2.5 bg-amber-500/5 border border-amber-500/15">
          <p className="text-[10px] font-mono text-amber-400 leading-relaxed">{asset.faultType}</p>
        </div>
      ) : (
        <div className="rounded-md p-2.5 bg-[rgba(0,212,170,0.04)] border border-[rgba(0,212,170,0.12)]">
          <p className="text-[10px] font-mono text-[#00D4AA]">No anomaly detected</p>
        </div>
      )}

      {/* Footer metrics */}
      <div className="flex items-center justify-between pt-1 border-t border-[--border-subtle]">
        <div className="flex items-center gap-1 text-[10px] font-mono text-[--text-muted]">
          <MapPin className="w-3 h-3" />
          <span>{asset.facilityName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[--text-muted]">
          <Zap className="w-3 h-3" />
          <span>{asset.energyDrawKw > 0 ? `${asset.energyDrawKw} kW` : 'Standby'}</span>
        </div>
      </div>
    </Link>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EquipmentHealthView() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [selectedFacility, setSelectedFacility] = useState<string>('All')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'health' | 'ttf' | 'name'>('health')

  // Summary KPIs
  const kpis = useMemo(() => {
    const critical  = ALL_ASSETS.filter(a => a.status === 'CRITICAL').length
    const advisory  = ALL_ASSETS.filter(a => a.status === 'ADVISORY').length
    const optimal   = ALL_ASSETS.filter(a => a.status === 'OPTIMAL').length
    const avgHealth = Math.round(ALL_ASSETS.reduce((s, a) => s + a.healthScore, 0) / ALL_ASSETS.length)
    return { total: ALL_ASSETS.length, critical, advisory, optimal, avgHealth }
  }, [])

  // Unique facilities and types for filter options
  const facilities = useMemo(() => ['All', ...Array.from(new Set(ALL_ASSETS.map(a => a.facilityName)))], [])
  const types      = useMemo(() => ['All', ...Array.from(new Set(ALL_ASSETS.map(a => TYPE_LABELS[a.type] || a.type)))], [])
  const statuses   = ['All', 'OPTIMAL', 'WATCH', 'ADVISORY', 'CRITICAL']

  // Filtered + sorted list
  const filteredAssets = useMemo(() => {
    let list = ALL_ASSETS.filter(a => {
      const q = searchQuery.toLowerCase()
      const matchSearch = !q ||
        a.externalId.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        (a.faultType?.toLowerCase().includes(q) ?? false) ||
        a.facilityName.toLowerCase().includes(q)
      const matchStatus   = selectedStatus === 'All' || a.status === selectedStatus
      const matchFacility = selectedFacility === 'All' || a.facilityName === selectedFacility
      const matchType     = selectedType === 'All' || (TYPE_LABELS[a.type] || a.type) === selectedType
      return matchSearch && matchStatus && matchFacility && matchType
    })

    list = [...list].sort((a, b) => {
      if (sortBy === 'health') return a.healthScore - b.healthScore
      if (sortBy === 'ttf')    return (a.predictedTtfDays ?? 999) - (b.predictedTtfDays ?? 999)
      return a.externalId.localeCompare(b.externalId)
    })
    return list
  }, [searchQuery, selectedStatus, selectedFacility, selectedType, sortBy])

  const FilterSelect = ({ value, onChange, options, label }: {
    value: string
    onChange: (v: string) => void
    options: string[]
    label: string
  }) => (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none pl-3 pr-7 py-2 rounded-md border font-mono text-[10px] font-medium text-[--text-secondary] hover:text-[--text-primary] hover:border-[--border-strong] focus:outline-none focus:border-[#00D4AA] transition-all bg-[var(--bg-elevated)] border-[--border-default] cursor-pointer"
      >
        {options.map(opt => (
          <option key={opt} value={opt}>
            {opt === 'All' ? `${label}` : opt === 'OPTIMAL' ? 'Optimal' : opt === 'ADVISORY' ? 'Advisory' : opt === 'CRITICAL' ? 'Critical' : opt === 'WATCH' ? 'Watch' : opt}
          </option>
        ))}
      </select>
      <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[--text-muted] rotate-90 pointer-events-none" />
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-light tracking-wide text-[--text-primary]">
            Equipment Health
          </h1>
          <p className="text-[10px] font-mono text-[--text-secondary] mt-1 uppercase tracking-wider">
            Monitoring {kpis.total} assets across {DEMO_FACILITIES.length} facilities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-md border font-mono text-[10px] font-bold text-[--text-secondary] hover:text-[--text-primary] hover:border-[--border-strong] transition-all bg-[var(--bg-elevated)] border-[--border-default] cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-md border font-mono text-[10px] font-bold text-[--text-secondary] hover:text-[--text-primary] hover:border-[--border-strong] transition-all bg-[var(--bg-elevated)] border-[--border-default] cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Assets"
          value={kpis.total}
          sub={`${kpis.optimal} operating normally`}
          icon={Cpu}
          accent="bg-[rgba(0,212,170,0.1)] text-[#00D4AA]"
        />
        <KpiCard
          label="Avg. Health Index"
          value={`${kpis.avgHealth}%`}
          sub="Across all monitored assets"
          icon={Activity}
          accent="bg-[rgba(0,212,170,0.1)] text-[#00D4AA]"
        />
        <KpiCard
          label="Advisory"
          value={kpis.advisory}
          sub="Assets requiring attention"
          icon={AlertTriangle}
          accent="bg-amber-500/10 text-amber-400"
        />
        <KpiCard
          label="Critical"
          value={kpis.critical}
          sub={kpis.critical > 0 ? 'Immediate action needed' : 'No critical assets'}
          icon={Shield}
          accent={kpis.critical > 0 ? 'bg-red-500/10 text-red-400' : 'bg-[rgba(0,212,170,0.1)] text-[#00D4AA]'}
        />
      </div>

      {/* Filter & Search Toolbar */}
      <div
        className="rounded-[10px] border p-4"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[--text-muted]" />
            <input
              type="text"
              placeholder="Search assets, faults, facilities..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-md border font-mono text-xs text-[--text-primary] placeholder-[--text-muted] focus:outline-none focus:border-[#00D4AA] transition-all bg-[var(--bg-elevated)] border-[--border-default] hover:border-[--border-strong]"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-[--text-muted]">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <FilterSelect value={selectedStatus} onChange={setSelectedStatus} options={statuses} label="All Statuses" />
            <FilterSelect value={selectedFacility} onChange={setSelectedFacility} options={facilities} label="All Facilities" />
            <FilterSelect value={selectedType} onChange={setSelectedType} options={types} label="All Types" />

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="appearance-none pl-3 pr-7 py-2 rounded-md border font-mono text-[10px] font-medium text-[--text-secondary] hover:text-[--text-primary] hover:border-[--border-strong] focus:outline-none focus:border-[#00D4AA] transition-all bg-[var(--bg-elevated)] border-[--border-default] cursor-pointer"
              >
                <option value="health">Sort: Health ↑</option>
                <option value="ttf">Sort: TTF ↑</option>
                <option value="name">Sort: Name A-Z</option>
              </select>
              <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[--text-muted] rotate-90 pointer-events-none" />
            </div>
          </div>

          {/* View mode toggle — pushed right */}
          <div className="lg:ml-auto flex items-center gap-1 p-1 rounded-md border border-[--border-default] bg-[var(--bg-elevated)]">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded transition-colors cursor-pointer',
                viewMode === 'list' ? 'bg-zinc-700 text-[--text-primary]' : 'text-[--text-muted] hover:text-[--text-secondary]'
              )}
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded transition-colors cursor-pointer',
                viewMode === 'grid' ? 'bg-zinc-700 text-[--text-primary]' : 'text-[--text-muted] hover:text-[--text-secondary]'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Result count */}
        <div className="mt-3 pt-3 border-t border-[--border-subtle]">
          <span className="text-[10px] font-mono text-[--text-muted]">
            Showing <span className="text-[--text-secondary] font-semibold">{filteredAssets.length}</span> of {kpis.total} assets
            {(selectedStatus !== 'All' || selectedFacility !== 'All' || selectedType !== 'All' || searchQuery) && (
              <button
                onClick={() => { setSelectedStatus('All'); setSelectedFacility('All'); setSelectedType('All'); setSearchQuery('') }}
                className="ml-3 text-[#00D4AA] hover:underline cursor-pointer font-semibold"
              >
                Clear filters
              </button>
            )}
          </span>
        </div>
      </div>

      {/* Asset List */}
      {filteredAssets.length === 0 ? (
        <div
          className="rounded-[10px] border py-16 flex flex-col items-center justify-center gap-3"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
          <Search className="w-8 h-8 text-[--text-muted]" />
          <p className="font-mono text-sm text-[--text-secondary]">No assets match your filters</p>
          <p className="font-mono text-[10px] text-[--text-muted]">Try adjusting or clearing the filters above</p>
        </div>
      ) : viewMode === 'list' ? (
        <div
          className="rounded-[10px] border overflow-x-auto"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-[--border-strong] text-[--text-muted] uppercase tracking-wider text-[10px]" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <th className="px-5 py-3.5">Asset</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Facility</th>
                <th className="px-5 py-3.5">AI Fault Diagnosis</th>
                <th className="px-5 py-3.5">TTF</th>
                <th className="px-5 py-3.5">Load</th>
                <th className="px-5 py-3.5">Energy Draw</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(asset => (
                <AssetRow key={asset.id} asset={asset} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAssets.map(asset => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}

      {/* Footer note */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[--text-muted] pt-1">
        <span>Data last synced: 14:02:45 UTC • Clara AI Engine v2.4.1</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
          <span className="text-[#00D4AA]">Live</span>
        </div>
      </div>
    </div>
  )
}
