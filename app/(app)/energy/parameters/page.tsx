'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronRight,
  ChevronDown,
  Settings,
  CloudSun,
  AlertTriangle,
  Zap,
  ArrowLeft,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ToggleProps {
  checked: boolean
  onChange: (val: boolean) => void
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
        checked ? "bg-[#00D4AA]" : "bg-[#1E2840]"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  )
}

export default function AdjustParametersPage() {
  const router = useRouter()

  // Form State
  const [algorithmType, setAlgorithmType] = useState('AI Dynamic (Recommended)')
  const [trainingWindow, setTrainingWindow] = useState('Last 180 Days')
  const [includeProduction, setIncludeProduction] = useState(true)

  const [weatherIntegration, setWeatherIntegration] = useState(true)
  const [weatherSource, setWeatherSource] = useState('Meteomatics Global API')
  const [occupancySensor, setOccupancySensor] = useState(false)

  const [sensitivityProfile, setSensitivityProfile] = useState('Medium (2 Std Dev)')
  const [minDeviation, setMinDeviation] = useState('18.0')
  const [durationThreshold, setDurationThreshold] = useState('15')

  const [warningThreshold, setWarningThreshold] = useState('1,100')
  const [criticalThreshold, setCriticalThreshold] = useState('1,250')

  const handleSave = () => {
    // Simulate save configuration
    router.push('/energy')
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[--text-secondary]">
        <span className="hover:text-[--text-primary] transition-colors">Intelligence</span>
        <ChevronRight className="w-2.5 h-2.5" />
        <Link href="/energy" className="hover:text-[--text-primary] transition-colors">
          Energy Optimization
        </Link>
        <ChevronRight className="w-2.5 h-2.5" />
        <span className="text-[--text-muted]">Model Parameters</span>
      </div>

      {/* Header Row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-light tracking-wide text-[--text-primary] mb-1">
            Adjust Parameters
          </h1>
          <p className="text-xs text-[--text-secondary]">
            Configure baseline algorithms, variables, and anomaly detection thresholds.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/energy"
            className="px-3.5 py-1.5 rounded-[6px] border text-xs font-mono font-medium transition-all border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] cursor-pointer"
          >
            Cancel
          </Link>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 text-[#0A0D14] hover:shadow-[0_0_15px_rgba(0,212,170,0.35)] transition-all font-mono text-xs font-bold px-3.5 py-1.5 rounded-[6px] cursor-pointer bg-[#00D4AA]"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {/* Form sections list */}
      <div className="flex flex-col gap-6 mt-2">
        {/* Baseline Calculation Section */}
        <div
          className="rounded-[10px] border p-6 flex flex-col gap-6"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
          {/* Card Header */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-[6px] flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-default)]">
              <Settings className="w-4 h-4 text-[#00D4AA]" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-semibold text-[--text-primary]">
                Baseline Calculation
              </h3>
              <p className="text-[11px] text-[--text-secondary] mt-0.5">
                Determine how the predictive model builds its expected consumption curves.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Algorithm Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-semibold text-[--text-primary]">
                Algorithm Type
              </label>
              <span className="text-[10px] text-[--text-secondary] mb-1">
                Select the mathematical model used to predict energy demand.
              </span>
              <div className="relative">
                <select
                  value={algorithmType}
                  onChange={(e) => setAlgorithmType(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[4px] px-3 py-2 text-xs font-mono text-[--text-primary] outline-none appearance-none focus:border-[#00D4AA] cursor-pointer"
                >
                  <option value="AI Dynamic (Recommended)">AI Dynamic (Recommended)</option>
                  <option value="Regression-based">Regression-based</option>
                  <option value="Static Average">Static Average</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[--text-muted]">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Training Data Window */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-semibold text-[--text-primary]">
                Training Data Window
              </label>
              <span className="text-[10px] text-[--text-secondary] mb-1">
                Historical timeframe used to train the selected algorithm.
              </span>
              <div className="relative">
                <select
                  value={trainingWindow}
                  onChange={(e) => setTrainingWindow(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[4px] px-3 py-2 text-xs font-mono text-[--text-primary] outline-none appearance-none focus:border-[#00D4AA] cursor-pointer"
                >
                  <option value="Last 180 Days">Last 180 Days</option>
                  <option value="Last 90 Days">Last 90 Days</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[--text-muted]">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Block */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="flex flex-col">
              <span className="text-xs font-mono font-semibold text-[--text-primary]">
                Include Production Telemetry
              </span>
              <span className="text-[10px] text-[--text-secondary] mt-0.5">
                Correlates energy consumption with manufacturing output data.
              </span>
            </div>
            <Toggle checked={includeProduction} onChange={setIncludeProduction} />
          </div>
        </div>

        {/* Environmental Influences Section */}
        <div
          className="rounded-[10px] border p-6 flex flex-col gap-6"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
          {/* Card Header */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-[6px] flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-default)]">
              <CloudSun className="w-4 h-4 text-[#00D4AA]" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-semibold text-[--text-primary]">
                Environmental Influences
              </h3>
              <p className="text-[11px] text-[--text-secondary] mt-0.5">
                External variables that impact HVAC and facility load calculations.
              </p>
            </div>
          </div>

          {/* Toggle Block */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="flex flex-col">
              <span className="text-xs font-mono font-semibold text-[--text-primary]">
                Weather Integration
              </span>
              <span className="text-[10px] text-[--text-secondary] mt-0.5">
                Use local weather API for Heating/Cooling Degree Days (HDD/CDD).
              </span>
            </div>
            <Toggle checked={weatherIntegration} onChange={setWeatherIntegration} />
          </div>

          {/* Weather Source */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-semibold text-[--text-primary]">
              Weather Data Source
            </label>
            <span className="text-[10px] text-[--text-secondary] mb-1">
              API provider for local ambient temperature and humidity.
            </span>
            <div className="relative">
              <select
                value={weatherSource}
                onChange={(e) => setWeatherSource(e.target.value)}
                disabled={!weatherIntegration}
                className={cn(
                  "w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[4px] px-3 py-2 text-xs font-mono text-[--text-primary] outline-none appearance-none focus:border-[#00D4AA] cursor-pointer",
                  !weatherIntegration && "opacity-50 cursor-not-allowed"
                )}
              >
                <option value="Meteomatics Global API">Meteomatics Global API</option>
                <option value="NOAA Weather API">NOAA Weather API</option>
                <option value="OpenWeatherMap API">OpenWeatherMap API</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[--text-muted]">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Toggle Block */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="flex flex-col">
              <span className="text-xs font-mono font-semibold text-[--text-primary]">
                Occupancy Sensor Data
              </span>
              <span className="text-[10px] text-[--text-secondary] mt-0.5">
                Requires zone-level presence detection via BMS integration.
              </span>
            </div>
            <Toggle checked={occupancySensor} onChange={setOccupancySensor} />
          </div>
        </div>

        {/* Anomaly Triggers Section */}
        <div
          className="rounded-[10px] border p-6 flex flex-col gap-6"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
          {/* Card Header */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-[6px] flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-default)]">
              <AlertTriangle className="w-4 h-4 text-[#00D4AA]" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-semibold text-[--text-primary]">
                Anomaly Triggers
              </h3>
              <p className="text-[11px] text-[--text-secondary] mt-0.5">
                Thresholds that determine when a deviation is flagged as an anomaly.
              </p>
            </div>
          </div>

          {/* Sensitivity Profile */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-semibold text-[--text-primary]">
              Sensitivity Profile
            </label>
            <span className="text-[10px] text-[--text-secondary] mb-1">
              Determines statistical strictness (Standard Deviations).
            </span>
            <div className="relative">
              <select
                value={sensitivityProfile}
                onChange={(e) => setSensitivityProfile(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[4px] px-3 py-2 text-xs font-mono text-[--text-primary] outline-none appearance-none focus:border-[#00D4AA] cursor-pointer"
              >
                <option value="Medium (2 Std Dev)">Medium (2 Std Dev)</option>
                <option value="High (1 Std Dev)">High (1 Std Dev)</option>
                <option value="Low (3 Std Dev)">Low (3 Std Dev)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[--text-muted]">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Minimum Deviation Alert */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-semibold text-[--text-primary]">
                Minimum Deviation Alert
              </label>
              <span className="text-[10px] text-[--text-secondary] mb-1">
                Percentage variance from baseline to trigger alert.
              </span>
              <div className="flex items-center bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[4px] overflow-hidden focus-within:border-[#00D4AA]">
                <input
                  type="text"
                  value={minDeviation}
                  onChange={(e) => setMinDeviation(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-[--text-primary] outline-none"
                />
                <span className="px-3 border-l border-[var(--border-default)] text-[10px] font-mono text-[--text-secondary]">
                  %
                </span>
              </div>
            </div>

            {/* Duration Threshold */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-semibold text-[--text-primary]">
                Duration Threshold
              </label>
              <span className="text-[10px] text-[--text-secondary] mb-1">
                Time anomaly must persist before alerting.
              </span>
              <div className="flex items-center bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[4px] overflow-hidden focus-within:border-[#00D4AA]">
                <input
                  type="text"
                  value={durationThreshold}
                  onChange={(e) => setDurationThreshold(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-[--text-primary] outline-none"
                />
                <span className="px-3 border-l border-[var(--border-default)] text-[10px] font-mono text-[--text-secondary]">
                  MIN
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Peak Demand Limits Section */}
        <div
          className="rounded-[10px] border p-6 flex flex-col gap-6"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
          {/* Card Header */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-[6px] flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-default)]">
              <Zap className="w-4 h-4 text-[#00D4AA]" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-semibold text-[--text-primary]">
                Peak Demand Limits
              </h3>
              <p className="text-[11px] text-[--text-secondary] mt-0.5">
                Hard caps for energy consumption to prevent utility penalty charges.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Warning Threshold */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-semibold text-[--text-primary]">
                Warning Threshold
              </label>
              <span className="text-[10px] text-[--text-secondary] mb-1">
                Triggers a non-critical advisory alert.
              </span>
              <div className="flex items-center bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[4px] overflow-hidden focus-within:border-[#00D4AA]">
                <input
                  type="text"
                  value={warningThreshold}
                  onChange={(e) => setWarningThreshold(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-[--text-primary] outline-none"
                />
                <span className="px-3 border-l border-[var(--border-default)] text-[10px] font-mono text-[--text-secondary]">
                  kW
                </span>
              </div>
            </div>

            {/* Critical Threshold */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-semibold text-[--text-primary]">
                Critical Threshold
              </label>
              <span className="text-[10px] text-[--text-secondary] mb-1">
                Triggers critical alert and potential load shedding.
              </span>
              <div className="flex items-center bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[4px] overflow-hidden focus-within:border-[#00D4AA]">
                <input
                  type="text"
                  value={criticalThreshold}
                  onChange={(e) => setCriticalThreshold(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-[--text-primary] outline-none"
                />
                <span className="px-3 border-l border-[var(--border-default)] text-[10px] font-mono text-[--text-secondary]">
                  kW
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
