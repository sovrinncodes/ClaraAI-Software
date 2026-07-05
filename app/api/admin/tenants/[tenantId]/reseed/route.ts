import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rawPrisma } from '@/lib/db/client'
import { resetDemoTenant } from '@/lib/db/demo-seed'
import { recordAuditEvent } from '@/lib/db/queries/admin/audit'
import { requirePlatformRole, getStaffActor } from '@/lib/utils/staff'

/** Restores a demo tenant to its pristine scenario state. Demo tenants only. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  if (!requirePlatformRole(request.headers, 'SUPER_ADMIN')) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  const { tenantId } = await params

  try {
    await resetDemoTenant(rawPrisma, tenantId)

    const actor = getStaffActor(request.headers)
    await recordAuditEvent({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'TENANT_RESEED',
      targetType: 'TENANT',
      targetId: tenantId,
      tenantId,
    })

    return NextResponse.json({ success: true, data: { tenantId } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    if (message === 'Tenant not found') {
      return NextResponse.json({ success: false, error: message }, { status: 404 })
    }
    if (message === 'Refusing to reset a non-demo tenant') {
      return NextResponse.json({ success: false, error: message }, { status: 403 })
    }
    console.error('[POST /api/admin/tenants/:id/reseed]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
