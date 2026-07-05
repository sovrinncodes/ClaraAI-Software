'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCcw, PauseCircle, PlayCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ViewAsButton } from '@/components/admin/view-as-button'
import type { TenantStatus } from '@/types/admin'

interface TenantActionsProps {
  tenantId: string
  tenantName: string
  status: TenantStatus
  isDemo: boolean
}

const ACTION_BUTTON_CLASS =
  'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ' +
  'disabled:opacity-40 disabled:cursor-not-allowed text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover]'

export function TenantActions({ tenantId, tenantName, status, isDemo }: TenantActionsProps) {
  const router = useRouter()
  const [pendingAction, setPendingAction] = useState<'reseed' | 'status' | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function runAction(action: 'reseed' | 'status') {
    const confirmText =
      action === 'reseed'
        ? `Reset ${tenantName} to its pristine demo scenario? All current operational data is replaced.`
        : status === 'ACTIVE'
          ? `Suspend ${tenantName}? Their users will lose access.`
          : `Reactivate ${tenantName}?`
    if (!window.confirm(confirmText)) return

    setPendingAction(action)
    setMessage(null)
    try {
      const res =
        action === 'reseed'
          ? await fetch(`/api/admin/tenants/${tenantId}/reseed`, { method: 'POST' })
          : await fetch(`/api/admin/tenants/${tenantId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }),
            })
      const body = await res.json()
      if (!body.success) {
        setMessage(body.error ?? 'Action failed')
      } else {
        setMessage(action === 'reseed' ? 'Demo data restored.' : 'Status updated.')
        router.refresh()
      }
    } catch {
      setMessage('Action failed')
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <ViewAsButton tenantId={tenantId} tenantName={tenantName} disabled={status !== 'ACTIVE'} />

      {isDemo && (
        <button
          type="button"
          onClick={() => runAction('reseed')}
          disabled={pendingAction !== null}
          className={cn(ACTION_BUTTON_CLASS)}
          style={{ borderColor: 'var(--border-default)' }}
        >
          {pendingAction === 'reseed' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCcw className="w-3.5 h-3.5" />
          )}
          Reseed demo data
        </button>
      )}

      <button
        type="button"
        onClick={() => runAction('status')}
        disabled={pendingAction !== null}
        className={cn(ACTION_BUTTON_CLASS)}
        style={{ borderColor: 'var(--border-default)' }}
      >
        {pendingAction === 'status' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : status === 'ACTIVE' ? (
          <PauseCircle className="w-3.5 h-3.5" />
        ) : (
          <PlayCircle className="w-3.5 h-3.5" />
        )}
        {status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
      </button>

      {message && (
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </span>
      )}
    </div>
  )
}
