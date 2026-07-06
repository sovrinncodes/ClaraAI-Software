import type { Metadata } from 'next'
import { Radio, Activity } from 'lucide-react'
import { adminGetPlatformStatus } from '@/lib/db/queries/admin/platform-status'
import { ModelHealthCard } from '@/components/admin/model-health-card'
import { formatTimeAgo } from '@/lib/utils/format'

export const metadata: Metadata = { title: 'Platform Health' }
export const dynamic = 'force-dynamic'

export default async function AdminHealthPage() {
  const status = await adminGetPlatformStatus()
  const configuredCount = status.models.filter((m) => m.state === 'configured').length
  const applicableCount = status.models.filter((m) => m.state !== 'not_applicable').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Platform Health
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Infrastructure and model endpoint status across Clara AI.
        </p>
      </div>

      {/* Ingestion KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="rounded-[10px] border p-5"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
          <div className="flex justify-between items-start mb-3">
            <span
              className="text-[10px] font-medium uppercase tracking-widest"
              style={{ color: 'var(--text-secondary)' }}
            >
              Model Endpoints
            </span>
            <Activity className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="font-mono text-3xl font-light" style={{ color: 'var(--text-primary)' }}>
            {configuredCount}/{applicableCount}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            configured (env-based check)
          </p>
        </div>

        <div
          className="rounded-[10px] border p-5"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
          <div className="flex justify-between items-start mb-3">
            <span
              className="text-[10px] font-medium uppercase tracking-widest"
              style={{ color: 'var(--text-secondary)' }}
            >
              Ingestion Events (24h)
            </span>
            <Radio className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="font-mono text-3xl font-light" style={{ color: 'var(--text-primary)' }}>
            {status.ingestionEventsLast24h}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            health score writes across all tenants
          </p>
        </div>

        <div
          className="rounded-[10px] border p-5"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
          <div className="flex justify-between items-start mb-3">
            <span
              className="text-[10px] font-medium uppercase tracking-widest"
              style={{ color: 'var(--text-secondary)' }}
            >
              Last Ingestion
            </span>
            <Radio className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="font-mono text-xl font-light" style={{ color: 'var(--text-primary)' }}>
            {status.lastIngestionAt ? formatTimeAgo(status.lastIngestionAt) : 'never'}
          </div>
        </div>
      </div>

      {/* Model endpoint cards */}
      <div>
        <p
          className="text-[10px] font-medium uppercase tracking-widest mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          The Ten Clara AI Models
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {status.models.map((model) => (
            <ModelHealthCard key={model.name} name={model.name} state={model.state} />
          ))}
        </div>
      </div>

      {/* Replay engine stub — infra lands in Phase 2 */}
      <div
        className="rounded-[10px] border border-dashed p-4 flex items-start gap-3"
        style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-surface)' }}
      >
        <Radio className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Telemetry Replay Engine —{' '}
            <span style={{ color: status.replayEngineConnected ? 'var(--status-optimal)' : 'var(--status-advisory)' }}>
              {status.replayEngineConnected ? 'connected' : 'not deployed'}
            </span>
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            The Fargate replay engine, IoT Core ingestion, and SageMaker endpoint pings are
            separate infrastructure that hasn&apos;t been provisioned yet. This page will show
            live health once that infra deploys.
          </p>
        </div>
      </div>
    </div>
  )
}
