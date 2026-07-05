'use client'

import { useState, useMemo } from 'react'
import { Plus, Building2, XCircle } from 'lucide-react'
import { FacilityStatsBar } from './facility-stats-bar'
import { FacilitySearch } from './facility-search'
import { FacilityList } from './facility-list'
import { DEMO_FACILITIES } from '@/lib/data/seed'

export function FacilitiesView() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')

  const filteredFacilities = useMemo(() => {
    return DEMO_FACILITIES.filter((facility) => {
      // 1. Search Query Match
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        query === '' ||
        facility.name.toLowerCase().includes(query) ||
        facility.externalId.toLowerCase().includes(query) ||
        facility.city.toLowerCase().includes(query) ||
        facility.region.toLowerCase().includes(query)

      // 2. Status Match
      const matchesStatus =
        statusFilter === 'ALL' || facility.status === statusFilter

      // 3. Type Match
      const matchesType =
        typeFilter === 'ALL' || facility.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [searchQuery, statusFilter, typeFilter])

  // Count active locations for subtitle description
  const activeLocationsCount = DEMO_FACILITIES.length

  const handleResetFilters = () => {
    setSearchQuery('')
    setStatusFilter('ALL')
    setTypeFilter('ALL')
    // We also want to clear child values if search state is controlled from the parent
    // Note: since child input/dropdowns are currently uncontrolled/semi-controlled,
    // reloading or simply resetting parent state handles lists rendering instantly.
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-light tracking-wide mb-1" style={{ color: 'var(--text-primary)' }}>
            Facilities
          </h1>
          <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            Manage and monitor across {activeLocationsCount} active locations.
          </p>
        </div>

        <button
          className="flex items-center gap-1 bg-[--accent-primary] text-[#0A0D14] hover:bg-[--accent-primary]/90 hover:shadow-[0_0_15px_rgba(0,212,170,0.3)] transition-all font-mono text-xs font-bold px-3.5 py-2 rounded-[6px] cursor-pointer w-fit"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Facility</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <FacilityStatsBar />

      {/* Search & Filter Bar */}
      <FacilitySearch
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onTypeChange={setTypeFilter}
      />

      {/* Grid List or Empty State */}
      {filteredFacilities.length > 0 ? (
        <FacilityList facilities={filteredFacilities} />
      ) : (
        <div
          className="rounded-[10px] border p-12 flex flex-col items-center justify-center text-center"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
          <Building2 className="w-12 h-12 text-muted-foreground mb-4 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <h3 className="font-mono text-sm font-semibold tracking-wide mb-1.5" style={{ color: 'var(--text-primary)' }}>
            No Facilities Found
          </h3>
          <p className="text-xs font-mono max-w-sm mb-5 leading-normal" style={{ color: 'var(--text-secondary)' }}>
            We couldn't find any facilities matching your search term "{searchQuery}" or filters. Try adjusting your query or filter criteria.
          </p>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md border text-xs font-mono font-medium transition-colors hover:border-[--border-strong] cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-primary)',
            }}
          >
            <XCircle className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <span>Reset Filters</span>
          </button>
        </div>
      )}
    </div>
  )
}
