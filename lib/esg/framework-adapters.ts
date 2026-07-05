// Framework adapters: transform a raw EsgScoreResult into framework-specific report structure.
// Each adapter produces a structured object ready for PDF generation or API serialisation.

import { kwhToMj } from './calculators'
import type {
  EsgScoreResult,
  Gri302Report,
  Gri303Report,
  Gri305Report,
  GhgProtocolReport,
  Iso50001Report,
  ReportMetadata,
  ScopeEmissions,
  SignificantEnergyUse,
} from '@/types/esg'

// ─── GRI 302 — Energy ─────────────────────────────────────────────────────────

export function buildGri302Report(
  result: EsgScoreResult,
  facilityName: string,
  baselineKwh: number,
  topConsumers: SignificantEnergyUse[],
): Gri302Report {
  const { energyMetrics, periodStart, periodEnd } = result
  const totalMj = kwhToMj(energyMetrics.totalKwh)
  const renewableMj = kwhToMj(energyMetrics.renewableKwh)
  const gridMj = kwhToMj(energyMetrics.gridKwh)
  const reductionKwh = Math.max(0, baselineKwh - energyMetrics.totalKwh)
  const reductionPct = baselineKwh > 0 ? (reductionKwh / baselineKwh) * 100 : 0

  void periodStart
  void periodEnd

  return {
    framework: 'GRI_302',
    disclosures: {
      gri302_1_energyWithinOrganisation: {
        totalFuelConsumptionMj: totalMj - gridMj - renewableMj,
        renewableElecKwh: energyMetrics.renewableKwh,
        nonRenewableElecKwh: energyMetrics.gridKwh,
        totalEnergyConsumptionMj: totalMj,
        coolingKwh: estimateCoolingLoad(energyMetrics.pueRatio, energyMetrics.totalKwh),
        heatingKwh: 0, // negligible in SA climate
      },
      gri302_3_energyIntensity: {
        energyIntensityKwhPerSqm: energyMetrics.energyIntensityKwhPerSqm ?? 0,
        denominator: 'm² gross floor area',
        energyTypesIncluded: ['electricity (renewable)', 'electricity (grid)', 'diesel (generators)'],
      },
      gri302_4_reductionOfEnergyConsumption: {
        reductionKwh: Math.round(reductionKwh),
        reductionPct: Math.round(reductionPct * 10) / 10,
        initiativesCount: topConsumers.length > 0 ? Math.ceil(topConsumers.length / 2) : 0,
      },
    },
    metadata: buildMetadata(result, facilityName, 'GRI_302'),
  }
}

// ─── GRI 303 — Water and Effluents ────────────────────────────────────────────
//
// Required disclosures: 303-3 (withdrawal), 303-4 (discharge), 303-5 (consumption).
// Cooling tower water balance uses data-centre industry assumptions:
//   ~50% evaporative loss (consumed), ~15% blowdown (discharged), ~35% other discharge.
// Phase 2: replace estimates with real sub-meter readings from IoT water meters.

export function buildGri303Report(
  result: EsgScoreResult,
  facilityName: string,
  waterInputs: Array<{ usageKl: number; source: string }>,
  facilityAreaSqm: number | null,
): Gri303Report {
  void facilityAreaSqm

  const totalWithdrawalKl = waterInputs.reduce((s, w) => s + w.usageKl, 0)

  // Aggregate withdrawal volume by source
  const sourceMap = new Map<string, number>()
  for (const w of waterInputs) {
    sourceMap.set(w.source, (sourceMap.get(w.source) ?? 0) + w.usageKl)
  }

  const bySource = Array.from(sourceMap.entries()).map(([source, volumeKl]) => ({
    source: source.charAt(0).toUpperCase() + source.slice(1),
    volumeKl: round(volumeKl, 0),
    sharePct: round(totalWithdrawalKl > 0 ? (volumeKl / totalWithdrawalKl) * 100 : 0, 1),
  }))

  if (bySource.length === 0) {
    bySource.push({ source: 'Municipal', volumeKl: totalWithdrawalKl, sharePct: 100 })
  }

  // Data centre cooling tower water balance
  const evaporativeLossKl = round(totalWithdrawalKl * 0.50, 0)
  const coolingTowerBlowdownKl = round(totalWithdrawalKl * 0.15, 0)
  const totalDischargeKl = round(coolingTowerBlowdownKl + totalWithdrawalKl * 0.20, 0)
  const totalConsumptionKl = round(Math.max(0, totalWithdrawalKl - totalDischargeKl), 0)

  return {
    framework: 'GRI_303',
    disclosures: {
      gri303_3_waterWithdrawal: {
        totalWithdrawalKl,
        bySource,
        scope3EmissionsTco2e: result.emissions.scope3Tco2e,
      },
      gri303_4_waterDischarge: {
        totalDischargeKl,
        coolingTowerBlowdownKl,
        evaporativeLossKl,
      },
      gri303_5_waterConsumption: {
        totalConsumptionKl,
        wueRatio: result.energyMetrics.wueRatio,
        withdrawalMinusDischargeKl: totalConsumptionKl,
      },
    },
    metadata: buildMetadata(result, facilityName, 'GRI_303'),
  }
}

