import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminGetTenantUsage, adminGetAlertVolumeTrend } from '@/lib/db/queries/admin/analytics'
import { requirePlatformRole } from '@/lib/utils/staff'

export async function GET(request: NextRequest) {
  if (!requirePlatformRole(request.headers, 'ANALYST')) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  try {
    const [usage, trend] = await Promise.all([
      adminGetTenantUsage(),
      adminGetAlertVolumeTrend(14),
    ])
    return NextResponse.json({ success: true, data: { usage, trend } })
  } catch (error) {
    console.error('[GET /api/admin/analytics]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
