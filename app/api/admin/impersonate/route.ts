import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/client'
import { recordAuditEvent } from '@/lib/db/queries/admin/audit'
import { requirePlatformRole, getStaffActor } from '@/lib/utils/staff'
import {
  IMPERSONATION_COOKIE,
  IMPERSONATION_TTL_SECONDS,
  signImpersonationToken,
  verifyImpersonationToken,
} from '@/lib/utils/impersonation'

const impersonateSchema = z.object({
  tenantId: z.string().min(1),
})

/** Starts a view-as session: signed cookie + audit trail. SUPPORT and above. */
export async function POST(request: NextRequest) {
  if (!requirePlatformRole(request.headers, 'SUPPORT')) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  const parsed = impersonateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const tenant = await prisma.tenant.findUnique({ where: { id: parsed.data.tenantId } })
    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Tenant not found' }, { status: 404 })
    }
    if (tenant.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: `Cannot impersonate a ${tenant.status.toLowerCase()} tenant` },
        { status: 409 }
      )
    }

    const actor = getStaffActor(request.headers)
    const token = await signImpersonationToken({
      tenantId: tenant.id,
      tenantName: tenant.name,
      staffUserId: actor.id,
      staffEmail: actor.email,
    })

    await recordAuditEvent({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'IMPERSONATE_START',
      targetType: 'TENANT',
      targetId: tenant.id,
      tenantId: tenant.id,
      metadata: { tenantName: tenant.name },
    })

    const response = NextResponse.json({ success: true, data: { tenantId: tenant.id } })
    response.cookies.set(IMPERSONATION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: IMPERSONATION_TTL_SECONDS,
    })
    return response
  } catch (error) {
    console.error('[POST /api/admin/impersonate]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

/** Ends the view-as session. */
export async function DELETE(request: NextRequest) {
  if (!requirePlatformRole(request.headers, 'SUPPORT')) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  try {
    const payload = await verifyImpersonationToken(
      request.cookies.get(IMPERSONATION_COOKIE)?.value
    )
    if (payload) {
      const actor = getStaffActor(request.headers)
      await recordAuditEvent({
        actorId: actor.id,
        actorEmail: actor.email,
        action: 'IMPERSONATE_END',
        targetType: 'TENANT',
        targetId: payload.tenantId,
        tenantId: payload.tenantId,
        metadata: { tenantName: payload.tenantName },
      })
    }

    const response = NextResponse.json({ success: true, data: null })
    response.cookies.delete(IMPERSONATION_COOKIE)
    return response
  } catch (error) {
    console.error('[DELETE /api/admin/impersonate]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
