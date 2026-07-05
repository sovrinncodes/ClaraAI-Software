'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { HealthScoreIndicator } from '@/components/shared/health-score-indicator'
import { Filter, Download } from 'lucide-react'
import { DEMO_WATCHLIST_ASSETS } from '@/lib/data/seed'
import { formatEnergy } from '@/lib/utils/format'

export function AssetWatchlist() {
  const getPredictionColorClass = (status: string) => {
    if (status === 'CRITICAL') return 'text-[--status-critical]'
    if (status === 'ADVISORY') return 'text-[--status-advisory]'
    return 'text-[--text-secondary]'
  }

  const getPredictionLabel = (asset: typeof DEMO_WATCHLIST_ASSETS[0]) => {
    if (asset.externalId === 'CRAC-02') return 'Fail <12d'
    if (asset.externalId === 'UPS-B') return 'Battery Cell Degradation'
    if (asset.externalId === 'CHL-01') return 'Bearing Wear (45d)'
    if (asset.externalId === 'AHU-03') return 'Fan Belt Wear'
    return asset.faultType || 'Maint. Required'
  }

  const handleExportCsv = () => {
    // Mock export action
    console.log('Exporting CSV...')
  }

  return (
    <div
      className="rounded-[10px] border p-5 flex flex-col mb-6"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-mono text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-primary)' }}>
          Asset Watchlist (Action Required)
        </h3>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-medium transition-colors hover:border-[--border-strong] font-mono"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-secondary)',
            }}
          >
            <Filter className="w-3 h-3" />
            <span>Filter: Needs Attention</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-medium transition-colors hover:border-[--border-strong] font-mono"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-secondary)',
            }}
          >
            <Download className="w-3 h-3" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border" style={{ borderColor: 'var(--border-subtle)' }}>
        <Table>
          <TableHeader style={{ backgroundColor: 'var(--bg-elevated)' }}>
            <TableRow style={{ borderColor: 'var(--border-subtle)' }} className="hover:bg-transparent">
              <TableHead className="font-mono text-[10px] uppercase font-semibold h-9 px-4" style={{ color: 'var(--text-muted)' }}>
                Asset ID
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase font-semibold h-9 px-4" style={{ color: 'var(--text-muted)' }}>
                Facility
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase font-semibold h-9 px-4 w-[160px]" style={{ color: 'var(--text-muted)' }}>
                Health Score
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase font-semibold h-9 px-4" style={{ color: 'var(--text-muted)' }}>
                AI Prediction / Status
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase font-semibold h-9 px-4 text-right" style={{ color: 'var(--text-muted)' }}>
                Power Draw
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DEMO_WATCHLIST_ASSETS.map((asset) => (
              <TableRow
                key={asset.id}
                style={{ borderColor: 'var(--border-subtle)' }}
                className="hover:bg-[--bg-hover] transition-colors"
              >
                <TableCell className="font-mono text-xs font-medium px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                  {asset.externalId}
                  <span className="block text-[10px] font-sans font-normal mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {asset.name.split(' (')[0]}
                  </span>
                </TableCell>
                <TableCell className="text-xs px-4 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {asset.facilityName}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <HealthScoreIndicator score={asset.healthScore} showBar={true} size="sm" />
                </TableCell>
                <TableCell className="font-mono text-xs px-4 py-3">
                  <span className={getPredictionColorClass(asset.status)}>
                    {getPredictionLabel(asset)}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs px-4 py-3 text-right font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {asset.energyDrawKw.toFixed(1)} kW
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