// ─── GRI 305 — Emissions ──────────────────────────────────────────────────────
//
// Disclosures: 305-1 (Scope 1 direct), 305-2 (Scope 2 indirect),
//              305-4 (intensity), 305-5 (reduction vs prior year, optional).
// Emission factor source: DFFE 2023 South Africa National GHG Inventory.
// SA grid factor: 0.9006 kgCO2e/kWh — location-based per Eskom published data.

export function buildGri305Report(
  result: EsgScoreResult,
  facilityName: string,
  emissions: ScopeEmissions,
  gridFactor: number,
  marketBasedTco2e: number | null,
  facilityAreaSqm: number | null,
  previousYearTco2e: number | null,
): Gri305Report {
  const { energyMetrics } = result
  const totalMwh = energyMetrics.totalKwh / 1000

  const tco2ePerMwh =
    totalMwh > 0
      ? round((emissions.scope1Tco2e + emissions.scope2Tco2e) / totalMwh, 4)
      : 0

  const tco2ePerSqm =
    facilityAreaSqm && facilityAreaSqm > 0
      ? round((emissions.scope1Tco2e + emissions.scope2Tco2e) / facilityAreaSqm, 4)
      : 0

  const reductionTco2e =
    previousYearTco2e !== null
      ? round(previousYearTco2e - emissions.totalTco2e, 3)
      : null

  const reductionPct =
    previousYearTco2e !== null && previousYearTco2e > 0 && reductionTco2e !== null
      ? round((reductionTco2e / previousYearTco2e) * 100, 1)
      : null

  return {
    framework: 'GRI_305',
    disclosures: {
      gri305_1_directEmissions: {
        scope1Tco2e: emissions.scope1Tco2e,
        fuelCombustionTco2e: round(emissions.scope1Tco2e * 0.6, 3),
        refrigerantLeakageTco2e: round(emissions.scope1Tco2e * 0.4, 3),
        emissionFactorSources: [
          'DFFE 2023 South Africa National GHG Inventory',
          'IPCC AR5 GWP100 (refrigerants)',
        ],
      },
      gri305_2_energyIndirectEmissions: {
        scope2LocationBasedTco2e: emissions.scope2Tco2e,
        scope2MarketBasedTco2e: marketBasedTco2e ?? emissions.scope2Tco2e,
        gridEmissionFactorKgCo2ePerKwh: gridFactor,
        electricityKwh: energyMetrics.gridKwh,
      },
      gri305_4_emissionsIntensity: {
        tco2ePerMwh,
        tco2ePerSqm,
        scopesIncluded: ['Scope 1', 'Scope 2 (location-based)'],
      },
      ...(reductionTco2e !== null &&
        reductionPct !== null &&
        previousYearTco2e !== null && {
          gri305_5_emissionsReduction: {
            baseYearTco2e: previousYearTco2e,
            reportingYearTco2e: emissions.totalTco2e,
            reductionTco2e,
            reductionPct,
          },
        }),
    },
    metadata: buildMetadata(result, facilityName, 'GRI_305'),
  }
}

