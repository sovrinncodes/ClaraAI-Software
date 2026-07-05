// Signed impersonation token — HMAC-SHA256 via Web Crypto so it runs in both
// the proxy (edge runtime) and Node route handlers.

export const IMPERSONATION_COOKIE = 'clara_impersonate'
export const IMPERSONATION_TTL_SECONDS = 60 * 60 // staff view-as sessions expire after 1h

export interface ImpersonationPayload {
  tenantId: string
  tenantName: string
  staffUserId: string
  staffEmail: string
  exp: number // unix seconds
}

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error('NEXTAUTH_SECRET is not configured')
  return secret
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function hmacSign(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  return base64UrlEncode(new Uint8Array(signature))
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

export async function signImpersonationToken(
  payload: Omit<ImpersonationPayload, 'exp'>
): Promise<string> {
  const full: ImpersonationPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + IMPERSONATION_TTL_SECONDS,
  }
  const encoded = base64UrlEncode(new TextEncoder().encode(JSON.stringify(full)))
  const signature = await hmacSign(encoded)
  return `${encoded}.${signature}`
}

/** Returns the payload when the token is authentic and unexpired, else null. */
export async function verifyImpersonationToken(
  token: string | undefined
): Promise<ImpersonationPayload | null> {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [encoded, signature] = parts

  try {
    const expected = await hmacSign(encoded)
    if (!timingSafeEqual(signature, expected)) return null

    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(encoded))
    ) as ImpersonationPayload

    if (!payload.tenantId || !payload.exp) return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}
