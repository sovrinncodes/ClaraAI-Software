'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Download,
  Link as LinkIcon,
  MoreVertical,
  Search,
  Filter,
  Calendar,
  Plus,
  FileText,
  RefreshCw,
  Check,
  AlertCircle,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Report {
  id: string
  name: string
  framework: 'GRI Baseline' | 'GHG Protocol' | 'Internal Format'
  coveragePeriod: string
  generated: string
  status: 'Ready' | 'Failed' | 'Generating'
}

const INITIAL_REPORTS: Report[] = [
  {
    id: 'REP-2024-004',
    name: 'Q1 2024 Corporate ESG Summary',
    framework: 'GRI Baseline',
    coveragePeriod: 'Jan 01, 2024 - Mar 31, 2024',
    generated: 'Today, 09:12 AM',
    status: 'Ready'
  },
  {
    id: 'REP-2024-003',
    name: 'Johannesburg DC-1 Water Usage',
    framework: 'Internal Format',
    coveragePeriod: 'Feb 01, 2024 - Feb 28, 2024',
    generated: 'Mar 01, 2024',
    status: 'Ready'
  },
  {
    id: 'REP-2024-002',
    name: 'Annual Carbon Footprint 2023',
    framework: 'GHG Protocol',
    coveragePeriod: 'Jan 01, 2023 - Dec 31, 2023',
    generated: 'Jan 15, 2024',
    status: 'Ready'
  },
  {
    id: 'REP-2024-001',
    name: 'Q4 2023 Corporate ESG Summary',
    framework: 'GRI Baseline',
    coveragePeriod: 'Oct 01, 2023 - Dec 31, 2023',
    generated: 'Jan 05, 2024',
    status: 'Ready'
  },
  {
    id: 'REP-2023-042',
    name: 'Dec 2023 Energy Usage Audit',
    framework: 'Internal Format',
    coveragePeriod: 'Dec 01, 2023 - Dec 31, 2023',
    generated: 'Dec 31, 2023',
    status: 'Failed'
  },
  {
    id: 'REP-2023-039',
    name: 'Q3 2023 Corporate ESG Summary',
    framework: 'GRI Baseline',
    coveragePeriod: 'Jul 01, 2023 - Sep 30, 2023',
    generated: 'Oct 05, 2023',
    status: 'Ready'
  },
  {
    id: 'REP-2023-038',
    name: 'Johannesburg DC-1 Water Usage (H2 2023)',
    framework: 'Internal Format',
    coveragePeriod: 'Jul 01, 2023 - Dec 31, 2023',
    generated: 'Jan 02, 2024',
    status: 'Ready'
  },
  {
    id: 'REP-2023-025',
    name: 'Q2 2023 Corporate ESG Summary',
    framework: 'GRI Baseline',
    coveragePeriod: 'Apr 01, 2023 - Jun 30, 2023',
    generated: 'Jul 05, 2023',
    status: 'Ready'
  },
  {
    id: 'REP-2023-020',
    name: 'Cape Town MFG-1 Energy Audit',
    framework: 'Internal Format',
    coveragePeriod: 'Jun 01, 2023 - Jun 30, 2023',
    generated: 'Jul 01, 2023',
    status: 'Ready'
  },
  {
    id: 'REP-2023-002',
    name: 'Annual Carbon Footprint 2022',
    framework: 'GHG Protocol',
    coveragePeriod: 'Jan 01, 2022 - Dec 31, 2022',
    generated: 'Jan 15, 2023',
    status: 'Ready'
  },
  {
    id: 'REP-2023-004',
    name: 'Q1 2023 Corporate ESG Summary',
    framework: 'GRI Baseline',
    coveragePeriod: 'Jan 01, 2023 - Mar 31, 2023',
    generated: 'Apr 05, 2023',
    status: 'Ready'
  },
  {
    id: 'REP-2023-001',
    name: 'Pretoria HQ Water Usage',
    framework: 'Internal Format',
    coveragePeriod: 'Dec 01, 2022 - Dec 31, 2022',
    generated: 'Jan 02, 2023',
    status: 'Ready'
  }
]

