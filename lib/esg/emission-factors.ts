// Emission factors for South Africa — sourced from DFFE (Dept. of Forestry, Fisheries & Environment)
// Grid factor: 2023 South Africa national grid emission factor (DFFE, 0.9006 kgCO2e/kWh)
// Fuel factors: IPCC AR5 GWP 100-year values, SANS 10228 / GHG Protocol

import type { FuelType, FuelUnit, RefrigerantType, WaterSource } from '@/types/esg'

// ─── Electricity grid factors ─────────────────────────────────────────────────

export const GRID_EMISSION_FACTORS: Record<string, number> = {
  ZA: 0.9006,          // South Africa (ESKOM national, kgCO2e/kWh)
  ZA_CITY_POWER: 0.9006,
  ZA_CAPE_TOWN: 0.8800, // slightly lower — City of Cape Town has some renewables
  ZA_RENEWABLE: 0.0,    // for market-based (RECs / PPAs)
  DEFAULT: 0.9006,
}

export function getGridFactor(country: string, region?: string): number {
  if (country !== 'ZA') return GRID_EMISSION_FACTORS.DEFAULT
  if (region?.toLowerCase().includes('cape')) return GRID_EMISSION_FACTORS.ZA_CAPE_TOWN
  return GRID_EMISSION_FACTORS.ZA
}

// ─── Fuel emission factors (kgCO2e per unit) ─────────────────────────────────

type FuelFactorKey = `${FuelType}_${FuelUnit}`

export const FUEL_EMISSION_FACTORS: Partial<Record<FuelFactorKey, number>> = {
  diesel_litres: 2.6839,       // kgCO2e/litre (IPCC + GHG Protocol)
  petrol_litres: 2.3110,
  lpg_litres: 1.5100,
  lpg_kg: 2.9830,
  natural_gas_m3: 2.0210,      // kgCO2e/m³ at STP
  natural_gas_kg: 2.7500,
}

export function getFuelFactor(fuelType: FuelType, unit: FuelUnit): number {
  const key: FuelFactorKey = `${fuelType}_${unit}`
  return FUEL_EMISSION_FACTORS[key] ?? 0
}

// ─── Refrigerant GWP values (AR5, 100-year) ──────────────────────────────────

export const REFRIGERANT_GWP: Record<RefrigerantType, number> = {
  R22: 1760,     // HCFC-22 (being phased out under Montreal Protocol)
  R410A: 2088,   // HFC blend
  R134a: 1300,
  R407C: 1774,
  R32: 675,
  R404A: 3922,   // high-GWP, being replaced
  R507A: 3985,
}

export function getRefrigerantGwp(type: RefrigerantType): number {
  return REFRIGERANT_GWP[type]
}

// ─── Water emission factors (kgCO2e/kL) ──────────────────────────────────────

export const WATER_EMISSION_FACTORS: Record<WaterSource, number> = {
  municipal: 0.344,   // kgCO2e per kL (SA DWS lifecycle including treatment + distribution)
  borehole: 0.130,    // lower — only pumping energy
  recycled: 0.080,    // greywater recycling
  mixed: 0.280,       // weighted estimate for mixed sources
}

export function getWaterFactor(source: WaterSource): number {
  return WATER_EMISSION_FACTORS[source]
}

// ─── MJ conversion constants ──────────────────────────────────────────────────

export const KWH_TO_MJ = 3.6        // 1 kWh = 3.6 MJ
export const LITRE_DIESEL_TO_MJ = 38.6
export const M3_GAS_TO_MJ = 38.0
