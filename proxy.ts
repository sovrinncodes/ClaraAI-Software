import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyCognitoToken, extractBearerToken, extractTenantId } from '@/lib/aws/cognito'
import { isPlatformRole } from '@/lib/utils/staff'
import { IMPERSONATION_COOKIE, verifyImpersonationToken } from '@/lib/utils/impersonation'
import type { PlatformRole } from '@/types/admin'

const PUBLIC_PATHS = ['/login', '/signup', '/verify', '/api/auth']
const SYNTHETIC_MODE = process.env.NEXT_PUBLIC_SYNTHETIC_MODE === 'true'

// Headers that carry trusted identity downstream. Always stripped from the
// incoming request so clients can never spoof them.
const TRUST_HEADERS = [
  'x-tenant-id',
  'x-user-id',
  'x-user-role',
  'x-platform-role',
  'x-impersonating',
  'x-impersonating-tenant-name',
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p))
}

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/api/admin')
}

function cleanRequestHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers)
  for (const name of TRUST_HEADERS) headers.delete(name)
  return headers
}

function getSyntheticPlatformRole(): PlatformRole | null {
  const value = process.env.SYNTHETIC_PLATFORM_ROLE
  return isPlatformRole(value) ? value : null
}

/**
 * When a valid impersonation cookie is present AND the caller is staff,
 * override the tenant context so the app renders as that tenant.
 */
async function applyImpersonation(
  request: NextRequest,
  headers: Headers,
  platformRole: PlatformRole | null
): Promise<void> {
  if (!platformRole) return
  const token = request.cookies.get(IMPERSONATION_COOKIE)?.value
  const payload = await verifyImpersonationToken(token)
  if (!payload) return

  headers.set('x-tenant-id', payload.tenantId)
  headers.set('x-impersonating', 'true')
  headers.set('x-impersonating-tenant-name', encodeURIComponent(payload.tenantName))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow public routes and Next.js internals
  if (isPublicPath(pathname)) return NextResponse.next()

  // In synthetic demo mode, inject the demo tenant and skip Cognito
  if (SYNTHETIC_MODE) {
    const requestHeaders = cleanRequestHeaders(request)
    requestHeaders.set('x-tenant-id', 'tenant_cpt')
    requestHeaders.set('x-user-role', 'TENANT_ADMIN')

    const platformRole = getSyntheticPlatformRole()
    if (platformRole) requestHeaders.set('x-platform-role', platformRole)

    // Staff surface is invisible without a platform role
    if (isAdminPath(pathname) && !platformRole) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    await applyImpersonation(request, requestHeaders, platformRole)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // Production: validate Cognito JWT from Authorization header or session cookie
  const authHeader = request.headers.get('authorization')
  const token = extractBearerToken(authHeader)

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const claims = await verifyCognitoToken(token)
    const tenantId = extractTenantId(claims)

    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant claim in token' }, { status: 403 })
    }

    const claimedRole = (claims as Record<string, unknown>)['custom:platform_role']
    const platformRole = isPlatformRole(typeof claimedRole === 'string' ? claimedRole : null)
      ? (claimedRole as PlatformRole)
      : null

    // Staff surface is invisible without a platform role
    if (isAdminPath(pathname) && !platformRole) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    // Inject tenant context into downstream request headers
    const requestHeaders = cleanRequestHeaders(request)
    requestHeaders.set('x-tenant-id', tenantId)
    requestHeaders.set('x-user-id', claims.sub)
    requestHeaders.set('x-user-role', claims['custom:role'] ?? 'READ_ONLY')
    if (platformRole) requestHeaders.set('x-platform-role', platformRole)

    await applyImpersonation(request, requestHeaders, platformRole)
    return NextResponse.next({ request: { headers: requestHeaders } })
  } catch {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
