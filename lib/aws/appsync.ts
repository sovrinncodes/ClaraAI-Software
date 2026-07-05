// AppSync client for GraphQL subscriptions over WebSocket.
// Used by real-time hooks in hooks/use-real-time-alerts.ts etc.

export interface AppSyncConfig {
  endpoint: string
  region: string
  apiKey: string
}

export function getAppSyncConfig(): AppSyncConfig {
  const endpoint = process.env.NEXT_PUBLIC_APPSYNC_ENDPOINT
  const region = process.env.NEXT_PUBLIC_APPSYNC_REGION ?? 'af-south-1'
  const apiKey = process.env.NEXT_PUBLIC_APPSYNC_API_KEY

  if (!endpoint || !apiKey) {
    throw new Error('AppSync endpoint and API key must be configured')
  }

  return { endpoint, region, apiKey }
}

// Subscription query templates — consumed by real-time hooks
export const SUBSCRIPTIONS = {
  onAlertCreated: (tenantId: string) => `
    subscription OnAlertCreated {
      onAlertCreated(tenantId: "${tenantId}") {
        id
        tenantId
        facilityId
        assetId
        severity
        status
        modelName
        title
        description
        predictedTtfDays
        createdAt
      }
    }
  `,

  onHealthScoreUpdated: (facilityId: string) => `
    subscription OnHealthScoreUpdated {
      onHealthScoreUpdated(facilityId: "${facilityId}") {
        assetId
        score
        predictedTtfDays
        faultType
        recordedAt
      }
    }
  `,

  onTelemetryReceived: (facilityId: string) => `
    subscription OnTelemetryReceived {
      onTelemetryReceived(facilityId: "${facilityId}") {
        timestamp
        facilityId
        actualKwh
        baselineKwh
        deviationPct
        anomalyFlag
      }
    }
  `,
} as const
