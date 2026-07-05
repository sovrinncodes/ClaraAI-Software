'use client'

import { useState } from 'react'
import { LogOut, Loader2 } from 'lucide-react'

export function ExitImpersonationButton() {
  const [isLoading, setIsLoading] = useState(false)

  async function exitImpersonation() {
    setIsLoading(true)
    try {
      await fetch('/api/admin/impersonate', { method: 'DELETE' })
    } finally {
      // Full navigation so the proxy drops the impersonated tenant context
      window.location.href = '/admin'
    }
  }

  return (
    <button
      type="button"
      onClick={exitImpersonation}
      disabled={isLoading}
      className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors shrink-0 disabled:opacity-60"
      style={{
        borderColor: 'rgba(245,166,35,0.45)',
        color: 'var(--status-advisory)',
      }}
    >
      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
      Exit
    </button>
  )
}
