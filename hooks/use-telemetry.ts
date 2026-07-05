'use client'

import { useState, useEffect, useRef } from 'react'
import { TELEMETRY_24H } from '@/lib/data/seed'
import type { EnergyReading } from '@/types/telemetry'

const SYNTHETIC_MODE = process.env.NEXT_PUBLIC_SYNTHETIC_MODE === 'true'

interface TelemetryState {
  readings: EnergyReading[]
  latestReading: EnergyReading | null
  lastSync: Date | null
  isConnected: boolean
}

// Returns the last N telemetry readings for a facility.
// Synthetic mode: slides a window over the static 96-point dataset.
// Production: subscribes to AppSync onTelemetryReceived.
export function useTelemetry(facilityId: string, windowSize = 96): TelemetryState {
  const [state, setState] = useState<TelemetryState>({
    readings: TELEMETRY_24H.slice(-windowSize),
    latestReading: TELEMETRY_24H[TELEMETRY_24H.length - 1] ?? null,
    lastSync: new Date(),
    isConnected: SYNTHETIC_MODE,
  })

  const indexRef = useRef(TELEMETRY_24H.length - 1)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!SYNTHETIC_MODE) return

    // Replay: advance the window pointer every 15 seconds in demo mode
    timerRef.current = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % TELEMETRY_24H.length

      setState((prev) => {
        const nextReading = TELEMETRY_24H[indexRef.current]
        const readings = [...prev.readings.slice(1), nextReading]
        return {
          readings,
          latestReading: nextReading,
          lastSync: new Date(),
          isConnected: true,
        }
      })
    }, 15_000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [facilityId])

  return state
}
