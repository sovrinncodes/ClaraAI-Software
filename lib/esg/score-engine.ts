// ESG composite score engine
// Produces the "ESG Insight Score" (0–100) displayed on the dashboard KPI card.
//
// Dimension weights (data-centre context, aligned with CPT ESG research):
//   Energy Efficiency       30% — PUE is the primary operational DC metric
//   Carbon Performance      20% — Scope 1+2 intensity vs SA coal-grid baseline
//   Equipment Sustainability 20% — Asset health scores; degraded HVAC = higher energy use
//   Renewable Mix           15% — Key ESG positioning differentiator
//   Water Efficiency        10% — WUE; important for wet-cooled data centres
//   Operational Reliability  5% — Data completeness as monitoring maturity proxy

import {
  pueToScore,
  wueToScore,
  carbonIntensityToScore,
} from './calculators'
import type {
  AssetHealthInput,
  EnergyMetrics,
  EsgDimensionScore,
  EsgScoreResult,
  ScopeEmissions,
} from '@/types/esg'

const DIMENSION_WEIGHTS = {
  energy_efficiency:        0.30,
  carbon_performance:       0.20,
  equipment_sustainability: 0.20,
  renewable_mix:            0.15,
  water_efficiency:         0.10,
  operational_reliability:  0.05,
} as const

// ─── Energy Efficiency ────────────────────────────────────────────────────────

function scoreEnergyEfficiency(metrics: EnergyMetrics): EsgDimensionScore {
  let score: number

  if (metrics.pueRatio !== null) {
    // Data centre: PUE drives 80% of dimension; intensity proxy drives 20%
    const pueScore = pueToScore(metrics.pueRatio)
    const intensityBonus =
      metrics.energyIntensityKwhPerSqm !== null
        ? Math.max(0, 100 - metrics.energyIntensityKwhPerSqm / 2)
        : 60
    score = pueScore * 0.8 + intensityBonus * 0.2
  } else if (metrics.energyIntensityKwhPerSqm !== null) {
    // Non-DC: kWh/m²/year (typical range 100–500)
    score = Math.max(0, 100 - metrics.energyIntensityKwhPerSqm / 5)
  } else {
    score = 60 // neutral when insufficient data
  }

  score = clamp(score, 0, 100)
  const weight = DIMENSION_WEIGHTS.energy_efficiency

  return {
    dimension: 'energy_efficiency',
    label: 'Energy Efficiency',
    score: round(score, 1),
    weight,
    weightedScore: round(score * weight, 2),
    inputs: {
      pueRatio: metrics.pueRatio,
      energyIntensityKwhPerSqm: metrics.energyIntensityKwhPerSqm,
    },
  }
}

// ─── Carbon Performance ───────────────────────────────────────────────────────

function scoreCarbonPerformance(
  emissions: ScopeEmissions,
  metrics: EnergyMetrics,
  yoyImprovementPct: number | null,
): EsgDimensionScore {
  const totalMwh = metrics.totalKwh / 1000

  // Intensity uses Scope 1+2 only (within organisational control)
  const controlledTco2e = emissions.scope1Tco2e + emissions.scope2Tco2e
  const intensity = totalMwh > 0 ? controlledTco2e / totalMwh : 0

  let score = carbonIntensityToScore(intensity)

  // Year-over-year reduction bonus: up to +10 pts for ≥10% reduction
  if (yoyImprovementPct !== null && yoyImprovementPct > 0) {
    score = Math.min(100, score + Math.min(10, yoyImprovementPct))
  }

  score = clamp(score, 0, 100)
  const weight = DIMENSION_WEIGHTS.carbon_performance

  return {
    dimension: 'carbon_performance',
    label: 'Carbon Performance',
    score: round(score, 1),
    weight,
    weightedScore: round(score * weight, 2),
    inputs: {
      scope1Tco2e: emissions.scope1Tco2e,
      scope2Tco2e: emissions.scope2Tco2e,
      tco2ePerMwh: round(intensity, 4),
      yoyImprovementPct,
    },
  }
}

// ─── Equipment Sustainability ─────────────────────────────────────────────────
//
// Connects predictive maintenance output directly into the ESG score.
// Critical assets (chillers, CRAC units) are weighted 2× because their
// health state has a disproportionate impact on facility energy consumption.
//
// Phase 2: replace operatingLoad overload heuristic with the document's
// energy-degradation formula using asset-level Timestream consumption vs
// commissioning baseline: (current_kWh - baseline_kWh) / baseline_kWh.

