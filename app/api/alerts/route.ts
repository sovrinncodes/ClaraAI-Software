import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAlerts, getAlertCounts, acknowledgeAlert, resolveAlert } from '@/lib/db/queries/alerts'
import { extractTenantFromHeaders } from '@/lib/utils/tenant'
import { alertActionSchema } from '@/lib/validation/schemas'
import type { AlertSeverity, AlertStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  const tenantId = extractTenantFromHeaders(request.headers)
  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const facilityId = searchParams.get('facilityId') ?? undefined
  const assetId = searchParams.get('assetId') ?? undefined
  const severity = searchParams.get('severity') as AlertSeverity | null
  const status = (searchParams.get('status') as AlertStatus | null) ?? 'ACTIVE'
  const countsOnly = searchParams.get('countsOnly') === 'true'
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50

  try {
    if (countsOnly) {
      const counts = await getAlertCounts(tenantId)
      return NextResponse.json({ success: true, data: counts })
    }

    const alerts = await getAlerts(tenantId, {
      facilityId,
      assetId,
      ...(severity && { severity }),
      status,
      limit,
    })
    return NextResponse.json({ success: true, data: alerts })
  } catch (error) {
    console.error('[GET /api/alerts]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const tenantId = extractTenantFromHeaders(request.headers)
  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = alertActionSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { alertId, action } = parsed.data

  try {
    const updated =
      action === 'acknowledge'
        ? await acknowledgeAlert(tenantId, alertId)
        : await resolveAlert(tenantId, alertId)
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[PATCH /api/alerts]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
