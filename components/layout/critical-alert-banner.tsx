'use client'

import { useState } from 'react'
import { AlertOctagon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CriticalAlertBannerProps {
  onAcknowledge?: () => void
  onViewDetails?: () => void
}

export function CriticalAlertBanner({ onAcknowledge, onViewDetails }: CriticalAlertBannerProps) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-3 rounded-[10px] border mb-6 transition-all duration-300"
      style={{
        backgroundColor: 'rgba(229, 72, 77, 0.1)',
        borderColor: 'rgba(229, 72, 77, 0.2)',
      }}
    >
      <div className="flex items-center gap-3">
        <AlertOctagon className="w-4 h-4 shrink-0 text-red-400" />
        <span className="text-xs font-medium text-red-200">
          <strong className="text-red-400 font-bold uppercase tracking-wider text-[10px] mr-2 font-mono">
            Critical Alert
          </strong>
          Unacknowledged vibration anomaly detected in Cape Town Assembly (HVAC CRAC Unit A). Predicted failure in{' '}
          <span className="font-mono text-red-400 font-semibold">14h 22m</span>.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
          className="h-7 border-red-500/20 hover:bg-red-500/10 text-red-200 hover:text-red-100 text-xs font-medium"
        >
          View Details
        </Button>
        <Button
          size="sm"
          onClick={() => {
            if (onAcknowledge) onAcknowledge()
            setVisible(false)
          }}
          className="h-7 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-4"
        >
          Acknowledge
        </Button>
        <button
          onClick={() => setVisible(false)}
          className="p-1 text-red-400 hover:text-red-200 hover:bg-red-500/10 rounded transition-colors ml-1"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
