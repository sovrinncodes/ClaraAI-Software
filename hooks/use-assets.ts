'use client'

import { useQuery } from '@tanstack/react-query'
import { DEMO_WATCHLIST_ASSETS, DEMO_CHL01 } from '@/lib/data/seed'
import type { Asset } from '@/types/asset'

interface AssetFilters {
  facilityId?: string
  type?: string
  search?: string
  watchlist?: boolean
}

async function fetchAssets(filters?: AssetFilters): Promise<Asset[]> {
  const params = new URLSearchParams()
  if (filters?.facilityId) params.set('facilityId', filters.facilityId)
  if (filters?.type) params.set('type', filters.type)
  if (filters?.search) params.set('search', filters.search)
  if (filters?.watchlist) params.set('watchlist', 'true')

  const res = await fetch(`/api/assets?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch assets')
  const json = await res.json()
  return json.data
}

async function fetchAsset(assetId: string): Promise<Asset> {
  const res = await fetch(`/api/assets/${assetId}`)
  if (!res.ok) throw new Error('Failed to fetch asset')
  const json = await res.json()
  return json.data
}

const isSynthetic = process.env.NEXT_PUBLIC_SYNTHETIC_MODE === 'true'

export function useAssets(filters?: AssetFilters) {
  return useQuery({
    queryKey: ['assets', filters],
    queryFn: isSynthetic
      ? () => {
          let results = DEMO_WATCHLIST_ASSETS as Asset[]
          if (filters?.facilityId)
            results = results.filter(a => a.facilityId === filters.facilityId)
          if (filters?.type) results = results.filter(a => a.type === filters.type)
          if (filters?.search) {
            const q = filters.search.toLowerCase()
            results = results.filter(
              a =>
                a.name.toLowerCase().includes(q) ||
                a.externalId.toLowerCase().includes(q)
            )
          }
          return Promise.resolve(results)
        }
      : () => fetchAssets(filters),
    staleTime: 30_000,
  })
}

export function useWatchlistAssets() {
  return useQuery({
    queryKey: ['assets', 'watchlist'],
    queryFn: isSynthetic
      ? () => Promise.resolve(DEMO_WATCHLIST_ASSETS as Asset[])
      : () => fetchAssets({ watchlist: true }),
    staleTime: 30_000,
  })
}

export function useAsset(assetId: string | null) {
  return useQuery({
    queryKey: ['asset', assetId],
    queryFn: isSynthetic
      ? () => {
          if (assetId === 'asset_chl_01' || assetId === 'CHL-01') {
            return Promise.resolve(DEMO_CHL01)
          }
          const asset = DEMO_WATCHLIST_ASSETS.find(
            a => a.id === assetId || a.externalId === assetId
          )
          if (!asset) throw new Error('Asset not found')
          return Promise.resolve(asset as Asset)
        }
      : () => fetchAsset(assetId!),
    enabled: Boolean(assetId),
    staleTime: 15_000,
  })
}
