// ESG domain types for Clara AI

export type EsgFramework =
  | 'GRI_302'
  | 'GRI_303'
  | 'GRI_305'
  | 'GHG_PROTOCOL'
  | 'ISO_50001'
  | 'TCFD'
  | 'GRESB'

export type EsgScoreDimension =
  | 'energy_efficiency'
  | 'carbon_performance'
  | 'equipment_sustainability'
  | 'renewable_mix'
  | 'water_efficiency'
  | 'operational_reliability'
  | 'reporting_completeness' // legacy — kept for backwards compat with older records

// ─── Emission inputs ─────────────────────────────────────────────────────────

export interface EnergyConsumptionInput {
  facilityId: string
  totalKwh: number
  renewableKwh: number
  periodStart: Date
  periodEnd: Date
}

export interface FuelConsumptionInput {
  facilityId: string
  fuelType: FuelType
  quantity: number
  unit: FuelUnit
}

export type FuelType = 'diesel' | 'natural_gas' | 'petrol' | 'lpg'
export type FuelUnit = 'litres' | 'm3' | 'kg'

export interface RefrigerantLeakInput {
  facilityId: string
  assetId: string
  refrigerantType: RefrigerantType
  leakQuantityKg: number
}

export type RefrigerantType = 'R22' | 'R410A' | 'R134a' | 'R407C' | 'R32' | 'R404A' | 'R507A'

export interface WaterUsageInput {
  facilityId: string
  usageKl: number
  source: WaterSource
  periodStart: Date
  periodEnd: Date
}

export type WaterSource = 'municipal' | 'borehole' | 'recycled' | 'mixed'

// ─── Asset health input (for Equipment Sustainability dimension) ───────────────

export interface AssetHealthInput {
  assetId: string
  healthScore: number        // 0–100 from HealthScore model
  operatingLoad: number | null  // 0–1 fraction of rated capacity
  isCritical: boolean        // critical assets weighted 2× in scoring
}

// ─── Calculation outputs ──────────────────────────────────────────────────────

export interface ScopeEmissions {
  scope1Tco2e: number   // direct: fuel combustion + refrigerant leakage
  scope2Tco2e: number   // indirect: purchased electricity × grid factor
  scope3Tco2e: number   // value chain: water supply, waste, etc.
  totalTco2e: number
}

export interface EnergyMetrics {
  totalKwh: number
  renewableKwh: number
  gridKwh: number
  renewablePct: number
  pueRatio: number | null       // data centres only
  wueRatio: number | null       // water usage effectiveness
  energyIntensityKwhPerSqm: number | null
}

// ─── ESG Score ────────────────────────────────────────────────────────────────

export interface EsgDimensionScore {
  dimension: EsgScoreDimension
  score: number           // 0-100
  weight: number          // 0-1, all weights sum to 1
  weightedScore: number   // score × weight
  inputs: Record<string, number | string | null>
  label: string
}

export interface EsgScoreResult {
  tenantId: string
  facilityId: string | null   // null = portfolio aggregate
  compositeScore: number       // 0-100, one decimal
  dimensions: EsgDimensionScore[]
  computedAt: Date
  energyMetrics: EnergyMetrics
  emissions: ScopeEmissions
  periodStart: Date
  periodEnd: Date
}

export interface EsgScoreTrend {
  recordedAt: Date
  score: number
}

// ─── GRI 302 — Energy ─────────────────────────────────────────────────────────

export interface Gri302Report {
  framework: 'GRI_302'
  disclosures: {
    gri302_1_energyWithinOrganisation: Gri302_1
    gri302_3_energyIntensity: Gri302_3
    gri302_4_reductionOfEnergyConsumption: Gri302_4
  }
  metadata: ReportMetadata
}

export interface Gri302_1 {
  totalFuelConsumptionMj: number
  renewableElecKwh: number
  nonRenewableElecKwh: number
  totalEnergyConsumptionMj: number
  heatingKwh: number
  coolingKwh: number
}

