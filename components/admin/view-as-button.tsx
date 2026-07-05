'use client'

import { useState } from 'react'
import { Eye, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ViewAsButtonProps {
  tenantId: string
  tenantName: string
  disabled?: boolean
  className?: string
}

export function ViewAsButton({ tenantId, tenantName, disabled, className }: ViewAsButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startImpersonation() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      })
      const body = await res.json()
      if (!body.success) {
        setError(body.error ?? 'Failed to start view-as session')
        setIsLoading(false)
        return
      }
      // Full navigation so the proxy picks up the impersonation cookie
      window.location.href = '/dashboard'
    } catch {
      setError('Failed to start view-as session')
      setIsLoading(false)
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={startImpersonation}
        disabled={disabled || isLoading}
        title={`Open the app as ${tenantName}`}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover]',
          className
        )}
        style={{ borderColor: 'var(--border-default)' }}
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
        View as
      </button>
      {error && (
        <span className="text-[10px]" style={{ color: 'var(--status-critical)' }}>
          {error}
        </span>
      )}
    </span>
  )
}
