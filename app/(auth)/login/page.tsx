'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, LogIn } from 'lucide-react'

// Accounts allowed to log in when NEXT_PUBLIC_SYNTHETIC_MODE=true.
// No passwords are stored — auth is enforced by the proxy and Cognito in production.
const SYNTHETIC_DEMO_EMAILS = new Set([
  'admin@cpt.co.za',
  'Precisekunle@gmail.com',
])

const SYNTHETIC_MODE = process.env.NEXT_PUBLIC_SYNTHETIC_MODE === 'true'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // In synthetic demo mode, Cognito is not provisioned. Skip the SDK call
    // and redirect directly — the proxy middleware handles all access control
    // for protected routes and injects the demo tenant context.
    if (SYNTHETIC_MODE) {
      if (!SYNTHETIC_DEMO_EMAILS.has(email)) {
        setLoading(false)
        setError('Account not found. Contact your administrator for access.')
        return
      }
      router.push('/dashboard')
      return
    }

    const result = await signIn('cognito', {
      redirect: false,
      email,
      password,
    })

    setLoading(false)

    if (result?.error) {
      setError('Invalid email or password. Please try again.')
      return
    }

    router.push('/dashboard')
  }

  return (
    <>
      <h1 className="text-sm font-semibold tracking-wider uppercase mb-1 text-white">
        System Sign in
      </h1>
      <p className="text-[10px] uppercase text-[#8B96A8] tracking-wider mb-6">
        Enter credentials to authenticate session
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-[9px] font-mono font-medium uppercase tracking-widest mb-1.5 text-[#8B96A8]"
          >
            User Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-none border border-white/10 text-xs font-mono transition-all outline-none bg-black/40 text-white placeholder-white/20 focus:border-[#00D4AA] focus:ring-1 focus:ring-[#00D4AA]"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-[9px] font-mono font-medium uppercase tracking-widest text-[#8B96A8]"
            >
              Session Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[9px] font-mono text-[#5A6478] hover:text-[#00D4AA] transition-colors uppercase"
            >
              Recover
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-none border border-white/10 text-xs font-mono transition-all outline-none bg-black/40 text-white placeholder-white/20 focus:border-[#00D4AA] focus:ring-1 focus:ring-[#00D4AA]"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-[10px] text-red-400 font-mono uppercase">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-none text-xs font-mono font-semibold border border-[#00D4AA] bg-transparent text-white hover:bg-[#00D4AA] hover:text-black transition-all duration-200 disabled:opacity-60 uppercase"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogIn className="w-3.5 h-3.5" />
          )}
          {loading ? 'Authenticating…' : 'Access Dashboard'}
        </button>
      </form>

      <p className="mt-6 text-center text-[10px] uppercase font-mono text-[#5A6478]">
        No active profile?{' '}
        <Link
          href="/signup"
          className="font-medium text-[#8B96A8] hover:text-[#00D4AA] transition-colors"
        >
          Request access
        </Link>
      </p>
    </>
  )
}
