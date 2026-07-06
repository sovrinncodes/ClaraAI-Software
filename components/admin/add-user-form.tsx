'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const INPUT_CLASS = 'rounded-md border px-3 py-1.5 text-sm bg-transparent outline-none'

interface AddUserFormProps {
  tenants: { id: string; name: string }[]
}

export function AddUserForm({ tenants }: AddUserFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? '')
  const [role, setRole] = useState('FACILITY_MANAGER')
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function createUser(event: React.FormEvent) {
    event.preventDefault()
    setIsPending(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, email: email.trim(), name: name.trim() || undefined, role }),
      })
      const payload = await res.json()
      if (payload.success) {
        setEmail('')
        setName('')
        setMessage('User added.')
        router.refresh()
      } else {
        setMessage(payload.error ?? 'Failed to add user')
      }
    } catch {
      setMessage('Failed to add user')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={createUser} className="flex items-center gap-2 flex-wrap">
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="email@company.com"
        className={cn(INPUT_CLASS, 'w-56')}
        style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
        maxLength={120}
      />
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Full name (optional)"
        className={cn(INPUT_CLASS, 'w-44')}
        style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
        maxLength={80}
      />
      <select
        value={tenantId}
        onChange={(event) => setTenantId(event.target.value)}
        className={cn(INPUT_CLASS)}
        style={{
          borderColor: 'var(--border-default)',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
        }}
      >
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name}
          </option>
        ))}
      </select>
      <select
        value={role}
        onChange={(event) => setRole(event.target.value)}
        className={cn(INPUT_CLASS)}
        style={{
          borderColor: 'var(--border-default)',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
        }}
      >
        <option value="TENANT_ADMIN">Tenant Admin</option>
        <option value="FACILITY_MANAGER">Facility Manager</option>
        <option value="READ_ONLY">Read Only</option>
      </select>
      <button
        type="submit"
        disabled={isPending || !email.trim() || !tenantId}
        className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover]"
        style={{ borderColor: 'var(--border-default)' }}
      >
        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
        Add user
      </button>
      {message && (
        <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </span>
      )}
    </form>
  )
}
