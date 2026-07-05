'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  ArrowLeft,
  Search,
  Download,
  AlertTriangle,
  Wrench,
  Zap,
  Settings,
  ChevronLeft,
  SlidersHorizontal,
  Clock
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot
} from 'recharts'
import { cn } from '@/lib/utils/cn'

interface EventLogItem {
  timestamp: string
  type: 'Telemetry' | 'Alert' | 'Maintenance' | 'System'
  severity: 'Warning' | 'Success' | 'Critical' | 'Info'
  description: string
  details: string
  source: string
}

interface AssetHistoryViewProps {
  assetId: string
}

// Full 24 items dataset to simulate multiple pages
const EVENT_LOG_DATA: EventLogItem[] = [
  {
    timestamp: '2024-01-15 08:14:22',
    type: 'Telemetry',
    severity: 'Warning',
    description: 'Vibration Threshold Exceeded (3X Harmonic)',
    details: 'Peak: 14.2 mm/s',
    source: 'Clara AI Sensor'
  },
  {
    timestamp: '2024-01-14 23:42:10',
    type: 'Alert',
    severity: 'Warning',
    description: 'Health Score Dropped Below 90%',
    details: 'Score: 89%',
    source: 'Clara AI Engine'
  },
  {
    timestamp: '2024-01-02 14:30:00',
    type: 'Maintenance',
    severity: 'Success',
    description: 'Q1 Preventative Maintenance Completed',
    details: 'WO-2891',
    source: 'John D.'
  },
  {
    timestamp: '2023-12-28 09:15:00',
    type: 'Alert',
    severity: 'Critical',
    description: 'Compressor Surge Detected',
    details: 'Pressure Drop: 45kPa',
    source: 'Clara AI Engine'
  },
  {
    timestamp: '2023-12-15 11:20:05',
    type: 'System',
    severity: 'Info',
    description: 'Load Threshold Configuration Updated',
    details: 'Max Load: 85%',
    source: 'Sarah M. (Admin)'
  },
  {
    timestamp: '2023-11-22 16:45:00',
    type: 'Maintenance',
    severity: 'Success',
    description: 'Coolant Refill & Filter Replacement',
    details: 'WO-1882',
    source: 'External Vendor'
  },
  {
    timestamp: '2023-11-05 14:12:33',
    type: 'Telemetry',
    severity: 'Warning',
    description: 'Elevated Oil Temperature Detected',
    details: 'Temp: 68°C',
    source: 'Clara AI Sensor'
  },
  {
    timestamp: '2023-10-15 08:00:00',
    type: 'System',
    severity: 'Info',
    description: 'Baseline Sensor Calibration (System Init)',
    details: 'Offset: 0.00',
    source: 'System Auto'
  },
  // Page 2 Mock Items
  {
    timestamp: '2023-09-28 10:30:00',
    type: 'Alert',
    severity: 'Warning',
    description: 'Refrigerant Leak Rate Exceeded Target',
    details: 'Leak: 2.1%/yr',
    source: 'Clara AI Engine'
  },
  {
    timestamp: '2023-09-15 13:00:00',
    type: 'Maintenance',
    severity: 'Success',
    description: 'Condenser Coil Cleaning',
    details: 'WO-1542',
    source: 'John D.'
  },
  {
    timestamp: '2023-08-30 08:45:12',
    type: 'Telemetry',
    severity: 'Info',
    description: 'Vibration Baseline recalibrated',
    details: 'RMS: 2.1 mm/s',
    source: 'Clara AI Sensor'
  },
  {
    timestamp: '2023-08-20 16:22:00',
    type: 'Alert',
    severity: 'Critical',
    description: 'High Lube Oil Temperature Shutoff Triggered',
    details: 'Temp: 92°C',
    source: 'Clara AI Engine'
  },
  {
    timestamp: '2023-08-11 11:30:00',
    type: 'System',
    severity: 'Info',
    description: 'Firmware Update Ingestion Node 1.4',
    details: 'v1.4.2-build8',
    source: 'Sarah M. (Admin)'
  },
  {
    timestamp: '2023-07-28 14:15:00',
    type: 'Maintenance',
    severity: 'Success',
    description: 'Lube Oil & Filter Replacement',
    details: 'WO-1209',
    source: 'External Vendor'
  },
  {
    timestamp: '2023-07-15 09:00:00',
    type: 'Telemetry',
    severity: 'Warning',
    description: 'Suction Pressure Deviation Alert',
    details: 'Press: 110 psi',
    source: 'Clara AI Sensor'
  },
  {
    timestamp: '2023-06-30 18:00:00',
    type: 'System',
    severity: 'Info',
    description: 'Telemetry Broker Restored (API Sync)',
    details: 'Ping: 42ms',
    source: 'System Auto'
  },
  // Page 3 Mock Items
  {
    timestamp: '2023-06-12 11:15:00',
    type: 'Alert',
    severity: 'Warning',
    description: 'High Motor Amperage Draw Peak',
    details: 'Amp: 750A',
    source: 'Clara AI Engine'
  },
  {
    timestamp: '2023-06-02 14:00:00',
    type: 'Maintenance',
    severity: 'Success',
    description: 'Main Coupling Alignment Correction',
    details: 'WO-0994',
    source: 'John D.'
  },
  {
    timestamp: '2023-05-20 08:33:45',
    type: 'Telemetry',
    severity: 'Warning',
    description: 'Water Flow Rate Below Threshold',
    details: 'Flow: 9.8 L/s',
    source: 'Clara AI Sensor'
  },
  {
    timestamp: '2023-05-15 10:00:00',
    type: 'System',
    severity: 'Info',
    description: 'Emergency Stop Button Test Cycle',
    details: 'Result: Pass',
    source: 'Sarah M. (Admin)'
  },
  {
    timestamp: '2023-04-30 12:44:00',
    type: 'Alert',
    severity: 'Critical',
    description: 'Loss of Phase Detection Alarm',
    details: 'Voltage Drop: 400V',
    source: 'Clara AI Engine'
  },
  {
    timestamp: '2023-04-18 15:30:00',
    type: 'Maintenance',
    severity: 'Success',
    description: 'Control Panel Relay Replacements',
    details: 'WO-0831',
    source: 'External Vendor'
  },
  {
    timestamp: '2023-04-05 09:12:00',
    type: 'Telemetry',
    severity: 'Warning',
    description: 'Bearing Temp Sensor Fault',
    details: 'Signal: Open Ckt',
    source: 'Clara AI Sensor'
  },
  {
    timestamp: '2023-03-20 08:00:00',
    type: 'System',
    severity: 'Info',
    description: 'Annual Sensor Calibration Cycle (Init)',
    details: 'Offset: -0.05',
    source: 'System Auto'
  }
]

