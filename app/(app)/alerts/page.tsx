'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  AlertOctagon,
  AlertTriangle,
  Eye,
  Check,
  X,
  Search,
  Filter,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ChevronDown,
  CheckSquare,
  Volume2
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatTimeAgo } from '@/lib/utils/format'
import { useAlertStore } from '@/lib/stores/alert-store'
import type { Alert } from '@/types/alert'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  CartesianGrid
} from 'recharts'

// Static Asset and Timeline definitions linked to alerts
interface AssetDetail {
  name: string
  location: string
  ttf: string
  healthScore: number
}

const ALERT_ASSETS: Record<string, AssetDetail> = {
  'ALR-8924': {
    name: 'CHL-01 (Main Chiller Unit)',
    location: 'Johannesburg DC-1 • Cooling System',
    ttf: '~72 Hours',
    healthScore: 64
  },
  'ALR-8925': {
    name: 'CRAC-04 (Computer Room AC)',
    location: 'Johannesburg DC-1 • Cooling System',
    ttf: '~48 Hours',
    healthScore: 58
  },
  'ALR-8926': {
    name: 'GEN-02 (Backup Diesel Generator)',
    location: 'Johannesburg DC-1 • Plant Room B',
    ttf: 'Immediate',
    healthScore: 45
  },
  'ALR-8927': {
    name: 'AHU-12 (Air Handling Unit)',
    location: 'Johannesburg DC-1 • Office Block Floor 2',
    ttf: 'N/A',
    healthScore: 78
  },
  'ALR-8928': {
    name: 'JHB-DC-01 (Facility PUE Monitor)',
    location: 'Johannesburg DC-1 • Infrastructure',
    ttf: 'N/A',
    healthScore: 82
  }
}

const TIMELINE_EVENTS: Record<string, { time: string; title: string; desc: string }[]> = {
  'ALR-8924': [
    {
      time: '13:52:00 UTC (Today)',
      title: 'Critical Alert Triggered by ML Engine',
      desc: 'Vibration amplitude exceeded 0.8 IPS on the Z-Axis. Model confidence: 92%. Predicted failure window narrowed to ~72 hours based on historical degradation profiles for this asset class.'
    },
    {
      time: '13:45:12 UTC (Today)',
      title: 'Health Score Dropped below 70%',
      desc: 'System marked asset health as 64% due to irregular telemetry patterns diverging from normal operational baseline.'
    },
    {
      time: '12:00:00 UTC (Today)',
      title: 'Routine Snapshot',
      desc: 'Health score logged at 88%. All operational parameters within normal limits.'
    }
  ],
  'ALR-8925': [
    {
      time: '12:52:00 UTC (Today)',
      title: 'Critical Alert Triggered by Thermodynamic Analyzer',
      desc: 'Cooling loop B refrigerant pressure fell below the critical threshold of 120 PSI (current reading: 98 PSI). System cooling efficiency reduced.'
    },
    {
      time: '12:30:15 UTC (Today)',
      title: 'Pressure Variance Detected',
      desc: 'Micro-fluctuations in loop B pressure noticed by sensor CRAC-P4.'
    }
  ],
  'ALR-8926': [
    {
      time: '11:52:00 UTC (Today)',
      title: 'Critical Alert Triggered by Start Sequence Monitor',
      desc: 'Backup generator failed to start within the designated safety window of 15 seconds during weekly automated generator test.'
    },
    {
      time: '11:51:45 UTC (Today)',
      title: 'Starter Battery Crank Alert',
      desc: 'Low cranking voltage (18.5V) detected on starter battery A during crank attempt.'
    }
  ],
  'ALR-8927': [
    {
      time: '09:52:00 UTC (Today)',
      title: 'Advisory Alert Triggered by Pressure Drop Analyzer',
      desc: 'Differential pressure across air intake filters exceeded 240 Pa. Baseline target filter resistance is 150 Pa.'
    }
  ],
  'ALR-8928': [
    {
      time: 'Yesterday, 17:52:00 UTC',
      title: 'Advisory Alert Triggered by PUE Optimiser',
      desc: 'Facility PUE rose above 1.50 for 2 consecutive hours. Ambient outside temperatures matched with elevated high-compute loads.'
    }
  ]
}

