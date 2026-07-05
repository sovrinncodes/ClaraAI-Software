import type { AlertSeverity, AlertStatus } from './asset'

export type { AlertSeverity, AlertStatus }

export interface Alert {
  id: string
  tenantId: string
  facilityId: string
  assetId?: string
  severity: AlertSeverity
  status: AlertStatus
  modelName: string
  title: string
  description: string
  recommendation?: string
  predictedTtfDays?: number
  deviationPct?: number
  createdAt: string
  updatedAt: string
}
