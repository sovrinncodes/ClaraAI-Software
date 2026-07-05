'use client'

import { useState, useEffect } from 'react'
import { DEMO_FACILITIES } from '@/lib/data/seed'
import type { Facility } from '@/types/facility'

const SYNTHETIC_MODE = process.env.NEXT_PUBLIC_SYNTHETIC_MODE === 'true'

interface FacilityHealthState {
  facility: Facility | null
  lastSync: Date | null
  isConnected: boolean
}

// Returns live health data for a single facility.
// Synthetic mode: returns static seed data with a refreshed lastSync timestamp.
// Production: subscribes to AppSync onHealthScoreUpdated.
export function useFacilityHealth(facilityId: string): FacilityHealthState {
  const [state, setState] = useState<FacilityHealthState>({
    facility: null,
    lastSync: null,
    isConnected: false,
  })

  useEffect(() => {
    if (SYNTHETIC_MODE) {
      const facility = DEMO_FACILITIES.find((f) => f.id === facilityId) ?? null
      setState({ facility, lastSync: new Date(), isConnected: true })
      return
    }

    // Production: subscribe to health updates via AppSync
    // const { generateClient } = await import('aws-amplify/api')
    // const client = generateClient()
    // const sub = client.graphql({ query: SUBSCRIPTIONS.onHealthScoreUpdated(facilityId) })
    //   .subscribe({
    //     next: ({ data }) => {
    //       setState((prev) => ({ ...prev, lastSync: new Date() }))
    //     },
    //   })
    // return () => sub.unsubscribe()
  }, [facilityId])

  return state
}
