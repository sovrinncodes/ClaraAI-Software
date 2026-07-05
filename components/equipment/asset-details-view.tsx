'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  MapPin,
  Cpu,
  Shield,
  Activity,
  Zap,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  Filter,
  ArrowLeft,
  Calendar,
  SlidersHorizontal,
  Download,
  Search,
  Plus,
  FileText,
  Check,
  Lock,
  User
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
  ReferenceDot,
  ReferenceArea,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts'
import { cn } from '@/lib/utils/cn'
import { getHealthColor } from '@/lib/utils/format'
import { DEMO_FACILITIES, CHL01_HEALTH_CURVE } from '@/lib/data/seed'

const VIBRATION_TREND_DATA = [
  { time: 'OCT 24, 14:00', deRadial: 3.5, deAxial: 4.8, ndeRadial: 1.5, bearingOilTempScaled: 42.1 / 5, motorStatorTempScaled: 58.2 / 5 },
  { time: '20:00', deRadial: 2.8, deAxial: 4.2, ndeRadial: 1.3, bearingOilTempScaled: 41.8 / 5, motorStatorTempScaled: 57.5 / 5 },
  { time: 'OCT 25, 02:00', deRadial: 2.5, deAxial: 3.5, ndeRadial: 1.2, bearingOilTempScaled: 41.2 / 5, motorStatorTempScaled: 56.4 / 5 },
  { time: '08:00', deRadial: 9.8, deAxial: 5.0, ndeRadial: 1.8, bearingOilTempScaled: 44.5 / 5, motorStatorTempScaled: 61.2 / 5 },
  { time: 'NOW', deRadial: 16.0, deAxial: 5.8, ndeRadial: 2.1, bearingOilTempScaled: 45.2 / 5, motorStatorTempScaled: 62.8 / 5 }
]

const MAINTENANCE_LOG_ROWS = [
  {
    id: 'wo-8992',
    date: '2024-05-14 08:30 UTC',
    woId: 'WO-8992',
    type: 'Corrective',
    description: 'Replaced worn drive belt on compressor motor.',
    technician: { name: 'S. Mokoena', avatar: '/avatar_sipho.png' },
    status: 'Completed',
  },
  {
    id: 'wo-8501',
    date: '2024-04-01 09:00 UTC',
    woId: 'WO-8501',
    type: 'Inspection',
    description: 'Q2 Vibration Analysis and Thermography scan.',
    technician: { name: 'L. Van Der Merwe', avatar: '/avatar_thandiwe.png' },
    status: 'Completed',
  },
  {
    id: 'wo-8320',
    date: '2024-03-15 14:15 UTC',
    woId: 'WO-8320',
    type: 'Preventative',
    description: 'Routine bearing lubrication and seal inspection.',
    technician: { name: 'J. Naidoo', initials: 'JN' },
    status: 'Completed',
  },
  {
    id: 'wo-7905',
    date: '2024-01-10 10:45 UTC',
    woId: 'WO-7905',
    type: 'Corrective',
    description: 'Recalibrated chilled water supply temperature sensor.',
    technician: { name: 'S. Mokoena', avatar: '/avatar_sipho.png' },
    status: 'Completed',
  },
  {
    id: 'wo-7201',
    date: '2023-11-20 07:00 UTC',
    woId: 'WO-7201',
    type: 'Preventative',
    description: 'Annual condenser tube cleaning and Eddy current testing.',
    technician: { name: 'External Contractor', isContractor: true },
    status: 'Completed',
  },
  {
    id: 'wo-9102',
    date: '2024-06-01 08:00 UTC',
    woId: 'WO-9102',
    type: 'Inspection',
    description: 'Scheduled acoustic emission test on gearbox.',
    technician: { name: 'Unassigned', isUnassigned: true },
    status: 'Scheduled',
  }
]

interface TelemetryItem {
  label: string
  value: string
  isAlert?: boolean
}

interface AlertLogItem {
  title: string
  time: string
  description: string
  badges?: string[]
  severity: 'CRITICAL' | 'ADVISORY' | 'WATCH' | 'OPTIMAL' | 'NEUTRAL'
}

interface HealthPoint {
  date: string
  score: number
  isActual: boolean
  confidenceLow?: number
  confidenceHigh?: number
}

interface AssetDetailData {
  facilityId: string
  facilityName: string
  name: string
  type: string
  sub: string
  manufacturer: string
  model: string
  serialNumber: string
  healthScore: number
  healthTrend: string
  status: 'OPTIMAL' | 'WATCH' | 'ADVISORY' | 'CRITICAL'
  predictedFailureDays: number
  predictedFailureConfidence: number
  predictedFailureRange: string
  vibrationRms: number
  vibrationIsoLabel: string
  operatingLoadPct: number
  drawKw: string
  telemetry: TelemetryItem[]
  alerts: AlertLogItem[]
  healthCurve: HealthPoint[]
}

