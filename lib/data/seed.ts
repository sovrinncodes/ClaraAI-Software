import type { Facility } from '@/types/facility'
import type { Asset } from '@/types/asset'
import type { Alert } from '@/types/alert'
import type { HealthDegradationPoint } from '@/types/health'
import type { EnergyReading } from '@/types/telemetry'

// ─── Facilities ───────────────────────────────────────────────────────────────

export const DEMO_FACILITIES: Facility[] = [
  {
    id: 'fac_jhb_dc_01',
    externalId: 'JHB-DC-01',
    name: 'Johannesburg DC-1',
    type: 'DATA_CENTER',
    status: 'OPTIMAL',
    city: 'Johannesburg',
    region: 'Gauteng',
    healthScore: 94,
    pueRatio: 1.24,
    energyDrawKw: 1800,
    activeAlerts: { critical: 0, advisory: 1, watch: 2 },
    monitoredAssets: { total: 42, online: 42 },
    uptimeMtdPct: 99.9,
  },
  {
    id: 'fac_cpt_mfg_01',
    externalId: 'CPT-MFG-01',
    name: 'Cape Town Assembly',
    type: 'MANUFACTURING',
    status: 'CRITICAL',
    city: 'Cape Town',
    region: 'Western Cape',
    healthScore: 72,
    pueRatio: 1.45,
    energyDrawKw: 4200,
    activeAlerts: { critical: 2, advisory: 4, watch: 4 },
    monitoredAssets: { total: 120, online: 118 },
    uptimeMtdPct: 96.2,
  },
  {
    id: 'fac_pta_hq_01',
    externalId: 'PTA-HQ-01',
    name: 'Pretoria HQ',
    type: 'COMMERCIAL',
    status: 'ADVISORY',
    city: 'Pretoria',
    region: 'Gauteng',
    healthScore: 88,
    energyDrawKw: 640,
    activeAlerts: { critical: 0, advisory: 3, watch: 1 },
    monitoredAssets: { total: 28, online: 28 },
    uptimeMtdPct: 99.1,
  },
  {
    id: 'fac_dbn_log_01',
    externalId: 'DBN-LOG-01',
    name: 'Durban Logistics Hub',
    type: 'LOGISTICS',
    status: 'OPTIMAL',
    city: 'Durban',
    region: 'KwaZulu-Natal',
    healthScore: 98,
    energyDrawKw: 840,
    activeAlerts: { critical: 0, advisory: 0, watch: 1 },
    monitoredAssets: { total: 34, online: 34 },
    uptimeMtdPct: 100,
  },
]

// ─── Key Demo Asset: CHL-01 ────────────────────────────────────────────────────

export const DEMO_CHL01: Asset = {
  id: 'asset_chl_01',
  externalId: 'CHL-01',
  facilityId: 'fac_jhb_dc_01',
  name: 'CHL-01 (Main Chiller Unit)',
  type: 'CHILLER',
  manufacturer: 'Carrier',
  model: 'AquaEdge',
  serialNumber: '8492-AX-99',
  healthScore: 82,
  status: 'ADVISORY',
  predictedTtfDays: 45,
  faultType: 'Stage 2 Compressor Shaft Bearing Wear',
  faultConfidence: 0.894,
  vibrationRms: 4.8,
  operatingLoadPct: 88,
  isoZone: 'D',
  isCritical: true,
  locationInFacility: 'Plant Room A',
}

// ─── Asset Watchlist (health < 85 or active alert) ───────────────────────────

