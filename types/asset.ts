import type { FacilityStatus } from './facility'

export type AlertSeverity = 'CRITICAL' | 'ADVISORY' | 'WATCH' | 'INFO'
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'
export type AssetType =
  | 'CRAC_UNIT' | 'CRAH_UNIT' | 'CHILLER' | 'COOLING_TOWER'
  | 'PUMP' | 'UPS' | 'PDU' | 'AHU' | 'FAN'
  | 'COMPRESSOR' | 'MOTOR' | 'GENERATOR' | 'CONVEYOR'

export interface Asset {
  id: string
  externalId: string
  facilityId: string
  name: string
  type: AssetType
  manufacturer?: string
  model?: string
  serialNumber?: string
  healthScore: number
  status: FacilityStatus
  predictedTtfDays?: number
  faultType?: string
  faultConfidence?: number
  vibrationRms?: number
  operatingLoadPct?: number
  isoZone?: 'A' | 'B' | 'C' | 'D'
  isCritical?: boolean
  locationInFacility?: string
}
