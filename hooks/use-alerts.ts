'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DEMO_ALERTS } from '@/lib/data/seed'
import { useAlertStore } from '@/lib/stores/alert-store'
import type { Alert } from '@/types/alert'
import type { AlertSeverity, AlertStatus } from '@/types/asset'

interface AlertFilters {
  severity?: AlertSeverity
  status?: AlertStatus
  facilityId?: string
  assetId?: string
}

interface AlertCounts {
  critical: number
  advisory: number
  watch: number
  total: number
}

async function fetchAlerts(filters?: AlertFilters): Promise<Alert[]> {
  const params = new URLSearchParams()
  if (filters?.severity) params.set('severity', filters.severity)
  if (filters?.status) params.set('status', filters.status)
  if (filters?.facilityId) params.set('facilityId', filters.facilityId)
  if (filters?.assetId) params.set('assetId', filters.assetId)

  const res = await fetch(`/api/alerts?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch alerts')
  const json = await res.json()
  return json.data
}

async function fetchAlertCounts(): Promise<AlertCounts> {
  const res = await fetch('/api/alerts?countsOnly=true')
  if (!res.ok) throw new Error('Failed to fetch alert counts')
  const json = await res.json()
  return json.data
}

async function patchAlert(id: string, action: 'acknowledge' | 'resolve'): Promise<Alert> {
  const res = await fetch('/api/alerts', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, action }),
  })
  if (!res.ok) throw new Error('Failed to update alert')
  const json = await res.json()
  return json.data
}

const isSynthetic = process.env.NEXT_PUBLIC_SYNTHETIC_MODE === 'true'

export function useAlerts(filters?: AlertFilters) {
  const storeAlerts = useAlertStore(s => s.alerts)

  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: isSynthetic
      ? () => {
          let results = storeAlerts.length > 0 ? storeAlerts : DEMO_ALERTS
          if (filters?.severity) results = results.filter(a => a.severity === filters.severity)
          if (filters?.status) results = results.filter(a => a.status === filters.status)
          if (filters?.facilityId) results = results.filter(a => a.facilityId === filters.facilityId)
          if (filters?.assetId) results = results.filter(a => a.assetId === filters.assetId)
          return Promise.resolve(results)
        }
      : () => fetchAlerts(filters),
    staleTime: 15_000,
  })
}

export function useAlertCounts() {
  const storeAlerts = useAlertStore(s => s.alerts)

  return useQuery({
    queryKey: ['alert-counts'],
    queryFn: isSynthetic
      ? () => {
          const alerts = storeAlerts.length > 0 ? storeAlerts : DEMO_ALERTS
          const active = alerts.filter(a => a.status === 'ACTIVE')
          return Promise.resolve({
            critical: active.filter(a => a.severity === 'CRITICAL').length,
            advisory: active.filter(a => a.severity === 'ADVISORY').length,
            watch: active.filter(a => a.severity === 'WATCH').length,
            total: active.length,
          })
        }
      : fetchAlertCounts,
    staleTime: 15_000,
  })
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient()
  const acknowledge = useAlertStore(s => s.acknowledgeAlert)

  return useMutation({
    mutationFn: (id: string) =>
      isSynthetic ? Promise.resolve(id) : patchAlert(id, 'acknowledge').then(() => id),
    onSuccess: (id: string) => {
      if (isSynthetic) acknowledge(id)
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alert-counts'] })
    },
  })
}

export function useResolveAlert() {
  const queryClient = useQueryClient()
  const resolve = useAlertStore(s => s.resolveAlert)

  return useMutation({
    mutationFn: (id: string) =>
      isSynthetic ? Promise.resolve(id) : patchAlert(id, 'resolve').then(() => id),
    onSuccess: (id: string) => {
      if (isSynthetic) resolve(id)
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alert-counts'] })
    },
  })
}
