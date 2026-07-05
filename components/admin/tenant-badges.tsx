import { cn } from '@/lib/utils/cn'
import type { TenantStatus } from '@/types/admin'

const STATUS_VARIANTS: Record<TenantStatus, { text: string; bg: string; border: string; dot: string }> = {
  ACTIVE:    { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', dot: 'bg-green-400' },
  SUSPENDED: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400' },
  ARCHIVED:  { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', dot: 'bg-slate-400' },
}

export function TenantStatusBadge({ status, className }: { status: TenantStatus; className?: string }) {
  const v = STATUS_VARIANTS[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border font-medium px-1.5 py-0.5 text-[10px]',
        v.bg, v.border, v.text, className
      )}
    >
      <span className={cn('rounded-full shrink-0 w-1 h-1', v.dot)} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border font-medium px-1.5 py-0.5 text-[10px]',
        'bg-violet-500/10 border-violet-500/20 text-violet-400',
        className
      )}
    >
      Demo
    </span>
  )
}
