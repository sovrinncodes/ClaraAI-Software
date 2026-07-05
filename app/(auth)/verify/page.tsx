'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MailCheck } from 'lucide-react'

function VerifyContent() {
  const params = useSearchParams()
  const email = params.get('email') ?? 'your email'

  return (
    <div className="text-center font-mono">
      <div
        className="w-12 h-12 flex items-center justify-center mx-auto mb-4 border border-[#00D4AA]/40 bg-[#00D4AA]/10"
      >
        <MailCheck className="w-6 h-6 text-[#00D4AA]" />
      </div>
      
      <h1 className="text-sm font-semibold tracking-wider uppercase mb-2 text-white">
        Inbox Dispatch verification
      </h1>
      
      <p className="text-[11px] leading-relaxed text-[#8B96A8] uppercase mb-6">
        A secure verification link was transmitted to <span className="text-white">{email}</span>.
        Access link to authenticate and initialize account workspace profile.
      </p>
      
      <Link
        href="/login"
        className="text-[10px] uppercase text-[#8B96A8] hover:text-[#00D4AA] transition-colors"
      >
        ← Return to sign in gate
      </Link>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  )
}
