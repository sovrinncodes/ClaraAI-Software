import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'

const region = process.env.AWS_REGION ?? 'af-south-1'
const userPoolId = process.env.COGNITO_USER_POOL_ID ?? ''

const JWKS_URL = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`
const ISSUER = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`

// Cached JWKS — reused across Lambda warm invocations
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null

function getJwks() {
  if (!jwks) jwks = createRemoteJWKSet(new URL(JWKS_URL))
  return jwks
}

export interface CognitoClaims extends JWTPayload {
  'custom:tenant_id'?: string
  'custom:role'?: string
  email?: string
  name?: string
  sub: string
}

export async function verifyCognitoToken(token: string): Promise<CognitoClaims> {
  const { payload } = await jwtVerify(token, getJwks(), {
    issuer: ISSUER,
    algorithms: ['RS256'],
  })
  return payload as CognitoClaims
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}

export function extractTenantId(claims: CognitoClaims): string | null {
  return claims['custom:tenant_id'] ?? null
}

export function extractUserRole(claims: CognitoClaims): string {
  return claims['custom:role'] ?? 'READ_ONLY'
}
