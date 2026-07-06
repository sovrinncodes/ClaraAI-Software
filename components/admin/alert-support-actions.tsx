'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface AlertSupportActionsProps {
  alertId: string
  status: string
}

const ACTION_CLASS =
  'rounded border px-1.5 py-0.5 text-[10px] font-medium transition-colors disabled:opacity-40 ' +
  'text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-hover]'

/** Support tool: resolve or mark alerts false-positive on behalf of the tenant. */
export function AlertSupportActions({ alertId, status }: AlertSupportActionsProps) {
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)

  if (status === 'RESOLVED' || status === 'FALSE_POSITIVE') return null

  async function setStatus(next: 'RESOLVED' | 'FALSE_POSITIVE') {
    setPending(next)
    try {
      const res = await fetch(`/api/admin/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      const payload = await res.json()
      if (payload.success) router.refresh()
    } finally {
      setPending(null)
    }
  }

  return (
    <span className="inline-flex items-center gap-1.5 shrink-0">
      {pending ? (
        <Loader2 className="w-3 h-3 animate-spin" style={{ color: 'var(--text-muted)' }} />
      ) : (
        <>
          <button
            type="button"
            onClick={() => setStatus('RESOLVED')}
            className={ACTION_CLASS}
            style={{ borderColor: 'var(--border-default)' }}
            title="Mark resolved on behalf of the tenant"
          >
            Resolve
          </button>
          <button
            type="button"
            onClick={() => setStatus('FALSE_POSITIVE')}
            className={ACTION_CLASS}
            style={{ borderColor: 'var(--border-default)' }}
            title="Mark as false positive"
          >
            False +
          </button>
        </>
      )}
    </span>
  )
}
