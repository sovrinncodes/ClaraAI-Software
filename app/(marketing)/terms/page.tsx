import { Activity } from 'lucide-react';
import Link from 'next/link';

import { NavReveal, GlitchTitle, Reveal } from '@/components/ui/motion-wrappers';
import { FlickeringFooter } from '@/components/ui/flickering-footer';

export default function TermsofServicePage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-black text-[#E4EAF3] font-mono selection:bg-[#00D4AA] selection:text-black">
      {/* Stars Background */}
      <div className="absolute inset-0 w-full h-full stars-bg opacity-20 pointer-events-none z-0"></div>

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <NavReveal className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[90vw] z-50 flex items-center justify-between px-6 lg:px-16 h-16 border-b border-white/10 bg-black/85 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-mono text-white text-xl font-bold tracking-widest italic transform -skew-x-12 flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center bg-[#00D4AA]/15 border border-[#00D4AA]/40">
              <Activity className="w-3.5 h-3.5 text-[#00D4AA]" />
            </div>
            CLARA<span className="text-[#00D4AA]">AI</span>
          </Link>
          <div className="h-4 w-px bg-white/20 hidden sm:block"></div>
          <span className="text-white/40 text-[9px] font-mono uppercase hidden sm:inline tracking-wider">EST. 2025 // SYSTEM_ACTIVE</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-wider font-mono">
          {['Product', 'Solutions', 'Pricing'].map(item => (
            <Link
              key={item}
              href={item === 'Pricing' ? '/pricing' : item === 'Solutions' ? '/solutions' : item === 'Product' ? '/product' : '#'}
              className="text-white/60 transition-colors hover:text-[#00D4AA]"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <Link
            href="/login"
            className="text-white/60 hover:text-white transition-colors"
          >
            SIGN IN
          </Link>
          <Link
            href="/demo"
            className="relative px-4 py-2 border border-[#00D4AA] text-[#00D4AA] hover:bg-[#00D4AA] hover:text-black transition-all duration-200"
          >
            VIEW DEMO
          </Link>
        </div>
      </NavReveal>

      {/* Main Content */}
      <main className="relative flex-1 px-6 py-32 z-10">
        <div className="max-w-3xl mx-auto">
          <GlitchTitle>
            <h1 className="text-3xl md:text-5xl font-bold tracking-wider text-white mb-6 uppercase">
              Terms of Service
            </h1>
          </GlitchTitle>
          
          <Reveal variant="up" delay={0.2}>
            <div className="prose prose-invert max-w-none font-mono text-[11px] leading-loose text-[#8B96A8] uppercase">
              <p className="mb-8 border-b border-white/10 pb-4">Last Updated: July 2026</p>

              <h2 className="text-[#00D4AA] text-sm tracking-widest mt-12 mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing or integrating with the Clara AI platform (operated by Sovrinn), you agree to be bound by these Terms of Service. These terms govern your use of the API, dashboards, predictive models, and all related services.
              </p>

              <h2 className="text-[#00D4AA] text-sm tracking-widest mt-12 mb-4">2. License & Restrictions</h2>
              <p className="mb-4">
                We grant you a non-exclusive, non-transferable license to use Clara AI for your internal business operations. You may not reverse engineer, decompile, or extract the underlying AI models, algorithms, or scoring weights from the platform.
              </p>

              <h2 className="text-[#00D4AA] text-sm tracking-widest mt-12 mb-4">3. Data Ownership</h2>
              <p className="mb-4">
                You retain full ownership of all raw telemetry data ingested into the system. Clara AI retains ownership of the predictive models, health scores, and platform infrastructure. We reserve the right to use anonymized, aggregated telemetry to improve our core AI models.
              </p>

              <h2 className="text-[#00D4AA] text-sm tracking-widest mt-12 mb-4">4. Limitation of Liability</h2>
              <p className="mb-4">
                Clara AI provides predictive maintenance alerts and ESG reporting metrics. While our models operate with high confidence, we do not guarantee the prevention of all hardware failures. Sovrinn shall not be liable for any indirect, consequential, or operational losses arising from the use or inability to use the platform.
              </p>
            </div>
          </Reveal>
        </div>
      </main>

      {/* Footer */}
      <FlickeringFooter />
    </div>
  );
}
