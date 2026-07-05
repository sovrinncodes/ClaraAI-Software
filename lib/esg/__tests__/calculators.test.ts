import { describe, it, expect } from 'vitest'
import {
  calcScope2,
  calcFuelEmissions,
  calcRefrigerantEmissions,
  calcWaterEmissions,
  calcTotalEmissions,
  pueToScore,
  wueToScore,
  carbonIntensityToScore,
  kwhToMj,
} from '../calculators'

const fid = 'fac_test'
const aid = 'asset_test'
const now = new Date()

// ─── Scope 2 ──────────────────────────────────────────────────────────────────

describe('calcScope2', () => {
  it('applies SA national grid factor (0.9006 kgCO2e/kWh)', () => {
    // 1000 kWh × 0.9006 / 1000 = 0.9006 tCO2e
    expect(calcScope2(1000, 'ZA')).toBeCloseTo(0.9006, 4)
  })

  it('applies Cape Town regional factor (0.88)', () => {
    expect(calcScope2(1000, 'ZA', 'Western Cape')).toBeCloseTo(0.88, 4)
  })

  it('0 kWh always gives 0 tCO2e', () => {
    expect(calcScope2(0, 'ZA')).toBe(0)
  })

  it('uses default SA factor for non-Cape ZA regions', () => {
    expect(calcScope2(1000, 'ZA', 'Gauteng')).toBeCloseTo(0.9006, 4)
  })
})

// ─── Scope 1: Fuel ────────────────────────────────────────────────────────────

describe('calcFuelEmissions', () => {
  it('returns 0 for empty input', () => {
    expect(calcFuelEmissions([])).toBe(0)
  })

  it('calculates diesel litres correctly (2.6839 kgCO2e/L)', () => {
    // 100 litres × 2.6839 / 1000 = 0.26839 tCO2e
    const result = calcFuelEmissions([
      { facilityId: fid, fuelType: 'diesel', unit: 'litres', quantity: 100 },
    ])
    expect(result).toBeCloseTo(0.26839, 4)
  })

  it('calculates natural gas m3 correctly (2.021 kgCO2e/m3)', () => {
    const result = calcFuelEmissions([
      { facilityId: fid, fuelType: 'natural_gas', unit: 'm3', quantity: 100 },
    ])
    expect(result).toBeCloseTo(0.2021, 4)
  })

  it('sums multiple fuel entries', () => {
    const result = calcFuelEmissions([
      { facilityId: fid, fuelType: 'diesel', unit: 'litres', quantity: 100 },
      { facilityId: fid, fuelType: 'petrol', unit: 'litres', quantity: 100 },
    ])
    // (100 × 2.6839 + 100 × 2.311) / 1000
    expect(result).toBeCloseTo((268.39 + 231.1) / 1000, 4)
  })
})

// ─── Scope 1: Refrigerants ────────────────────────────────────────────────────

describe('calcRefrigerantEmissions', () => {
  it('returns 0 for empty input', () => {
    expect(calcRefrigerantEmissions([])).toBe(0)
  })

  it('calculates R410A correctly (GWP = 2088)', () => {
    // 1 kg × 2088 / 1000 = 2.088 tCO2e
    const result = calcRefrigerantEmissions([
      { facilityId: fid, assetId: aid, refrigerantType: 'R410A', leakQuantityKg: 1 },
    ])
    expect(result).toBeCloseTo(2.088, 3)
  })

  it('calculates R134a correctly (GWP = 1300)', () => {
    const result = calcRefrigerantEmissions([
      { facilityId: fid, assetId: aid, refrigerantType: 'R134a', leakQuantityKg: 2 },
    ])
    expect(result).toBeCloseTo((2 * 1300) / 1000, 3)
  })

  it('R404A has higher GWP than R410A', () => {
    const r404a = calcRefrigerantEmissions([
      { facilityId: fid, assetId: aid, refrigerantType: 'R404A', leakQuantityKg: 1 },
    ])
    const r410a = calcRefrigerantEmissions([
      { facilityId: fid, assetId: aid, refrigerantType: 'R410A', leakQuantityKg: 1 },
    ])
    expect(r404a).toBeGreaterThan(r410a)
  })
})

// ─── Scope 3: Water ───────────────────────────────────────────────────────────

