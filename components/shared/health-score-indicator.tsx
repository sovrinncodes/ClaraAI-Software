import { cn } from '@/lib/utils/cn'
import { getHealthColor } from '@/lib/utils/format'

interface HealthScoreIndicatorProps {
  score: number
  showBar?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function HealthScoreIndicator({
  score,
  showBar = false,
  size = 'md',
  className,
}: HealthScoreIndicatorProps) {
  const colorClass = getHealthColor(score)

  const sizeClass = {
    sm: 'text-sm font-mono font-medium',
    md: 'text-lg font-mono font-medium',
    lg: 'text-3xl font-mono font-light',
  }[size]

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className={cn(sizeClass, colorClass)}>
        {score.toFixed(1)}%
      </span>
      {showBar && (
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--bg-elevated)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${score}%`,
              backgroundColor: score >= 90
                ? 'var(--status-optimal)'
                : score >= 70
                ? 'var(--status-advisory)'
                : 'var(--status-critical)',
            }}
          />
        </div>
      )}
    </div>
  )
}
