import { Activity } from 'lucide-react';
import Link from 'next/link';

import { NavReveal, GlitchTitle, Reveal } from '@/components/ui/motion-wrappers';
import { FlickeringFooter } from '@/components/ui/flickering-footer';

export default function SecurityPage() {
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
        <div className="max-w-4xl mx-auto">
          <GlitchTitle>
            <h1 className="text-3xl md:text-5xl font-bold tracking-wider text-white mb-6 uppercase text-center">
              System Security
            </h1>
          </GlitchTitle>
          
          <Reveal variant="up" delay={0.2}>
            <div className="prose prose-invert max-w-none font-mono text-sm leading-relaxed text-[#8B96A8]">
              <p className="text-center mb-12 uppercase tracking-widest text-xs">
                Clara AI is engineered with defense-in-depth principles for critical infrastructure.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-6 border border-white/10 bg-[#111620]/60 relative">
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00D4AA]"></div>
                  <h3 className="text-[#00D4AA] text-xs uppercase tracking-widest mb-3">[ ENCRYPTION ]</h3>
                  <p className="text-[11px] uppercase leading-relaxed">
                    All telemetry, health scores, and metadata are encrypted at rest using AES-256. Data in transit is secured via TLS 1.2 or higher. We employ automated key rotation and strictly managed HSMs.
                  </p>
                </div>

                <div className="p-6 border border-white/10 bg-[#111620]/60 relative">
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00D4AA]"></div>
                  <h3 className="text-[#00D4AA] text-xs uppercase tracking-widest mb-3">[ ISOLATION ]</h3>
                  <p className="text-[11px] uppercase leading-relaxed">
                    Tenant data is logically isolated at the database level. Dedicated ingestion endpoints and scoped API keys ensure cross-tenant data leakage is structurally impossible.
                  </p>
                </div>

                <div className="p-6 border border-white/10 bg-[#111620]/60 relative">
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00D4AA]"></div>
                  <h3 className="text-[#00D4AA] text-xs uppercase tracking-widest mb-3">[ COMPLIANCE ]</h3>
                  <p className="text-[11px] uppercase leading-relaxed">
                    Our infrastructure stack is fully compliant with ISO 27001 and SOC 2 Type II. We support GDPR, POPIA, and CCPA data processing requirements out of the box.
                  </p>
                </div>

                <div className="p-6 border border-white/10 bg-[#111620]/60 relative">
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00D4AA]"></div>
                  <h3 className="text-[#00D4AA] text-xs uppercase tracking-widest mb-3">[ ACCESS_CONTROL ]</h3>
                  <p className="text-[11px] uppercase leading-relaxed">
                    We support SAML 2.0 and OIDC for Single Sign-On (SSO). Granular Role-Based Access Control (RBAC) allows you to restrict dashboard views and alert thresholds down to the individual sensor level.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </main>

      {/* Footer */}
      <FlickeringFooter />
    </div>
  );
}