export const DEMO_WATCHLIST_ASSETS: (Asset & { facilityName: string; energyDrawKw: number })[] = [
  {
    ...DEMO_CHL01,
    facilityName: 'Johannesburg DC-1',
    energyDrawKw: 45.2,
  },
  {
    id: 'asset_crac_02',
    externalId: 'CRAC-02',
    facilityId: 'fac_cpt_mfg_01',
    name: 'CRAC-02 (Computer Room Air Conditioning)',
    type: 'CRAC_UNIT',
    healthScore: 71,
    status: 'CRITICAL',
    predictedTtfDays: 12,
    faultType: 'Compressor Overheat',
    faultConfidence: 0.91,
    vibrationRms: 6.1,
    operatingLoadPct: 97,
    isoZone: 'D',
    isCritical: true,
    facilityName: 'Cape Town Assembly',
    energyDrawKw: 22.4,
  },
  {
    id: 'asset_ups_b',
    externalId: 'UPS-B',
    facilityId: 'fac_cpt_mfg_01',
    name: 'UPS-B (Uninterruptible Power Supply)',
    type: 'UPS',
    healthScore: 78,
    status: 'ADVISORY',
    predictedTtfDays: 31,
    faultType: 'Battery Cell Degradation',
    faultConfidence: 0.76,
    operatingLoadPct: 82,
    isCritical: true,
    facilityName: 'Cape Town Assembly',
    energyDrawKw: 18.1,
  },
  {
    id: 'asset_ahu_03',
    externalId: 'AHU-03',
    facilityId: 'fac_pta_hq_01',
    name: 'AHU-03 (Air Handling Unit)',
    type: 'AHU',
    healthScore: 84,
    status: 'ADVISORY',
    predictedTtfDays: 58,
    faultType: 'Fan Belt Wear',
    faultConfidence: 0.68,
    vibrationRms: 2.9,
    operatingLoadPct: 71,
    isoZone: 'C',
    isCritical: false,
    facilityName: 'Pretoria HQ',
    energyDrawKw: 8.7,
  },
]

// ─── Live Alerts ──────────────────────────────────────────────────────────────

const now = new Date()
const minsAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString()

export const DEMO_ALERTS: Alert[] = [
  {
    id: 'ALR-8924',
    tenantId: 'tenant_cpt',
    facilityId: 'fac_jhb_dc_01',
    assetId: 'asset_chl_01',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    modelName: 'ML Engine',
    title: 'Anomalous Vibration Detected',
    description: 'Vibration amplitude exceeded 0.8 IPS. Predicted failure window narrowed to ~72 hours.',
    recommendation: 'Perform immediate alignment check. Verify bearing lubrication. Limit operating load to 60%.',
    predictedTtfDays: 3,
    createdAt: minsAgo(10),
    updatedAt: minsAgo(10),
  },
  {
    id: 'ALR-8925',
    tenantId: 'tenant_cpt',
    facilityId: 'fac_jhb_dc_01',
    assetId: 'asset_crac_04',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    modelName: 'Failure Forecast',
    title: 'Refrigerant Pressure Drop',
    description: 'Sudden pressure drop detected in cooling loop B. Immediate inspection required.',
    recommendation: 'Inspect refrigeration lines for leaks. Check expansion valve calibration.',
    predictedTtfDays: 2,
    createdAt: minsAgo(60),
    updatedAt: minsAgo(60),
  },
  {
    id: 'ALR-8926',
    tenantId: 'tenant_cpt',
    facilityId: 'fac_jhb_dc_01',
    assetId: 'asset_gen_02',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    modelName: 'Start Sequence Monitor',
    title: 'Generator Start Failure',
    description: 'Backup generator failed routine start sequence test.',
    recommendation: 'Check battery voltage and starter motor contacts. Verify fuel level and supply pressure.',
    createdAt: minsAgo(120),
    updatedAt: minsAgo(120),
  },
  {
    id: 'ALR-8927',
    tenantId: 'tenant_cpt',
    facilityId: 'fac_jhb_dc_01',
    assetId: 'asset_ahu_12',
    severity: 'ADVISORY',
    status: 'ACKNOWLEDGED',
    modelName: 'Pressure Drop Analyzer',
    title: 'Filter Resistance High',
    description: 'Airflow resistance approaching scheduled maintenance threshold.',
    recommendation: 'Schedule filter replacement during next maintenance window.',
    createdAt: minsAgo(240),
    updatedAt: minsAgo(240),
  },
  {
    id: 'ALR-8928',
    tenantId: 'tenant_cpt',
    facilityId: 'fac_jhb_dc_01',
    severity: 'ADVISORY',
    status: 'ACKNOWLEDGED',
    modelName: 'PUE Optimiser',
    title: 'PUE Target Exceeded',
    description: 'Facility PUE rose above 1.50 for 2 consecutive hours.',
    recommendation: 'Verify chiller sequencing and cooling tower operating status.',
    createdAt: minsAgo(1440),
    updatedAt: minsAgo(1440),
  }
]