function scoreEquipmentSustainability(assets: AssetHealthInput[]): EsgDimensionScore {
  const weight = DIMENSION_WEIGHTS.equipment_sustainability

  if (assets.length === 0) {
    return {
      dimension: 'equipment_sustainability',
      label: 'Equipment Sustainability',
      score: 65,
      weight,
      weightedScore: round(65 * weight, 2),
      inputs: { assetCount: 0, note: 'neutral — no asset health data' },
    }
  }

  // Weighted-average health score: critical assets count double
  let totalWeight = 0
  let weightedHealthSum = 0

  for (const asset of assets) {
    const w = asset.isCritical ? 2 : 1
    totalWeight += w
    weightedHealthSum += asset.healthScore * w
  }

  const avgHealthScore = weightedHealthSum / totalWeight

  // Overload penalty: assets running above 80% rated load consume more energy
  // per unit of output — an early indicator of degradation before health score
  // catches up. Each % above the 80% threshold costs 0.4 pts (capped at 15).
  let penaltyTotal = 0
  let penaltyCount = 0

  for (const asset of assets) {
    if (asset.operatingLoad !== null && asset.operatingLoad > 0.80) {
      const overloadPct = (asset.operatingLoad - 0.80) * 100
      penaltyTotal += Math.min(overloadPct * 0.4, 15)
      penaltyCount++
    }
  }

  const avgPenalty = penaltyCount > 0 ? penaltyTotal / penaltyCount : 0
  // Penalty contributes 30% of the dimension adjustment
  const score = clamp(avgHealthScore - avgPenalty * 0.3, 0, 100)

  return {
    dimension: 'equipment_sustainability',
    label: 'Equipment Sustainability',
    score: round(score, 1),
    weight,
    weightedScore: round(score * weight, 2),
    inputs: {
      assetCount: assets.length,
      criticalAssetCount: assets.filter((a) => a.isCritical).length,
      avgHealthScore: round(avgHealthScore, 1),
      overloadPenalty: round(avgPenalty * 0.3, 1),
    },
  }
}

// ─── Renewable Mix ────────────────────────────────────────────────────────────

function scoreRenewableMix(metrics: EnergyMetrics): EsgDimensionScore {
  // Base score = renewable %; bonus for exceeding 30% industry threshold
  const ABOVE_TARGET = Math.max(0, metrics.renewablePct - 30)
  const score = clamp(metrics.renewablePct + ABOVE_TARGET * 0.5, 0, 100)
  const weight = DIMENSION_WEIGHTS.renewable_mix

  return {
    dimension: 'renewable_mix',
    label: 'Renewable Energy Mix',
    score: round(score, 1),
    weight,
    weightedScore: round(score * weight, 2),
    inputs: {
      renewablePct: metrics.renewablePct,
      renewableKwh: metrics.renewableKwh,
      totalKwh: metrics.totalKwh,
    },
  }
}

// ─── Water Efficiency ─────────────────────────────────────────────────────────

function scoreWaterEfficiency(wueRatio: number | null): EsgDimensionScore {
  const score = wueRatio !== null ? wueToScore(wueRatio) : 65 // neutral when no data
  const weight = DIMENSION_WEIGHTS.water_efficiency

  return {
    dimension: 'water_efficiency',
    label: 'Water Efficiency',
    score: clamp(round(score, 1), 0, 100),
    weight,
    weightedScore: round(clamp(score, 0, 100) * weight, 2),
    inputs: { wueRatio },
  }
}

// ─── Operational Reliability ──────────────────────────────────────────────────
//
// Measures operational maturity — how consistently the facility is monitored
// and data is captured. Aligns with the document's "Operational Reliability"
// dimension (10% weight in the document; 5% here given renewable mix is
// kept as an explicit dimension).
//
// Phase 2: incorporate maintenance compliance rate + equipment MTBF data.

function scoreOperationalReliability(dataCompletePct: number): EsgDimensionScore {
  const score = clamp(dataCompletePct, 0, 100)
  const weight = DIMENSION_WEIGHTS.operational_reliability

  return {
    dimension: 'operational_reliability',
    label: 'Operational Reliability',
    score: round(score, 1),
    weight,
    weightedScore: round(score * weight, 2),
    inputs: { dataCompletePct },
  }
}

// ─── Public: composite score ──────────────────────────────────────────────────

export interface ScoreEngineInputs {
  tenantId: string
  facilityId: string | null
  metrics: EnergyMetrics
  emissions: ScopeEmissions
  yoyImprovementPct: number | null   // year-over-year carbon reduction %
  dataCompletePct: number            // 0-100
  assetHealthInputs?: AssetHealthInput[]  // omit to use neutral default (65)
  periodStart: Date
  periodEnd: Date
}

export function computeEsgScore(inputs: ScoreEngineInputs): EsgScoreResult {
  const dimensions: EsgDimensionScore[] = [
    scoreEnergyEfficiency(inputs.metrics),
    scoreCarbonPerformance(inputs.emissions, inputs.metrics, inputs.yoyImprovementPct),
    scoreEquipmentSustainability(inputs.assetHealthInputs ?? []),
    scoreRenewableMix(inputs.metrics),
    scoreWaterEfficiency(inputs.metrics.wueRatio),
    scoreOperationalReliability(inputs.dataCompletePct),
  ]

  const compositeScore = round(
    dimensions.reduce((sum, d) => sum + d.weightedScore, 0),
    1,
  )

  return {
    tenantId: inputs.tenantId,
    facilityId: inputs.facilityId,
    compositeScore,
    dimensions,
    computedAt: new Date(),
    energyMetrics: inputs.metrics,
    emissions: inputs.emissions,
    periodStart: inputs.periodStart,
    periodEnd: inputs.periodEnd,
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
