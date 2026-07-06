'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { TenantFeatureFlags } from '@/types/admin'

interface TenantSettingsPanelProps {
  tenantId: string
  plan: string
  featureFlags: TenantFeatureFlags
}

function FlagToggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative w-9 h-5 rounded-full transition-colors shrink-0"
        style={{
          backgroundColor: checked ? 'var(--accent-primary-muted)' : 'var(--bg-elevated)',
          border: `1px solid ${checked ? 'rgba(0,212,170,0.35)' : 'var(--border-default)'}`,
        }}
      >
        <span
          className="absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all"
          style={{
            left: checked ? 'calc(100% - 18px)' : '2px',
            backgroundColor: checked ? 'var(--accent-primary)' : 'var(--text-muted)',
          }}
        />
      </button>
    </label>
  )
}

export function TenantSettingsPanel({ tenantId, plan, featureFlags }: TenantSettingsPanelProps) {
  const router = useRouter()
  const [draftPlan, setDraftPlan] = useState(plan)
  const [draftFlags, setDraftFlags] = useState<TenantFeatureFlags>(featureFlags)
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const isDirty =
    draftPlan !== plan ||
    draftFlags.acousticMonitor !== featureFlags.acousticMonitor ||
    draftFlags.hotSpotTracker !== featureFlags.hotSpotTracker

  async function save() {
    setIsPending(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: draftPlan, featureFlags: draftFlags }),
      })
      const payload = await res.json()
      if (payload.success) {
        setMessage('Saved.')
        router.refresh()
      } else {
        setMessage(payload.error ?? 'Save failed')
      }
    } catch {
      setMessage('Save failed')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="px-4 py-3 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Plan
        </span>
        <select
          value={draftPlan}
          onChange={(event) => setDraftPlan(event.target.value)}
          className="rounded-md border px-2 py-1 text-xs outline-none"
          style={{
            borderColor: 'var(--border-default)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="trial">Trial</option>
          <option value="starter">Starter</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      <FlagToggle
        label="Sound Health Monitor"
        checked={draftFlags.acousticMonitor}
        onChange={(value) => setDraftFlags({ ...draftFlags, acousticMonitor: value })}
      />
      <FlagToggle
        label="Hot Spot Tracker"
        checked={draftFlags.hotSpotTracker}
        onChange={(value) => setDraftFlags({ ...draftFlags, hotSpotTracker: value })}
      />

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={save}
          disabled={!isDirty || isPending}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
            'disabled:opacity-40 text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover]'
          )}
          style={{ borderColor: 'var(--border-default)' }}
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save settings
        </button>
        {message && (
          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
            {message}
          </span>
        )}
      </div>
    </div>
  )
}