export default function EsgPage() {
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS)
  const [activeTab, setActiveTab] = useState<'all' | 'gri' | 'ghg' | 'custom'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [frameworkFilter, setFrameworkFilter] = useState<string>('All')
  const [showFrameworkDropdown, setShowFrameworkDropdown] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)

  // Form states for new report
  const [newReportName, setNewReportName] = useState('')
  const [newReportFramework, setNewReportFramework] = useState<'GRI Baseline' | 'GHG Protocol' | 'Internal Format'>('GRI Baseline')
  const [newReportStart, setNewReportStart] = useState('')
  const [newReportEnd, setNewReportEnd] = useState('')

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'info'>('success')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const triggerToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToastMessage(msg)
    setToastType(type)
  }

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [toastMessage])

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      // Tab filter mapping
      if (activeTab === 'gri' && rep.framework !== 'GRI Baseline') return false
      if (activeTab === 'ghg' && rep.framework !== 'GHG Protocol') return false
      if (activeTab === 'custom' && rep.framework !== 'Internal Format') return false

      // Dropdown framework filter
      if (frameworkFilter !== 'All' && rep.framework !== frameworkFilter) return false

      // Search query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase()
        const matchName = rep.name.toLowerCase().includes(query)
        const matchId = rep.id.toLowerCase().includes(query)
        const matchFw = rep.framework.toLowerCase().includes(query)
        if (!matchName && !matchId && !matchFw) return false
      }

      return true
    })
  }, [reports, activeTab, frameworkFilter, searchQuery])

  // Paginated reports
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredReports.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredReports, currentPage])

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1

  // Handle page resets on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, frameworkFilter, searchQuery])

  // Generate Report submission handler
  const handleGenerateReportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReportName.trim()) return

    const newId = `REP-2024-${String(reports.length + 1).padStart(3, '0')}`
    const startFormatted = newReportStart ? new Date(newReportStart).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Jan 01, 2024'
    const endFormatted = newReportEnd ? new Date(newReportEnd).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Mar 31, 2024'
    
    const newReportItem: Report = {
      id: newId,
      name: newReportName,
      framework: newReportFramework,
      coveragePeriod: `${startFormatted} - ${endFormatted}`,
      generated: 'Just now',
      status: 'Generating'
    }

    setReports((prev) => [newReportItem, ...prev])
    setShowGenerateModal(false)
    triggerToast(`Initiated generation of ${newReportName}`, 'info')

    // Reset fields
    setNewReportName('')
    setNewReportStart('')
    setNewReportEnd('')

    // Simulate completion
    setTimeout(() => {
      setReports((prev) =>
        prev.map((r) => (r.id === newId ? { ...r, status: 'Ready', generated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' today' } : r))
      )
      triggerToast(`Report ${newId} is ready for download`, 'success')
    }, 4000)
  }

  // Retry failed report handler
  const handleRetry = (reportId: string, name: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'Generating', generated: 'Retrying...' } : r))
    )
    triggerToast(`Re-generating report ${reportId}...`, 'info')

    setTimeout(() => {
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: 'Ready', generated: 'Just now' } : r))
      )
      triggerToast(`Report ${reportId} successfully generated`, 'success')
    }, 3000)
  }

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-[8px] border shadow-2xl font-mono text-xs animate-in fade-in slide-in-from-top-4 duration-200"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: toastType === 'success' ? '#00D4AA' : 'var(--border-strong)',
            color: 'var(--text-primary)'
          }}
        >
          {toastType === 'success' ? (
            <Check className="w-4 h-4 text-[#00D4AA]" />
          ) : (
            <RefreshCw className="w-4 h-4 text-[--text-muted] animate-spin" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumbs & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[--text-secondary]">
          <span className="hover:text-[--text-primary] transition-colors">Overview</span>
          <span>/</span>
          <span className="text-[--text-muted]">ESG Reports</span>
        </div>

        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <button
            onClick={() => triggerToast('Viewing scheduled reports pipeline...', 'info')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border text-xs font-mono font-medium transition-all border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[--text-muted]" />
            <span>Scheduled Reports</span>
          </button>

          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-1.5 text-[#0A0D14] hover:shadow-[0_0_15px_rgba(0,212,170,0.35)] transition-all font-mono text-xs font-bold px-3.5 py-1.5 rounded-[6px] cursor-pointer bg-[#00D4AA]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Title */}
      <div>
        <h1 className="font-mono text-2xl font-light tracking-wide text-[--text-primary] mb-1">
          Compliance & Reporting
        </h1>
        <p className="text-xs text-[--text-secondary]">
          Generate automated, audit-ready sustainability reports across all operational facilities.
        </p>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* YTD Scope 1 */}
        <div className="rounded-[10px] border p-5 bg-[var(--bg-card)] border-[var(--border-default)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
              YTD Scope 1 Emissions
            </span>
            <FileText className="w-4 h-4 text-[--text-muted]" />
          </div>
          <div className="font-mono text-2xl font-light text-[--text-primary] mb-1 flex items-baseline gap-1.5">
            342.5 <span className="text-xs text-[--text-secondary]">tCO2e</span>
          </div>
          <div className="text-[9px] font-mono text-[#00D4AA] font-bold flex items-center gap-0.5 mt-1">
            <span>↘ -4.2% vs last year</span>
          </div>
        </div>

        {/* YTD Scope 2 */}
        <div className="rounded-[10px] border p-5 bg-[var(--bg-card)] border-[var(--border-default)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
              YTD Scope 2 Emissions
            </span>
            <FileText className="w-4 h-4 text-[--text-muted]" />
          </div>
          <div className="font-mono text-2xl font-light text-[--text-primary] mb-1 flex items-baseline gap-1.5">
            1,204.8 <span className="text-xs text-[--text-secondary]">tCO2e</span>
          </div>
          <div className="text-[9px] font-mono text-[#F5A623] font-bold flex items-center gap-0.5 mt-1">
            <span>↗ +1.2% vs last year</span>
          </div>
        </div>

        {/* Renewable Energy Share */}
        <div className="rounded-[10px] border p-5 bg-[var(--bg-card)] border-[var(--border-default)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
              Renewable Energy Share
            </span>
            <FileText className="w-4 h-4 text-[--text-muted]" />
          </div>
          <div className="font-mono text-2xl font-light text-[--text-primary] mb-1 flex items-baseline gap-1.5">
            42.5<span className="text-xs text-[--text-secondary]">%</span>
          </div>
          <div className="text-[9px] font-mono text-[#00D4AA] font-bold flex items-center gap-0.5 mt-1">
            <span>↗ +15.0% vs target</span>
          </div>
        </div>

        {/* Total Water Usage */}
        <div className="rounded-[10px] border p-5 bg-[var(--bg-card)] border-[var(--border-default)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
              Total Water Usage
            </span>
            <FileText className="w-4 h-4 text-[--text-muted]" />
          </div>
          <div className="font-mono text-2xl font-light text-[--text-primary] mb-1 flex items-baseline gap-1.5">
            8,420 <span className="text-xs text-[--text-secondary]">kL</span>
          </div>
          <div className="text-[9px] font-mono text-[--text-muted] font-medium flex items-center gap-0.5 mt-1">
            <span>— Unchanged</span>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-[--border-subtle]">
        {[
          { id: 'all', label: `Report Library (${reports.length})` },
          { id: 'gri', label: 'GRI Framework' },
          { id: 'ghg', label: 'GHG Protocol' },
          { id: 'custom', label: 'Custom Extracts' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'px-4 py-2.5 text-xs font-mono font-medium border-b-2 -mb-px transition-colors cursor-pointer',
              activeTab === tab.id
                ? 'border-[--accent-primary] text-[--text-primary]'
                : 'border-transparent text-[--text-secondary] hover:text-[--text-primary]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-muted]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports..."
            className="w-full pl-9 pr-4 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[6px] text-xs font-mono text-[--text-primary] placeholder-[--text-muted] outline-none focus:border-[#00D4AA] transition-colors"
          />
        </div>

        {/* Quick Filter actions */}
        <div className="flex items-center gap-3 ml-auto sm:ml-0 relative">
          <div className="relative">
            <button
              onClick={() => setShowFrameworkDropdown(!showFrameworkDropdown)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border text-xs font-mono font-medium transition-all border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-[--text-muted]" />
              <span>Framework: {frameworkFilter}</span>
            </button>
            
            {showFrameworkDropdown && (
              <div className="absolute right-0 mt-1.5 w-[160px] rounded-[6px] border border-[--border-strong] bg-[var(--bg-elevated)] shadow-2xl z-20 font-mono text-xs overflow-hidden">
                {['All', 'GRI Baseline', 'GHG Protocol', 'Internal Format'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setFrameworkFilter(opt)
                      setShowFrameworkDropdown(false)
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 hover:bg-[var(--bg-hover)] text-[--text-primary] border-b border-[--border-subtle] last:border-b-0 cursor-pointer",
                      frameworkFilter === opt && "bg-[var(--bg-active)]"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => triggerToast('Opening custom date range picker...', 'info')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border text-xs font-mono font-medium transition-all border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[--text-muted]" />
            <span>Date Range</span>
          </button>
        </div>
      </div>

      {/* Reports Table Layout */}
      <div className="rounded-[10px] border bg-[var(--bg-card)] border-[var(--border-default)] p-5 flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="text-[10px] font-semibold text-[--text-muted] border-b border-[--border-subtle]">
                <th className="pb-3.5 font-semibold">REPORT NAME</th>
                <th className="pb-3.5 font-semibold">FRAMEWORK</th>
                <th className="pb-3.5 font-semibold">COVERAGE PERIOD</th>
                <th className="pb-3.5 font-semibold">GENERATED</th>
                <th className="pb-3.5 font-semibold">STATUS</th>
                <th className="pb-3.5 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReports.length > 0 ? (
                paginatedReports.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[--border-subtle] hover:bg-[rgba(255,255,255,0.01)] transition-colors"
                  >
                    <td className="py-4.5 pr-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-[--text-primary]">{row.name}</span>
                        <span className="text-[10px] text-[--text-muted]">{row.id}</span>
                      </div>
                    </td>
                    <td className="py-4.5">
                      <span className="inline-block px-2.5 py-0.5 rounded border border-[--border-default] bg-[var(--bg-surface)] text-[--text-secondary] text-[10px]">
                        {row.framework}
                      </span>
                    </td>
                    <td className="py-4.5 text-[--text-secondary]">{row.coveragePeriod}</td>
                    <td className="py-4.5 text-[--text-secondary]">{row.generated}</td>
                    <td className="py-4.5">
                      {row.status === 'Ready' && (
                        <span className="px-2 py-0.5 rounded border border-green-500/20 bg-green-500/10 text-green-400 font-bold uppercase tracking-wider text-[9px]">
                          Ready
                        </span>
                      )}
                      {row.status === 'Failed' && (
                        <span className="px-2 py-0.5 rounded border border-red-500/20 bg-red-500/10 text-red-400 font-bold uppercase tracking-wider text-[9px]">
                          Failed
                        </span>
                      )}
                      {row.status === 'Generating' && (
                        <span className="flex items-center gap-1.5 text-blue-400 font-bold text-[9px] uppercase tracking-wider">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Generating</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4.5 text-right">
                      {row.status === 'Failed' ? (
                        <button
                          onClick={() => handleRetry(row.id, row.name)}
                          className="px-2.5 py-1 rounded-[4px] border border-[--border-default] hover:border-red-500/30 text-[--text-primary] font-bold text-[10px] cursor-pointer bg-[var(--bg-surface)] flex items-center gap-1.5 ml-auto transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              if (row.status === 'Generating') return
                              triggerToast(`Downloading ${row.name} (${row.id})`)
                            }}
                            disabled={row.status === 'Generating'}
                            className={cn(
                              "p-1.5 rounded-[4px] border border-[--border-default] text-[--text-muted] hover:text-[--text-primary] hover:bg-[var(--bg-surface)] transition-all",
                              row.status === 'Generating' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                            )}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (row.status === 'Generating') return
                              navigator.clipboard.writeText(`https://clara-ai.internal/reports/${row.id}`)
                              triggerToast('Report link copied to clipboard!')
                            }}
                            disabled={row.status === 'Generating'}
                            className={cn(
                              "p-1.5 rounded-[4px] border border-[--border-default] text-[--text-muted] hover:text-[--text-primary] hover:bg-[var(--bg-surface)] transition-all",
                              row.status === 'Generating' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                            )}
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-[4px] text-[--text-muted] hover:text-[--text-primary] cursor-pointer">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[--text-muted] font-mono">
                    No reports match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-[--border-subtle] text-xs font-mono text-[--text-secondary]">
          <span>
            Showing {filteredReports.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredReports.length)} of {filteredReports.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 rounded-[6px] border border-[--border-default] disabled:opacity-40 text-xs font-medium cursor-pointer disabled:cursor-not-allowed bg-[var(--bg-elevated)] text-[--text-primary] hover:border-[--border-strong]"
            >
              Previous
            </button>
            <span className="px-2 text-[--text-muted]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-1.5 rounded-[6px] border border-[--border-default] disabled:opacity-40 text-xs font-medium cursor-pointer disabled:cursor-not-allowed bg-[var(--bg-elevated)] text-[--text-primary] hover:border-[--border-strong]"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal Dialog: Generate Report */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 backdrop-blur-xs p-4">
          <div
            className="w-full max-w-md rounded-[10px] border shadow-2xl p-6 font-mono relative overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-strong)',
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-5 border-b border-[--border-subtle] pb-3">
              <span className="text-sm font-bold text-[--text-primary] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00D4AA]" />
                <span>Generate Sustainability Report</span>
              </span>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-[--text-muted] hover:text-[--text-primary] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleGenerateReportSubmit} className="flex flex-col gap-4.5">
              {/* Report Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-[--text-secondary] uppercase tracking-wider">Report Name</label>
                <input
                  type="text"
                  required
                  value={newReportName}
                  onChange={(e) => setNewReportName(e.target.value)}
                  placeholder="e.g. Q2 2024 Energy Consumption Audit"
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[6px] text-xs text-[--text-primary] outline-none focus:border-[#00D4AA] transition-colors"
                />
              </div>

              {/* Framework */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-[--text-secondary] uppercase tracking-wider">Framework</label>
                <select
                  value={newReportFramework}
                  onChange={(e) => setNewReportFramework(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[6px] text-xs text-[--text-primary] outline-none focus:border-[#00D4AA] cursor-pointer"
                >
                  <option value="GRI Baseline">GRI Baseline</option>
                  <option value="GHG Protocol">GHG Protocol</option>
                  <option value="Internal Format">Internal Format</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-[--text-secondary] uppercase tracking-wider font-mono">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newReportStart}
                    onChange={(e) => setNewReportStart(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[6px] text-xs text-[--text-primary] outline-none focus:border-[#00D4AA]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-[--text-secondary] uppercase tracking-wider font-mono">End Date</label>
                  <input
                    type="date"
                    required
                    value={newReportEnd}
                    onChange={(e) => setNewReportEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[6px] text-xs text-[--text-primary] outline-none focus:border-[#00D4AA]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-[--border-subtle] pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 rounded-[6px] border border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] font-mono text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[6px] bg-[#00D4AA] text-[#0A0D14] hover:shadow-[0_0_12px_rgba(0,212,170,0.3)] transition-all font-mono text-xs font-bold cursor-pointer"
                >
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
