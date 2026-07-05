import { NextRequest, NextResponse } from 'next/server'
import { extractTenantFromHeaders } from '@/lib/utils/tenant'
import { getLatestEsgScore, getPortfolioEnergySavingsMtd } from '@/lib/db/queries/esg'
import { getPortfolioHealthIndex } from '@/lib/db/queries/health-scores'
import { getAlertCounts } from '@/lib/db/queries/alerts'
import { PORTFOLIO_KPIS } from '@/lib/data/seed'

const TARIFF_ZAR_PER_KWH = 1.5

export async function GET(request: NextRequest) {
  try {
    const tenantId = extractTenantFromHeaders(request.headers)
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const mtdStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [esgScore, healthIndex, alertCounts, savedKwhMtd] = await Promise.all([
      getLatestEsgScore(tenantId),
      getPortfolioHealthIndex(tenantId),
      getAlertCounts(tenantId),
      getPortfolioEnergySavingsMtd(tenantId, mtdStart, now),
    ])

    // When the DB is empty (first run before seed), fall back to demo values
    const hasRealData = esgScore !== null || alertCounts.total > 0

    if (!hasRealData) {
      return NextResponse.json({
        success: true,
        data: {
          esgScore: {
            composite: PORTFOLIO_KPIS.esgInsightScore,
            trend: PORTFOLIO_KPIS.esgTrend,
          },
          portfolioHealth: {
            index: PORTFOLIO_KPIS.portfolioHealthIndex,
            trend: PORTFOLIO_KPIS.healthTrend,
          },
          energyOptimisedMtd: {
            mwhSaved: PORTFOLIO_KPIS.energyOptimisedMwhMtd,
            costSavedZar: PORTFOLIO_KPIS.energySavingsZar,
          },
          activeAlerts: {
            critical: PORTFOLIO_KPIS.criticalAlertCount,
            advisory: PORTFOLIO_KPIS.advisoryAlertCount,
            watch: 0,
            total: PORTFOLIO_KPIS.activeAlertCount,
          },
        },
      })
    }

    const mwhSaved = Math.round((savedKwhMtd / 1000) * 10) / 10
    const costSavedZar = Math.round(savedKwhMtd * TARIFF_ZAR_PER_KWH)

    return NextResponse.json({
      success: true,
      data: {
        esgScore: {
          composite: esgScore ? Math.round(esgScore.compositeScore * 10) / 10 : null,
          trend: null,
        },
        portfolioHealth: {
          index: Math.round(healthIndex * 10) / 10,
          trend: null,
        },
        energyOptimisedMtd: {
          mwhSaved,
          costSavedZar,
        },
        activeAlerts: alertCounts,
      },
    })
  } catch (err) {
    console.error('[GET /api/portfolio-kpis]', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
