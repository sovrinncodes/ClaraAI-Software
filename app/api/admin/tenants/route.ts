import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma, rawPrisma } from '@/lib/db/client'
import { adminListTenantOverviews } from '@/lib/db/queries/admin/tenants'
import { recordAuditEvent } from '@/lib/db/queries/admin/audit'
import { cloneDemoTenant } from '@/lib/db/demo-seed'
import { requirePlatformRole, getStaffActor } from '@/lib/utils/staff'

export async function GET(request: NextRequest) {
  if (!requirePlatformRole(request.headers, 'ANALYST')) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  try {
    const tenants = await adminListTenantOverviews()
    return NextResponse.json({ success: true, data: tenants })
  } catch (error) {
    console.error('[GET /api/admin/tenants]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

const cloneTenantSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  industry: z.string().max(80).optional(),
})

/** Creates a new demo tenant cloned from the canonical scenario. */
export async function POST(request: NextRequest) {
  if (!requirePlatformRole(request.headers, 'SUPER_ADMIN')) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  const parsed = cloneTenantSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    )
  }

  try {
    const existing = await prisma.tenant.findUnique({ where: { slug: parsed.data.slug } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Slug already in use' }, { status: 409 })
    }

    const tenant = await cloneDemoTenant(rawPrisma, parsed.data)

    const actor = getStaffActor(request.headers)
    await recordAuditEvent({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'TENANT_CLONE',
      targetType: 'TENANT',
      targetId: tenant.id,
      tenantId: tenant.id,
      metadata: { name: tenant.name, slug: tenant.slug },
    })

    return NextResponse.json({ success: true, data: tenant }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/tenants]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
