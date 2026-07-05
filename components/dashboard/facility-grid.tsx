'use client'

import { FacilityCard } from './facility-card'
import { Filter } from 'lucide-react'
import type { Facility } from '@/types/facility'

interface FacilityGridProps {
  facilities: Facility[]
}

export function FacilityGrid({ facilities }: FacilityGridProps) {
  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-mono text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-primary)' }}>
          Monitored Facilities
        </h3>
        <button
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-medium transition-colors hover:border-[--border-strong] font-mono"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-secondary)',
          }}
        >
          <Filter className="w-3 h-3" />
          <span>Filter</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {facilities.map((facility) => (
          <FacilityCard key={facility.id} facility={facility} />
        ))}
      </div>
    </div>
  )
}