const ASSET_DETAILS_MAP: Record<string, AssetDetailData> = {
  asset_chl_01: {
    facilityId: 'fac_jhb_dc_01',
    facilityName: 'Johannesburg DC-1',
    name: 'CHL-01',
    type: 'CHILLER',
    sub: 'Centrifugal Chiller',
    manufacturer: 'York',
    model: 'YK Centrifugal',
    serialNumber: 'YK-2021-994',
    healthScore: 82,
    healthTrend: '-5.4%',
    status: 'ADVISORY',
    predictedFailureDays: 45,
    predictedFailureConfidence: 89.4,
    predictedFailureRange: '± 5 Days',
    vibrationRms: 14.2,
    vibrationIsoLabel: 'ISO 10816: Unacceptable',
    operatingLoadPct: 88,
    drawKw: '45.2 kW',
    telemetry: [
      { label: 'Evaporator Temp', value: '4.2 °C' },
      { label: 'Condenser Temp', value: '38.5 °C', isAlert: true },
      { label: 'Refrigerant Press.', value: '145 psi' },
      { label: 'Motor Speed', value: '2950 RPM' },
      { label: 'Chilled Water Flow', value: '12.4 L/s' },
      { label: 'Oil Pressure', value: '42 psi' }
    ],
    alerts: [
      {
        title: 'Vibration Threshold Exceeded',
        time: 'Today, 08:14 AM',
        description: 'Vibration exceeded acceptable threshold. Peak amplitude at 3X running speed (298Hz).',
        severity: 'CRITICAL'
      },
      {
        title: 'Health Score Dropped Below 90%',
        time: 'Yesterday, 11:42 PM',
        description: 'Asset health score dropped into the Advisory zone (89%).',
        severity: 'ADVISORY'
      },
      {
        title: 'Minor Temp Fluctuation',
        time: 'Oct 12, 04:30 PM',
        description: 'Slight fluctuation in lube oil temp (45 °C).',
        severity: 'NEUTRAL'
      }
    ],
    healthCurve: CHL01_HEALTH_CURVE
  },
  asset_crac_02: {
    facilityId: 'fac_cpt_mfg_01',
    facilityName: 'Cape Town Assembly',
    name: 'CRAC-02',
    type: 'CRAC_UNIT',
    sub: 'Computer Room Air Conditioning',
    manufacturer: 'Stulz',
    model: 'CyberAir',
    serialNumber: '1092-TX-88',
    healthScore: 71,
    healthTrend: '-6.5%',
    status: 'CRITICAL',
    predictedFailureDays: 12,
    predictedFailureConfidence: 91,
    predictedFailureRange: '± 2 Days',
    vibrationRms: 6.1,
    vibrationIsoLabel: 'ISO 10816: Unacceptable',
    operatingLoadPct: 97,
    drawKw: '22.4 kW',
    telemetry: [
      { label: 'Return Air Temp', value: '26.8 °C', isAlert: true },
      { label: 'Supply Air Temp', value: '18.2 °C' },
      { label: 'Fan Speed', value: '92%' },
      { label: 'Compressor Load', value: '97%', isAlert: true },
      { label: 'Humidifier Status', value: 'Active' },
      { label: 'Refrigerant Charge', value: 'Low' }
    ],
    alerts: [
      {
        title: 'Compressor Overheat Anomaly',
        time: 'Today, 10:12 AM',
        description: 'Compressor temperature exceeded safety threshold (85°C). Immediate inspection required.',
        severity: 'CRITICAL'
      }
    ],
    healthCurve: [
      { date: '-7d', score: 88, isActual: true },
      { date: '-6d', score: 86, isActual: true },
      { date: '-5d', score: 83, isActual: true },
      { date: '-4d', score: 80, isActual: true },
      { date: '-3d', score: 78, isActual: true },
      { date: '-2d', score: 75, isActual: true },
      { date: '-1d', score: 73, isActual: true },
      { date: 'Today', score: 71, isActual: true }
    ]
  },
  asset_ups_b: {
    facilityId: 'fac_cpt_mfg_01',
    facilityName: 'Cape Town Assembly',
    name: 'UPS-B',
    type: 'UPS',
    sub: 'Uninterruptible Power Supply',
    manufacturer: 'APC',
    model: 'Symmetra PX',
    serialNumber: '4591-UX-44',
    healthScore: 78,
    healthTrend: '-2.0%',
    status: 'ADVISORY',
    predictedFailureDays: 31,
    predictedFailureConfidence: 76,
    predictedFailureRange: '± 4 Days',
    vibrationRms: 0.1,
    vibrationIsoLabel: 'ISO 10816: Satisfactory',
    operatingLoadPct: 82,
    drawKw: '18.1 kW',
    telemetry: [
      { label: 'Input Voltage', value: '402 V' },
      { label: 'Output Voltage', value: '400 V' },
      { label: 'Battery Capacity', value: '100%' },
      { label: 'Internal Temp', value: '34.2 °C' },
      { label: 'Cell Voltage Deviation', value: '0.12 V', isAlert: true },
      { label: 'Load Level', value: '82%' }
    ],
    alerts: [
      {
        title: 'Battery Cell Degradation',
        time: 'Today, 09:47 AM',
        description: 'Accelerated voltage drop detected in cell bank C4 during discharge test.',
        severity: 'ADVISORY'
      }
    ],
    healthCurve: [
      { date: '-7d', score: 92, isActual: true },
      { date: '-6d', score: 90, isActual: true },
      { date: '-5d', score: 88, isActual: true },
      { date: '-4d', score: 86, isActual: true },
      { date: '-3d', score: 84, isActual: true },
      { date: '-2d', score: 82, isActual: true },
      { date: '-1d', score: 80, isActual: true },
      { date: 'Today', score: 78, isActual: true }
    ]
  },
  asset_ahu_03: {
    facilityId: 'fac_pta_hq_01',
    facilityName: 'Pretoria HQ',
    name: 'AHU-03',
    type: 'AHU',
    sub: 'Air Handling Unit',
    manufacturer: 'Trane',
    model: 'Climate Changer',
    serialNumber: '7291-ZX-33',
    healthScore: 84,
    healthTrend: '-1.5%',
    status: 'ADVISORY',
    predictedFailureDays: 58,
    predictedFailureConfidence: 68,
    predictedFailureRange: '± 7 Days',
    vibrationRms: 2.9,
    vibrationIsoLabel: 'ISO 10816: Satisfactory',
    operatingLoadPct: 71,
    drawKw: '8.7 kW',
    telemetry: [
      { label: 'Filter Diff Pressure', value: '120 Pa' },
      { label: 'Supply Fan Speed', value: '71%' },
      { label: 'Static Discharge Press', value: '240 Pa' },
      { label: 'Mixed Air Temp', value: '21.5 °C' },
      { label: 'Coil Valve Opening', value: '45%' },
      { label: 'Vibration Velocity', value: '2.9 mm/s', isAlert: true }
    ],
    alerts: [
      {
        title: 'Vibration ISO Zone C',
        time: 'Today, 06:14 AM',
        description: 'Vibration levels entering ISO 10816 Zone C advisory range indicating fan belt wear.',
        severity: 'ADVISORY'
      }
    ],
    healthCurve: [
      { date: '-7d', score: 95, isActual: true },
      { date: '-6d', score: 94, isActual: true },
      { date: '-5d', score: 92, isActual: true },
      { date: '-4d', score: 91, isActual: true },
      { date: '-3d', score: 89, isActual: true },
      { date: '-2d', score: 87, isActual: true },
      { date: '-1d', score: 85, isActual: true },
      { date: 'Today', score: 84, isActual: true }
    ]
  }
}

interface AssetDetailsViewProps {
  assetId: string
}

