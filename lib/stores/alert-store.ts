import { create } from 'zustand'
import type { Alert } from '@/types/alert'

import { DEMO_ALERTS } from '@/lib/data/seed'

interface AlertStore {
  alerts: Alert[]
  unreadCount: number

  // Actions
  setAlerts: (alerts: Alert[]) => void
  addAlert: (alert: Alert) => void
  acknowledgeAlert: (alertId: string) => void
  resolveAlert: (alertId: string) => void
  markAllRead: () => void
  clearResolved: () => void
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: DEMO_ALERTS,
  unreadCount: DEMO_ALERTS.filter((a) => a.status === 'ACTIVE').length,

  setAlerts(alerts) {
    set({
      alerts,
      unreadCount: alerts.filter((a) => a.status === 'ACTIVE').length,
    })
  },

  addAlert(alert) {
    set((state) => ({
      alerts: [alert, ...state.alerts],
      unreadCount: state.unreadCount + 1,
    }))
  },

  acknowledgeAlert(alertId) {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' as const } : a
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  resolveAlert(alertId) {
    set((state) => {
      const alert = state.alerts.find((a) => a.id === alertId)
      const wasActive = alert ? alert.status === 'ACTIVE' : false
      return {
        alerts: state.alerts.map((a) =>
          a.id === alertId ? { ...a, status: 'RESOLVED' as const } : a
        ),
        unreadCount: wasActive ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      }
    })
  },

  markAllRead() {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.status === 'ACTIVE' ? { ...a, status: 'ACKNOWLEDGED' as const } : a
      ),
      unreadCount: 0,
    }))
  },

  clearResolved() {
    const { alerts } = get()
    set({ alerts: alerts.filter((a) => a.status !== 'RESOLVED') })
  },
}))

// Selectors
export const selectCriticalAlerts = (state: AlertStore) =>
  state.alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'ACTIVE')

export const selectActiveAlerts = (state: AlertStore) =>
  state.alerts.filter((a) => a.status === 'ACTIVE')

export const selectAlertsByFacility = (facilityId: string) => (state: AlertStore) =>
  state.alerts.filter((a) => a.facilityId === facilityId && a.status === 'ACTIVE')
