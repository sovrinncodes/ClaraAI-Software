import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAssetById } from '@/lib/db/queries/assets'
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

  try {
    const asset = await getAssetById(tenantId, assetId)
    if (!asset) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: asset })
  } catch (error) {
    console.error('[GET /api/assets/:id]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