// ─── Portfolio KPIs ────────────────────────────────────────────────────────────

export const PORTFOLIO_KPIS = {
  esgInsightScore: 78.4,
  esgTrend: +2.1,
  portfolioHealthIndex: 88.0,
  healthTrend: -1.4,
  energyOptimisedMwhMtd: 42.3,
  energySavingsZar: 127400,
  activeAlertCount: 16,
  criticalAlertCount: 2,
  advisoryAlertCount: 8,
  totalFacilities: 4,
  totalAssets: 224,
  onlineAssets: 222,
}

// ─── ESG Sparkline (last 7 days) ──────────────────────────────────────────────

export const ESG_SPARKLINE = [74.1, 75.2, 76.0, 76.8, 77.9, 78.1, 78.4]

export const HEALTH_SPARKLINE = [91.2, 90.8, 90.1, 89.5, 88.9, 88.4, 88.0]

export const ENERGY_SPARKLINE = [5.2, 6.1, 4.8, 7.3, 5.9, 4.2, 5.6]

export const ALERTS_SPARKLINE = [9, 11, 13, 10, 14, 15, 16]

// ─── CHL-01 Health Degradation Curve ─────────────────────────────────────────

export const CHL01_HEALTH_CURVE: HealthDegradationPoint[] = [
  { date: '-7d', score: 95, isActual: true },
  { date: '-6d', score: 94, isActual: true },
  { date: '-5d', score: 93, isActual: true },
  { date: '-4d', score: 91, isActual: true },
  { date: '-3d', score: 90, isActual: true },
  { date: '-2d', score: 87, isActual: true, hasEvent: true, eventLabel: 'Vibration Spike' },
  { date: '-1d', score: 84, isActual: true },
  { date: 'Today', score: 82, isActual: true },
  { date: '+5d', score: 79, isActual: false, confidenceHigh: 82, confidenceLow: 76 },
  { date: '+10d', score: 76, isActual: false, confidenceHigh: 80, confidenceLow: 72 },
  { date: '+20d', score: 70, isActual: false, confidenceHigh: 75, confidenceLow: 64 },
  { date: '+30d', score: 62, isActual: false, confidenceHigh: 68, confidenceLow: 55 },
  { date: '+45d', score: 40, isActual: false, confidenceHigh: 50, confidenceLow: 30 },
]

// ─── 24H Telemetry (96 × 15-min intervals) ───────────────────────────────────

function generateTelemetry(): EnergyReading[] {
  const readings: EnergyReading[] = []
  const baseDate = new Date()
  baseDate.setHours(0, 0, 0, 0)

  for (let i = 0; i < 96; i++) {
    const ts = new Date(baseDate.getTime() + i * 15 * 60000)
    const hour = ts.getHours()

    // Base load follows a daily curve: lower at night, peaks mid-morning and afternoon
    const dayFactor = Math.sin(((hour - 6) / 24) * Math.PI * 2) * 0.8 + 1.0
    const noise = (Math.random() - 0.5) * 0.15
    const actualKwh = Math.max(6.1, Math.min(8.8, (7.48 * dayFactor + noise)))

    const baselineKwh = 7.48 * dayFactor
    const deviationPct = ((actualKwh - baselineKwh) / baselineKwh) * 100
    const anomalyFlag = Math.abs(deviationPct) > 8

    readings.push({
      timestamp: ts.toISOString(),
      facilityId: 'all',
      actualKwh,
      baselineKwh,
      deviationPct,
      anomalyFlag,
    })
  }
  return readings
}

export const TELEMETRY_24H = generateTelemetry()
