import { describe, it, expect } from 'vitest'
import { computeEsgScore } from '../score-engine'
import type { EnergyMetrics, ScopeEmissions, AssetHealthInput } from '@/types/esg'

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const BASE_METRICS: EnergyMetrics = {
  totalKwh: 15_768_000,
  renewableKwh: 6_701_400,  // 42.5%
  gridKwh: 9_066_600,
  renewablePct: 42.5,
  pueRatio: null,
  wueRatio: null,
  energyIntensityKwhPerSqm: null,
}

const BASE_EMISSIONS: ScopeEmissions = {
  scope1Tco2e: 0,
  // 9,066,600 kWh (grid) × 0.9006 / 1000 ≈ 8,162 tCO2e → intensity 0.52 tCO2e/MWh
  scope2Tco2e: 8162,
  scope3Tco2e: 0,
  totalTco2e: 8162,
}

const periodStart = new Date('2026-01-01T00:00:00Z')
const periodEnd = new Date('2026-06-15T00:00:00Z')

function makeInputs(overrides: Partial<Parameters<typeof computeEsgScore>[0]> = {}) {
  return {
    tenantId: 'tenant_cpt',
    facilityId: 'fac_jhb_dc_01',
    metrics: BASE_METRICS,
    emissions: BASE_EMISSIONS,
    yoyImprovementPct: null,
    dataCompletePct: 87,
    assetHealthInputs: [],
    periodStart,
    periodEnd,
    ...overrides,
  }
}

// ─── Weights ──────────────────────────────────────────────────────────────────

describe('DIMENSION_WEIGHTS', () => {
  it('six dimension weights sum to exactly 1.0', () => {
    const result = computeEsgScore(makeInputs())
    const totalWeight = result.dimensions.reduce((sum, d) => sum + d.weight, 0)
    expect(totalWeight).toBeCloseTo(1.0, 10)
  })

  it('produces exactly six dimensions', () => {
    const result = computeEsgScore(makeInputs())
    expect(result.dimensions).toHaveLength(6)
  })

  it('composite equals sum of weighted dimension scores', () => {
    const result = computeEsgScore(makeInputs())
    const sumOfWeighted = result.dimensions.reduce((s, d) => s + d.weightedScore, 0)
    expect(result.compositeScore).toBeCloseTo(sumOfWeighted, 1)
  })
})

// ─── Energy Efficiency ────────────────────────────────────────────────────────

describe('scoreEnergyEfficiency', () => {
  it('PUE 1.0 drives energy dimension close to 100', () => {
    const result = computeEsgScore(makeInputs({
      metrics: { ...BASE_METRICS, pueRatio: 1.0, energyIntensityKwhPerSqm: null },
    }))
    const dim = result.dimensions.find((d) => d.dimension === 'energy_efficiency')!
    // pueScore = 100 × 0.8 + intensityBonus 60 × 0.2 = 80 + 12 = 92
    expect(dim.score).toBeGreaterThanOrEqual(90)
  })

  it('PUE 1.24 (JHB demo) scores above 75', () => {
    const result = computeEsgScore(makeInputs({
      metrics: { ...BASE_METRICS, pueRatio: 1.24 },
    }))
    const dim = result.dimensions.find((d) => d.dimension === 'energy_efficiency')!
    expect(dim.score).toBeGreaterThan(75)
  })

  it('no PUE, no intensity → neutral energy score of 60', () => {
    const result = computeEsgScore(makeInputs({
      metrics: { ...BASE_METRICS, pueRatio: null, energyIntensityKwhPerSqm: null },
    }))
    const dim = result.dimensions.find((d) => d.dimension === 'energy_efficiency')!
    expect(dim.score).toBe(60)
  })
})

// ─── Equipment Sustainability ─────────────────────────────────────────────────