// Generate dynamic waveform data for Recharts based on selected alert ID
const generateWaveformData = (alertId: string) => {
  const points = []
  if (alertId === 'ALR-8924') {
    // Vibration (normal teal to chaotic red)
    for (let i = 0; i < 60; i++) {
      const val =
        i < 36
          ? 0.35 + 0.08 * Math.sin(i * 1.2) + (Math.random() - 0.5) * 0.02
          : 0.5 + 0.45 * Math.sin((i - 36) * 1.8) + (Math.random() - 0.5) * 0.05
      points.push({ time: i, amplitude: parseFloat(val.toFixed(3)) })
    }
  } else if (alertId === 'ALR-8925') {
    // Pressure drop (steady to declining)
    for (let i = 0; i < 60; i++) {
      const val =
        i < 30
          ? 145 + (Math.random() - 0.5) * 3
          : 145 - (i - 30) * 1.5 + Math.sin(i) * 3
      points.push({ time: i, amplitude: parseFloat(val.toFixed(1)) })
    }
  } else if (alertId === 'ALR-8926') {
    // Starter Crank (steady voltage, drops off, then flat low)
    for (let i = 0; i < 60; i++) {
      const val =
        i < 20
          ? 24.2 + (Math.random() - 0.5) * 0.1
          : i < 35
          ? 24.2 - (i - 20) * 0.35 + (Math.random() - 0.5) * 0.2
          : 18.2 + (Math.random() - 0.5) * 0.08
      points.push({ time: i, amplitude: parseFloat(val.toFixed(2)) })
    }
  } else if (alertId === 'ALR-8927') {
    // Filter Resistance (steady climb over time)
    for (let i = 0; i < 60; i++) {
      const val = 120 + i * 2.1 + Math.sin(i * 0.5) * 3
      points.push({ time: i, amplitude: parseFloat(val.toFixed(1)) })
    }
  } else {
    // PUE target (oscillating around baseline, then spiking)
    for (let i = 0; i < 60; i++) {
      const val =
        i < 40
          ? 1.22 + Math.sin(i * 0.4) * 0.02 + Math.random() * 0.015
          : 1.24 + (i - 40) * 0.012 + Math.sin(i * 0.8) * 0.03
      points.push({ time: i, amplitude: parseFloat(val.toFixed(2)) })
    }
  }
  return points
}

// Chart configuration details mapping
const CHART_CONFIGS: Record<
  string,
  { label: string; unit: string; boundaryIndex: number; boundaryText: string; domain: [number, number] }
> = {
  'ALR-8924': {
    label: 'TELEMETRY SNAPSHOT (Z-Axis Vibration Amplitude)',
    unit: 'IPS',
    boundaryIndex: 36,
    boundaryText: 'Anomaly Triggered',
    domain: [0, 1.2]
  },
  'ALR-8925': {
    label: 'TELEMETRY SNAPSHOT (Loop B Refrigerant Pressure)',
    unit: 'PSI',
    boundaryIndex: 30,
    boundaryText: 'Leak Initiated',
    domain: [80, 160]
  },
  'ALR-8926': {
    label: 'TELEMETRY SNAPSHOT (Starter Crank Voltage)',
    unit: 'V',
    boundaryIndex: 20,
    boundaryText: 'Crank Sequence Start',
    domain: [15, 26]
  },
  'ALR-8927': {
    label: 'TELEMETRY SNAPSHOT (Differential Intake Pressure)',
    unit: 'Pa',
    boundaryIndex: 45,
    boundaryText: 'Threshold Exceeded',
    domain: [100, 260]
  },
  'ALR-8928': {
    label: 'TELEMETRY SNAPSHOT (Facility PUE Ratio)',
    unit: 'PUE',
    boundaryIndex: 40,
    boundaryText: 'Baseline Exceeded',
    domain: [1.1, 1.6]
  }
}

