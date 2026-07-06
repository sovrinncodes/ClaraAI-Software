'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Loader2, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const INPUT_CLASS = 'rounded-md border px-3 py-1.5 text-sm bg-transparent outline-none'

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}

/** Creates a blank (non-demo) tenant — real customer onboarding. */
export function CreateTenantForm() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [plan, setPlan] = useState('trial')
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function createTenant(event: React.FormEvent) {
    event.preventDefault()
    setIsPending(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slugify(name),
          industry: industry.trim() || undefined,
          plan,
          template: 'blank',
        }),
      })
      const payload = await res.json()
      if (payload.success) {
        setName('')
        setIndustry('')
        setIsOpen(false)
        router.refresh()
      } else {
        setMessage(payload.error ?? 'Failed to create tenant')
      }
    } catch {
      setMessage('Failed to create tenant')
    } finally {
      setIsPending(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover]"
        style={{ borderColor: 'var(--border-default)' }}
      >
        <Plus className="w-3.5 h-3.5" />
        New tenant
      </button>
    )
  }

  return (
    <form
      onSubmit={createTenant}
      className="flex items-center gap-2 flex-wrap rounded-[10px] border p-3"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
    >
      <Building2 className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
      <input
        type="text"
        required
        autoFocus
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Tenant name"
        className={cn(INPUT_CLASS, 'w-52')}
        style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
        maxLength={80}
      />
      <input
        type="text"
        value={industry}
        onChange={(event) => setIndustry(event.target.value)}
        placeholder="Industry (optional)"
        className={cn(INPUT_CLASS, 'w-44')}
        style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
        maxLength={80}
      />
      <select
        value={plan}
        onChange={(event) => setPlan(event.target.value)}
        className={INPUT_CLASS}
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
      <button
        type="submit"
        disabled={isPending || name.trim().length < 2}
        className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover]"
        style={{ borderColor: 'var(--border-default)' }}
      >
        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
        Create
      </button>
      <button
        type="button"
        onClick={() => {
          setIsOpen(false)
          setMessage(null)
        }}
        className="p-1.5 rounded-md transition-colors text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-hover]"
        title="Cancel"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      {message && (
        <span className="text-[10px]" style={{ color: 'var(--status-critical)' }}>
          {message}
        </span>
      )}
    </form>
  )
}
