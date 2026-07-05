import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getHealthScoreHistory, getLatestHealthScore } from '@/lib/db/queries/health-scores'
import { extractTenantFromHeaders } from '@/lib/utils/tenant'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const tenantId = extractTenantFromHeaders(request.headers)
  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { assetId } = await params
  const { searchParams } = request.nextUrl
  const days = searchParams.get('days') ? parseInt(searchParams.get('days')!, 10) : 7
  const latestOnly = searchParams.get('latest') === 'true'

  try {
    if (latestOnly) {
      const score = await getLatestHealthScore(tenantId, assetId)
      return NextResponse.json({ success: true, data: score })
    }

    const history = await getHealthScoreHistory(tenantId, assetId, days)
    return NextResponse.json({ success: true, data: history })
  } catch (error) {
    console.error('[GET /api/health-scores/:assetId]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
