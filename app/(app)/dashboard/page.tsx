import type { Metadata } from 'next'
import { CriticalAlertBanner } from '@/components/layout/critical-alert-banner'
import {
  EsgScoreCard,
  PortfolioHealthCard,
  EnergyOptimisedCard,
  ActiveAlertsCard,
} from '@/components/dashboard/kpi-cards'
import { TelemetryOverviewChart } from '@/components/dashboard/telemetry-overview-chart'
import { FacilityGrid } from '@/components/dashboard/facility-grid'
import { AssetWatchlist } from '@/components/dashboard/asset-watchlist'
import { LiveAlertFeed } from '@/components/dashboard/live-alert-feed'
import { DEMO_FACILITIES, DEMO_ALERTS } from '@/lib/data/seed'

export const metadata: Metadata = { title: 'Portfolio Overview' }

export default function DashboardPage() {
  const hasCriticalAlert = DEMO_ALERTS.some(
    (alert) => alert.severity === 'CRITICAL' && alert.status === 'ACTIVE'
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Conditional Top Critical Alert Banner */}
      {hasCriticalAlert && <CriticalAlertBanner />}

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <EsgScoreCard />
        <PortfolioHealthCard />
        <EnergyOptimisedCard />
        <ActiveAlertsCard />
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left 3/4 Column — Analytics and Tables */}
        <div className="lg:col-span-3 flex flex-col">
          <TelemetryOverviewChart />
          <FacilityGrid facilities={DEMO_FACILITIES} />
          <AssetWatchlist />
        </div>

        {/* Right 1/4 Column — Live Alert Feed */}
        <div className="lg:col-span-1 h-full lg:sticky lg:top-6">
          <LiveAlertFeed />
        </div>
      </div>
    </div>
  )
}
