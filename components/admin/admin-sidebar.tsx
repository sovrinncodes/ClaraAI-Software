'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FlaskConical,
  ScrollText,
  Users,
  HeartPulse,
  BarChart3,
  ArrowLeftToLine,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface AdminNavItem {
  label: string
  href: string
  icon: LucideIcon
  disabled?: boolean
}

const NAV_SECTIONS: { label: string; items: AdminNavItem[] }[] = [
  {
    label: 'PLATFORM',
    items: [
      { label: 'Overview', href: '/admin', icon: LayoutDashboard },
      { label: 'Demo Control', href: '/admin/demo', icon: FlaskConical },
      { label: 'Audit Log', href: '/admin/audit', icon: ScrollText },
    ],
  },
  {
    label: 'COMING SOON',
    items: [
      { label: 'Users', href: '/admin/users', icon: Users, disabled: true },
      { label: 'Platform Health', href: '/admin/health', icon: HeartPulse, disabled: true },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, disabled: true },
    ],
  },
]

function AdminNavLink({ item, active }: { item: AdminNavItem; active: boolean }) {
  const Icon = item.icon

  if (item.disabled) {
    return (
      <span
        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-not-allowed opacity-40"
        style={{ color: 'var(--text-muted)' }}
        title="Planned for a later phase"
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="truncate">{item.label}</span>
      </span>
    )
  }

  return (
    <Link
      href={item.href}
      className={cn(
        'group flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors relative',
        active
          ? 'text-[--text-primary] bg-[--bg-active]'
          : 'text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover]'
      )}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
          style={{ backgroundColor: 'var(--chart-5)' }}
        />
      )}
      <Icon
        className="w-4 h-4 shrink-0 transition-colors"
        style={active ? { color: 'var(--chart-5)' } : { color: 'var(--text-muted)' }}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin' || pathname.startsWith('/admin/tenants')
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="w-[200px] shrink-0 flex flex-col h-full border-r"
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
    >
      {/* Staff wordmark — visually distinct from the tenant app */}
      <div
        className="flex items-center gap-2.5 h-[56px] px-4 border-b shrink-0"
        style={{ borderColor: 'var(--border-default)' }}
      >
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
          style={{
            backgroundColor: 'rgba(139,92,246,0.12)',
            color: 'var(--chart-5)',
            border: '1px solid rgba(139,92,246,0.25)',
          }}
        >
          S
        </div>
        <span
          className="font-mono text-sm font-semibold tracking-widest uppercase"
          style={{ color: 'var(--text-primary)' }}
        >
          Clara Staff
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p
              className="px-3 mb-1.5 text-[10px] font-semibold tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <AdminNavLink item={item} active={isActive(item.href)} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div
        className="border-t px-2 py-3"
        style={{ borderColor: 'var(--border-default)' }}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover]"
        >
          <ArrowLeftToLine className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
          <span className="truncate">Back to App</span>
        </Link>
      </div>
    </aside>
  )
}
