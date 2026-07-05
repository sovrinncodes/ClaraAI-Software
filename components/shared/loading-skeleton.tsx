import { cn } from '@/lib/utils/cn'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded', className)}
      style={{ backgroundColor: 'var(--bg-elevated)' }}
    />
  )
}

export function KpiCardSkeleton() {
  return (
    <div
      className="rounded-[10px] border p-5 space-y-3"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
    >
      <div className="flex justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-9 w-32" />
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-8 w-full" />
    </div>
  )
}

export function FacilityCardSkeleton() {
  return (
    <div
      className="rounded-[10px] border p-5 space-y-3"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
    >
      <div className="flex justify-between">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-5 w-16 rounded" />
      </div>
      <Skeleton className="h-8 w-20" />
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  )
}
