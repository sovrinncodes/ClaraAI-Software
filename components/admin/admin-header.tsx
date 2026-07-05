import { ShieldCheck } from 'lucide-react'
import type { PlatformRole } from '@/types/admin'

export function AdminHeader({ role }: { role: PlatformRole }) {
  return (
    <header
      className="h-[56px] shrink-0 flex items-center justify-between px-6 border-b"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
        // Distinct violet stripe so staff chrome is never mistaken for tenant UI
        boxShadow: 'inset 0 2px 0 0 var(--chart-5)',
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="text-xs font-medium uppercase tracking-widest"
          style={{ color: 'var(--text-secondary)' }}
        >
          Platform Administration
        </span>
      </div>

      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
        style={{
          backgroundColor: 'rgba(139,92,246,0.10)',
          borderColor: 'rgba(139,92,246,0.25)',
        }}
      >
        <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--chart-5)' }} />
        <span className="text-xs font-mono font-medium" style={{ color: 'var(--chart-5)' }}>
          {role}
        </span>
      </div>
    </header>
  )
}
