import { cn } from '@/lib/utils/cn'
import type { FacilityStatus } from '@/types/facility'

const VARIANTS: Record<FacilityStatus, { dot: string; text: string; bg: string; border: string }> = {
  OPTIMAL:  { dot: 'bg-[--status-optimal]',  text: 'text-green-400', bg: 'bg-green-500/10',  border: 'border-green-500/20' },
  WATCH:    { dot: 'bg-[--status-watch]',    text: 'text-blue-400',  bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
  ADVISORY: { dot: 'bg-[--status-advisory]', text: 'text-amber-400', bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
  CRITICAL: { dot: 'bg-[--status-critical]', text: 'text-red-400',   bg: 'bg-red-500/10',    border: 'border-red-500/20' },
}

const LABELS: Record<FacilityStatus, string> = {
  OPTIMAL: 'Optimal',
  WATCH: 'Watch',
  ADVISORY: 'Advisory',
  CRITICAL: 'Critical',
}

interface StatusBadgeProps {
  status: FacilityStatus
  className?: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const v = VARIANTS[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border font-medium',
        v.bg, v.border, v.text,
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
        className
      )}
    >
      <span className={cn('rounded-full shrink-0', v.dot, size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5')} />
      {LABELS[status]}
    </span>
  )
}
