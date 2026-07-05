import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getFacilityById } from '@/lib/db/queries/facilities'
import { extractTenantFromHeaders } from '@/lib/utils/tenant'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ facilityId: string }> }
) {
  const tenantId = extractTenantFromHeaders(request.headers)
  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { facilityId } = await params

  try {
    const facility = await getFacilityById(tenantId, facilityId)
    if (!facility) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: facility })
  } catch (error) {
    console.error('[GET /api/facilities/:id]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
