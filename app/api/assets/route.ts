import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAssets, getWatchlistAssets } from '@/lib/db/queries/assets'
import { extractTenantFromHeaders } from '@/lib/utils/tenant'
import type { AssetType } from '@prisma/client'

export async function GET(request: NextRequest) {
  const tenantId = extractTenantFromHeaders(request.headers)
  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const facilityId = searchParams.get('facilityId') ?? undefined
  const type = searchParams.get('type') as AssetType | null
  const watchlist = searchParams.get('watchlist') === 'true'
  const search = searchParams.get('search') ?? undefined

  try {
    if (watchlist) {
      const assets = await getWatchlistAssets(tenantId)
      return NextResponse.json({ success: true, data: assets })
    }

    const assets = await getAssets(tenantId, {
      facilityId,
      ...(type && { type }),
      search,
    })
    return NextResponse.json({ success: true, data: assets })
  } catch (error) {
    console.error('[GET /api/assets]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
