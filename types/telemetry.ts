export interface TelemetryPoint {
  timestamp: string
  assetId: string
  sensorType: string
  value: number
  unit: string
}

export interface EnergyReading {
  timestamp: string
  facilityId: string
  actualKwh: number
  baselineKwh: number
  deviationPct: number
  anomalyFlag: boolean
}
