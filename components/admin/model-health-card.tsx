import { CheckCircle2, CircleDashed, MinusCircle } from 'lucide-react'
import type { ModelHealthState } from '@/lib/db/queries/admin/platform-status'

const STATE_META: Record<
  ModelHealthState,
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  configured: { label: 'Configured', color: 'var(--status-optimal)', icon: CheckCircle2 },
  not_configured: { label: 'Not configured', color: 'var(--status-advisory)', icon: CircleDashed },
  not_applicable: { label: 'Rule-based', color: 'var(--text-muted)', icon: MinusCircle },
}

export function ModelHealthCard({ name, state }: { name: string; state: ModelHealthState }) {
  const meta = STATE_META[state]
  const Icon = meta.icon

  return (
    <div
      className="rounded-[10px] border p-4 flex items-start gap-3"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: meta.color }} />
      <div className="min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          {name}
        </p>
        <p className="text-[10px] font-mono mt-0.5" style={{ color: meta.color }}>
          {meta.label}
        </p>
      </div>
    </div>
  )
}
