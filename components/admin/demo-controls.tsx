'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCcw, CopyPlus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const BUTTON_CLASS =
  'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ' +
  'disabled:opacity-40 disabled:cursor-not-allowed text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover]'

export function ReseedButton({ tenantId, tenantName }: { tenantId: string; tenantName: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function reseed() {
    if (
      !window.confirm(
        `Reset ${tenantName} to its pristine demo scenario? All current operational data is replaced.`
      )
    )
      return
    setIsLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/tenants/${tenantId}/reseed`, { method: 'POST' })
      const body = await res.json()
      setMessage(body.success ? 'Restored.' : (body.error ?? 'Reseed failed'))
      if (body.success) router.refresh()
    } catch {
      setMessage('Reseed failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={reseed}
        disabled={isLoading}
        className={cn(BUTTON_CLASS)}
        style={{ borderColor: 'var(--border-default)' }}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <RefreshCcw className="w-3.5 h-3.5" />
        )}
        Reseed
      </button>
      {message && (
        <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </span>
      )}
    </span>
  )
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}

export function CloneTenantForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function createClone(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setMessage('Name must be at least 2 characters')
      return
    }

    setIsLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, slug: slugify(trimmed) }),
      })
      const body = await res.json()
      if (body.success) {
        setName('')
        setMessage(`Created ${body.data.name}.`)
        router.refresh()
      } else {
        setMessage(body.error ?? 'Failed to create demo tenant')
      }
    } catch {
      setMessage('Failed to create demo tenant')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={createClone} className="flex items-center gap-2 flex-wrap">
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="New demo tenant name (e.g. Acme Data Centres)"
        className="rounded-md border px-3 py-1.5 text-sm w-72 bg-transparent outline-none focus:border-[--border-strong]"
        style={{
          borderColor: 'var(--border-default)',
          color: 'var(--text-primary)',
        }}
        maxLength={80}
      />
      <button
        type="submit"
        disabled={isLoading || name.trim().length < 2}
        className={cn(BUTTON_CLASS)}
        style={{ borderColor: 'var(--border-default)' }}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <CopyPlus className="w-3.5 h-3.5" />
        )}
        Clone from template
      </button>
      {message && (
        <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </span>
      )}
    </form>
  )
}
