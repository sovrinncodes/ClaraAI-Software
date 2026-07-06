import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import {
  adminGetTenantDetail,
  adminUpdateTenantStatus,
  adminUpdateTenantSettings,
} from '@/lib/db/queries/admin/tenants'
import { recordAuditEvent } from '@/lib/db/queries/admin/audit'
import { requirePlatformRole, getStaffActor } from '@/lib/utils/staff'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  if (!requirePlatformRole(request.headers, 'ANALYST')) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  const { tenantId } = await params

  try {
    const detail = await adminGetTenantDetail(tenantId)
    if (!detail) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: detail })
  } catch (error) {
    console.error('[GET /api/admin/tenants/:id]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

const patchTenantSchema = z
  .object({
    status: z.enum(['ACTIVE', 'SUSPENDED', 'ARCHIVED']).optional(),
    plan: z.enum(['trial', 'starter', 'professional', 'enterprise']).optional(),
    featureFlags: z
      .object({
        acousticMonitor: z.boolean(),
        hotSpotTracker: z.boolean(),
      })
      .optional(),
  })
  .refine((body) => Object.keys(body).length > 0, { message: 'No changes provided' })

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  if (!requirePlatformRole(request.headers, 'SUPER_ADMIN')) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  const { tenantId } = await params
  const parsed = patchTenantSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    )
  }

  try {
    const { status, plan, featureFlags } = parsed.data
    const actor = getStaffActor(request.headers)
    let tenant = null

    if (status !== undefined) {
      tenant = await adminUpdateTenantStatus(tenantId, status)
      await recordAuditEvent({
        actorId: actor.id,
        actorEmail: actor.email,
        action: 'TENANT_STATUS_CHANGE',
        targetType: 'TENANT',
        targetId: tenantId,
        tenantId,
        metadata: { status },
      })
    }

    if (plan !== undefined || featureFlags !== undefined) {
      tenant = await adminUpdateTenantSettings(tenantId, { plan, featureFlags })
      if (!tenant) {
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
      }
      await recordAuditEvent({
        actorId: actor.id,
        actorEmail: actor.email,
        action: 'TENANT_SETTINGS_CHANGE',
        targetType: 'TENANT',
        targetId: tenantId,
        tenantId,
        metadata: {
          ...(plan !== undefined && { plan }),
          ...(featureFlags !== undefined && { featureFlags: { ...featureFlags } }),
        },
      })
    }

    return NextResponse.json({ success: true, data: tenant })
  } catch (error) {
    console.error('[PATCH /api/admin/tenants/:id]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
