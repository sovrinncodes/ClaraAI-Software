'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, UserX, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { PlatformRole } from '@/types/admin'

const SELECT_CLASS =
  'rounded-md border px-2 py-1 text-xs outline-none bg-[--bg-card] disabled:opacity-40'

interface UserRowActionsProps {
  userId: string
  email: string
  role: string
  platformRole: PlatformRole | null
  isDisabled: boolean
  canManageStaffRoles: boolean
}

export function UserRowActions({
  userId,
  email,
  role,
  platformRole,
  isDisabled,
  canManageStaffRoles,
}: UserRowActionsProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function patchUser(body: Record<string, unknown>, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return
    setIsPending(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const payload = await res.json()
      if (!payload.success) {
        setError(payload.error ?? 'Update failed')
      } else {
        router.refresh()
      }
    } catch {
      setError('Update failed')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={role}
        disabled={isPending}
        onChange={(event) => patchUser({ role: event.target.value })}
        className={SELECT_CLASS}
        style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
        title="Tenant role"
      >
        <option value="TENANT_ADMIN">Tenant Admin</option>
        <option value="FACILITY_MANAGER">Facility Manager</option>
        <option value="READ_ONLY">Read Only</option>
      </select>

      {canManageStaffRoles && (
        <select
          value={platformRole ?? ''}
          disabled={isPending}
          onChange={(event) =>
            patchUser(
              { platformRole: event.target.value === '' ? null : event.target.value },
              event.target.value === ''
                ? `Revoke staff access for ${email}?`
                : `Grant ${event.target.value} staff access to ${email}?`
            )
          }
          className={SELECT_CLASS}
          style={{
            borderColor: platformRole ? 'rgba(139,92,246,0.35)' : 'var(--border-default)',
            color: platformRole ? 'var(--chart-5)' : 'var(--text-muted)',
          }}
          title="Staff role (SUPER_ADMIN only)"
        >
          <option value="">No staff role</option>
          <option value="ANALYST">Analyst</option>
          <option value="SUPPORT">Support</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
      )}

      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          patchUser(
            { isDisabled: !isDisabled },
            isDisabled ? undefined : `Disable ${email}? They will lose access.`
          )
        }
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors',
          'disabled:opacity-40 text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover]'
        )}
        style={{ borderColor: 'var(--border-default)' }}
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isDisabled ? (
          <UserCheck className="w-3.5 h-3.5" />
        ) : (
          <UserX className="w-3.5 h-3.5" />
        )}
        {isDisabled ? 'Enable' : 'Disable'}
      </button>

      {error && (
        <span className="text-[10px]" style={{ color: 'var(--status-critical)' }}>
          {error}
        </span>
      )}
    </div>
  )
}
