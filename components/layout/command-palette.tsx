'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Building,
  Cpu,
  ClipboardCheck,
  CornerDownLeft,
  X,
  Server,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface CommandPaletteProps {
  onClose: () => void
}

interface PaletteItem {
  id: string
  type: 'facility' | 'asset' | 'action'
  category: 'FACILITIES' | 'ASSETS' | 'QUICK ACTIONS'
  title: string
  subtext: string
  icon: any
  badge?: {
    text: string
    style: string
  }
  url: string
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const allItems: PaletteItem[] = [
    // Facilities
    {
      id: 'fac_cpt_mfg',
      type: 'facility',
      category: 'FACILITIES',
      title: 'CPT Manufacturing Plant',
      subtext: 'Cape Town, ZA • 12 Active Alerts • ESG Score: 78',
      icon: Building,
      url: '/facilities/fac_cpt_mfg_01'
    },
    // Assets
    {
      id: 'asset_crac_a',
      type: 'asset',
      category: 'ASSETS',
      title: 'CRAC Unit A',
      subtext: 'JHB Data Centre • Server Room 102 • Health: 68%',
      icon: Server,
      badge: { text: 'Warning', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
      url: '/equipment/asset_crac_01'
    },
    {
      id: 'asset_crac_b',
      type: 'asset',
      category: 'ASSETS',
      title: 'CRAC Unit B',
      subtext: 'JHB Data Centre • Server Room 102 • Health: 92%',
      icon: Server,
      url: '/equipment/asset_crac_02'
    },
    {
      id: 'asset_ct_01',
      type: 'asset',
      category: 'ASSETS',
      title: 'Cooling Tower 01',
      subtext: 'CPT Manufacturing Plant • Roof Deck • Health: 42%',
      icon: Server,
      badge: { text: 'Critical', style: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
      url: '/equipment/asset_gen_01'
    },
    // Quick Actions
    {
      id: 'action_create_wo',
      type: 'action',
      category: 'QUICK ACTIONS',
      title: 'Create Work Order',
      subtext: 'Draft a new maintenance request for an asset',
      icon: ClipboardCheck,
      url: '/equipment/asset_chl_01/work-order'
    }
  ]

  // Filter items based on query
  const filteredItems = allItems.filter((item) => {
    const q = query.toLowerCase().trim()
    if (!q) return true
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtext.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    )
  })

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => (filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => (filteredItems.length > 0 ? (prev - 1 + filteredItems.length) % filteredItems.length : 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredItems[activeIndex]) {
          handleSelect(filteredItems[activeIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [filteredItems, activeIndex])

  const handleSelect = (item: PaletteItem) => {
    router.push(item.url)
    onClose()
  }

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]')
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [activeIndex])

  // Group filtered items by category
  const categories: ('FACILITIES' | 'ASSETS' | 'QUICK ACTIONS')[] = ['FACILITIES', 'ASSETS', 'QUICK ACTIONS']

  // Find index mapping in flat list
  let flatIndexCounter = 0
  const groupedStructure = categories.map((cat) => {
    const itemsInCat = filteredItems.filter((item) => item.category === cat)
    const itemsWithIndex = itemsInCat.map((item) => {
      const currentFlatIndex = flatIndexCounter
      flatIndexCounter++
      return { ...item, flatIndex: currentFlatIndex }
    })
    return { category: cat, items: itemsWithIndex }
  }).filter((group) => group.items.length > 0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[620px] rounded-[10px] border border-[--border-strong] bg-[--bg-surface] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[--border-subtle]">
          <Search className="w-4.5 h-4.5 text-[--text-muted] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent text-sm text-[--text-primary] placeholder-[--text-muted] outline-none border-none font-sans"
          />
          <kbd
            onClick={onClose}
            className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-[--border-subtle] bg-[--bg-active] text-[--text-disabled] shadow-sm select-none cursor-pointer"
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-[380px] overflow-y-auto divide-y divide-[--border-subtle]">
          {filteredItems.length > 0 ? (
            groupedStructure.map((group) => (
              <div key={group.category} className="flex flex-col">
                {/* Category Header */}
                <div className="px-4 py-2 bg-[--bg-card]/30 font-mono text-[9px] font-bold uppercase tracking-wider text-[--text-muted] select-none">
                  {group.category}
                </div>

                {/* Items */}
                <div className="flex flex-col">
                  {group.items.map((item) => {
                    const isSelected = item.flatIndex === activeIndex
                    const ItemIcon = item.icon

                    return (
                      <div
                        key={item.id}
                        data-active={isSelected}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setActiveIndex(item.flatIndex)}
                        className={cn(
                          'flex items-center justify-between gap-4 px-4 py-3.5 cursor-pointer transition-all border-l-[3px] border-l-transparent font-sans',
                          isSelected
                            ? 'bg-[--bg-active] border-l-[--accent-primary] text-[--text-primary]'
                            : 'hover:bg-[--bg-hover]/40 text-[--text-primary]'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            "w-7 h-7 rounded-[6px] border flex items-center justify-center shrink-0 transition-colors",
                            isSelected 
                              ? "bg-[--accent-primary-muted] border-[rgba(0,212,170,0.2)] text-[--accent-primary]"
                              : "bg-[--bg-card] border-[--border-default] text-[--text-secondary]"
                          )}>
                            <ItemIcon className="w-3.5 h-3.5" />
                          </div>

                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold truncate">
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className={cn("text-[9px] font-semibold px-1.5 py-0.2 rounded border font-mono", item.badge.style)}>
                                  {item.badge.text}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[--text-secondary] truncate mt-0.5">
                              {item.subtext}
                            </span>
                          </div>
                        </div>

                        {/* Action hints or arrows */}
                        {isSelected && (
                          <div className="flex items-center gap-1.5 text-[10px] text-[--accent-primary] font-mono shrink-0 animate-in fade-in duration-100 pr-1">
                            {item.type === 'asset' || item.type === 'facility' ? (
                              <>
                                <span>Jump to {item.type}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            ) : (
                              <>
                                <span>Execute</span>
                                <CornerDownLeft className="w-3 h-3" />
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs font-mono text-[--text-muted]">
              No results found matching "{query}"
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 bg-[--bg-card]/30 border-t border-[--border-subtle] font-mono text-[9px] text-[--text-muted]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="px-1 py-0.5 rounded border border-[--border-subtle] bg-[--bg-card]">↑</span>
              <span className="px-1 py-0.5 rounded border border-[--border-subtle] bg-[--bg-card]">↓</span>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1 py-0.5 rounded border border-[--border-subtle] bg-[--bg-card]">↵</span>
              <span>to select</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1 py-0.5 rounded border border-[--border-subtle] bg-[--bg-card]">ESC</span>
              <span>to dismiss</span>
            </span>
          </div>

          <div className="tracking-wider select-none font-bold">
            CLARA AI SEARCH
          </div>
        </div>
      </div>
    </div>
  )
}
