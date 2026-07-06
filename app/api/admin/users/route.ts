import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/client'
import { adminListUsers, adminCreateUser } from '@/lib/db/queries/admin/users'
import { recordAuditEvent } from '@/lib/db/queries/admin/audit'
import { requirePlatformRole, getStaffActor } from '@/lib/utils/staff'

export async function GET(request: NextRequest) {
  if (!requirePlatformRole(request.headers, 'ANALYST')) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  const { searchParams } = request.nextUrl

  try {
    const users = await adminListUsers({
      search: searchParams.get('search') ?? undefined,
      tenantId: searchParams.get('tenantId') ?? undefined,
    })
    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('[GET /api/admin/users]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

const createUserSchema = z.object({
  tenantId: z.string().min(1),
  email: z.string().email().max(120),
  name: z.string().min(1).max(80).optional(),
  role: z.enum(['TENANT_ADMIN', 'FACILITY_MANAGER', 'READ_ONLY']),
})

/** Adds a user to a tenant (Cognito provisioning + invite email land with auth go-live). */
export async function POST(request: NextRequest) {
  if (!requirePlatformRole(request.headers, 'SUPPORT')) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  const parsed = createUserSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    )
  }

  try {
    const tenant = await prisma.tenant.findUnique({ where: { id: parsed.data.tenantId } })
    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Tenant not found' }, { status: 404 })
    }

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 409 })
    }

    const user = await adminCreateUser(parsed.data)

    const actor = getStaffActor(request.headers)
    await recordAuditEvent({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'USER_CREATE',
      targetType: 'USER',
      targetId: user.id,
      tenantId: parsed.data.tenantId,
      metadata: { email: user.email, role: user.role },
    })

    return NextResponse.json({ success: true, data: user }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/users]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
