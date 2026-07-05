import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getFacilities } from '@/lib/db/queries/facilities'
import { extractTenantFromHeaders } from '@/lib/utils/tenant'
import type { FacilityStatus, FacilityType } from '@prisma/client'

export async function GET(request: NextRequest) {
  const tenantId = extractTenantFromHeaders(request.headers)
  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const status = searchParams.get('status') as FacilityStatus | null
  const type = searchParams.get('type') as FacilityType | null
  const search = searchParams.get('search') ?? undefined

  try {
    const facilities = await getFacilities(tenantId, {
      ...(status && { status }),
      ...(type && { type }),
      search,
    })
    return NextResponse.json({ success: true, data: facilities })
  } catch (error) {
    console.error('[GET /api/facilities]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
