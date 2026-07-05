'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Activity,
  Zap,
  Leaf,
  Bell,
  Wrench,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAlertStore } from '@/lib/stores/alert-store'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

interface NavSection {
  label: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'OVERVIEW',
    items: [
      { label: 'Portfolio Overview', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Facilities', href: '/facilities', icon: Building2 },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { label: 'Equipment Health', href: '/equipment', icon: Activity },
      { label: 'Energy Optimisation', href: '/energy', icon: Zap },
      { label: 'ESG Reports', href: '/esg', icon: Leaf },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { label: 'Alert Feed', href: '/alerts', icon: Bell },
      { label: 'Work Orders', href: '/workorders', icon: Wrench },
    ],
  },
]

const BOTTOM_NAV: NavItem[] = [
  { label: 'Settings', href: '/settings', icon: Settings },
]

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
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
          style={{ backgroundColor: 'var(--accent-primary)' }}
        />
      )}
      <Icon
        className={cn(
          'w-4 h-4 shrink-0 transition-colors',
          active ? 'text-[--accent-primary]' : 'text-[--text-muted] group-hover:text-[--text-secondary]'
        )}
        style={active ? { color: 'var(--accent-primary)' } : undefined}
      />
      <span className="truncate">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span
          className="ml-auto font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
          style={{
            backgroundColor: 'rgba(229,72,77,0.15)',
            color: 'var(--status-critical)',
          }}
        >
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const unreadCount = useAlertStore((state) => state.unreadCount)

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="w-[200px] shrink-0 flex flex-col h-full border-r"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
      }}
    >
      {/* Wordmark */}
      <div
        className="flex items-center gap-2.5 h-[56px] px-4 border-b shrink-0"
        style={{ borderColor: 'var(--border-default)' }}
      >
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
          style={{
            backgroundColor: 'var(--accent-primary-muted)',
            color: 'var(--accent-primary)',
            border: '1px solid rgba(0,212,170,0.20)',
          }}
        >
          C
        </div>
        <span
          className="font-mono text-sm font-semibold tracking-widest uppercase"
          style={{ color: 'var(--text-primary)' }}
        >
          Clara AI
        </span>
      </div>

      {/* Main nav */}
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
              {section.items.map((item) => {
                const updatedItem = item.href === '/alerts' ? { ...item, badge: unreadCount } : item
                return (
                  <li key={item.href}>
                    <NavLink item={updatedItem} active={isActive(item.href)} />
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom nav */}
      <div
        className="border-t px-2 py-3 space-y-0.5"
        style={{ borderColor: 'var(--border-default)' }}
      >
        {BOTTOM_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </div>
    </aside>
  )
}