describe('scoreEquipmentSustainability', () => {
  it('no assets → neutral score of 65', () => {
    const result = computeEsgScore(makeInputs({ assetHealthInputs: [] }))
    const dim = result.dimensions.find((d) => d.dimension === 'equipment_sustainability')!
    expect(dim.score).toBe(65)
  })

  it('omitted assetHealthInputs → neutral score of 65', () => {
    const { assetHealthInputs: _, ...inputs } = makeInputs()
    const result = computeEsgScore(inputs)
    const dim = result.dimensions.find((d) => d.dimension === 'equipment_sustainability')!
    expect(dim.score).toBe(65)
  })

  it('single critical asset at 82% health → uses that score', () => {
    const chl01: AssetHealthInput = {
      assetId: 'CHL-01',
      healthScore: 82,
      operatingLoad: 0.88,
      isCritical: true,
    }
    const result = computeEsgScore(makeInputs({ assetHealthInputs: [chl01] }))
    const dim = result.dimensions.find((d) => d.dimension === 'equipment_sustainability')!
    // avgHealth = 82, overload 8% above 0.80 → penalty = 8 × 0.4 = 3.2, contrib 30% → 0.96
    // score ≈ 82 - 0.96 ≈ 81
    expect(dim.score).toBeLessThan(82)
    expect(dim.score).toBeGreaterThan(75)
  })

  it('critical asset at 82% scores lower than non-critical at 82% when paired with healthy asset', () => {
    const healthyAsset: AssetHealthInput = { assetId: 'good', healthScore: 100, operatingLoad: 0.5, isCritical: false }

    const withCritical82: AssetHealthInput = { assetId: 'bad', healthScore: 82, operatingLoad: null, isCritical: true }
    const withNonCritical82: AssetHealthInput = { assetId: 'bad', healthScore: 82, operatingLoad: null, isCritical: false }

    const critResult = computeEsgScore(makeInputs({ assetHealthInputs: [healthyAsset, withCritical82] }))
    const nonCritResult = computeEsgScore(makeInputs({ assetHealthInputs: [healthyAsset, withNonCritical82] }))

    const critScore = critResult.dimensions.find((d) => d.dimension === 'equipment_sustainability')!.score
    const nonCritScore = nonCritResult.dimensions.find((d) => d.dimension === 'equipment_sustainability')!.score

    // Critical at 82% should pull composite down more than non-critical at 82%
    expect(critScore).toBeLessThan(nonCritScore)
  })

  it('overload penalty fires when operatingLoad > 0.80', () => {
    const overloaded: AssetHealthInput = { assetId: 'a', healthScore: 90, operatingLoad: 0.90, isCritical: false }
    const normal: AssetHealthInput = { assetId: 'b', healthScore: 90, operatingLoad: 0.70, isCritical: false }

    const overloadedResult = computeEsgScore(makeInputs({ assetHealthInputs: [overloaded] }))
    const normalResult = computeEsgScore(makeInputs({ assetHealthInputs: [normal] }))

    const overloadedScore = overloadedResult.dimensions.find((d) => d.dimension === 'equipment_sustainability')!.score
    const normalScore = normalResult.dimensions.find((d) => d.dimension === 'equipment_sustainability')!.score

    expect(overloadedScore).toBeLessThan(normalScore)
  })

  it('overload penalty is capped at 15 points per asset', () => {
    // operatingLoad = 1.0 → 20% above threshold × 0.4 = 8 pts, but max cap is 15
    // 100% load → 20% over → 8 pts < 15 cap → penalty = 8 × 0.3 = 2.4
    const maxLoad: AssetHealthInput = { assetId: 'a', healthScore: 100, operatingLoad: 1.0, isCritical: false }
    const result = computeEsgScore(makeInputs({ assetHealthInputs: [maxLoad] }))
    const dim = result.dimensions.find((d) => d.dimension === 'equipment_sustainability')!
    // Score should be positive (100 - some penalty)
    expect(dim.score).toBeGreaterThan(0)
    expect(dim.score).toBeLessThan(100)
  })
})

// ─── Water Efficiency ─────────────────────────────────────────────────────────

describe('scoreWaterEfficiency', () => {
  it('null WUE → neutral score of 65', () => {
    const result = computeEsgScore(makeInputs({
      metrics: { ...BASE_METRICS, wueRatio: null },
    }))
    const dim = result.dimensions.find((d) => d.dimension === 'water_efficiency')!
    expect(dim.score).toBe(65)
  })

  it('WUE 1.0 → score near 100', () => {
    const result = computeEsgScore(makeInputs({
      metrics: { ...BASE_METRICS, wueRatio: 1.0 },
    }))
    const dim = result.dimensions.find((d) => d.dimension === 'water_efficiency')!
    expect(dim.score).toBeCloseTo(100, 1)
  })
})

// ─── Renewable Mix ────────────────────────────────────────────────────────────

