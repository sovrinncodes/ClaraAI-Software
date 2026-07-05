'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  Wrench,
  Plus,
  Download,
  CheckCircle,
  Search,
  ChevronDown,
  User,
  Check,
  X,
  ExternalLink,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ClipboardCheck,
  Package,
  History,
  Building
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useWorkOrderStore } from '@/lib/stores/work-order-store'
import type { WorkOrder, WorkOrderPriority, WorkOrderStatus } from '@/types/work-order'
import Image from 'next/image'

export default function WorkOrdersPage() {
  const { workOrders, openCount, highPriorityCount, markComplete, updatePartStatus } = useWorkOrderStore()

  // Selection state
  const [selectedWoId, setSelectedWoId] = useState<string>('WO-8924')

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('Active')
  const [priorityFilter, setPriorityFilter] = useState<string>('All')
  const [facilityFilter, setFacilityFilter] = useState<string>('All')

  // Dropdown states
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const [showFacilityDropdown, setShowFacilityDropdown] = useState(false)

  // Interactive Checklist states (keeps track of checked items per work order)
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({})

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
  }

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [toastMessage])

  // Filter logic
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((wo) => {
      // 1. Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase()
        const matchTitle = wo.title.toLowerCase().includes(query)
        const matchId = wo.id.toLowerCase().includes(query)
        const matchAssetCode = wo.assetCode.toLowerCase().includes(query)
        const matchAssetName = wo.assetName.toLowerCase().includes(query)
        const matchAssignee = wo.assigneeName.toLowerCase().includes(query)
        const matchDescription = wo.description.toLowerCase().includes(query)
        if (!matchTitle && !matchId && !matchAssetCode && !matchAssetName && !matchAssignee && !matchDescription) {
          return false
        }
      }

      // 2. Status Filter
      if (statusFilter === 'Active') {
        if (wo.status === 'Completed') return false
      } else if (statusFilter !== 'All') {
        if (wo.status !== statusFilter) return false
      }

      // 3. Priority Filter
      if (priorityFilter !== 'All') {
        if (wo.priority !== priorityFilter) return false
      }

      // 4. Facility Filter
      if (facilityFilter !== 'All') {
        if (wo.facilityId !== facilityFilter) return false
      }

      return true
    })
  }, [workOrders, searchQuery, statusFilter, priorityFilter, facilityFilter])

  // Current selected work order
  const selectedWo = useMemo(() => {
    return workOrders.find((w) => w.id === selectedWoId) || filteredWorkOrders[0] || null
  }, [workOrders, selectedWoId, filteredWorkOrders])

  // Update selection if filtered out
  useEffect(() => {
    if (filteredWorkOrders.length > 0 && !filteredWorkOrders.some((w) => w.id === selectedWoId)) {
      setSelectedWoId(filteredWorkOrders[0].id)
    }
  }, [filteredWorkOrders, selectedWoId])

  // Export CSV
  const handleExportCSV = () => {
    if (filteredWorkOrders.length === 0) {
      triggerToast('No work orders to export.')
      return
    }

    const headers = ['ID', 'Title', 'Asset', 'Facility', 'Priority', 'Status', 'Assignee', 'Due Date', 'Description']
    const rows = filteredWorkOrders.map((wo) => [
      wo.id,
      wo.title,
      `${wo.assetCode} (${wo.assetName})`,
      wo.facilityName,
      wo.priority,
      wo.status,
      wo.assigneeName,
      wo.dueDate,
      wo.description.replace(/"/g, '""')
    ])
    
    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n')
      
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `clara_work_orders_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Work orders exported to CSV successfully.')
  }

  // Toggle tasks checkbox locally
  const toggleTaskCheck = (woId: string, taskIdx: number) => {
    const key = `${woId}-${taskIdx}`
    setCheckedTasks((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Handle Mark Complete action
  const handleMarkComplete = (id: string) => {
    markComplete(id, 'Technician')
    triggerToast(`Work order ${id} completed successfully.`)
  }

  // Handle Parts Procurement
  const handleRequestPart = (woId: string, partNumber: string) => {
    updatePartStatus(woId, partNumber, 'Requested')
    triggerToast(`Procurement request generated successfully for ${partNumber}`)
  }

  // Helper colors
  const getPriorityColor = (priority: WorkOrderPriority) => {
    switch (priority) {
      case 'Critical':
      case 'High':
        return '#E5484D' // status-critical
      case 'Medium':
        return '#F5A623' // status-advisory
      case 'Low':
        return '#8B96A8' // text-secondary
      default:
        return 'var(--text-muted)'
    }
  }

  const getPriorityBadgeClass = (priority: WorkOrderPriority) => {
    switch (priority) {
      case 'Critical':
      case 'High':
        return 'bg-[rgba(229,72,77,0.12)] text-[#E5484D] border-[rgba(229,72,77,0.2)]'
      case 'Medium':
        return 'bg-[rgba(245,166,35,0.12)] text-[#F5A623] border-[rgba(245,166,35,0.2)]'
      case 'Low':
        return 'bg-[rgba(139,150,168,0.12)] text-[#8B96A8] border-[rgba(139,150,168,0.2)]'
      default:
        return 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border-subtle)]'
    }
  }

  const getStatusBadgeClass = (status: WorkOrderStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-[rgba(0,212,170,0.1)] text-[#00D4AA] border-[rgba(0,212,170,0.2)]'
      case 'In Progress':
        return 'bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border-[rgba(59,130,246,0.2)]'
      case 'Pending Parts':
        return 'bg-[rgba(245,166,35,0.1)] text-[#F5A623] border-[rgba(245,166,35,0.2)]'
      case 'Open':
      default:
        return 'bg-[var(--bg-hover)] text-[var(--text-secondary)] border-[var(--border-strong)]'
    }
  }

  return (
    <div className="flex flex-col gap-6 relative h-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-[8px] border shadow-2xl font-mono text-xs animate-in fade-in slide-in-from-top-4 duration-200"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: '#00D4AA',
            color: 'var(--text-primary)'
          }}
        >
          <Check className="w-4 h-4 text-[#00D4AA]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumbs & Actions Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[--text-secondary]">
          <span className="hover:text-[--text-primary] transition-colors cursor-pointer">Operations</span>
          <span>/</span>
          <span className="text-[--text-muted]">Work Orders</span>
        </div>

        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border text-xs font-mono font-medium transition-all border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[--text-muted]" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/equipment/asset_chl_01/work-order"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] text-xs font-mono font-medium bg-[var(--accent-primary)] hover:shadow-[0_0_12px_rgba(0,212,170,0.3)] text-[#0A0D14] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Work Order</span>
          </Link>
        </div>
      </div>

      {/* Title block */}
      <div>
        <h1 className="font-mono text-2xl font-light tracking-wide text-[--text-primary] mb-1">
          Work Orders
        </h1>
        <p className="text-xs text-[--text-secondary] font-mono">
          {openCount} Open • {highPriorityCount} High Priority
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-muted]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders or assets..."
            className="w-full pl-9 pr-4 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[6px] text-xs font-mono text-[--text-primary] placeholder-[--text-muted] outline-none focus:border-[#00D4AA] transition-colors"
          />
        </div>

        {/* Dropdowns filters */}
        <div className="flex flex-wrap items-center gap-3 relative">
          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown)
                setShowPriorityDropdown(false)
                setShowFacilityDropdown(false)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-xs font-mono font-medium transition-all border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] cursor-pointer"
            >
              <span>Status: {statusFilter}</span>
              <ChevronDown className="w-3 h-3 text-[--text-muted]" />
            </button>
            {showStatusDropdown && (
              <div className="absolute left-0 mt-1.5 w-[160px] rounded-[6px] border border-[--border-strong] bg-[var(--bg-elevated)] shadow-2xl z-20 font-mono text-xs overflow-hidden">
                {['Active', 'All', 'Open', 'In Progress', 'Completed', 'Pending Parts'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setStatusFilter(opt)
                      setShowStatusDropdown(false)
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 hover:bg-[var(--bg-hover)] text-[--text-primary] border-b border-[--border-subtle] last:border-b-0 cursor-pointer',
                      statusFilter === opt && 'bg-[var(--bg-active)]'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Priority Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowPriorityDropdown(!showPriorityDropdown)
                setShowStatusDropdown(false)
                setShowFacilityDropdown(false)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-xs font-mono font-medium transition-all border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] cursor-pointer"
            >
              <span>Priority: {priorityFilter}</span>
              <ChevronDown className="w-3 h-3 text-[--text-muted]" />
            </button>
            {showPriorityDropdown && (
              <div className="absolute left-0 mt-1.5 w-[160px] rounded-[6px] border border-[--border-strong] bg-[var(--bg-elevated)] shadow-2xl z-20 font-mono text-xs overflow-hidden">
                {['All', 'Critical', 'High', 'Medium', 'Low'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setPriorityFilter(opt)
                      setShowPriorityDropdown(false)
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 hover:bg-[var(--bg-hover)] text-[--text-primary] border-b border-[--border-subtle] last:border-b-0 cursor-pointer',
                      priorityFilter === opt && 'bg-[var(--bg-active)]'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Facility Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFacilityDropdown(!showFacilityDropdown)
                setShowStatusDropdown(false)
                setShowPriorityDropdown(false)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-xs font-mono font-medium transition-all border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] cursor-pointer"
            >
              <span>
                Facility:{' '}
                {facilityFilter === 'All'
                  ? 'All'
                  : facilityFilter === 'fac_jhb_dc_01'
                  ? 'Johannesburg'
                  : facilityFilter === 'fac_cpt_mfg_01'
                  ? 'Cape Town'
                  : 'Pretoria'}
              </span>
              <ChevronDown className="w-3 h-3 text-[--text-muted]" />
            </button>
            {showFacilityDropdown && (
              <div className="absolute left-0 mt-1.5 w-[200px] rounded-[6px] border border-[--border-strong] bg-[var(--bg-elevated)] shadow-2xl z-20 font-mono text-xs overflow-hidden">
                {[
                  { id: 'All', label: 'All Facilities' },
                  { id: 'fac_jhb_dc_01', label: 'Johannesburg DC-1' },
                  { id: 'fac_cpt_mfg_01', label: 'Cape Town Assembly' },
                  { id: 'fac_pta_hq_01', label: 'Pretoria HQ' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setFacilityFilter(opt.id)
                      setShowFacilityDropdown(false)
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 hover:bg-[var(--bg-hover)] text-[--text-primary] border-b border-[--border-subtle] last:border-b-0 cursor-pointer',
                      facilityFilter === opt.id && 'bg-[var(--bg-active)]'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid Content: Left Master Feed, Right Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start flex-1 min-h-0">
        {/* Left Side: Master Feed List */}
        <div className="lg:col-span-2 flex flex-col gap-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {filteredWorkOrders.length > 0 ? (
            filteredWorkOrders.map((wo) => {
              const isSelected = wo.id === selectedWoId
              return (
                <div
                  key={wo.id}
                  onClick={() => setSelectedWoId(wo.id)}
                  className={cn(
                    'p-4 rounded-[10px] border transition-all cursor-pointer flex flex-col gap-2 border-[var(--border-default)]',
                    isSelected
                      ? 'bg-[var(--bg-active)] border-[var(--border-strong)] shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
                      : 'bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]'
                  )}
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: getPriorityColor(wo.priority)
                  }}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-xs text-[--text-primary] line-clamp-1 flex-1 pr-2">
                      {wo.title}
                    </span>
                    <span className="font-mono text-[9px] text-[--text-muted] shrink-0 uppercase">
                      {wo.id}
                    </span>
                  </div>

                  <div className="flex gap-2 items-center flex-wrap">
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-surface)] text-[--text-secondary] border border-[--border-subtle]">
                      {wo.assetCode}
                    </span>
                    <span className={cn(
                      "font-mono text-[9px] px-1.5 py-0.5 rounded border font-medium",
                      getStatusBadgeClass(wo.status)
                    )}>
                      {wo.status}
                    </span>
                    {wo.priority !== 'Low' && (
                      <span className={cn(
                        "font-mono text-[9px] px-1.5 py-0.5 rounded border font-medium",
                        getPriorityBadgeClass(wo.priority)
                      )}>
                        {wo.priority}
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-[--text-secondary] line-clamp-2 leading-relaxed">
                    {wo.description}
                  </p>
                </div>
              )
            })
          ) : (
            <div className="py-12 border rounded-[10px] border-dashed border-[var(--border-default)] text-center text-xs font-mono text-[--text-muted] bg-[var(--bg-card)]">
              No work orders matching the selected filters.
            </div>
          )}
        </div>

        {/* Right Side: Detail Panel */}
        <div className="lg:col-span-3 flex flex-col gap-5 p-6 rounded-[10px] border bg-[var(--bg-card)] border-[var(--border-default)]">
          {selectedWo ? (
            <>
              {/* Detail Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[--border-subtle] pb-4">
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-mono font-medium tracking-wide text-[--text-primary]">
                    {selectedWo.title}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      "font-mono text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider",
                      getStatusBadgeClass(selectedWo.status)
                    )}>
                      {selectedWo.status}
                    </span>

                    <span className={cn(
                      "font-mono text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider",
                      getPriorityBadgeClass(selectedWo.priority)
                    )}>
                      {selectedWo.priority} Priority
                    </span>

                    <span className="text-[10px] font-mono text-[--text-muted]">
                      ID: {selectedWo.id}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                  <span className="font-mono text-[10px] text-[--text-muted] uppercase tracking-wider">
                    Created By
                  </span>
                  <span className="font-mono text-xs text-[--text-primary] font-semibold">
                    {selectedWo.id === 'WO-8924' ? 'System' : 'System Admin'}
                  </span>
                  <span className="font-mono text-[10px] text-[--text-muted]">
                    {new Date(selectedWo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })},{' '}
                    {new Date(selectedWo.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} UTC
                  </span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-surface)] p-3.5 rounded-[8px] border border-[--border-subtle]">
                <div className="flex items-center gap-3">
                  <button
                    disabled={selectedWo.status === 'Completed'}
                    onClick={() => handleMarkComplete(selectedWo.id)}
                    className={cn(
                      'flex items-center gap-1.5 font-mono text-xs font-bold px-3.5 py-1.5 rounded-[6px] transition-all cursor-pointer',
                      selectedWo.status !== 'Completed'
                        ? 'bg-[#00D4AA] text-[#0A0D14] hover:shadow-[0_0_12px_rgba(0,212,170,0.3)]'
                        : 'bg-[var(--bg-elevated)] border border-[--border-default] text-[--text-muted] cursor-not-allowed'
                    )}
                  >
                    <CheckCircle className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Mark as Complete</span>
                  </button>

                  <button
                    onClick={() => triggerToast('Editing is pre-populated during creation. Please delete and recreate for adjustments.')}
                    className="flex items-center gap-1.5 font-mono text-xs font-bold px-3.5 py-1.5 rounded-[6px] border border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] transition-all cursor-pointer"
                  >
                    <span>Edit Details</span>
                  </button>
                </div>

                {selectedWo.sourceAlert && (
                  <Link
                    href={`/alerts?search=${selectedWo.sourceAlert.title}`}
                    className="flex items-center gap-1 text-[10px] font-mono text-[--text-secondary] hover:text-[--accent-primary] transition-colors cursor-pointer"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-[var(--status-critical)]" />
                    <span>View Alert {selectedWo.id === 'WO-8924' ? 'ALR-8925' : ''}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {/* Detail Info Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Affected Asset Card */}
                <Link
                  href={`/equipment/${selectedWo.assetId}`}
                  className="rounded-[8px] border p-4 bg-[var(--bg-surface)] border-[--border-subtle] hover:border-[--border-strong] transition-all group flex flex-col justify-between"
                >
                  <div>
                    <span className="block text-[9px] font-mono font-semibold uppercase tracking-widest text-[--text-muted] mb-1.5">
                      Affected Asset
                    </span>
                    <span className="block font-mono text-xs font-bold text-[--text-primary] group-hover:text-[var(--accent-primary)] transition-colors mb-1">
                      {selectedWo.assetCode} ({selectedWo.assetName})
                    </span>
                    <span className="block text-[10px] text-[--text-secondary]">
                      {selectedWo.facilityName}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-[9px] font-mono text-[var(--accent-primary)] mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View Health Dashboard</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </Link>

                {/* Assignee Card */}
                <div className="rounded-[8px] border p-4 bg-[var(--bg-surface)] border-[--border-subtle] flex justify-between items-stretch">
                  <div className="flex flex-col justify-between">
                    <div>
                      <span className="block text-[9px] font-mono font-semibold uppercase tracking-widest text-[--text-muted] mb-1.5">
                        Assignee
                      </span>
                      <div className="flex items-center gap-2">
                        {selectedWo.assigneeAvatar ? (
                          <div className="relative w-5 h-5 rounded-full overflow-hidden border border-[var(--border-default)]">
                            <Image
                              src={selectedWo.assigneeAvatar}
                              alt={selectedWo.assigneeName}
                              fill
                              sizes="20px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[var(--bg-hover)] border border-[var(--border-default)] flex items-center justify-center">
                            <User className="w-3 h-3 text-[var(--text-secondary)]" />
                          </div>
                        )}
                        <span className="font-mono text-xs font-bold text-[--text-primary]">
                          {selectedWo.assigneeName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex flex-col justify-between">
                    <div>
                      <span className="block text-[9px] font-mono font-semibold uppercase tracking-widest text-[--text-muted] mb-1.5">
                        Due Date
                      </span>
                      <span
                        className="block font-mono text-xs font-bold"
                        style={{
                          color:
                            selectedWo.dueDate.toLowerCase().includes('today') ||
                            selectedWo.dueDate.toLowerCase().includes('tomorrow')
                              ? '#E5484D'
                              : 'var(--text-primary)'
                        }}
                      >
                        {selectedWo.dueDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description & Scope of Work */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[--text-muted]">
                    Description & Scope
                  </span>
                  <p className="text-xs text-[--text-primary] font-mono leading-relaxed bg-[var(--bg-surface)] p-4 rounded-[8px] border border-[--border-subtle]">
                    {selectedWo.description}
                  </p>
                </div>

                {/* Scope of work list */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <ClipboardCheck className="w-4 h-4 text-[var(--accent-primary)]" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[--text-secondary]">
                      Scope of Work ({selectedWo.tasks.length} actions)
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 pl-1">
                    {selectedWo.tasks.map((task, idx) => {
                      const checkKey = `${selectedWo.id}-${idx}`
                      const isChecked = checkedTasks[checkKey] || selectedWo.status === 'Completed'

                      return (
                        <div
                          key={idx}
                          onClick={() => selectedWo.status !== 'Completed' && toggleTaskCheck(selectedWo.id, idx)}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-[6px] border font-mono text-xs transition-all",
                            selectedWo.status !== 'Completed' ? "cursor-pointer" : "cursor-default",
                            isChecked
                              ? "bg-[rgba(0,212,170,0.03)] border-[rgba(0,212,170,0.1)] text-[--text-muted]"
                              : "bg-[var(--bg-surface)] border-[--border-subtle] text-[--text-primary] hover:border-[--border-strong]"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all",
                            isChecked
                              ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[#0A0D14]"
                              : "border-[var(--border-strong)]"
                          )}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className={cn("leading-relaxed select-none", isChecked && "line-through text-[--text-muted]")}>
                            {task}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Required Parts (if any) */}
              {selectedWo.parts && selectedWo.parts.length > 0 && (
                <div className="flex flex-col gap-2.5 border-t border-[--border-subtle] pt-4">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[var(--accent-primary)]" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[--text-secondary]">
                      Required Parts & Inventory
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {selectedWo.parts.map((part) => (
                      <div
                        key={part.partNumber}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-[8px] bg-[var(--bg-surface)] border border-[--border-subtle] font-mono text-xs"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-[--text-primary]">
                            {part.partNumber}
                          </span>
                          <span className="text-[10px] text-[--text-secondary]">
                            {part.description}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {part.status === 'Requested' ? (
                            <span className="px-2.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 border-blue-500/20 text-blue-400">
                              Requested
                            </span>
                          ) : part.status === 'In Stock' ? (
                            <span className="px-2.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider bg-green-500/10 border-green-500/20 text-[#00D4AA]">
                              In Stock
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider bg-red-500/10 border-red-500/20 text-red-400">
                                Out of Stock
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRequestPart(selectedWo.id, part.partNumber)}
                                className="px-2.5 py-1 rounded text-[10px] font-bold bg-[var(--bg-elevated)] border border-[var(--border-strong)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all cursor-pointer"
                              >
                                Request Procurement
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Log / Timeline */}
              <div className="flex flex-col gap-3.5 border-t border-[--border-subtle] pt-4">
                <div className="flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[var(--accent-primary)]" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[--text-secondary]">
                    Activity Log Timeline
                  </span>
                </div>

                <div className="relative pl-4 flex flex-col gap-4 font-mono text-xs before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-subtle)]">
                  {selectedWo.activityLog.map((log, idx) => {
                    const isCompletion = log.title.toLowerCase().includes('completed')
                    const isCreation = log.title.toLowerCase().includes('created')

                    return (
                      <div key={idx} className="relative flex flex-col gap-0.5">
                        {/* Dot indicator */}
                        <span
                          className={cn(
                            "absolute -left-[14.5px] top-1 w-2.5 h-2.5 rounded-full border-2",
                            isCompletion && "bg-[#00D4AA] border-[#00D4AA]",
                            isCreation && "bg-[var(--text-muted)] border-[var(--text-muted)]",
                            !isCompletion && !isCreation && "bg-blue-400 border-blue-400"
                          )}
                        />
                        <div className="flex items-baseline justify-between flex-wrap gap-2">
                          <span className="font-bold text-[--text-primary]">
                            {log.title}
                          </span>
                          <span className="text-[9px] text-[--text-muted]">
                            {log.timestamp}
                          </span>
                        </div>
                        <span className="text-[10px] text-[--text-secondary]">
                          {log.subtitle}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="py-24 text-center font-mono text-xs text-[--text-muted]">
              No work order selected. Please select a work order from the list.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