export default function AlertsPage() {
  const { alerts, acknowledgeAlert, resolveAlert, markAllRead } = useAlertStore()
  
  // Selection state
  const [selectedAlertId, setSelectedAlertId] = useState<string>('ALR-8924')
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'UNRESOLVED' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ALL'>('UNRESOLVED')
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'ADVISORY'>('ALL')
  const [facilityFilter, setFacilityFilter] = useState<'ALL' | 'fac_jhb_dc_01'>('ALL')

  // UI Dropdown Visibility States
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showSeverityDropdown, setShowSeverityDropdown] = useState(false)
  const [showFacilityDropdown, setShowFacilityDropdown] = useState(false)

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  
  const triggerToast = (msg: string) => {
    setToastMessage(msg)
  }

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [toastMessage])

  // Filter Alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Search text
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase()
        const matchTitle = alert.title.toLowerCase().includes(query)
        const matchDesc = alert.description.toLowerCase().includes(query)
        const matchAsset = (alert.assetId ?? '').toLowerCase().includes(query)
        const matchId = alert.id.toLowerCase().includes(query)
        if (!matchTitle && !matchDesc && !matchAsset && !matchId) return false
      }

      // Status
      if (statusFilter === 'UNRESOLVED') {
        if (alert.status === 'RESOLVED') return false
      } else if (statusFilter !== 'ALL') {
        if (alert.status !== statusFilter) return false
      }

      // Severity
      if (severityFilter !== 'ALL') {
        if (alert.severity !== severityFilter) return false
      }

      // Facility
      if (facilityFilter !== 'ALL') {
        if (alert.facilityId !== facilityFilter) return false
      }

      return true
    })
  }, [alerts, searchQuery, statusFilter, severityFilter, facilityFilter])

  // Find currently selected alert
  const selectedAlert = useMemo(() => {
    return alerts.find((a) => a.id === selectedAlertId) || alerts[0]
  }, [alerts, selectedAlertId])

  // Automatically update selected alert if current selection is filtered out
  useEffect(() => {
    if (filteredAlerts.length > 0 && !filteredAlerts.some((a) => a.id === selectedAlertId)) {
      setSelectedAlertId(filteredAlerts[0].id)
    }
  }, [filteredAlerts, selectedAlertId])

  // Chart Telemetry Data & Config
  const chartData = useMemo(() => {
    if (!selectedAlert) return []
    return generateWaveformData(selectedAlert.id)
  }, [selectedAlert])

  const chartConfig = useMemo(() => {
    if (!selectedAlert) return CHART_CONFIGS['ALR-8924']
    return CHART_CONFIGS[selectedAlert.id] || CHART_CONFIGS['ALR-8924']
  }, [selectedAlert])

  // Gradient offsets based on boundary points
  const boundaryPercent = useMemo(() => {
    if (!chartConfig) return '60%'
    return `${(chartConfig.boundaryIndex / 60) * 100}%`
  }, [chartConfig])

  // Calculate dynamic count of unacknowledged critical alerts
  const unacknowledgedCriticalCount = useMemo(() => {
    return alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length
  }, [alerts])

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertOctagon className="w-4 h-4 text-[#E5484D]" />
      case 'ADVISORY':
        return <AlertTriangle className="w-4 h-4 text-[#F5A623]" />
      default:
        return <Eye className="w-4 h-4 text-[#3B82F6]" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return '#E5484D'
      case 'ADVISORY':
        return '#F5A623'
      default:
        return '#3B82F6'
    }
  }

  return (
    <div className="flex flex-col gap-6 relative h-full">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-[8px] border shadow-2xl font-mono text-xs animate-in fade-in slide-in-from-top-4 duration-200"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: '#00D4AA',
            color: 'var(--text-primary)'
          }}
        >
          <Check className="w-4 h-4 text-[#00D4AA]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumbs & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[--text-secondary]">
          <span className="hover:text-[--text-primary] transition-colors cursor-pointer">Operations</span>
          <span>/</span>
          <span className="text-[--text-muted]">Alert Feed</span>
        </div>

        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <button
            onClick={() => triggerToast('Alert log exported to CSV successfully.')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border text-xs font-mono font-medium transition-all border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[--text-muted]" />
            <span>Export Log</span>
          </button>

          <button
            onClick={() => {
              markAllRead()
              triggerToast('All active alerts acknowledged.')
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border text-xs font-mono font-medium transition-all border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-[--text-muted]" />
            <span>Acknowledge All</span>
          </button>
        </div>
      </div>

      {/* Header Title */}
      <div>
        <h1 className="font-mono text-2xl font-light tracking-wide text-[--text-primary] mb-1">
          Alert Feed
        </h1>
        <p className="text-xs text-[--text-secondary] font-mono">
          {unacknowledgedCriticalCount} Unacknowledged Critical {unacknowledgedCriticalCount === 1 ? 'Alert' : 'Alerts'}
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-muted]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts or assets..."
            className="w-full pl-9 pr-4 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[6px] text-xs font-mono text-[--text-primary] placeholder-[--text-muted] outline-none focus:border-[#00D4AA] transition-colors"
          />
        </div>

        {/* Filters Select Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 relative">
          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown)
                setShowSeverityDropdown(false)
                setShowFacilityDropdown(false)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-xs font-mono font-medium transition-all border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] cursor-pointer"
            >
              <span>Status: {statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()}</span>
              <ChevronDown className="w-3 h-3 text-[--text-muted]" />
            </button>

            {showStatusDropdown && (
              <div className="absolute left-0 mt-1.5 w-[160px] rounded-[6px] border border-[--border-strong] bg-[var(--bg-elevated)] shadow-2xl z-20 font-mono text-xs overflow-hidden">
                {[
                  { id: 'UNRESOLVED', label: 'Unresolved' },
                  { id: 'ACTIVE', label: 'Active' },
                  { id: 'ACKNOWLEDGED', label: 'Acknowledged' },
                  { id: 'RESOLVED', label: 'Resolved' },
                  { id: 'ALL', label: 'All' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setStatusFilter(opt.id as any)
                      setShowStatusDropdown(false)
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 hover:bg-[var(--bg-hover)] text-[--text-primary] border-b border-[--border-subtle] last:border-b-0 cursor-pointer',
                      statusFilter === opt.id && 'bg-[var(--bg-active)]'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Severity Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSeverityDropdown(!showSeverityDropdown)
                setShowStatusDropdown(false)
                setShowFacilityDropdown(false)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-xs font-mono font-medium transition-all border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] cursor-pointer"
            >
              <span>Severity: {severityFilter.charAt(0) + severityFilter.slice(1).toLowerCase()}</span>
              <ChevronDown className="w-3 h-3 text-[--text-muted]" />
            </button>

            {showSeverityDropdown && (
              <div className="absolute left-0 mt-1.5 w-[160px] rounded-[6px] border border-[--border-strong] bg-[var(--bg-elevated)] shadow-2xl z-20 font-mono text-xs overflow-hidden">
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'CRITICAL', label: 'Critical' },
                  { id: 'ADVISORY', label: 'Advisory' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSeverityFilter(opt.id as any)
                      setShowSeverityDropdown(false)
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 hover:bg-[var(--bg-hover)] text-[--text-primary] border-b border-[--border-subtle] last:border-b-0 cursor-pointer',
                      severityFilter === opt.id && 'bg-[var(--bg-active)]'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Facility Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFacilityDropdown(!showFacilityDropdown)
                setShowStatusDropdown(false)
                setShowSeverityDropdown(false)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-xs font-mono font-medium transition-all border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] cursor-pointer"
            >
              <span>Facility: {facilityFilter === 'ALL' ? 'All' : 'Johannesburg'}</span>
              <ChevronDown className="w-3 h-3 text-[--text-muted]" />
            </button>

            {showFacilityDropdown && (
              <div className="absolute left-0 mt-1.5 w-[180px] rounded-[6px] border border-[--border-strong] bg-[var(--bg-elevated)] shadow-2xl z-20 font-mono text-xs overflow-hidden">
                {[
                  { id: 'ALL', label: 'All Facilities' },
                  { id: 'fac_jhb_dc_01', label: 'Johannesburg DC-1' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setFacilityFilter(opt.id as any)
                      setShowFacilityDropdown(false)
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 hover:bg-[var(--bg-hover)] text-[--text-primary] border-b border-[--border-subtle] last:border-b-0 cursor-pointer',
                      facilityFilter === opt.id && 'bg-[var(--bg-active)]'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column Master, Right Column Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start flex-1 min-h-0">
        {/* Left Side: Master Feed List */}
        <div className="lg:col-span-2 flex flex-col gap-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => {
              const isSelected = alert.id === selectedAlertId
              const assetTag = alert.assetId ? alert.title.split(':')[0] || 'CHL-01' : 'Facility'

              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlertId(alert.id)}
                  className={cn(
                    'p-4 rounded-[10px] border transition-all cursor-pointer flex flex-col gap-2 border-[var(--border-default)]',
                    isSelected
                      ? 'bg-[var(--bg-active)] border-[var(--border-strong)] shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
                      : 'bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]'
                  )}
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: getSeverityColor(alert.severity)
                  }}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-xs text-[--text-primary] line-clamp-1 flex-1 pr-2">
                      {alert.title}
                    </span>
                    <span className="font-mono text-[9px] text-[--text-muted] shrink-0">
                      {formatTimeAgo(alert.createdAt)}
                    </span>
                  </div>

                  <div className="flex gap-2 items-center">
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-surface)] text-[--text-secondary] border border-[--border-subtle]">
                      {alert.assetId ? alert.id.replace('alert_', 'ALR-') : alert.id}
                    </span>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-surface)] text-[--text-secondary] border border-[--border-subtle]">
                      {alert.assetId ? 'CHL-01' : 'JHB-DC-01'}
                    </span>
                    <span className={cn(
                      "font-mono text-[9px] font-bold uppercase tracking-wider ml-auto",
                      alert.status === 'ACTIVE' ? 'text-[#E5484D]' : 'text-[#00D4AA]'
                    )}>
                      {alert.status === 'ACTIVE' ? 'Active' : alert.status.toLowerCase()}
                    </span>
                  </div>

                  <p className="text-[10px] text-[--text-secondary] line-clamp-2 leading-relaxed">
                    {alert.description}
                  </p>
                </div>
              )
            })
          ) : (
            <div className="py-12 border rounded-[10px] border-dashed border-[var(--border-default)] text-center text-xs font-mono text-[--text-muted] bg-[var(--bg-card)]">
              No alerts matching the selected filters.
            </div>
          )}
        </div>

        {/* Right Side: Detail Panel */}
        <div className="lg:col-span-3 flex flex-col gap-5 p-6 rounded-[10px] border bg-[var(--bg-card)] border-[var(--border-default)]">
          {selectedAlert ? (
            <>
              {/* Detail Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[--border-subtle] pb-4">
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-lg font-mono font-medium tracking-wide text-[--text-primary]">
                    {selectedAlert.title}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: selectedAlert.severity === 'CRITICAL' ? 'rgba(229,72,77,0.12)' : 'rgba(245,166,35,0.12)',
                        color: selectedAlert.severity === 'CRITICAL' ? '#E5484D' : '#F5A623'
                      }}
                    >
                      {getSeverityIcon(selectedAlert.severity)}
                      <span className="capitalize font-bold">{selectedAlert.severity.toLowerCase()}</span>
                    </div>

                    <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full border border-[--border-default] bg-[var(--bg-surface)] text-[--text-secondary]">
                      {selectedAlert.status === 'ACTIVE' ? 'Unacknowledged' : selectedAlert.status.charAt(0) + selectedAlert.status.slice(1).toLowerCase()}
                    </span>

                    <span className="text-[10px] font-mono text-[--text-muted]">
                      ID: {selectedAlert.id}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0 text-right">
                  <span className="font-mono text-xs text-[--text-primary] font-semibold">
                    {formatTimeAgo(selectedAlert.createdAt)}
                  </span>
                  <span className="font-mono text-[10px] text-[--text-muted]">
                    {new Date(selectedAlert.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} UTC
                  </span>
                </div>
              </div>

              {/* Action Buttons row */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-surface)] p-3.5 rounded-[8px] border border-[--border-subtle]">
                <div className="flex items-center gap-3">
                  <button
                    disabled={selectedAlert.status !== 'ACTIVE'}
                    onClick={() => {
                      acknowledgeAlert(selectedAlert.id)
                      triggerToast(`Alert ${selectedAlert.id} acknowledged.`)
                    }}
                    className={cn(
                      'flex items-center gap-1.5 font-mono text-xs font-bold px-3.5 py-1.5 rounded-[6px] transition-all cursor-pointer',
                      selectedAlert.status === 'ACTIVE'
                        ? 'bg-[#00D4AA] text-[#0A0D14] hover:shadow-[0_0_12px_rgba(0,212,170,0.3)]'
                        : 'bg-[var(--bg-elevated)] border border-[--border-default] text-[--text-muted] cursor-not-allowed'
                    )}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Acknowledge</span>
                  </button>

                  <button
                    disabled={selectedAlert.status === 'RESOLVED'}
                    onClick={() => {
                      resolveAlert(selectedAlert.id)
                      triggerToast(`Alert ${selectedAlert.id} resolved.`)
                    }}
                    className={cn(
                      'flex items-center gap-1.5 font-mono text-xs font-bold px-3.5 py-1.5 rounded-[6px] border transition-all cursor-pointer',
                      selectedAlert.status !== 'RESOLVED'
                        ? 'border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary]'
                        : 'bg-[var(--bg-elevated)] text-[--text-muted] border-[--border-default] cursor-not-allowed'
                    )}
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-[--text-muted]" />
                    <span>Resolve</span>
                  </button>
                </div>

                {selectedAlert.assetId && (
                  <button
                    onClick={() => triggerToast(`Navigating to asset detail room...`)}
                    className="flex items-center gap-1 text-[10px] font-mono text-[--text-secondary] hover:text-[--accent-primary] transition-colors cursor-pointer"
                  >
                    <span>View Equipment</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Asset & Prediction Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Affected Asset */}
                <div className="rounded-[8px] border p-4 bg-[var(--bg-surface)] border-[--border-subtle]">
                  <span className="block text-[9px] font-mono font-semibold uppercase tracking-widest text-[--text-muted] mb-1.5">
                    Affected Asset
                  </span>
                  <span className="block font-mono text-xs font-bold text-[--text-primary] mb-1">
                    {ALERT_ASSETS[selectedAlert.id]?.name || 'N/A'}
                  </span>
                  <span className="block text-[10px] text-[--text-secondary]">
                    {ALERT_ASSETS[selectedAlert.id]?.location || 'N/A'}
                  </span>
                </div>

                {/* Predicted Failure */}
                <div className="rounded-[8px] border p-4 bg-[var(--bg-surface)] border-[--border-subtle] flex justify-between items-start">
                  <div>
                    <span className="block text-[9px] font-mono font-semibold uppercase tracking-widest text-[--text-muted] mb-1.5">
                      Predicted Failure
                    </span>
                    <span
                      className="block font-mono text-base font-bold"
                      style={{
                        color:
                          ALERT_ASSETS[selectedAlert.id]?.ttf === 'Immediate' ||
                          ALERT_ASSETS[selectedAlert.id]?.ttf.includes('Hours')
                            ? '#E5484D'
                            : 'var(--text-primary)'
                      }}
                    >
                      {ALERT_ASSETS[selectedAlert.id]?.ttf || 'N/A'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="block text-[9px] font-mono font-semibold uppercase tracking-widest text-[--text-muted] mb-1.5">
                      Health Score
                    </span>
                    <span
                      className="block font-mono text-base font-bold"
                      style={{
                        color:
                          (ALERT_ASSETS[selectedAlert.id]?.healthScore || 100) < 65
                            ? '#E5484D'
                            : (ALERT_ASSETS[selectedAlert.id]?.healthScore || 100) < 80
                            ? '#F5A623'
                            : '#00D4AA'
                      }}
                    >
                      {ALERT_ASSETS[selectedAlert.id]?.healthScore
                        ? `${ALERT_ASSETS[selectedAlert.id].healthScore}%`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Telemetry Snapshot Waveform */}
              <div className="rounded-[8px] border p-4 bg-[var(--bg-surface)] border-[--border-subtle] flex flex-col gap-3">
                <span className="block text-[9px] font-mono font-semibold uppercase tracking-widest text-[--text-muted]">
                  {chartConfig.label}
                </span>

                <div className="h-[140px] w-full mt-1.5">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                      <defs>
                        <linearGradient id="gradientWave" x1="0" y1="0" x2="1" y2="0">
                          <stop offset={boundaryPercent} stopColor="#00D4AA" stopOpacity={0.9} />
                          <stop offset={boundaryPercent} stopColor="#E5484D" stopOpacity={0.9} />
                        </linearGradient>
                        <linearGradient id="fillWave" x1="0" y1="0" x2="1" y2="0">
                          <stop offset={boundaryPercent} stopColor="#00D4AA" stopOpacity={0.12} />
                          <stop offset={boundaryPercent} stopColor="#E5484D" stopOpacity={0.12} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="time" hide />
                      <YAxis
                        domain={chartConfig.domain}
                        tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'monospace' }}
                        tickFormatter={(v) => `${v} ${chartConfig.unit}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-elevated)',
                          borderColor: 'var(--border-strong)',
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                          fontSize: '10px'
                        }}
                      />
                      <ReferenceLine
                        x={chartConfig.boundaryIndex}
                        stroke="#F5A623"
                        strokeDasharray="3 3"
                        label={{
                          value: chartConfig.boundaryText,
                          position: 'top',
                          fill: '#F5A623',
                          fontSize: 9,
                          fontFamily: 'monospace',
                          offset: 10
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="amplitude"
                        stroke="url(#gradientWave)"
                        fill="url(#fillWave)"
                        strokeWidth={1.8}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Event Timeline */}
              <div className="flex flex-col gap-3">
                <span className="block text-[9px] font-mono font-semibold uppercase tracking-widest text-[--text-muted]">
                  Event Timeline
                </span>

                <div className="flex flex-col pl-2.5 relative border-l border-[--border-subtle] ml-1.5 space-y-5 py-1">
                  {(TIMELINE_EVENTS[selectedAlert.id] || []).map((evt, idx) => (
                    <div key={idx} className="relative pl-5 flex flex-col gap-1">
                      {/* Timeline Dot Indicator */}
                      <span
                        className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border border-[var(--bg-card)]"
                        style={{
                          backgroundColor:
                            idx === 0
                              ? selectedAlert.severity === 'CRITICAL'
                                ? '#E5484D'
                                : '#F5A623'
                              : 'var(--border-strong)'
                        }}
                      />

                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-mono font-bold text-xs text-[--text-primary]">
                          {evt.title}
                        </span>
                        <span className="font-mono text-[9px] text-[--text-muted] shrink-0">
                          {evt.time}
                        </span>
                      </div>

                      <p className="text-[10px] text-[--text-secondary] leading-relaxed">
                        {evt.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-24 text-center text-xs font-mono text-[--text-muted]">
              Select an alert from the feed to view full analytical breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