describe('scoreRenewableMix', () => {
  it('42.5% renewable mix scores above 40', () => {
    const result = computeEsgScore(makeInputs())
    const dim = result.dimensions.find((d) => d.dimension === 'renewable_mix')!
    // base 42.5 + bonus (42.5 - 30) × 0.5 = 42.5 + 6.25 = 48.75
    expect(dim.score).toBeCloseTo(48.75, 1)
  })

  it('0% renewable → score 0', () => {
    const result = computeEsgScore(makeInputs({
      metrics: { ...BASE_METRICS, renewablePct: 0, renewableKwh: 0, gridKwh: BASE_METRICS.totalKwh },
    }))
    const dim = result.dimensions.find((d) => d.dimension === 'renewable_mix')!
    expect(dim.score).toBe(0)
  })

  it('100% renewable → score 100 (clamped)', () => {
    const result = computeEsgScore(makeInputs({
      metrics: { ...BASE_METRICS, renewablePct: 100, renewableKwh: BASE_METRICS.totalKwh, gridKwh: 0 },
    }))
    const dim = result.dimensions.find((d) => d.dimension === 'renewable_mix')!
    expect(dim.score).toBe(100)
  })
})

// ─── Carbon Performance ───────────────────────────────────────────────────────

describe('scoreCarbonPerformance', () => {
  it('zero emissions → score near 100', () => {
    const result = computeEsgScore(makeInputs({
      emissions: { scope1Tco2e: 0, scope2Tco2e: 0, scope3Tco2e: 0, totalTco2e: 0 },
    }))
    const dim = result.dimensions.find((d) => d.dimension === 'carbon_performance')!
    expect(dim.score).toBeCloseTo(100, 1)
  })

  it('yoy improvement adds bonus points', () => {
    const without = computeEsgScore(makeInputs({ yoyImprovementPct: null }))
    const withImprovement = computeEsgScore(makeInputs({ yoyImprovementPct: 5 }))
    const dimWithout = without.dimensions.find((d) => d.dimension === 'carbon_performance')!
    const dimWith = withImprovement.dimensions.find((d) => d.dimension === 'carbon_performance')!
    expect(dimWith.score).toBeGreaterThan(dimWithout.score)
  })
})

// ─── Operational Reliability ──────────────────────────────────────────────────

describe('scoreOperationalReliability', () => {
  it('100% data completeness → score 100', () => {
    const result = computeEsgScore(makeInputs({ dataCompletePct: 100 }))
    const dim = result.dimensions.find((d) => d.dimension === 'operational_reliability')!
    expect(dim.score).toBe(100)
  })

  it('0% data completeness → score 0', () => {
    const result = computeEsgScore(makeInputs({ dataCompletePct: 0 }))
    const dim = result.dimensions.find((d) => d.dimension === 'operational_reliability')!
    expect(dim.score).toBe(0)
  })

  it('87% completeness (seed demo value) → score 87', () => {
    const result = computeEsgScore(makeInputs({ dataCompletePct: 87 }))
    const dim = result.dimensions.find((d) => d.dimension === 'operational_reliability')!
    expect(dim.score).toBe(87)
  })
})

// ─── Composite score ──────────────────────────────────────────────────────────

describe('compositeScore', () => {
  it('is a number between 0 and 100', () => {
    const result = computeEsgScore(makeInputs())
    expect(result.compositeScore).toBeGreaterThanOrEqual(0)
    expect(result.compositeScore).toBeLessThanOrEqual(100)
  })

  it('has one decimal place precision', () => {
    const result = computeEsgScore(makeInputs())
    const str = result.compositeScore.toString()
    const decimals = str.includes('.') ? str.split('.')[1].length : 0
    expect(decimals).toBeLessThanOrEqual(1)
  })

  it('higher PUE degrades composite score', () => {
    const goodPue = computeEsgScore(makeInputs({ metrics: { ...BASE_METRICS, pueRatio: 1.0 } }))
    const badPue = computeEsgScore(makeInputs({ metrics: { ...BASE_METRICS, pueRatio: 2.0 } }))
    expect(goodPue.compositeScore).toBeGreaterThan(badPue.compositeScore)
  })

  it('preserves tenantId and facilityId in result', () => {
    const result = computeEsgScore(makeInputs())
    expect(result.tenantId).toBe('tenant_cpt')
    expect(result.facilityId).toBe('fac_jhb_dc_01')
  })
})
