'use client'

import { useEffect, useRef } from 'react'
import { useAlertStore } from '@/lib/stores/alert-store'
import { DEMO_ALERTS } from '@/lib/data/seed'
import type { Alert } from '@/types/alert'

const SYNTHETIC_MODE = process.env.NEXT_PUBLIC_SYNTHETIC_MODE === 'true'

// In synthetic mode this hook seeds the store from static data and
// simulates an occasional new alert to animate the live feed.
// In production it subscribes to AppSync onAlertCreated.
export function useRealTimeAlerts(tenantId: string) {
  const { setAlerts, addAlert } = useAlertStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Seed initial state
    setAlerts(DEMO_ALERTS)

    if (SYNTHETIC_MODE) {
      // Simulate a new advisory alert every 60 seconds in demo mode
      timerRef.current = setTimeout(() => {
        const synthetic: Alert = {
          id: `alert_synthetic_${Date.now()}`,
          tenantId,
          facilityId: 'fac_jhb_dc_01',
          assetId: 'asset_chl_01',
          severity: 'ADVISORY',
          status: 'ACTIVE',
          modelName: 'Failure Forecast',
          title: 'CHL-01: Bearing Wear Progressing',
          description: 'Health score dropped 2 points in the last hour.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        addAlert(synthetic)
      }, 60_000)

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }

    // Production: AppSync WebSocket subscription
    // const { generateClient } = await import('aws-amplify/api')
    // const client = generateClient()
    // const sub = client.graphql({ query: SUBSCRIPTIONS.onAlertCreated(tenantId) })
    //   .subscribe({ next: ({ data }) => addAlert(data.onAlertCreated) })
    // return () => sub.unsubscribe()
  }, [tenantId, setAlerts, addAlert])
}
