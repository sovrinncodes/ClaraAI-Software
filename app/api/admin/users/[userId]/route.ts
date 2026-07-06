import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/client'
import { adminUpdateUser } from '@/lib/db/queries/admin/users'
import { recordAuditEvent } from '@/lib/db/queries/admin/audit'
import { requirePlatformRole, getStaffActor } from '@/lib/utils/staff'

const patchUserSchema = z
  .object({
    role: z.enum(['TENANT_ADMIN', 'FACILITY_MANAGER', 'READ_ONLY']).optional(),
    platformRole: z.enum(['SUPER_ADMIN', 'SUPPORT', 'ANALYST']).nullable().optional(),
    isDisabled: z.boolean().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, { message: 'No changes provided' })

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Tenant-role changes and disabling need SUPPORT; staff-role grants need SUPER_ADMIN.
  if (!requirePlatformRole(request.headers, 'SUPPORT')) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  const parsed = patchUserSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    )
  }

  if (
    parsed.data.platformRole !== undefined &&
    !requirePlatformRole(request.headers, 'SUPER_ADMIN')
  ) {
    return NextResponse.json(
      { success: false, error: 'Only SUPER_ADMIN can change staff roles' },
      { status: 403 }
    )
  }

  const { userId } = await params

  try {
    const before = await prisma.user.findUnique({ where: { id: userId } })
    if (!before) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const user = await adminUpdateUser(userId, parsed.data)

    const actor = getStaffActor(request.headers)
    const action =
      parsed.data.platformRole === undefined
        ? 'USER_UPDATE'
        : parsed.data.platformRole === null
          ? 'ROLE_REVOKE'
          : 'ROLE_GRANT'

    await recordAuditEvent({
      actorId: actor.id,
      actorEmail: actor.email,
      action,
      targetType: 'USER',
      targetId: userId,
      tenantId: before.tenantId,
      metadata: {
        email: before.email,
        changes: parsed.data as Record<string, unknown>,
      },
    })

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('[PATCH /api/admin/users/:id]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
