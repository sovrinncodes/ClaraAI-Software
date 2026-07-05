'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, User, Check, Plus, Folder, Building2 } from 'lucide-react'
import { formatUtcTime } from '@/lib/utils/format'
import { CommandPalette } from '@/components/layout/command-palette'
import { useWorkspaceStore, WORKSPACES } from '@/lib/stores/workspace-store'

interface HeaderProps {
  tenantName?: string
}

function LiveDataBadge() {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
      style={{
        backgroundColor: 'rgba(0,212,170,0.08)',
        borderColor: 'rgba(0,212,170,0.20)',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ backgroundColor: 'var(--accent-primary)' }}
      />
      <span
        className="font-mono text-[10px] font-semibold tracking-widest"
        style={{ color: 'var(--accent-primary)' }}
      >
        LIVE DATA
      </span>
    </div>
  )
}

function LastSyncIndicator() {
  const [time, setTime] = useState(() => formatUtcTime(new Date().toISOString()))

  useEffect(() => {
    const id = setInterval(() => {
      setTime(formatUtcTime(new Date().toISOString()))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-1.5">
      <span
        className="font-mono text-[10px] tracking-wide"
        style={{ color: 'var(--text-muted)' }}
      >
        LAST SYNC
      </span>
      <span
        className="font-mono text-[10px] font-medium tabular-nums"
        style={{ color: 'var(--text-secondary)' }}
      >
        {time}
      </span>
    </div>
  )
}

function SearchButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors hover:border-[--border-strong] cursor-pointer"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-default)',
        color: 'var(--text-muted)',
      }}
      aria-label="Search"
    >
      <Search className="w-3.5 h-3.5" />
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Search...
      </span>
      <kbd
        className="font-mono text-[10px] px-1 rounded"
        style={{
          backgroundColor: 'var(--bg-active)',
          color: 'var(--text-disabled)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        ⌘K
      </kbd>
    </button>
  )
}

function TenantSwitcher() {
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Reset search when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
    }
  }, [isOpen])

  const filteredWorkspaces = WORKSPACES.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeMatchesSearch = activeWorkspace.name
    .toLowerCase()
    .includes(searchQuery.toLowerCase())

  const otherWorkspaces = filteredWorkspaces.filter(
    (w) => w.id !== activeWorkspace.id
  )

  const totalWorkspaces = WORKSPACES.length
  const totalFacilities = WORKSPACES.reduce((sum, w) => sum + w.facilities, 0)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-all duration-200 cursor-pointer"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: isOpen ? 'var(--accent-primary)' : 'var(--border-default)',
          boxShadow: isOpen ? '0 0 0 1px var(--accent-primary)' : 'none',
        }}
      >
        <div
          className="w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center shrink-0 transition-colors"
          style={{
            backgroundColor: activeWorkspace.bgColor,
            color: activeWorkspace.color,
          }}
        >
          {activeWorkspace.code}
        </div>
        <span
          className="text-xs font-medium max-w-[120px] truncate"
          style={{ color: 'var(--text-primary)' }}
        >
          {activeWorkspace.name}
        </span>
        <ChevronDown
          className="w-3 h-3 shrink-0 transition-transform duration-200"
          style={{
            color: 'var(--text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-[320px] rounded-lg border z-50 p-4 flex flex-col gap-3 shadow-2xl shadow-black/85"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-strong)',
          }}
        >
          {/* Header text */}
          <div>
            <h4
              className="text-xs font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Switch Workspace
            </h4>
            <p
              className="text-[11px]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Select a tenant to manage their facilities and data.
            </p>
          </div>

          {/* Search workspaces input */}
          <div className="relative">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search workspaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded border text-xs focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
              style={{
                backgroundColor: 'var(--bg-base)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
              autoFocus
            />
          </div>

          {/* ACTIVE WORKSPACE section */}
          {activeMatchesSearch && (
            <div className="flex flex-col gap-1">
              <span
                className="text-[9px] font-bold tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                ACTIVE WORKSPACE
              </span>
              <div
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-2 rounded-md border cursor-pointer transition-colors"
                style={{
                  backgroundColor: 'rgba(0, 212, 170, 0.06)',
                  borderColor: 'rgba(0, 212, 170, 0.15)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded text-[10px] font-bold flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: activeWorkspace.bgColor,
                      color: activeWorkspace.color,
                    }}
                  >
                    {activeWorkspace.code}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {activeWorkspace.name}
                    </span>
                    <span
                      className="text-[10px]"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {activeWorkspace.facilities} facilities &middot;{' '}
                      {activeWorkspace.assets} assets
                    </span>
                  </div>
                </div>
                <Check
                  className="w-3.5 h-3.5"
                  style={{ color: 'var(--accent-primary)' }}
                />
              </div>
            </div>
          )}

          {/* ALL WORKSPACES section */}
          {otherWorkspaces.length > 0 && (
            <div className="flex flex-col gap-1 max-h-[180px] overflow-y-auto">
              <span
                className="text-[9px] font-bold tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                ALL WORKSPACES
              </span>
              <div className="flex flex-col gap-1">
                {otherWorkspaces.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => {
                      setActiveWorkspace(w)
                      setIsOpen(false)
                    }}
                    className="flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-[var(--bg-hover)] transition-colors border border-transparent hover:border-[var(--border-subtle)]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded text-[10px] font-bold flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: w.bgColor,
                          color: w.color,
                        }}
                      >
                        {w.code}
                      </div>
                      <div className="flex flex-col">
                        <span
                          className="text-xs font-medium"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {w.name}
                        </span>
                        <span
                          className="text-[10px]"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {w.facilities} facilities &middot; {w.assets} assets
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No results state */}
          {filteredWorkspaces.length === 0 && (
            <div className="text-center py-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              No workspaces found
            </div>
          )}

          {/* Footer divider */}
          <div
            className="w-full h-px"
            style={{ backgroundColor: 'var(--border-default)' }}
          />

          {/* Footer with summary indicators and Add Button */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              <div
                className="flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono tracking-wider font-semibold uppercase"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                <Folder className="w-3 h-3 animate-none" style={{ color: 'var(--text-muted)' }} />
                <span>{totalWorkspaces} workspaces</span>
              </div>
              <div
                className="flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono tracking-wider font-semibold uppercase"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                <Building2 className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                <span>{totalFacilities} facilities</span>
              </div>
            </div>

            <button
              onClick={() => alert(`Adding new workspace is simulated.`)}
              className="flex items-center gap-1 px-2.5 py-1 rounded border text-[10px] font-semibold cursor-pointer transition-colors"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AvatarButton() {
  return (
    <button
      className="w-7 h-7 rounded-full border flex items-center justify-center transition-colors hover:border-[--border-strong]"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-default)',
      }}
      aria-label="User menu"
    >
      <User className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
    </button>
  )
}

export function Header({ tenantName }: HeaderProps = {}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <header
      className="h-[56px] shrink-0 flex items-center gap-4 px-6 border-b"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
      }}
    >
      {/* Left — sync status */}
      <div className="flex items-center gap-4 flex-1">
        <LastSyncIndicator />
      </div>

      {/* Right — controls */}
      <div className="flex items-center gap-3">
        <LiveDataBadge />
        <div
          className="w-px h-4"
          style={{ backgroundColor: 'var(--border-default)' }}
        />
        <SearchButton onClick={() => setIsSearchOpen(true)} />
        <TenantSwitcher />
        <AvatarButton />
      </div>

      {isSearchOpen && <CommandPalette onClose={() => setIsSearchOpen(false)} />}
    </header>
  )
}
