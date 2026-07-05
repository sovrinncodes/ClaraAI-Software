// Pure ESG calculation functions — no DB dependencies, fully deterministic

import {
  getFuelFactor,
  getGridFactor,
  getRefrigerantGwp,
  getWaterFactor,
  KWH_TO_MJ,
} from './emission-factors'
import type {
  EnergyConsumptionInput,
  EnergyMetrics,
  FuelConsumptionInput,
  RefrigerantLeakInput,
  ScopeEmissions,
  WaterUsageInput,
} from '@/types/esg'

// ─── Scope 2: Purchased electricity ──────────────────────────────────────────

export function calcScope2(
  gridKwh: number,
  country: string,
  region?: string,
): number {
  const factor = getGridFactor(country, region)
  return (gridKwh * factor) / 1000 // → tCO2e
}

// ─── Scope 1: Fuel combustion ─────────────────────────────────────────────────

export function calcFuelEmissions(inputs: FuelConsumptionInput[]): number {
  return inputs.reduce((sum, input) => {
    const factor = getFuelFactor(input.fuelType, input.unit)
    return sum + (input.quantity * factor) / 1000 // → tCO2e
  }, 0)
}

// ─── Scope 1: Refrigerant leakage ────────────────────────────────────────────

export function calcRefrigerantEmissions(inputs: RefrigerantLeakInput[]): number {
  return inputs.reduce((sum, input) => {
    const gwp = getRefrigerantGwp(input.refrigerantType)
    // tCO2e = kg leaked × GWP / 1000
    return sum + (input.leakQuantityKg * gwp) / 1000
  }, 0)
}

// ─── Scope 3: Water supply ────────────────────────────────────────────────────

export function calcWaterEmissions(inputs: WaterUsageInput[]): number {
  return inputs.reduce((sum, input) => {
    const factor = getWaterFactor(input.source)
    return sum + (input.usageKl * factor) / 1000 // → tCO2e
  }, 0)
}

// ─── Aggregate scopes ─────────────────────────────────────────────────────────

export interface ScopeInputs {
  energyInputs: EnergyConsumptionInput[]
  fuelInputs: FuelConsumptionInput[]
  refrigerantInputs: RefrigerantLeakInput[]
  waterInputs: WaterUsageInput[]
  country: string
  region?: string
}

export function calcTotalEmissions(inputs: ScopeInputs): ScopeEmissions {
  const totalKwh = inputs.energyInputs.reduce((s, e) => s + e.totalKwh, 0)
  const renewableKwh = inputs.energyInputs.reduce((s, e) => s + e.renewableKwh, 0)
  const gridKwh = totalKwh - renewableKwh

  const scope1Fuel = calcFuelEmissions(inputs.fuelInputs)
  const scope1Refrigerant = calcRefrigerantEmissions(inputs.refrigerantInputs)
  const scope1Tco2e = scope1Fuel + scope1Refrigerant

  const scope2Tco2e = calcScope2(gridKwh, inputs.country, inputs.region)

  const scope3Tco2e = calcWaterEmissions(inputs.waterInputs)

  return {
    scope1Tco2e: round(scope1Tco2e, 3),
    scope2Tco2e: round(scope2Tco2e, 3),
    scope3Tco2e: round(scope3Tco2e, 3),
    totalTco2e: round(scope1Tco2e + scope2Tco2e + scope3Tco2e, 3),
  }
}

// ─── Energy metrics ───────────────────────────────────────────────────────────

export function calcEnergyMetrics(
  energyInputs: EnergyConsumptionInput[],
  facilityAreaSqm: number | null,
  pueRatio: number | null,
  wueRatio: number | null,
): EnergyMetrics {
  const totalKwh = energyInputs.reduce((s, e) => s + e.totalKwh, 0)
  const renewableKwh = energyInputs.reduce((s, e) => s + e.renewableKwh, 0)
  const gridKwh = totalKwh - renewableKwh
  const renewablePct = totalKwh > 0 ? (renewableKwh / totalKwh) * 100 : 0

  return {
    totalKwh: round(totalKwh, 0),
    renewableKwh: round(renewableKwh, 0),
    gridKwh: round(gridKwh, 0),
    renewablePct: round(renewablePct, 2),
    pueRatio,
    wueRatio,
    energyIntensityKwhPerSqm:
      facilityAreaSqm && facilityAreaSqm > 0
        ? round(totalKwh / facilityAreaSqm, 2)
        : null,
  }
}

// ─── PUE score helper ─────────────────────────────────────────────────────────
// Maps PUE → 0-100 score. Best possible PUE = 1.0 (100), worst = 2.5+ (0).

export function pueToScore(pue: number): number {
  const score = ((2.5 - pue) / (2.5 - 1.0)) * 100
  return clamp(score, 0, 100)
}

// ─── WUE score helper ─────────────────────────────────────────────────────────
// WUE = litres water / kWh IT load. Best = 1.0 → 100, worst = 5.0+ → 0.

export function wueToScore(wue: number): number {
  const score = ((5.0 - wue) / (5.0 - 1.0)) * 100
  return clamp(score, 0, 100)
}

// ─── Carbon intensity score ───────────────────────────────────────────────────
// Maps tCO2e/MWh → 0-100.
// Scale: 1.5 tCO2e/MWh = 0 (coal-heavy grid worst case), 0 = 100 (carbon free).
// Using 1.5 as the denominator correctly positions SA (0.90) as average/poor,
// and rewards facilities with renewable PPAs reducing effective intensity.

export function carbonIntensityToScore(tco2ePerMwh: number): number {
  const WORST_CASE_INTENSITY = 1.5  // tCO2e/MWh — coal-dominated grid upper bound
  const score = ((WORST_CASE_INTENSITY - tco2ePerMwh) / WORST_CASE_INTENSITY) * 100
  return clamp(score, 0, 100)
}

// ─── Energy consumption → MJ conversion ──────────────────────────────────────

export function kwhToMj(kwh: number): number {
  return kwh * KWH_TO_MJ
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
