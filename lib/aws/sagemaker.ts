import {
  SageMakerRuntimeClient,
  InvokeEndpointCommand,
} from '@aws-sdk/client-sagemaker-runtime'

const client = new SageMakerRuntimeClient({
  region: process.env.AWS_REGION ?? 'af-south-1',
})

// Maps user-facing model names to env var endpoint names
const ENDPOINT_ENV_KEYS: Record<string, string> = {
  'Failure Forecast': 'SAGEMAKER_ENDPOINT_FAILURE_FORECAST',
  'Fault Type Identifier': 'SAGEMAKER_ENDPOINT_FAULT_TYPE_IDENTIFIER',
  'Energy Baseline': 'SAGEMAKER_ENDPOINT_ENERGY_BASELINE',
  'Energy Waste Detector': 'SAGEMAKER_ENDPOINT_ENERGY_WASTE_DETECTOR',
  'Sound Health Monitor': 'SAGEMAKER_ENDPOINT_SOUND_HEALTH_MONITOR',
  'Safe Operating Range': 'SAGEMAKER_ENDPOINT_SAFE_OPERATING_RANGE',
  'Clara AI Insights': 'SAGEMAKER_ENDPOINT_CLARA_AI_INSIGHTS',
  'PUE Optimiser': 'SAGEMAKER_ENDPOINT_PUE_OPTIMISER',
  'Hot Spot Tracker': 'SAGEMAKER_ENDPOINT_HOT_SPOT_TRACKER',
  'Power Quality Guard': 'SAGEMAKER_ENDPOINT_POWER_QUALITY_GUARD',
}

export interface InferenceInput {
  modelName: string
  payload: Record<string, unknown>
}

export interface InferenceResult {
  modelName: string
  output: Record<string, unknown>
  latencyMs: number
}

export async function invokeModel(input: InferenceInput): Promise<InferenceResult> {
  const envKey = ENDPOINT_ENV_KEYS[input.modelName]
  if (!envKey) throw new Error(`Unknown model: ${input.modelName}`)

  const endpointName = process.env[envKey]
  if (!endpointName) throw new Error(`Endpoint not configured for model: ${input.modelName}`)

  const start = Date.now()

  const command = new InvokeEndpointCommand({
    EndpointName: endpointName,
    ContentType: 'application/json',
    Body: Buffer.from(JSON.stringify(input.payload)),
  })

  const response = await client.send(command)
  const raw = response.Body ? new TextDecoder().decode(response.Body as Uint8Array) : '{}'

  return {
    modelName: input.modelName,
    output: JSON.parse(raw),
    latencyMs: Date.now() - start,
  }
}

// Convenience wrappers for each model

export async function runFailureForecast(assetId: string, vibrationSeries: number[]) {
  return invokeModel({
    modelName: 'Failure Forecast',
    payload: { assetId, vibrationSeries },
  })
}

export async function runEnergyBaseline(facilityId: string, features: Record<string, number>) {
  return invokeModel({
    modelName: 'Energy Baseline',
    payload: { facilityId, features },
  })
}

export async function runEnergyWasteDetector(facilityId: string, readings: number[]) {
  return invokeModel({
    modelName: 'Energy Waste Detector',
    payload: { facilityId, readings },
  })
}

export async function runFaultTypeIdentifier(assetId: string, fftSpectrum: number[]) {
  return invokeModel({
    modelName: 'Fault Type Identifier',
    payload: { assetId, fftSpectrum },
  })
}
