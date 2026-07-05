import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminGetPlatformStats } from '@/lib/db/queries/admin/stats'
import { requirePlatformRole } from '@/lib/utils/staff'

export async function GET(request: NextRequest) {
  if (!requirePlatformRole(request.headers, 'ANALYST')) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  try {
    const stats = await adminGetPlatformStats()
    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('[GET /api/admin/stats]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
