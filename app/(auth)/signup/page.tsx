'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight, Check } from 'lucide-react'

type Step = 'account' | 'verify' | 'industry'

const INDUSTRY_OPTIONS = [
  { value: 'data_centre', label: 'Data Centre / Co-location' },
  { value: 'manufacturing', label: 'Manufacturing & Industrial' },
  { value: 'commercial_re', label: 'Commercial Real Estate' },
  { value: 'logistics', label: 'Logistics & Warehousing' },
  { value: 'agriculture', label: 'Agriculture & Agri-processing' },
  { value: 'other', label: 'Other' },
]

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('account')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: '',
    verifyCode: '',
    industry: '',
  })

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 800)) // placeholder delay
    setLoading(false)
    setStep('verify')
  }

  async function handleVerifySubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setLoading(false)
    setStep('industry')
  }

  async function handleIndustrySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.industry) {
      setError('Please select your industry.')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setLoading(false)
    router.push('/dashboard')
  }

  const inputClass =
    'w-full px-3 py-2 rounded-none border border-white/10 text-xs font-mono transition-all outline-none bg-black/40 text-white placeholder-white/20 focus:border-[#00D4AA] focus:ring-1 focus:ring-[#00D4AA]'
  const labelClass = 'block text-[9px] font-mono font-medium uppercase tracking-widest mb-1.5 text-[#8B96A8]'

  const steps: Step[] = ['account', 'verify', 'industry']
  const stepIdx = steps.indexOf(step)

  return (
    <>
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-mono font-bold transition-all"
              style={{
                backgroundColor: i <= stepIdx ? '#00D4AA' : 'transparent',
                color: i <= stepIdx ? '#0A0D14' : '#5A6478',
                border: i <= stepIdx ? '1px solid #00D4AA' : '1px solid rgba(255,255,255,0.15)',
              }}
            >
              {i < stepIdx ? <Check className="w-2.5 h-2.5" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className="w-8 h-px"
                style={{ backgroundColor: i < stepIdx ? '#00D4AA' : 'rgba(255,255,255,0.15)' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step: Account */}
      {step === 'account' && (
        <>
          <h1 className="text-sm font-semibold tracking-wider uppercase mb-1 text-white">
            Register Profile
          </h1>
          <p className="text-[10px] uppercase text-[#8B96A8] tracking-wider mb-6">
            Free 30-day trial session allocation
          </p>
          <form onSubmit={handleAccountSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelClass}>Full name</label>
                <input className={inputClass} type="text" required
                  value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Jane Smith" />
              </div>
              <div>
                <label className={labelClass}>Work email</label>
                <input className={inputClass} type="email" required
                  value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="jane@company.com" />
              </div>
              <div>
                <label className={labelClass}>Company name</label>
                <input className={inputClass} type="text" required
                  value={form.company} onChange={(e) => update('company', e.target.value)} placeholder="Acme Corp" />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <input className={inputClass} type="password" required minLength={8}
                  value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Min. 8 characters" />
              </div>
              <div>
                <label className={labelClass}>Confirm password</label>
                <input className={inputClass} type="password" required
                  value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="Repeat password" />
              </div>
            </div>
            {error && <p className="text-[10px] text-red-400 font-mono uppercase">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-none text-xs font-mono font-semibold border border-[#00D4AA] bg-transparent text-white hover:bg-[#00D4AA] hover:text-black transition-all duration-200 disabled:opacity-60 uppercase">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
              {loading ? 'Processing…' : 'Continue Enrollment'}
            </button>
          </form>
          <p className="mt-6 text-center text-[10px] uppercase font-mono text-[#5A6478]">
            Already enrolled?{' '}
            <Link href="/login" className="font-medium text-[#8B96A8] hover:text-[#00D4AA] transition-colors">
              Sign in
            </Link>
          </p>
        </>
      )}

      {/* Step: Verify */}
      {step === 'verify' && (
        <>
          <h1 className="text-sm font-semibold tracking-wider uppercase mb-1 text-white">
            Verify Identity
          </h1>
          <p className="text-[10px] uppercase text-[#8B96A8] tracking-wider mb-6">
            We sent a 6-digit access code to <span className="text-white">{form.email}</span>
          </p>
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Verification code</label>
              <input className={inputClass} type="text" required
                maxLength={6} pattern="[0-9]{6}"
                value={form.verifyCode} onChange={(e) => update('verifyCode', e.target.value)}
                placeholder="123456" />
            </div>
            {error && <p className="text-[10px] text-red-400 font-mono uppercase">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-none text-xs font-mono font-semibold border border-[#00D4AA] bg-transparent text-white hover:bg-[#00D4AA] hover:text-black transition-all duration-200 disabled:opacity-60 uppercase">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {loading ? 'Verifying…' : 'Verify credentials'}
            </button>
          </form>
        </>
      )}

      {/* Step: Industry */}
      {step === 'industry' && (
        <>
          <h1 className="text-sm font-semibold tracking-wider uppercase mb-1 text-white">
            Operational Scope
          </h1>
          <p className="text-[10px] uppercase text-[#8B96A8] tracking-wider mb-6">
            Select target industry parameter context
          </p>
          <form onSubmit={handleIndustrySubmit} className="space-y-3">
            {INDUSTRY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('industry', opt.value)}
                className="w-full text-left px-3 py-2.5 rounded-none border text-xs transition-all duration-150 font-mono uppercase"
                style={{
                  backgroundColor: form.industry === opt.value ? 'rgba(0, 212, 170, 0.08)' : 'transparent',
                  borderColor: form.industry === opt.value ? '#00D4AA' : 'rgba(255,255,255,0.08)',
                  color: form.industry === opt.value ? '#00D4AA' : '#8B96A8',
                }}
              >
                <div className="flex justify-between items-center">
                  <span>{opt.label}</span>
                  {form.industry === opt.value && <span className="text-[8px]">[ SELECTED ]</span>}
                </div>
              </button>
            ))}
            {error && <p className="text-[10px] text-red-400 font-mono uppercase">{error}</p>}
            <button type="submit" disabled={loading || !form.industry}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-none text-xs font-mono font-semibold border border-[#00D4AA] bg-transparent text-white hover:bg-[#00D4AA] hover:text-black transition-all duration-200 disabled:opacity-60 uppercase mt-4">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
              {loading ? 'Initializing…' : 'Access main system'}
            </button>
          </form>
        </>
      )}
    </>
  )
}
