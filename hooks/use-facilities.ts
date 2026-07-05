'use client'

import { useQuery } from '@tanstack/react-query'
import { DEMO_FACILITIES } from '@/lib/data/seed'
import type { Facility } from '@/types/facility'
import type { FacilityStatus, FacilityType } from '@/types/facility'

interface FacilityFilters {
  status?: FacilityStatus
  type?: FacilityType
  search?: string
}

async function fetchFacilities(filters?: FacilityFilters): Promise<Facility[]> {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.type) params.set('type', filters.type)
  if (filters?.search) params.set('search', filters.search)

  const res = await fetch(`/api/facilities?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch facilities')
  const json = await res.json()
  return json.data
}

async function fetchFacility(facilityId: string): Promise<Facility> {
  const res = await fetch(`/api/facilities/${facilityId}`)
  if (!res.ok) throw new Error('Failed to fetch facility')
  const json = await res.json()
  return json.data
}

const isSynthetic = process.env.NEXT_PUBLIC_SYNTHETIC_MODE === 'true'

export function useFacilities(filters?: FacilityFilters) {
  return useQuery({
    queryKey: ['facilities', filters],
    queryFn: isSynthetic
      ? () => {
          let results = DEMO_FACILITIES
          if (filters?.status) results = results.filter(f => f.status === filters.status)
          if (filters?.type) results = results.filter(f => f.type === filters.type)
          if (filters?.search) {
            const q = filters.search.toLowerCase()
            results = results.filter(
              f =>
                f.name.toLowerCase().includes(q) ||
                f.externalId.toLowerCase().includes(q) ||
                f.city.toLowerCase().includes(q)
            )
          }
          return Promise.resolve(results)
        }
      : () => fetchFacilities(filters),
    staleTime: 30_000,
  })
}

export function useFacility(facilityId: string | null) {
  return useQuery({
    queryKey: ['facility', facilityId],
    queryFn: isSynthetic
      ? () => {
          const facility = DEMO_FACILITIES.find(f => f.id === facilityId || f.externalId === facilityId)
          if (!facility) throw new Error('Facility not found')
          return Promise.resolve(facility)
        }
      : () => fetchFacility(facilityId!),
    enabled: Boolean(facilityId),
    staleTime: 30_000,
  })
}

export function usePortfolioStats() {
  return useQuery({
    queryKey: ['portfolio-stats'],
    queryFn: isSynthetic
      ? () => {
          const facilities = DEMO_FACILITIES
          const totalHealth =
            facilities.reduce((sum, f) => sum + f.healthScore, 0) / facilities.length
          const totalEnergy = facilities.reduce((sum, f) => sum + f.energyDrawKw, 0)
          const totalAlerts = facilities.reduce(
            (acc, f) => ({
              critical: acc.critical + f.activeAlerts.critical,
              advisory: acc.advisory + f.activeAlerts.advisory,
              watch: acc.watch + f.activeAlerts.watch,
            }),
            { critical: 0, advisory: 0, watch: 0 }
          )
          return Promise.resolve({
            facilityCount: facilities.length,
            avgHealthScore: Math.round(totalHealth * 10) / 10,
            totalEnergyKw: totalEnergy,
            alerts: totalAlerts,
          })
        }
      : async () => {
          const [facilities] = await Promise.all([fetchFacilities()])
          const totalHealth =
            facilities.reduce((sum, f) => sum + f.healthScore, 0) / facilities.length
          const totalEnergy = facilities.reduce((sum, f) => sum + f.energyDrawKw, 0)
          const totalAlerts = facilities.reduce(
            (acc, f) => ({
              critical: acc.critical + f.activeAlerts.critical,
              advisory: acc.advisory + f.activeAlerts.advisory,
              watch: acc.watch + f.activeAlerts.watch,
            }),
            { critical: 0, advisory: 0, watch: 0 }
          )
          return {
            facilityCount: facilities.length,
            avgHealthScore: Math.round(totalHealth * 10) / 10,
            totalEnergyKw: totalEnergy,
            alerts: totalAlerts,
          }
        },
    staleTime: 60_000,
  })
}
