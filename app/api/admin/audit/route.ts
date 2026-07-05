import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminListAuditEvents } from '@/lib/db/queries/admin/audit'
import { requirePlatformRole } from '@/lib/utils/staff'

export async function GET(request: NextRequest) {
  if (!requirePlatformRole(request.headers, 'ANALYST')) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  const { searchParams } = request.nextUrl
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  try {
    const events = await adminListAuditEvents({
      action: searchParams.get('action') ?? undefined,
      tenantId: searchParams.get('tenantId') ?? undefined,
      actorEmail: searchParams.get('actorEmail') ?? undefined,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    })
    return NextResponse.json({ success: true, data: events })
  } catch (error) {
    console.error('[GET /api/admin/audit]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
