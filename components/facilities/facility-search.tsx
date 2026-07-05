'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, Filter, LayoutGrid, List, Map, Check } from 'lucide-react'

interface FacilitySearchProps {
  onSearchChange?: (val: string) => void
  onStatusChange?: (status: string) => void
  onTypeChange?: (type: string) => void
}

export function FacilitySearch({ onSearchChange, onStatusChange, onTypeChange }: FacilitySearchProps) {
  const [searchVal, setSearchVal] = useState('')
  const [activeView, setActiveView] = useState<'grid' | 'list' | 'map'>('grid')
  
  const [statusOpen, setStatusOpen] = useState(false)
  const [typeOpen, setTypeOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedType, setSelectedType] = useState('ALL')

  const statusRef = useRef<HTMLDivElement>(null)
  const typeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setStatusOpen(false)
      }
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setTypeOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses', labelShort: 'All' },
    { value: 'OPTIMAL', label: 'Optimal', labelShort: 'Optimal' },
    { value: 'ADVISORY', label: 'Sub-optimal', labelShort: 'Sub-optimal' },
    { value: 'CRITICAL', label: 'Action Req.', labelShort: 'Action Req.' }
  ]

  const typeOptions = [
    { value: 'ALL', label: 'All Types', labelShort: 'All' },
    { value: 'DATA_CENTER', label: 'Data Center', labelShort: 'Data Center' },
    { value: 'MANUFACTURING', label: 'Manufacturing', labelShort: 'Manufacturing' },
    { value: 'COMMERCIAL', label: 'Commercial', labelShort: 'Commercial' },
    { value: 'LOGISTICS', label: 'Logistics', labelShort: 'Logistics' }
  ]

  const handleStatusSelect = (val: string) => {
    setSelectedStatus(val)
    setStatusOpen(false)
    if (onStatusChange) onStatusChange(val)
  }

  const handleTypeSelect = (val: string) => {
    setSelectedType(val)
    setTypeOpen(false)
    if (onTypeChange) onTypeChange(val)
  }

  const getStatusDisplayLabel = () => {
    const option = statusOptions.find(o => o.value === selectedStatus)
    return `Status: ${option ? option.labelShort : 'All'}`
  }

  const getTypeDisplayLabel = () => {
    const option = typeOptions.find(o => o.value === selectedType)
    return `Type: ${option ? option.labelShort : 'All'}`
  }

  return (
    <div
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded-[10px] border mb-6"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
    >
      {/* Search Input */}
      <div className="relative flex-1 max-w-[320px]">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
          style={{ color: 'var(--text-muted)' }}
        />
        <input
          type="text"
          value={searchVal}
          onChange={(e) => {
            setSearchVal(e.target.value)
            if (onSearchChange) onSearchChange(e.target.value)
          }}
          placeholder="Search facilities, locations, or IDs..."
          className="w-full pl-9 pr-4 py-1.5 rounded-md border text-xs font-mono focus:outline-none focus:border-[--border-strong] transition-colors"
          style={{
            backgroundColor: 'var(--bg-base)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Filters and View Toggles */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Dropdown */}
        <div className="relative" ref={statusRef}>
          <button
            onClick={() => setStatusOpen(!statusOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono font-medium transition-colors hover:border-[--border-strong] cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-primary)',
            }}
          >
            <Filter className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <span>{getStatusDisplayLabel()}</span>
            <ChevronDown className="w-3 h-3 transition-transform duration-200" style={{ color: 'var(--text-muted)', transform: statusOpen ? 'rotate(180deg)' : 'none' }} />
          </button>

          {statusOpen && (
            <div
              className="absolute left-0 mt-1 w-44 rounded-md border shadow-lg z-50 py-1"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-default)',
              }}
            >
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusSelect(opt.value)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-left text-xs font-mono transition-colors hover:bg-[--bg-hover] text-[--text-primary] cursor-pointer"
                >
                  <span>{opt.label}</span>
                  {selectedStatus === opt.value && (
                    <Check className="w-3.5 h-3.5 text-[--accent-primary]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Type Dropdown */}
        <div className="relative" ref={typeRef}>
          <button
            onClick={() => setTypeOpen(!typeOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono font-medium transition-colors hover:border-[--border-strong] cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-primary)',
            }}
          >
            <LayoutGrid className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <span>{getTypeDisplayLabel()}</span>
            <ChevronDown className="w-3 h-3 transition-transform duration-200" style={{ color: 'var(--text-muted)', transform: typeOpen ? 'rotate(180deg)' : 'none' }} />
          </button>

          {typeOpen && (
            <div
              className="absolute left-0 mt-1 w-44 rounded-md border shadow-lg z-50 py-1"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-default)',
              }}
            >
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleTypeSelect(opt.value)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-left text-xs font-mono transition-colors hover:bg-[--bg-hover] text-[--text-primary] cursor-pointer"
                >
                  <span>{opt.label}</span>
                  {selectedType === opt.value && (
                    <Check className="w-3.5 h-3.5 text-[--accent-primary]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Switcher Toggle */}
        <div
          className="flex rounded-md overflow-hidden border shrink-0"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <button
            onClick={() => setActiveView('grid')}
            className="p-1.5 border-r transition-colors cursor-pointer animate-press"
            style={{
              backgroundColor: activeView === 'grid' ? 'var(--bg-active)' : 'var(--bg-elevated)',
              borderColor: 'var(--border-default)',
            }}
            aria-label="Grid View"
          >
            <LayoutGrid
              className="w-3.5 h-3.5"
              style={{ color: activeView === 'grid' ? 'var(--accent-primary)' : 'var(--text-muted)' }}
            />
          </button>
          <button
            onClick={() => setActiveView('list')}
            className="p-1.5 border-r transition-colors cursor-pointer animate-press"
            style={{
              backgroundColor: activeView === 'list' ? 'var(--bg-active)' : 'var(--bg-elevated)',
              borderColor: 'var(--border-default)',
            }}
            aria-label="List View"
          >
            <List
              className="w-3.5 h-3.5"
              style={{ color: activeView === 'list' ? 'var(--accent-primary)' : 'var(--text-muted)' }}
            />
          </button>
          <button
            onClick={() => setActiveView('map')}
            className="p-1.5 transition-colors cursor-pointer animate-press"
            style={{
              backgroundColor: activeView === 'map' ? 'var(--bg-active)' : 'var(--bg-elevated)',
            }}
            aria-label="Map View"
          >
            <Map
              className="w-3.5 h-3.5"
              style={{ color: activeView === 'map' ? 'var(--accent-primary)' : 'var(--text-muted)' }}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
