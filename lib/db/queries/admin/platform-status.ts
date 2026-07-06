import { prisma } from '@/lib/db/client'
import { MODEL_CATALOGUE } from '@/lib/data/model-catalogue'

export type ModelHealthState = 'configured' | 'not_configured' | 'not_applicable'

export interface ModelHealthCard {
  name: string
  state: ModelHealthState
}

export interface PlatformStatus {
  models: ModelHealthCard[]
  replayEngineConnected: boolean
  ingestionEventsLast24h: number
  lastIngestionAt: string | null
}

/**
 * Infrastructure health for the platform. Model endpoint health is a
 * configuration check (env var present), not a live SageMaker ping — real
 * health checks land when SageMaker/CloudWatch wiring goes in (Phase 2).
 * Ingestion counts use HealthScore.recordedAt as the closest live signal
 * to telemetry activity available before the replay engine deploys.
 */
export async function adminGetPlatformStatus(): Promise<PlatformStatus> {
  const models: ModelHealthCard[] = MODEL_CATALOGUE.map((entry) => ({
    name: entry.name,
    state:
      entry.envVar === null
        ? 'not_applicable'
        : process.env[entry.envVar]
          ? 'configured'
          : 'not_configured',
  }))

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const [ingestionEventsLast24h, latestHealthScore] = await Promise.all([
    prisma.healthScore.count({ where: { recordedAt: { gte: since } } }),
    prisma.healthScore.findFirst({ orderBy: { recordedAt: 'desc' }, select: { recordedAt: true } }),
  ])

  return {
    models,
    // The Fargate replay engine is separate infra that hasn't been deployed yet
    // (CLAUDE.md §17) — always false until that service exists and is pingable.
    replayEngineConnected: false,
    ingestionEventsLast24h,
    lastIngestionAt: latestHealthScore?.recordedAt.toISOString() ?? null,
  }
}
