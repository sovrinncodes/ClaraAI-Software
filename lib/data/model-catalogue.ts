// User-facing model names only — never expose technical names (CLAUDE.md §7).
// Endpoint health is stubbed until SageMaker/CloudWatch wiring lands (Phase 2 infra).

export interface ModelCatalogueEntry {
  name: string
  // null = not a SageMaker endpoint (e.g. rule-based / LLM orchestration)
  envVar: string | null
}

export const MODEL_CATALOGUE: ModelCatalogueEntry[] = [
  { name: 'Failure Forecast', envVar: 'SAGEMAKER_ENDPOINT_FAILURE_FORECAST' },
  { name: 'Fault Type Identifier', envVar: 'SAGEMAKER_ENDPOINT_FAULT_TYPE_IDENTIFIER' },
  { name: 'Energy Baseline', envVar: 'SAGEMAKER_ENDPOINT_ENERGY_BASELINE' },
  { name: 'Energy Waste Detector', envVar: 'SAGEMAKER_ENDPOINT_ENERGY_WASTE_DETECTOR' },
  { name: 'Sound Health Monitor', envVar: 'SAGEMAKER_ENDPOINT_SOUND_HEALTH_MONITOR' },
  { name: 'Safe Operating Range', envVar: 'SAGEMAKER_ENDPOINT_SAFE_OPERATING_RANGE' },
  { name: 'Clara AI Insights', envVar: null },
  { name: 'PUE Optimiser', envVar: 'SAGEMAKER_ENDPOINT_PUE_OPTIMISER' },
  { name: 'Hot Spot Tracker', envVar: 'SAGEMAKER_ENDPOINT_HOT_SPOT_TRACKER' },
  { name: 'Power Quality Guard', envVar: 'SAGEMAKER_ENDPOINT_POWER_QUALITY_GUARD' },
]