export function AssetHistoryView({ assetId }: AssetHistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All')
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 8

  // Generate 90 points for the health trend chart
  const healthTrendData = useMemo(() => {
    const data = []
    const totalPoints = 90
    for (let i = 0; i <= totalPoints; i++) {
      let val = 98
      
      if (i <= 30) {
        // Decline from 98 to 82 (Oct 15 to Nov 15)
        val = 98 - (i * (16 / 30))
      } else if (i === 31) {
        // Jump back to 95 after maintenance (Nov 16)
        val = 94
      } else {
        // Decline from 94 to 82 (Nov 16 to Today)
        const progress = (i - 31) / (totalPoints - 31)
        val = 94 - (progress * 12)
      }

      data.push({
        day: i,
        score: Math.round(val),
        isCriticalPoint: i === 30,
        isMaintenancePoint: i === 31
      })
    }
    return data
  }, [])

  // Filter logs
  const filteredEvents = useMemo(() => {
    return EVENT_LOG_DATA.filter((event) => {
      const matchesSearch =
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.source.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = selectedType === 'All' || event.type === selectedType
      const matchesSeverity = selectedSeverity === 'All' || event.severity === selectedSeverity

      return matchesSearch && matchesType && matchesSeverity
    })
  }, [searchTerm, selectedType, selectedSeverity])

  // Paginated events
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / itemsPerPage))
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredEvents.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredEvents, currentPage])

  // Reset pagination on filter change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedType, selectedSeverity])

  const renderChartTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null
    const pt = payload[0].payload
    
    let dateStr = ''
    if (pt.day < 30) dateStr = `Oct ${15 + Math.floor(pt.day / 1)}`
    else if (pt.day === 30) dateStr = `Nov 15 (Critical Alert)`
    else if (pt.day === 31) dateStr = `Nov 16 (Intervention)`
    else if (pt.day < 60) dateStr = `Nov ${16 + Math.floor((pt.day - 31) / 1)}`
    else dateStr = `Dec ${15 + Math.floor((pt.day - 60) / 1)}`
    
    return (
      <div
        className="p-3 rounded-[10px] border shadow-xl font-mono text-[11px]"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-strong)'
        }}
      >
        <div className="text-[10px] mb-1 font-bold text-[--text-secondary]">
          {dateStr}
        </div>
        <div className="flex justify-between items-center gap-5">
          <span className="text-[--text-secondary]">Health Score:</span>
          <span className={cn('font-bold', pt.score < 85 ? 'text-[--status-critical]' : 'text-[#00D4AA]')}>
            {pt.score}%
          </span>
        </div>
      </div>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Telemetry':
        return <Zap className="w-3.5 h-3.5 text-[#00D4AA]" />
      case 'Alert':
        return <AlertTriangle className="w-3.5 h-3.5 text-[--status-critical]" />
      case 'Maintenance':
        return <Wrench className="w-3.5 h-3.5 text-[#00D4AA]" />
      case 'System':
      default:
        return <Settings className="w-3.5 h-3.5 text-[--text-muted]" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-500/10 border-red-500/20 text-red-400'
      case 'Warning':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400'
      case 'Success':
        return 'bg-green-500/10 border-green-500/20 text-green-400'
      case 'Info':
      default:
        return 'bg-slate-500/10 border-slate-500/20 text-slate-400'
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[--text-secondary]">
        <Link href="/equipment" className="hover:text-[--text-primary] transition-colors">
          Equipment Health
        </Link>
        <span>/</span>
        <span className="hover:text-[--text-primary] transition-colors">
          Johannesburg DC-1
        </span>
        <span>/</span>
        <Link href={`/equipment/${assetId}`} className="hover:text-[--text-primary] transition-colors">
          CHL-01
        </Link>
        <span>/</span>
        <span className="text-[--text-muted]">History</span>
      </div>

      {/* Header Title Row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-mono text-2xl font-light tracking-wide text-[--text-primary]">
              Historical Log
            </h1>
            <span className="px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase tracking-wider bg-[rgba(255,255,255,0.06)] border-[--border-default] text-[--text-secondary]">
              CHL-01
            </span>
          </div>
          <p className="text-[10px] font-mono text-[--text-secondary] uppercase tracking-wider">
            Past 90 Days Overview • 142 Events Recorded
          </p>
        </div>

        <Link
          href={`/equipment/${assetId}`}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border text-xs font-mono font-medium transition-all border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Asset</span>
        </Link>
      </div>

      {/* Health Score Trend (90 Days) Card */}
      <div
        className="rounded-[10px] border p-5 flex flex-col"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
      >
        <div className="flex items-center justify-between gap-4 mb-6">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
            Health Score Trend (90 Days)
          </h3>
          <span className="text-[10px] font-mono text-[--text-secondary] uppercase tracking-wider">
            OCT 15 - TODAY
          </span>
        </div>

        <div className="h-[240px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={healthTrendData} margin={{ top: 25, right: 30, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
              <XAxis
                dataKey="day"
                ticks={[0, 30, 60, 90]}
                tickFormatter={(val) => {
                  if (val === 0) return 'OCT 15'
                  if (val === 30) return 'NOV 15'
                  if (val === 60) return 'DEC 15'
                  if (val === 90) return 'TODAY'
                  return ''
                }}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-geist-mono)' }}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 33, 66, 100]}
                tickFormatter={(val) => `${val}%`}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-geist-mono)' }}
              />
              <Tooltip content={renderChartTooltip} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />

              {/* Maintenance Vertical Line */}
              <ReferenceLine x={31} stroke="rgba(0, 212, 170, 0.4)" strokeDasharray="3 3" />

              {/* Critical Marker dot */}
              <ReferenceDot
                x={30}
                y={82}
                r={4.5}
                fill="#E5484D"
                stroke="var(--bg-card)"
                strokeWidth={2}
                label={{
                  value: 'CRITICAL',
                  fill: '#E5484D',
                  fontSize: 9,
                  fontFamily: 'var(--font-geist-mono)',
                  position: 'top',
                  offset: 8
                }}
              />

              {/* Maintenance Marker dot */}
              <ReferenceDot
                x={31}
                y={94}
                r={4.5}
                fill="#00D4AA"
                stroke="var(--bg-card)"
                strokeWidth={2}
                label={{
                  value: 'MAINTENANCE',
                  fill: '#00D4AA',
                  fontSize: 9,
                  fontFamily: 'var(--font-geist-mono)',
                  position: 'top',
                  offset: 8
                }}
              />

              <Line
                type="monotone"
                dataKey="score"
                stroke="#00D4AA"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: 'var(--bg-card)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Asset Event Log Table Card */}
      <div
        className="rounded-[10px] border p-5 flex flex-col gap-4"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[--border-subtle]">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
            Asset Event Log
          </h3>
          <span className="text-[10px] font-mono text-[--text-secondary] uppercase tracking-wider font-medium">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredEvents.length)} of {filteredEvents.length} Events
          </span>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[--text-muted]" />
              <input
                type="text"
                placeholder="Search event history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-md border font-mono text-xs text-[--text-primary] placeholder-[--text-muted] focus:outline-none focus:border-[--border-strong] transition-all bg-[var(--bg-elevated)] border-[--border-default]"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-[--text-secondary] uppercase">Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-2.5 py-1.5 rounded-md border font-mono text-xs text-[--text-primary] focus:outline-none bg-[var(--bg-elevated)] border-[--border-default] cursor-pointer"
              >
                <option value="All">All Event Types</option>
                <option value="Telemetry">Telemetry</option>
                <option value="Alert">Alert</option>
                <option value="Maintenance">Maintenance</option>
                <option value="System">System</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-[--text-secondary] uppercase">Severity:</span>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-2.5 py-1.5 rounded-md border font-mono text-xs text-[--text-primary] focus:outline-none bg-[var(--bg-elevated)] border-[--border-default] cursor-pointer"
              >
                <option value="All">All Severities</option>
                <option value="Warning">Warning</option>
                <option value="Success">Success</option>
                <option value="Critical">Critical</option>
                <option value="Info">Info</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Date Preset */}
            <button className="px-3 py-1.5 rounded-md border font-mono text-xs text-[--text-primary] bg-[var(--bg-elevated)] border-[--border-default] hover:border-[--border-strong] transition-colors cursor-pointer flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[--text-muted]" />
              <span>Last 90 Days</span>
            </button>

            {/* Export CSV */}
            <button className="px-3.5 py-1.5 rounded-md font-mono text-xs font-bold text-[#0A0D14] hover:shadow-[0_0_15px_rgba(0,212,170,0.35)] transition-all cursor-pointer bg-[#00D4AA] flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-[--border-strong] text-[--text-secondary] uppercase text-[10px] tracking-wider">
                <th className="py-2.5 pr-4">Timestamp (UTC)</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Severity</th>
                <th className="py-2.5 px-4">Event Description</th>
                <th className="py-2.5 px-4">Metric / Details</th>
                <th className="py-2.5 pl-4 text-right">Source / User</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEvents.length > 0 ? (
                paginatedEvents.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b last:border-0 border-[--border-subtle] hover:bg-[rgba(255,255,255,0.01)] transition-colors text-[--text-secondary]"
                  >
                    <td className="py-3 pr-4 text-[--text-primary] font-medium whitespace-nowrap">{row.timestamp}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {getTypeIcon(row.type)}
                        <span>{row.type}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn('px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider', getSeverityBadge(row.severity))}>
                        {row.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[--text-primary] font-medium max-w-xs truncate" title={row.description}>
                      {row.description}
                    </td>
                    <td className="py-3 px-4 text-[--text-primary] whitespace-nowrap">{row.details}</td>
                    <td className="py-3 pl-4 text-right whitespace-nowrap">{row.source}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[--text-muted]">
                    No historical logs found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="flex items-center justify-between pt-4 border-t border-[--border-subtle] text-xs">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3.5 py-1.5 rounded-md border font-mono text-xs font-medium text-[--text-primary] border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="font-mono text-[10px] text-[--text-secondary] uppercase font-bold tracking-wider">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3.5 py-1.5 rounded-md border font-mono text-xs font-medium text-[--text-primary] border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
          >
            <span>Next Page</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