describe('calcWaterEmissions', () => {
  it('returns 0 for empty input', () => {
    expect(calcWaterEmissions([])).toBe(0)
  })

  it('applies municipal factor (0.344 kgCO2e/kL)', () => {
    // 1000 kL × 0.344 / 1000 = 0.344 tCO2e
    const result = calcWaterEmissions([
      { facilityId: fid, source: 'municipal', usageKl: 1000, periodStart: now, periodEnd: now },
    ])
    expect(result).toBeCloseTo(0.344, 3)
  })

  it('recycled water has a lower factor than municipal', () => {
    const recycled = calcWaterEmissions([
      { facilityId: fid, source: 'recycled', usageKl: 1000, periodStart: now, periodEnd: now },
    ])
    const municipal = calcWaterEmissions([
      { facilityId: fid, source: 'municipal', usageKl: 1000, periodStart: now, periodEnd: now },
    ])
    expect(recycled).toBeLessThan(municipal)
  })
})

// ─── calcTotalEmissions ───────────────────────────────────────────────────────

describe('calcTotalEmissions', () => {
  it('sums scope 1+2+3 correctly', () => {
    const result = calcTotalEmissions({
      energyInputs: [{ facilityId: fid, totalKwh: 1000, renewableKwh: 0, periodStart: now, periodEnd: now }],
      fuelInputs: [{ facilityId: fid, fuelType: 'diesel', unit: 'litres', quantity: 100 }],
      refrigerantInputs: [],
      waterInputs: [{ facilityId: fid, source: 'municipal', usageKl: 100, periodStart: now, periodEnd: now }],
      country: 'ZA',
    })

    expect(result.scope2Tco2e).toBeCloseTo(0.9006, 3)
    expect(result.scope1Tco2e).toBeCloseTo(0.26839, 3)
    expect(result.scope3Tco2e).toBeCloseTo(0.0344, 3)
    expect(result.totalTco2e).toBeCloseTo(
      result.scope1Tco2e + result.scope2Tco2e + result.scope3Tco2e,
      3
    )
  })

  it('renewable kWh does not incur Scope 2 emissions', () => {
    const result = calcTotalEmissions({
      energyInputs: [{ facilityId: fid, totalKwh: 1000, renewableKwh: 1000, periodStart: now, periodEnd: now }],
      fuelInputs: [],
      refrigerantInputs: [],
      waterInputs: [],
      country: 'ZA',
    })
    expect(result.scope2Tco2e).toBe(0)
  })

  it('returns zero total for no inputs', () => {
    const result = calcTotalEmissions({
      energyInputs: [],
      fuelInputs: [],
      refrigerantInputs: [],
      waterInputs: [],
      country: 'ZA',
    })
    expect(result.totalTco2e).toBe(0)
  })
})

// ─── Score normalisers ────────────────────────────────────────────────────────

describe('pueToScore', () => {
  it('PUE 1.0 (perfect) → 100', () => {
    expect(pueToScore(1.0)).toBeCloseTo(100, 1)
  })

  it('PUE 2.5 (worst) → 0', () => {
    expect(pueToScore(2.5)).toBeCloseTo(0, 1)
  })

  it('PUE 1.24 (JHB DC-1 demo) → between 80 and 95', () => {
    const score = pueToScore(1.24)
    expect(score).toBeGreaterThan(80)
    expect(score).toBeLessThan(95)
  })

  it('PUE above 2.5 clamps to 0', () => {
    expect(pueToScore(3.0)).toBe(0)
  })
})

describe('wueToScore', () => {
  it('WUE 1.0 (best) → 100', () => {
    expect(wueToScore(1.0)).toBeCloseTo(100, 1)
  })

  it('WUE 5.0 → 0', () => {
    expect(wueToScore(5.0)).toBe(0)
  })

  it('WUE above 5.0 clamps to 0', () => {
    expect(wueToScore(6.0)).toBe(0)
  })

  it('is monotonically decreasing', () => {
    expect(wueToScore(1.5)).toBeGreaterThan(wueToScore(2.0))
    expect(wueToScore(2.0)).toBeGreaterThan(wueToScore(3.0))
  })
})

describe('carbonIntensityToScore', () => {
  it('0 tCO2e/MWh → 100 (carbon-free)', () => {
    expect(carbonIntensityToScore(0)).toBeCloseTo(100, 1)
  })

  it('1.5 tCO2e/MWh → 0 (worst case)', () => {
    expect(carbonIntensityToScore(1.5)).toBe(0)
  })

  it('SA grid (~0.9 tCO2e/MWh) scores between 30 and 50', () => {
    const score = carbonIntensityToScore(0.9)
    expect(score).toBeGreaterThan(30)
    expect(score).toBeLessThan(50)
  })
})

describe('kwhToMj', () => {
  it('1 kWh = 3.6 MJ', () => {
    expect(kwhToMj(1)).toBe(3.6)
  })

  it('scales linearly', () => {
    expect(kwhToMj(100)).toBe(360)
  })
})