export interface Gri302_3 {
  energyIntensityKwhPerSqm: number
  denominator: string
  energyTypesIncluded: string[]
}

export interface Gri302_4 {
  reductionKwh: number
  reductionPct: number
  initiativesCount: number
}

// ─── GRI 303 — Water and Effluents ────────────────────────────────────────────

export interface Gri303Report {
  framework: 'GRI_303'
  disclosures: {
    gri303_3_waterWithdrawal: Gri303_3
    gri303_4_waterDischarge: Gri303_4
    gri303_5_waterConsumption: Gri303_5
  }
  metadata: ReportMetadata
}

export interface Gri303_3 {
  totalWithdrawalKl: number
  bySource: Array<{ source: string; volumeKl: number; sharePct: number }>
  scope3EmissionsTco2e: number
}

export interface Gri303_4 {
  totalDischargeKl: number
  coolingTowerBlowdownKl: number
  evaporativeLossKl: number
}

export interface Gri303_5 {
  totalConsumptionKl: number
  wueRatio: number | null   // litres per kWh IT load
  withdrawalMinusDischargeKl: number
}

// ─── GRI 305 — Emissions ──────────────────────────────────────────────────────

export interface Gri305Report {
  framework: 'GRI_305'
  disclosures: {
    gri305_1_directEmissions: Gri305_1
    gri305_2_energyIndirectEmissions: Gri305_2
    gri305_4_emissionsIntensity: Gri305_4
    gri305_5_emissionsReduction?: Gri305_5
  }
  metadata: ReportMetadata
}

export interface Gri305_1 {
  scope1Tco2e: number
  fuelCombustionTco2e: number
  refrigerantLeakageTco2e: number
  emissionFactorSources: string[]
}

export interface Gri305_2 {
  scope2LocationBasedTco2e: number
  scope2MarketBasedTco2e: number
  gridEmissionFactorKgCo2ePerKwh: number
  electricityKwh: number
}

export interface Gri305_4 {
  tco2ePerMwh: number
  tco2ePerSqm: number
  scopesIncluded: string[]
}

export interface Gri305_5 {
  baseYearTco2e: number
  reportingYearTco2e: number
  reductionTco2e: number
  reductionPct: number
}

// ─── GHG Protocol ────────────────────────────────────────────────────────────

export interface GhgProtocolReport {
  framework: 'GHG_PROTOCOL'
  scope1: GhgScope1
  scope2: GhgScope2
  scope3: GhgScope3
  totalTco2e: number
  intensity: GhgIntensity
  metadata: ReportMetadata
}

export interface GhgScope1 {
  totalTco2e: number
  fuelCombustionTco2e: number
  refrigerantLeakageTco2e: number
  breakdown: Array<{ source: string; tco2e: number }>
}

export interface GhgScope2 {
  totalTco2e: number
  locationBasedTco2e: number
  marketBasedTco2e: number       // adjusted for RECs / PPAs
  gridFactor: number             // kgCO2e/kWh
  electricityKwh: number
}

export interface GhgScope3 {
  totalTco2e: number
  waterSupplyTco2e: number
  wasteDisposalTco2e: number
  upstreamEnergyTco2e: number
}

export interface GhgIntensity {
  tco2ePerMwh: number
  tco2ePerSqm: number
  tco2ePerEmployee: number | null
}

// ─── ISO 50001 ────────────────────────────────────────────────────────────────

export interface Iso50001Report {
  framework: 'ISO_50001'
  baselineKwh: number
  reportingKwh: number
  improvementKwh: number
  improvementPct: number
  significantEnergyUses: SignificantEnergyUse[]
  pueRatio: number | null
  metadata: ReportMetadata
}

export interface SignificantEnergyUse {
  assetId: string
  assetName: string
  consumptionKwh: number
  sharePct: number
}

export interface ReportMetadata {
  tenantId: string
  facilityId: string
  periodStart: Date
  periodEnd: Date
  generatedAt: Date
  dataCompletePct: number
  reportId: string
  framework: EsgFramework
}
