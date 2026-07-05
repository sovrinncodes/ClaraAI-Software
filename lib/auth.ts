import NextAuth from 'next-auth'
import Cognito from 'next-auth/providers/cognito'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      tenantId: string
      userRole: string
    }
  }
}

const region = process.env.AWS_REGION ?? 'af-south-1'
const userPoolId = process.env.COGNITO_USER_POOL_ID ?? ''

// In synthetic demo mode, Cognito is not provisioned. We still register the
// provider so Auth.js initialises cleanly, but the login page bypasses signIn()
// before it is ever invoked.
const providers = [
  Cognito({
    clientId: process.env.COGNITO_CLIENT_ID ?? 'placeholder',
    clientSecret: process.env.COGNITO_CLIENT_SECRET ?? 'placeholder',
    issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
  }),
]

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const p = profile as Record<string, unknown>
        token.tenantId = (p['custom:tenant_id'] as string) ?? ''
        token.userRole = (p['custom:role'] as string) ?? 'READ_ONLY'
        token.sub = p.sub as string
      }
      return token
    },

    async session({ session, token }) {
      session.user.id = token.sub as string
      session.user.tenantId = token.tenantId as string
      session.user.userRole = token.userRole as string
      return session
    },
  },
})
