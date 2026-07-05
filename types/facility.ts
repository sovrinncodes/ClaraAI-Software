export type FacilityStatus = 'OPTIMAL' | 'WATCH' | 'ADVISORY' | 'CRITICAL'
export type FacilityType = 'DATA_CENTER' | 'MANUFACTURING' | 'COMMERCIAL' | 'LOGISTICS' | 'AGRICULTURE'

export interface Facility {
  id: string
  externalId: string
  name: string
  type: FacilityType
  status: FacilityStatus
  city: string
  region: string
  healthScore: number
  pueRatio?: number
  energyDrawKw: number
  activeAlerts: { critical: number; advisory: number; watch: number }
  monitoredAssets: { total: number; online: number }
  uptimeMtdPct: number
}

export interface FacilityDetail extends Facility {
  totalAreaSqm?: number
  tierRating?: string
  gridZone?: string
  managerName?: string
  commissionedAt?: string
  country: string
}
