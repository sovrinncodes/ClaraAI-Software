import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminGetPlatformStatus } from '@/lib/db/queries/admin/platform-status'
import { requirePlatformRole } from '@/lib/utils/staff'

export async function GET(request: NextRequest) {
  if (!requirePlatformRole(request.headers, 'ANALYST')) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  try {
    const status = await adminGetPlatformStatus()
    return NextResponse.json({ success: true, data: status })
  } catch (error) {
    console.error('[GET /api/admin/platform-status]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