export function AssetDetailsView({ assetId }: AssetDetailsViewProps) {
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'telemetry' | 'maintenance' | 'specs'>('diagnostics')
  const [checkedActions, setCheckedActions] = useState<boolean[]>([false, false, false])
  const [isAcknowledged, setIsAcknowledged] = useState<boolean>(false)

  // Telemetry Tab States
  const [selectedSensors, setSelectedSensors] = useState<string[]>(['de_radial', 'de_axial'])
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'custom'>('24h')

  // Maintenance Tab States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)

  const handleToggleSensor = (sensorId: string) => {
    setSelectedSensors(prev =>
      prev.includes(sensorId)
        ? prev.filter(id => id !== sensorId)
        : [...prev, sensorId]
    )
  }

  const TELEMETRY_FFT_DATA = useMemo(() => {
    const data = []
    for (let hz = 0; hz <= 1080; hz += 10) {
      let amp = 0.1 + Math.random() * 0.3
      
      // 1X Peak (99 Hz)
      if (hz === 100) {
        amp = 7.5
      } else if (hz === 90 || hz === 110) {
        amp = 1.8
      }
      
      // 2X Peak (199 Hz)
      if (hz === 200) {
        amp = 3.5
      } else if (hz === 190 || hz === 210) {
        amp = 1.0
      }
      
      // 3X Peak (298 Hz) - Anomaly
      if (hz === 300) {
        amp = 14.2
      } else if (hz >= 290 && hz <= 310 && hz !== 300) {
        amp = 6.5
      }
      
      data.push({
        hz,
        amp: parseFloat(amp.toFixed(2)),
        isAnomaly: hz >= 280 && hz <= 320
      })
    }
    return data
  }, [])

  const filteredMaintenanceRows = useMemo(() => {
    return MAINTENANCE_LOG_ROWS.filter((row) => {
      const matchesSearch = row.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            row.woId.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedType === 'All' || row.type === selectedType
      const matchesStatus = selectedStatus === 'All' || row.status === selectedStatus
      return matchesSearch && matchesType && matchesStatus
    })
  }, [searchQuery, selectedType, selectedStatus])

  const details = useMemo(() => {
    return ASSET_DETAILS_MAP[assetId] || ASSET_DETAILS_MAP.asset_chl_01
  }, [assetId])

  const handleToggleAction = (index: number) => {
    setCheckedActions((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  const handleAcknowledge = () => {
    setIsAcknowledged(true)
  }

  // Process Health Prediction Curve data
  const healthCurveData = useMemo(() => {
    return details.healthCurve.map((pt) => {
      let displayLabel = pt.date
      if (pt.date === '-7d') displayLabel = 'T-7 DAYS'
      if (pt.date === 'Today') displayLabel = 'TODAY'
      if (pt.date === '+45d') displayLabel = 'T+45 DAYS'
      
      const isToday = pt.date === 'Today'
      
      return {
        name: displayLabel,
        actual: pt.isActual ? pt.score : (isToday ? pt.score : null),
        predicted: !pt.isActual ? pt.score : (isToday ? pt.score : null),
        confidenceRange: pt.confidenceLow !== undefined ? [pt.confidenceLow, pt.confidenceHigh] : null,
        confidenceLow: pt.confidenceLow,
        confidenceHigh: pt.confidenceHigh,
        raw: pt
      }
    })
  }, [details])

  const renderHealthTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null
    const pt = payload[0].payload
    const isActual = pt.actual !== null && pt.raw.isActual
    return (
      <div
        className="p-3 rounded-[10px] border shadow-xl font-mono text-[11px]"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-strong)',
        }}
      >
        <div className="text-[10px] mb-1.5 font-bold uppercase tracking-wider text-[--text-secondary]">
          {pt.raw.date} Health
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center gap-5">
            <span className="text-[--text-secondary]">{isActual ? 'Actual Score:' : 'Predicted Score:'}</span>
            <span className={cn('font-bold', isActual ? 'text-[#00D4AA]' : 'text-[#F5A623]')}>
              {pt.actual !== null ? pt.actual : pt.predicted}%
            </span>
          </div>
          {pt.confidenceLow !== undefined && (
            <div className="flex justify-between items-center gap-5 text-[10px] text-[--text-muted]">
              <span>Confidence Range:</span>
              <span>{pt.confidenceLow}% - {pt.confidenceHigh}%</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Generate 100 frequency bins up to 1000 Hz for vibration chart
  const vibrationSpectrumData = useMemo(() => {
    const data = []
    for (let hz = 0; hz <= 1000; hz += 10) {
      let amp = 0.2 + Math.random() * 0.4
      // Main peaks
      if (hz === 100) {
        amp = 4.0 // 1X running speed
      } else if (hz === 200) {
        amp = 2.5 // 2X running speed
      } else if (hz === 300) {
        amp = details.name === 'CHL-01' ? 14.2 : 3.2 // 3X running speed (extreme anomaly for CHL-01)
      }
      
      // Add spread/bell shape around peaks
      if (hz === 90 || hz === 110) amp = 1.8
      if (hz === 190 || hz === 210) amp = 1.0
      if (hz === 290 || hz === 310) amp = details.name === 'CHL-01' ? 6.8 : 1.2
      
      data.push({
        hz,
        amp: parseFloat(amp.toFixed(2)),
        isAnomaly: details.name === 'CHL-01' && hz >= 290 && hz <= 310
      })
    }
    return data
  }, [details])

  const renderFftTooltip = ({ active, payload }: any) => {
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
          Frequency: {pt.hz} Hz
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-[--text-secondary]">Amplitude:</span>
          <span className={cn('font-bold', pt.isAnomaly ? 'text-[#F5A623]' : 'text-[#00D4AA]')}>
            {pt.amp} mm/s
          </span>
        </div>
      </div>
    )
  }

  const statusLabelMap = {
    CRITICAL: { text: 'Critical', style: 'bg-red-500/10 border-red-500/20 text-red-400' },
    ADVISORY: { text: 'Advisory', style: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
    WATCH: { text: 'Watch', style: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
    OPTIMAL: { text: 'Optimal', style: 'bg-green-500/10 border-green-500/20 text-green-400' }
  }

  const statusProps = statusLabelMap[details.status]

  // Sparkline data
  const sparklineHealth = details.name === 'CHL-01' ? [86, 85, 85, 84, 83, 83, 82] : [88, 87, 87, 86, 85, 84, 84]
  const sparklineVibration = details.name === 'CHL-01' ? [3.2, 3.4, 3.5, 3.7, 4.2, 4.6, 14.2] : [2.0, 2.1, 2.3, 2.2, 2.5, 2.7, 2.9]
  const sparklineLoad = [85, 86, 87, 85, 88, 87, 88]
  const sparklineTtf = details.name === 'CHL-01' ? [57, 55, 52, 50, 48, 46, 45] : [65, 63, 62, 60, 59, 58, 58]

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[--text-secondary]">
        <Link href="/equipment" className="hover:text-[--text-primary] transition-colors">
          Equipment Health
        </Link>
        <span>/</span>
        <span className="hover:text-[--text-primary] transition-colors">
          {details.facilityName}
        </span>
        <span>/</span>
        <span className="text-[--text-muted]">{details.name}</span>
      </div>

      {/* Header Info Title Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center flex-wrap gap-3 mb-2">
            <h1 className="font-mono text-2xl font-light tracking-wide text-[--text-primary]">
              {details.name}
            </h1>
            <span className={cn('px-2.5 py-0.5 rounded border text-[9px] font-mono font-bold uppercase tracking-wider', statusProps.style)}>
              {details.healthScore}% Health - {statusProps.text}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-mono text-[--text-secondary]">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[--text-muted]" />
              <span>{details.sub}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[--text-muted]" />
              <span>{details.facilityName}, {details.name === 'CHL-01' ? 'Plant Room A' : 'Zone B'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[--text-muted]" />
              <span>SN: {details.serialNumber}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/equipment/${assetId}/history`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border text-xs font-mono font-medium transition-all border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-[--text-muted]" />
            <span>View History</span>
          </Link>

          <Link
            href={`/equipment/${assetId}/work-order`}
            className="flex items-center gap-1.5 text-[#0A0D14] hover:shadow-[0_0_15px_rgba(0,212,170,0.35)] transition-all font-mono text-xs font-bold px-3.5 py-1.5 rounded-[6px] cursor-pointer bg-[#00D4AA]"
          >
            <Wrench className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Create Work Order</span>
          </Link>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-[--border-subtle]">
        {[
          { id: 'diagnostics', label: 'AI Diagnostics' },
          { id: 'telemetry', label: 'Telemetry & FFT' },
          { id: 'maintenance', label: 'Maintenance Log' },
          { id: 'specs', label: 'Specifications' }
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

      {/* Main Content Router */}
      {activeTab === 'diagnostics' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left Column (KPIs and Main Charts) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* 4 KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Current Health */}
              <div
                className="rounded-[10px] border p-5 flex flex-col justify-between"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                      Current Health
                    </span>
                    <Activity className="w-4 h-4 text-[--text-muted]" />
                  </div>
                  <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                    <span>{details.healthScore}%</span>
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-[--status-critical]">
                      <TrendingDown className="w-2.5 h-2.5" />
                      <span>{details.healthTrend}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 mt-3">
                  <span className="text-[10px] font-mono text-[--text-secondary]">
                    Target: &gt;90%
                  </span>
                  <div className="w-[60px] h-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparklineHealth.map((v) => ({ v }))}>
                        <Line type="monotone" dataKey="v" stroke="var(--status-critical)" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Predicted TTF */}
              <div
                className="rounded-[10px] border p-5 flex flex-col justify-between"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                      Predicted TTF
                    </span>
                    <Clock className="w-4 h-4 text-[--text-muted]" />
                  </div>
                  <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                    <span>{details.predictedFailureDays} Days</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 mt-3">
                  <span className="text-[9px] font-mono text-[--status-critical] font-bold">
                    -{details.name === 'CHL-01' ? 12 : 5}d vs prediction
                  </span>
                  <div className="w-[60px] h-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparklineTtf.map((v) => ({ v }))}>
                        <Line type="monotone" dataKey="v" stroke="var(--status-critical)" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Peak Vibration */}
              <div
                className="rounded-[10px] border p-5 flex flex-col justify-between"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                      Peak Vibration
                    </span>
                    <Activity className="w-4 h-4 text-[--text-muted]" />
                  </div>
                  <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                    <span>{details.vibrationRms} <span className="text-xs">mm/s</span></span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 mt-3">
                  <span className="text-[9px] font-mono text-[--status-critical] font-bold">
                    +420% anomaly
                  </span>
                  <div className="w-[60px] h-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparklineVibration.map((v) => ({ v }))}>
                        <Line type="monotone" dataKey="v" stroke="var(--status-critical)" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Operating Load */}
              <div
                className="rounded-[10px] border p-5 flex flex-col justify-between"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                      Operating Load
                    </span>
                    <Zap className="w-4 h-4 text-[--text-muted]" />
                  </div>
                  <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                    <span>{details.operatingLoadPct}% <span className="text-xs font-normal text-[--text-secondary]">Stable</span></span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 mt-3">
                  <span className="text-[10px] font-mono text-[--text-secondary]">
                    Avg: 85%
                  </span>
                  <div className="w-[60px] h-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparklineLoad.map((v) => ({ v }))}>
                        <Line type="monotone" dataKey="v" stroke="var(--text-muted)" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Score Prediction Model Card */}
            <div
              className="rounded-[10px] border p-5 flex flex-col"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                  Health Score Prediction Model
                </h3>
                <div className="flex items-center gap-4 text-[10px] font-mono text-[--text-secondary]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 rounded-full bg-[#00D4AA]" />
                    <span>Historical Health</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 border-t-2 border-dashed border-[#F5A623]" />
                    <span>Predicted Trajectory</span>
                  </div>
                </div>
              </div>

              <div className="h-[240px] w-full relative">
                {healthCurveData.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={healthCurveData} margin={{ top: 20, right: 35, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F5A623" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#F5A623" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-geist-mono)' }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        ticks={[0, 20, 40, 60, 80, 100]}
                        tickFormatter={(val) => `${val}%`}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-geist-mono)' }}
                      />
                      <Tooltip content={renderHealthTooltip} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
                      
                      {/* Confidence band area */}
                      <Area
                        type="monotone"
                        dataKey="confidenceRange"
                        stroke="none"
                        fill="url(#confidenceGradient)"
                        connectNulls
                      />

                      {/* Vertical Reference line at Today */}
                      <ReferenceLine x="TODAY" stroke="var(--border-strong)" strokeDasharray="3 3" />

                      {/* FAILURE reference line */}
                      <ReferenceLine
                        y={40}
                        stroke="var(--status-critical)"
                        strokeDasharray="3 3"
                        label={{
                          value: 'FAILURE',
                          fill: 'var(--status-critical)',
                          fontSize: 9,
                          fontFamily: 'var(--font-geist-mono)',
                          position: 'right',
                          offset: 10
                        }}
                      />

                      {/* Actual Curve */}
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#00D4AA"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, stroke: 'var(--bg-card)', strokeWidth: 2 }}
                        connectNulls
                      />

                      {/* Prediction Curve */}
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#F5A623"
                        strokeDasharray="4 4"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, stroke: 'var(--bg-card)', strokeWidth: 2 }}
                        connectNulls
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Vibration Spectrum Card */}
            <div
              className="rounded-[10px] border p-5 flex flex-col"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                  Vibration Spectrum (FFT Analysis)
                </h3>
                {details.name === 'CHL-01' && (
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    Anomaly Detected
                  </span>
                )}
              </div>

              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vibrationSpectrumData} margin={{ top: 20, right: 10, left: -30, bottom: 0 }} barGap={0}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis
                      dataKey="hz"
                      ticks={[0, 298, 1000]}
                      tickFormatter={(val) => val === 298 ? '3X RUNNING SPEED (298 Hz)' : `${val} Hz`}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-geist-mono)' }}
                    />
                    <YAxis
                      domain={[0, 15]}
                      ticks={[0.0, 7.5, 15.0]}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-geist-mono)' }}
                    />
                    <Tooltip content={renderFftTooltip} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                    <Bar dataKey="amp" barSize={2}>
                      {vibrationSpectrumData.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={entry.isAnomaly ? '#F5A623' : '#00D4AA'}
                          opacity={entry.isAnomaly ? 1 : 0.4}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column Panels */}
          <div className="flex flex-col gap-6">
            {/* Clara AI Insight */}
            <div className="rounded-[10px] border p-5 flex flex-col gap-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <div className="flex items-center gap-2 pb-2 border-b border-[--border-subtle]">
                <div className="w-5 h-5 rounded flex items-center justify-center bg-[rgba(0,212,170,0.1)] text-[#00D4AA]">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                </div>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                  Clara AI Insight
                </h3>
              </div>

              <p className="text-xs text-[--text-secondary] leading-relaxed">
                High confidence of bearing degradation. The FFT spectrum shows a sudden 420% increase in amplitude at the 3X running speed harmonic (298Hz) over the last 48 hours.
              </p>

              <div className="rounded-lg p-3 flex flex-col gap-1.5" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                <span className="text-[9px] font-mono text-[--text-muted] uppercase tracking-wider">Predicted Root Cause</span>
                <span className="text-xs font-semibold text-[--text-primary] font-mono">Stage 2 Compressor Shaft Bearing Wear</span>
                <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono mt-0.5">
                  <Shield className="w-3 h-3 fill-current" />
                  <span>Confidence: 89.4%</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 my-1">
                <span className="text-[9px] font-mono text-[--text-muted] uppercase tracking-wider">Recommended Actions</span>
                {[
                  'Reduce operating load to <70% to extend TTF by estimated +14 days.',
                  'Dispatch field engineer for visual bearing inspection.',
                  'Order replacement part #BRG-YK-02 (Not in local inventory).'
                ].map((action, idx) => (
                  <label key={idx} className="flex items-start gap-2.5 text-xs text-[--text-secondary] cursor-pointer hover:text-[--text-primary] select-none">
                    <input
                      type="checkbox"
                      checked={checkedActions[idx]}
                      onChange={() => handleToggleAction(idx)}
                      className="mt-0.5 w-3.5 h-3.5 rounded border border-[--border-strong] bg-transparent text-[#00D4AA] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#00D4AA]"
                    />
                    <span>{action}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleAcknowledge}
                  className="flex-1 py-2 rounded-md font-mono text-xs font-bold text-[#0A0D14] hover:shadow-[0_0_15px_rgba(0,212,170,0.35)] transition-all cursor-pointer text-center"
                  style={{ backgroundColor: isAcknowledged ? 'var(--status-optimal)' : '#00D4AA' }}
                >
                  {isAcknowledged ? 'Acknowledged' : 'Acknowledge'}
                </button>
                <button
                  className="flex-1 py-2 rounded-md border font-mono text-xs font-medium text-[--text-primary] hover:border-[--border-strong] transition-colors cursor-pointer text-center"
                  style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-elevated)' }}
                >
                  Create Work Order
                </button>
              </div>
            </div>

            {/* Asset Alert History */}
            <div className="rounded-[10px] border p-5 flex flex-col" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary] mb-4 pb-2 border-b border-[--border-subtle]">
                Asset Alert History
              </h3>
              <div className="flex flex-col gap-4">
                {details.alerts.map((alert, idx) => (
                  <div key={idx} className="flex gap-3 text-xs">
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                      alert.severity === 'CRITICAL' ? 'bg-red-500/10' : alert.severity === 'ADVISORY' ? 'bg-amber-500/10' : 'bg-slate-500/10'
                    )}>
                      <Activity className={cn(
                        'w-4 h-4',
                        alert.severity === 'CRITICAL' ? 'text-red-400' : alert.severity === 'ADVISORY' ? 'text-amber-400' : 'text-slate-400'
                      )} />
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[--text-primary] font-mono leading-none">
                          {alert.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-[--text-secondary] leading-relaxed">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-[9px] font-mono mt-0.5 text-[--text-muted]">
                        <span>{alert.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-3 border-t border-[--border-subtle] text-center">
                <Link
                  href={`/equipment/${assetId}/history`}
                  className="inline-block w-full py-2 rounded-md border text-center font-mono text-[10px] font-bold text-[--text-secondary] hover:text-[--text-primary] hover:border-[--border-strong] transition-all"
                  style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-elevated)' }}
                >
                  View Full Log
                </Link>
              </div>
            </div>

            {/* Specifications Card */}
            <div className="rounded-[10px] border p-5 flex flex-col" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary] mb-4 pb-2 border-b border-[--border-subtle]">
                Specifications
              </h3>
              <div className="flex flex-col gap-2 font-mono text-xs">
                {[
                  { label: 'Manufacturer', value: details.manufacturer },
                  { label: 'Model', value: details.model },
                  { label: 'Serial Number', value: details.serialNumber },
                  { label: 'Capacity', value: details.name === 'CHL-01' ? '500 Tons' : 'N/A' },
                  { label: 'Refrigerant', value: details.name === 'CHL-01' ? 'R-134a' : 'N/A' },
                  { label: 'Last Serviced', value: details.name === 'CHL-01' ? 'Jan 14, 2024' : 'N/A' }
                ].map((spec, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1.5 border-b last:border-0 border-[--border-subtle]">
                    <span className="text-[--text-secondary]">{spec.label}</span>
                    <span className="text-[--text-primary] font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Telemetry & FFT Tab */}
      {activeTab === 'telemetry' && (
        <div className="flex flex-col gap-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-[--border-subtle]">
            {/* Left Range Presets */}
            <div className="flex items-center rounded-lg border border-[--border-default] bg-[var(--bg-elevated)] p-1">
              {[
                { id: '24h', label: 'Last 24h' },
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
                { id: 'custom', label: 'Custom Range', hasIcon: true }
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setTimeRange(preset.id as any)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-[10px] font-medium transition-colors cursor-pointer',
                    timeRange === preset.id
                      ? 'bg-zinc-800 text-[--text-primary]'
                      : 'text-[--text-secondary] hover:text-[--text-primary]'
                  )}
                >
                  {preset.hasIcon && <Calendar className="w-3.5 h-3.5" />}
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
            {/* Right Action Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md border border-[--border-default] bg-[var(--bg-elevated)] font-mono text-[10px] font-bold text-[--text-secondary] hover:text-[--text-primary] hover:border-[--border-strong] transition-all cursor-pointer">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[--text-muted]" />
                <span>Advanced Filters</span>
              </button>
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md border border-[--border-default] bg-[var(--bg-elevated)] font-mono text-[10px] font-bold text-[--text-secondary] hover:text-[--text-primary] hover:border-[--border-strong] transition-all cursor-pointer">
                <Download className="w-3.5 h-3.5 text-[--text-muted]" />
                <span>Export Data</span>
              </button>
            </div>
          </div>

          {/* Dual Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
            {/* Left Column (70%) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Vibration Trend Line Chart */}
              <div className="rounded-[10px] border p-5 flex flex-col" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#00D4AA]" />
                    <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                      Vibration Trend
                    </h3>
                  </div>
                  {/* Legend */}
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 text-[9px] font-mono text-[--text-secondary]">
                    {selectedSensors.includes('de_radial') && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-0.5 rounded-full bg-[#00D4AA]" />
                        <span>DE Radial</span>
                      </div>
                    )}
                    {selectedSensors.includes('de_axial') && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-0.5 rounded-full bg-[#F5A623]" />
                        <span>DE Axial</span>
                      </div>
                    )}
                    {selectedSensors.includes('nde_radial') && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-0.5 rounded-full bg-zinc-500" />
                        <span>NDE Radial</span>
                      </div>
                    )}
                    {selectedSensors.includes('bearing_oil_temp') && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-0.5 rounded-full bg-purple-500" />
                        <span>Bearing Oil Temp (Scaled)</span>
                      </div>
                    )}
                    {selectedSensors.includes('motor_stator_temp') && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-0.5 rounded-full bg-blue-500" />
                        <span>Motor Stator Temp (Scaled)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-0.5 border-t border-dashed border-red-500" />
                      <span className="text-red-400">Threshold</span>
                    </div>
                  </div>
                </div>

                <div className="h-[260px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={VIBRATION_TREND_DATA} margin={{ top: 10, right: 35, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                      <XAxis
                        dataKey="time"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-geist-mono)' }}
                      />
                      <YAxis
                        domain={[0, 16]}
                        ticks={[0, 8.0, 16.0]}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-geist-mono)' }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null
                          return (
                            <div
                              className="p-3 rounded-[10px] border shadow-xl font-mono text-[11px] flex flex-col gap-1.5"
                              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
                            >
                              <div className="text-[10px] font-bold text-[--text-secondary] uppercase mb-1">
                                {payload[0].payload.time}
                              </div>
                              {payload.map((entry: any, i: number) => {
                                let label = entry.name
                                let valStr = `${entry.value} mm/s`
                                if (entry.name === 'bearingOilTempScaled') {
                                  label = 'Bearing Oil Temp'
                                  valStr = `${(entry.value * 5).toFixed(1)} °C`
                                } else if (entry.name === 'motorStatorTempScaled') {
                                  label = 'Motor Stator Temp'
                                  valStr = `${(entry.value * 5).toFixed(1)} °C`
                                }
                                return (
                                  <div key={i} className="flex justify-between items-center gap-4">
                                    <span style={{ color: entry.stroke }}>{label}:</span>
                                    <span className="font-bold text-[--text-primary]">{valStr}</span>
                                  </div>
                                )
                              })}
                            </div>
                          )
                        }}
                      />

                      {/* Threshold reference line */}
                      <ReferenceLine
                        y={14.5}
                        stroke="#EF4444"
                        strokeDasharray="4 4"
                        label={{
                          value: 'CRITICAL',
                          fill: '#EF4444',
                          fontSize: 8,
                          fontFamily: 'var(--font-geist-mono)',
                          position: 'insideRight',
                          offset: 10
                        }}
                      />

                      {selectedSensors.includes('de_radial') && (
                        <Line
                          type="monotone"
                          dataKey="deRadial"
                          name="DE Radial"
                          stroke="#00D4AA"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, stroke: 'var(--bg-card)', strokeWidth: 2 }}
                        />
                      )}

                      {selectedSensors.includes('de_axial') && (
                        <Line
                          type="monotone"
                          dataKey="deAxial"
                          name="DE Axial"
                          stroke="#F5A623"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, stroke: 'var(--bg-card)', strokeWidth: 2 }}
                        />
                      )}

                      {selectedSensors.includes('nde_radial') && (
                        <Line
                          type="monotone"
                          dataKey="ndeRadial"
                          name="NDE Radial"
                          stroke="#8A90A6"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, stroke: 'var(--bg-card)', strokeWidth: 2 }}
                        />
                      )}

                      {selectedSensors.includes('bearing_oil_temp') && (
                        <Line
                          type="monotone"
                          dataKey="bearingOilTempScaled"
                          name="bearingOilTempScaled"
                          stroke="#C084FC"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, stroke: 'var(--bg-card)', strokeWidth: 2 }}
                        />
                      )}

                      {selectedSensors.includes('motor_stator_temp') && (
                        <Line
                          type="monotone"
                          dataKey="motorStatorTempScaled"
                          name="motorStatorTempScaled"
                          stroke="#60A5FA"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, stroke: 'var(--bg-card)', strokeWidth: 2 }}
                        />
                      )}

                      {/* Critical breach dot */}
                      {selectedSensors.includes('de_radial') && (
                        <ReferenceDot
                          x="NOW"
                          y={16.0}
                          r={4}
                          fill="#EF4444"
                          stroke="#0A0D14"
                          strokeWidth={2}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* FFT Spectrum Card */}
              <div className="rounded-[10px] border p-5 flex flex-col" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#00D4AA]" />
                    <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                      High-Resolution FFT Spectrum
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      Anomaly Detected at 3X
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-[--text-muted]">Snapshot: 14:02:45 UTC</span>
                </div>

                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={TELEMETRY_FFT_DATA} margin={{ top: 10, right: 10, left: -30, bottom: 0 }} barGap={0}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                      <XAxis
                        dataKey="hz"
                        ticks={[0, 1080]}
                        tickFormatter={(val) => `${val} Hz`}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-geist-mono)' }}
                      />
                      <YAxis
                        domain={[0, 15]}
                        ticks={[0, 5.0, 10.0, 15.0]}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-geist-mono)' }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null
                          const pt = payload[0].payload
                          return (
                            <div
                              className="p-3 rounded-[10px] border shadow-xl font-mono text-[11px]"
                              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
                            >
                              <div className="text-[10px] mb-1 font-bold text-[--text-secondary]">
                                Frequency: {pt.hz} Hz
                              </div>
                              <div className="flex justify-between items-center gap-4">
                                <span className="text-[--text-secondary]">Amplitude:</span>
                                <span className={cn('font-bold', pt.isAnomaly ? 'text-[#F5A623]' : 'text-[#00D4AA]')}>
                                  {pt.amp} mm/s
                                </span>
                              </div>
                            </div>
                          )
                        }}
                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      />
                      
                      {/* Highlight region (280 to 320 Hz) */}
                      <ReferenceArea x1={280} x2={320} fill="#F5A623" fillOpacity={0.08} />

                      {/* Harmonics references */}
                      <ReferenceLine
                        x={100}
                        stroke="rgba(255,255,255,0.15)"
                        strokeDasharray="3 3"
                        label={{ value: '1X', fill: 'var(--text-muted)', fontSize: 8, fontFamily: 'var(--font-geist-mono)', position: 'top', offset: 5 }}
                      />
                      <ReferenceLine
                        x={200}
                        stroke="rgba(255,255,255,0.15)"
                        strokeDasharray="3 3"
                        label={{ value: '2X', fill: 'var(--text-muted)', fontSize: 8, fontFamily: 'var(--font-geist-mono)', position: 'top', offset: 5 }}
                      />
                      <ReferenceLine
                        x={300}
                        stroke="#F5A623"
                        strokeDasharray="3 3"
                        label={{ value: '3X (298 Hz)', fill: '#F5A623', fontSize: 8, fontFamily: 'var(--font-geist-mono)', position: 'top', offset: 5 }}
                      />

                      <Bar dataKey="amp" barSize={1.8}>
                        {TELEMETRY_FFT_DATA.map((entry, idx) => (
                          <Cell
                            key={`cell-${idx}`}
                            fill={entry.isAnomaly ? '#F5A623' : '#00D4AA'}
                            opacity={entry.isAnomaly ? 1.0 : 0.4}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Column (30%) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              {/* Telemetry Sensors */}
              <div className="rounded-[10px] border p-5 flex flex-col" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[--border-subtle]">
                  <Check className="w-4 h-4 text-[#00D4AA]" />
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                    Telemetry Sensors
                  </h3>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Vibration category */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-mono font-bold tracking-widest text-[--text-muted] uppercase">VIBRATION</span>
                    {[
                      { id: 'de_radial', label: 'Drive End Radial', value: '14.2 mm/s', dotColor: 'bg-[#00D4AA]' },
                      { id: 'de_axial', label: 'Drive End Axial', value: '8.4 mm/s', dotColor: 'bg-[#F5A623]' },
                      { id: 'nde_radial', label: 'Non-Drive End Radial', value: '2.1 mm/s', dotColor: 'bg-zinc-500' }
                    ].map((sensor) => (
                      <label key={sensor.id} className="flex items-center justify-between py-1.5 px-2.5 rounded-md hover:bg-zinc-800/40 cursor-pointer transition-colors select-none text-xs font-mono">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={selectedSensors.includes(sensor.id)}
                            onChange={() => handleToggleSensor(sensor.id)}
                            className="w-3.5 h-3.5 rounded border border-[--border-strong] bg-transparent text-[#00D4AA] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#00D4AA]"
                          />
                          <span className={cn('w-2 h-2 rounded-full shrink-0', sensor.dotColor)} />
                          <span className="text-[--text-secondary]">{sensor.label}</span>
                        </div>
                        <span className="text-[--text-primary] font-semibold">{sensor.value}</span>
                      </label>
                    ))}
                  </div>

                  {/* Temperature category */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
                    <span className="text-[9px] font-mono font-bold tracking-widest text-[--text-muted] uppercase">TEMPERATURE</span>
                    {[
                      { id: 'bearing_oil_temp', label: 'Bearing Oil Temp', value: '45.2 °C', dotColor: 'bg-purple-500' },
                      { id: 'motor_stator_temp', label: 'Motor Stator Temp', value: '62.8 °C', dotColor: 'bg-blue-500' }
                    ].map((sensor) => (
                      <label key={sensor.id} className="flex items-center justify-between py-1.5 px-2.5 rounded-md hover:bg-zinc-800/40 cursor-pointer transition-colors select-none text-xs font-mono">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={selectedSensors.includes(sensor.id)}
                            onChange={() => handleToggleSensor(sensor.id)}
                            className="w-3.5 h-3.5 rounded border border-[--border-strong] bg-transparent text-[#00D4AA] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#00D4AA]"
                          />
                          <span className={cn('w-2 h-2 rounded-full shrink-0', sensor.dotColor)} />
                          <span className="text-[--text-secondary]">{sensor.label}</span>
                        </div>
                        <span className="text-[--text-primary] font-semibold">{sensor.value}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Harmonic Analysis */}
              <div className="rounded-[10px] border p-5 flex flex-col" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[--border-subtle]">
                  <Search className="w-4 h-4 text-[#00D4AA]" />
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                    Harmonic Analysis
                  </h3>
                </div>

                <div className="flex flex-col gap-3 font-mono text-xs">
                  {[
                    { label: '1X (Running Speed)', hz: '99.5 Hz', amp: '2.4 mm/s', isAnomaly: false },
                    { label: '2X Harmonic', hz: '199.0 Hz', amp: '1.1 mm/s', isAnomaly: false },
                    { label: '3X Harmonic (Anomaly)', hz: '298.5 Hz', amp: '14.2 mm/s', isAnomaly: true }
                  ].map((harmonic, idx) => (
                    <div key={idx} className="flex flex-col gap-1 py-2 px-2.5 rounded-md bg-[var(--bg-elevated)] border border-[--border-subtle]">
                      <span className={cn('text-[9px] font-bold uppercase tracking-wider', harmonic.isAnomaly ? 'text-amber-400' : 'text-[--text-muted]')}>
                        {harmonic.label}
                      </span>
                      <div className="flex justify-between items-center text-xs text-[--text-primary]">
                        <span className="text-[--text-secondary]">{harmonic.hz}</span>
                        <span className={cn('font-semibold', harmonic.isAnomaly ? 'text-amber-400' : 'text-[--text-primary]')}>
                          {harmonic.amp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FFT Configuration */}
              <div className="rounded-[10px] border p-5 flex flex-col" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[--border-subtle]">
                  <SlidersHorizontal className="w-4 h-4 text-[#00D4AA]" />
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                    FFT Configuration
                  </h3>
                </div>

                <div className="flex flex-col gap-2 font-mono text-xs">
                  {[
                    { label: 'Fmax', value: '1000 Hz' },
                    { label: 'Lines of Resolution', value: '3200' },
                    { label: 'Windowing', value: 'Hanning' },
                    { label: 'Averages', value: '4 (Linear)' }
                  ].map((config, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0 border-[--border-subtle]">
                      <span className="text-[--text-secondary]">{config.label}</span>
                      <span className="text-[--text-primary] font-medium">{config.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Log Tab */}
      {activeTab === 'maintenance' && (
        <div className="flex flex-col gap-6">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-[--border-subtle]">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1 max-w-xl">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[--text-muted]" />
                <input
                  type="text"
                  placeholder="Search maintenance logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[var(--bg-elevated)] border border-[--border-default] hover:border-[--border-strong] focus:border-[#00D4AA] rounded-md text-xs font-mono transition-colors text-[--text-primary] placeholder-[--text-muted] focus:outline-none focus:ring-0"
                />
              </div>

              {/* Type Filter */}
              <div className="relative w-full sm:w-[150px]">
                <button
                  onClick={() => {
                    setIsTypeDropdownOpen(!isTypeDropdownOpen)
                    setIsStatusDropdownOpen(false)
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-md border border-[--border-default] bg-[var(--bg-elevated)] text-xs font-mono text-[--text-secondary] hover:text-[--text-primary] hover:border-[--border-strong] transition-all cursor-pointer"
                >
                  <span>{selectedType === 'All' ? 'All Types' : selectedType}</span>
                  <ChevronRight className={cn('w-3.5 h-3.5 transform transition-transform text-[--text-muted]', isTypeDropdownOpen ? 'rotate-90' : 'rotate-0')} />
                </button>
                {isTypeDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1.5 z-10 rounded-md border border-[--border-strong] bg-[var(--bg-elevated)] shadow-xl p-1 flex flex-col font-mono text-xs">
                    {['All', 'Corrective', 'Preventative', 'Inspection'].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedType(type)
                          setIsTypeDropdownOpen(false)
                        }}
                        className={cn(
                          'w-full text-left px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors text-xs cursor-pointer',
                          selectedType === type ? 'text-[#00D4AA] bg-zinc-800/60 font-semibold' : 'text-[--text-secondary]'
                        )}
                      >
                        {type === 'All' ? 'All Types' : type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Filter */}
              <div className="relative w-full sm:w-[150px]">
                <button
                  onClick={() => {
                    setIsStatusDropdownOpen(!isStatusDropdownOpen)
                    setIsTypeDropdownOpen(false)
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-md border border-[--border-default] bg-[var(--bg-elevated)] text-xs font-mono text-[--text-secondary] hover:text-[--text-primary] hover:border-[--border-strong] transition-all cursor-pointer"
                >
                  <span>{selectedStatus === 'All' ? 'All Statuses' : selectedStatus}</span>
                  <ChevronRight className={cn('w-3.5 h-3.5 transform transition-transform text-[--text-muted]', isStatusDropdownOpen ? 'rotate-90' : 'rotate-0')} />
                </button>
                {isStatusDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1.5 z-10 rounded-md border border-[--border-strong] bg-[var(--bg-elevated)] shadow-xl p-1 flex flex-col font-mono text-xs">
                    {['All', 'Completed', 'Scheduled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setSelectedStatus(status)
                          setIsStatusDropdownOpen(false)
                        }}
                        className={cn(
                          'w-full text-left px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors text-xs cursor-pointer',
                          selectedStatus === status ? 'text-[#00D4AA] bg-zinc-800/60 font-semibold' : 'text-[--text-secondary]'
                        )}
                      >
                        {status === 'All' ? 'All Statuses' : status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-[#00D4AA] text-[#0A0D14] hover:shadow-[0_0_15px_rgba(0,212,170,0.35)] transition-all font-mono text-xs font-bold px-4 py-2 rounded-md cursor-pointer">
              <Plus className="w-4 h-4 stroke-[2.2]" />
              <span>Log Maintenance</span>
            </button>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto rounded-[10px] border border-[--border-default] bg-[var(--bg-card)]">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-[--border-strong] text-[--text-muted] uppercase tracking-wider text-[10px] bg-zinc-900/30">
                  <th className="px-5 py-3">Date & Time</th>
                  <th className="px-5 py-3">WO ID</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Technician</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--border-subtle]">
                {filteredMaintenanceRows.length > 0 ? (
                  filteredMaintenanceRows.map((row) => (
                    <tr key={row.id} className="hover:bg-zinc-900/20 transition-colors text-[--text-secondary]">
                      <td className="px-5 py-3.5 font-medium text-[--text-primary] whitespace-nowrap">
                        {row.date}
                      </td>
                      <td className="px-5 py-3.5 text-[--text-muted] whitespace-nowrap">
                        {row.woId}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {row.type === 'Corrective' && <Wrench className="w-3.5 h-3.5 text-[#F5A623]" />}
                          {row.type === 'Preventative' && <Shield className="w-3.5 h-3.5 text-[#00D4AA]" />}
                          {row.type === 'Inspection' && <Search className="w-3.5 h-3.5 text-zinc-400" />}
                          <span>{row.type}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[--text-primary] min-w-[280px]">
                        {row.description}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {row.technician.avatar && (
                            <img
                              src={row.technician.avatar}
                              alt={row.technician.name}
                              className="w-5 h-5 rounded-full object-cover border border-zinc-800"
                            />
                          )}
                          {row.technician.initials && (
                            <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] font-bold text-zinc-300">
                              {row.technician.initials}
                            </div>
                          )}
                          {row.technician.isContractor && (
                            <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                              <Lock className="w-2.5 h-2.5" />
                            </div>
                          )}
                          {row.technician.isUnassigned && (
                            <div className="w-5 h-5 rounded-full border border-dashed border-zinc-600 flex items-center justify-center" />
                          )}
                          <span className="text-xs">{row.technician.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {row.status === 'Completed' ? (
                          <span className="px-2 py-0.5 rounded-[4px] border text-[9px] font-bold uppercase tracking-wider bg-green-500/10 border-green-500/20 text-green-400">
                            Completed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-[4px] border text-[9px] font-bold uppercase tracking-wider bg-zinc-800/60 border-zinc-700/50 text-zinc-400">
                            Scheduled
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button className="hover:text-[--text-primary] transition-colors cursor-pointer">
                          <FileText className="w-4 h-4 text-zinc-400 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-[--text-muted] font-mono text-xs">
                      No maintenance logs found matching search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Specifications Tab */}
      {activeTab === 'specs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left column: Technical Parameters + BOM */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Technical Parameters Card */}
            <div
              className="rounded-[10px] border p-6 flex flex-col gap-5"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center gap-2 pb-3 border-b border-[--border-subtle]">
                <SlidersHorizontal className="w-4 h-4 text-[#00D4AA]" />
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                  Technical Parameters
                </h3>
              </div>
              <div className="flex flex-col divide-y divide-[--border-subtle] font-mono text-xs">
                {[
                  { label: 'Cooling Capacity',          value: details.name === 'CHL-01' ? '1,200 TR (4,220 kW)' : 'N/A' },
                  { label: 'Refrigerant Type',          value: details.name === 'CHL-01' ? 'R-134a' : 'N/A' },
                  { label: 'Refrigerant Charge',        value: details.name === 'CHL-01' ? '850 kg' : 'N/A' },
                  { label: 'Compressor Type',           value: details.name === 'CHL-01' ? 'Centrifugal, Single-Stage' : details.type === 'UPS' ? 'N/A (Battery)' : 'N/A' },
                  { label: 'Motor Power',               value: details.name === 'CHL-01' ? '750 kW' : details.name === 'CRAC-02' ? '18 kW' : details.name === 'AHU-03' ? '7.5 kW' : 'N/A' },
                  { label: 'Nominal Voltage',           value: details.name === 'CHL-01' ? '3.3 kV / 3-Phase / 50 Hz' : details.name === 'UPS-B' ? '400 V / 3-Phase / 50 Hz' : '400 V' },
                  { label: 'Max Operating Speed',       value: details.name === 'CHL-01' ? '3,550 RPM' : 'N/A' },
                  { label: 'Design Pressure (High/Low)', value: details.name === 'CHL-01' ? '15.2 bar / 10.5 bar' : 'N/A' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-3">
                    <span className="text-[--text-secondary]">{row.label}</span>
                    <span className="text-[--text-primary] font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Spare Parts (BOM) Card */}
            <div
              className="rounded-[10px] border flex flex-col"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center justify-between p-5 pb-4 border-b border-[--border-subtle]">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#00D4AA]" />
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                    Critical Spare Parts (BOM)
                  </h3>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-mono text-[10px] font-bold text-[--text-secondary] hover:text-[--text-primary] hover:border-[--border-strong] transition-all bg-[var(--bg-elevated)] border-[--border-default] cursor-pointer">
                  <Download className="w-3 h-3" />
                  <span>Export BOM</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[--border-strong] text-[--text-muted] uppercase tracking-wider text-[10px]" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <th className="px-5 py-3">Part Number</th>
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3">Replacement Interval</th>
                      <th className="px-5 py-3">In Stock</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[--border-subtle]">
                    {[
                      { part: '028-12345-000', desc: 'Oil Filter Cartridge',         interval: '12 Months', stock: 4, stockOk: true },
                      { part: '021-98765-111', desc: 'Refrigerant Filter Drier',     interval: '24 Months', stock: 1, stockOk: true },
                      { part: '024-55555-222', desc: 'O-Ring Kit (Compressor)',      interval: 'As Needed', stock: 0, stockOk: false },
                      { part: '064-33333-444', desc: 'Vibration Sensor (Accelerometer)', interval: '60 Months', stock: 2, stockOk: true },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-zinc-900/20 transition-colors text-[--text-secondary]">
                        <td className="px-5 py-3.5 text-[--text-muted]">{row.part}</td>
                        <td className="px-5 py-3.5 text-[--text-primary]">{row.desc}</td>
                        <td className="px-5 py-3.5">{row.interval}</td>
                        <td className="px-5 py-3.5">
                          <span className={cn(
                            'px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider',
                            row.stockOk
                              ? 'bg-green-500/10 border-green-500/20 text-green-400'
                              : 'bg-red-500/10 border-red-500/20 text-red-400'
                          )}>
                            {row.stock} Available
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button className="text-[#00D4AA] hover:underline text-[10px] font-bold cursor-pointer">
                            Order
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right column: General Info + Documentation */}
          <div className="flex flex-col gap-6">
            {/* General Information */}
            <div
              className="rounded-[10px] border p-5 flex flex-col gap-4"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center gap-2 pb-3 border-b border-[--border-subtle]">
                <Clock className="w-4 h-4 text-[#00D4AA]" />
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                  General Information
                </h3>
              </div>
              <div className="flex flex-col divide-y divide-[--border-subtle] font-mono text-xs">
                {[
                  { label: 'Manufacturer',      value: details.name === 'CHL-01' ? 'Johnson Controls' : details.manufacturer },
                  { label: 'Model',             value: details.name === 'CHL-01' ? 'YK Centrifugal' : details.model },
                  { label: 'Serial Number',     value: details.serialNumber },
                  { label: 'Asset ID',          value: details.name },
                  { label: 'Year of Manufacture', value: details.name === 'CHL-01' ? '2021' : '2020' },
                  { label: 'Installation Date', value: details.name === 'CHL-01' ? '12-Oct-2021' : '2020-06-01' },
                  { label: 'Expected Lifespan', value: details.name === 'CHL-01' ? '20 Years' : '15 Years' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-2.5">
                    <span className="text-[--text-secondary]">{row.label}</span>
                    <span className="text-[--text-primary] font-medium text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documentation */}
            <div
              className="rounded-[10px] border p-5 flex flex-col gap-4"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center gap-2 pb-3 border-b border-[--border-subtle]">
                <FileText className="w-4 h-4 text-[#00D4AA]" />
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                  Documentation
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { name: 'Operation & Maintenance Manual', type: 'PDF', size: '12.4 MB' },
                  { name: 'Installation Guide',             type: 'PDF', size: '5.1 MB'  },
                  { name: 'Electrical Wiring Diagram',      type: 'PDF', size: '2.8 MB'  },
                ].map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-md hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer group border border-transparent hover:border-[--border-subtle]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded flex items-center justify-center bg-[rgba(0,212,170,0.08)] border border-[rgba(0,212,170,0.15)]">
                        <FileText className="w-3.5 h-3.5 text-[#00D4AA]" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[11px] text-[--text-primary] group-hover:text-[#00D4AA] transition-colors">{doc.name}</span>
                        <span className="font-mono text-[9px] text-[--text-muted]">{doc.type} • {doc.size}</span>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Download className="w-3.5 h-3.5 text-[--text-muted] hover:text-[#00D4AA] transition-colors" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
