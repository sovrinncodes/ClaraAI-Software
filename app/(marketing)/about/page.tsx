import { Activity } from 'lucide-react';
import Link from 'next/link';

import { NavReveal, GlitchTitle, Reveal } from '@/components/ui/motion-wrappers';
import { FlickeringFooter } from '@/components/ui/flickering-footer';

export default function AboutPage() {
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
            <h1 className="text-3xl md:text-5xl font-bold tracking-wider text-white mb-6 uppercase">
              About Clara AI
            </h1>
          </GlitchTitle>
          
          <Reveal variant="up" delay={0.2}>
            <div className="prose prose-invert max-w-none font-mono text-sm leading-relaxed text-[#8B96A8]">
              <p className="text-lg text-white mb-8 border-l-2 border-[#00D4AA] pl-4">
                We are engineering the intelligence layer for the world's most critical infrastructure.
              </p>
              
              <div className="grid md:grid-cols-2 gap-12 mt-12">
                <div>
                  <h2 className="text-[#00D4AA] text-xs uppercase tracking-widest mb-4">[ THE_MISSION ]</h2>
                  <p className="mb-6">
                    Industrial facilities, data centres, and commercial portfolios generate terabytes of telemetry data daily. Yet, most of this data sits idle, trapped in legacy building management systems.
                  </p>
                  <p className="mb-6">
                    Clara AI, a Sovrinn company, was founded to bridge the gap between raw telemetry and operational foresight. We deploy autonomous AI models that monitor every asset continuously, transforming reactive maintenance into predictive certainty.
                  </p>
                </div>
                <div>
                  <h2 className="text-[#00D4AA] text-xs uppercase tracking-widest mb-4">[ THE_TEAM ]</h2>
                  <p className="mb-6">
                    Based in South Africa but operating globally, our team consists of deep-learning engineers, industrial automation veterans, and ESG compliance experts.
                  </p>
                  <p className="mb-6">
                    We believe that reducing downtime and minimizing carbon footprints are not mutually exclusive goals. Through intelligent operations, we achieve both simultaneously.
                  </p>
                </div>
              </div>

              <div className="mt-16 p-8 border border-white/10 bg-[#111620]/60 relative">
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00D4AA]"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#00D4AA]"></div>
                <h3 className="text-white text-lg uppercase tracking-wider mb-4">Backed by Sovrinn</h3>
                <p>
                  Clara AI is proudly backed and operated by Sovrinn, giving us the scale, security, and industrial pedigree required to partner with the world's largest facility operators.
                </p>
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