// ─── GHG Protocol ────────────────────────────────────────────────────────────

export function buildGhgProtocolReport(
  result: EsgScoreResult,
  facilityName: string,
  emissions: ScopeEmissions,
  gridFactor: number,
  marketBasedTco2e: number | null,
  facilityAreaSqm: number | null,
  employeeCount: number | null,
): GhgProtocolReport {
  const { energyMetrics } = result
  const totalMwh = energyMetrics.totalKwh / 1000

  return {
    framework: 'GHG_PROTOCOL',
    scope1: {
      totalTco2e: emissions.scope1Tco2e,
      fuelCombustionTco2e: round(emissions.scope1Tco2e * 0.6, 3),
      refrigerantLeakageTco2e: round(emissions.scope1Tco2e * 0.4, 3),
      breakdown: [
        { source: 'Diesel generators', tco2e: round(emissions.scope1Tco2e * 0.6, 3) },
        { source: 'Refrigerant leakage', tco2e: round(emissions.scope1Tco2e * 0.4, 3) },
      ],
    },
    scope2: {
      totalTco2e: emissions.scope2Tco2e,
      locationBasedTco2e: emissions.scope2Tco2e,
      marketBasedTco2e: marketBasedTco2e ?? emissions.scope2Tco2e,
      gridFactor,
      electricityKwh: energyMetrics.gridKwh,
    },
    scope3: {
      totalTco2e: emissions.scope3Tco2e,
      waterSupplyTco2e: round(emissions.scope3Tco2e * 0.9, 3),
      wasteDisposalTco2e: round(emissions.scope3Tco2e * 0.05, 3),
      upstreamEnergyTco2e: round(emissions.scope3Tco2e * 0.05, 3),
    },
    totalTco2e: emissions.totalTco2e,
    intensity: {
      tco2ePerMwh: totalMwh > 0 ? round(emissions.totalTco2e / totalMwh, 4) : 0,
      tco2ePerSqm:
        facilityAreaSqm && facilityAreaSqm > 0
          ? round(emissions.totalTco2e / facilityAreaSqm, 4)
          : 0,
      tco2ePerEmployee:
        employeeCount && employeeCount > 0
          ? round(emissions.totalTco2e / employeeCount, 2)
          : null,
    },
    metadata: buildMetadata(result, facilityName, 'GHG_PROTOCOL'),
  }
}

// ─── ISO 50001 ────────────────────────────────────────────────────────────────

export function buildIso50001Report(
  result: EsgScoreResult,
  facilityName: string,
  baselineKwh: number,
  topConsumers: SignificantEnergyUse[],
): Iso50001Report {
  const { energyMetrics } = result
  const improvementKwh = Math.max(0, baselineKwh - energyMetrics.totalKwh)
  const improvementPct =
    baselineKwh > 0 ? (improvementKwh / baselineKwh) * 100 : 0

  return {
    framework: 'ISO_50001',
    baselineKwh,
    reportingKwh: energyMetrics.totalKwh,
    improvementKwh: Math.round(improvementKwh),
    improvementPct: round(improvementPct, 1),
    significantEnergyUses: topConsumers,
    pueRatio: energyMetrics.pueRatio,
    metadata: buildMetadata(result, facilityName, 'ISO_50001'),
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildMetadata(
  result: EsgScoreResult,
  facilityName: string,
  framework: ReportMetadata['framework'],
): ReportMetadata {
  void facilityName
  return {
    tenantId: result.tenantId,
    facilityId: result.facilityId ?? '',
    periodStart: result.periodStart,
    periodEnd: result.periodEnd,
    generatedAt: new Date(),
    dataCompletePct:
      result.dimensions.find((d) => d.dimension === 'operational_reliability')?.score ??
      result.dimensions.find((d) => d.dimension === 'reporting_completeness')?.score ??
      80,
    reportId: `REP-${Date.now()}`,
    framework,
  }
}

function estimateCoolingLoad(pue: number | null, totalKwh: number): number {
  if (pue === null) return 0
  // IT load = total / PUE; cooling ≈ total − IT load
  const itKwh = totalKwh / pue
  return Math.max(0, Math.round(totalKwh - itKwh))
}

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}
