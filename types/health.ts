export interface HealthScore {
  assetId: string
  score: number
  predictedTtfDays?: number
  faultType?: string
  faultConfidence?: number
  vibrationRms?: number
  operatingLoad?: number
  isoZone?: 'A' | 'B' | 'C' | 'D'
  recordedAt: string
}

export interface HealthDegradationPoint {
  date: string
  score: number
  isActual: boolean
  confidenceHigh?: number
  confidenceLow?: number
  hasEvent?: boolean
  eventLabel?: string
}
