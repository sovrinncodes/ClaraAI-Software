import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { adminUpdateAlertStatus } from '@/lib/db/queries/admin/support'
import { recordAuditEvent } from '@/lib/db/queries/admin/audit'
import { requirePlatformRole, getStaffActor } from '@/lib/utils/staff'

const patchAlertSchema = z.object({
  status: z.enum(['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'FALSE_POSITIVE']),
})

/** Support tool: change an alert's status on behalf of a tenant. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ alertId: string }> }
) {
  if (!requirePlatformRole(request.headers, 'SUPPORT')) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  const { alertId } = await params
  const parsed = patchAlertSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const alert = await adminUpdateAlertStatus(alertId, parsed.data.status)

    const actor = getStaffActor(request.headers)
    await recordAuditEvent({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'ALERT_STATUS_CHANGE',
      targetType: 'ALERT',
      targetId: alertId,
      tenantId: alert.tenantId,
      metadata: { status: parsed.data.status, title: alert.title },
    })

    return NextResponse.json({ success: true, data: alert })
  } catch (error) {
    console.error('[PATCH /api/admin/alerts/:id]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
