'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Activity, ArrowRight, Building2, ChevronRight, Zap, BarChart3 } from 'lucide-react';
import { NavReveal, GlitchTitle, Reveal, Stagger, StaggerChild } from '@/components/ui/motion-wrappers';
import { FlickeringFooter } from '@/components/ui/flickering-footer';

export default function DemoPage() {
  const isDemoMode = process.env.NEXT_PUBLIC_SYNTHETIC_MODE === 'true';

  if (isDemoMode) {
    redirect('/dashboard');
  }

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

      {/* Corner Frame Accents for Viewport */}
      <div className="fixed top-20 left-4 w-6 h-6 border-t-2 border-l-2 border-white/20 z-40 pointer-events-none"></div>
      <div className="fixed top-20 right-4 w-6 h-6 border-t-2 border-r-2 border-white/20 z-40 pointer-events-none"></div>
      <div className="fixed bottom-16 left-4 w-6 h-6 border-b-2 border-l-2 border-white/20 z-40 pointer-events-none"></div>
      <div className="fixed bottom-16 right-4 w-6 h-6 border-b-2 border-r-2 border-white/20 z-40 pointer-events-none"></div>

      {/* Hero / Form Container */}
      <main className="relative flex-1 flex items-center justify-center px-6 py-24 pt-32 z-10">
        <div className="max-w-4xl w-full mx-auto grid md:grid-cols-2 gap-12 items-stretch">
          
          {/* Info Side */}
          <div className="flex flex-col justify-between py-2">
            <div>
              <Reveal variant="up" delay={0.1}>
                <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#00D4AA]/30 bg-[#00D4AA]/5 text-[10px] font-mono text-[#00D4AA] uppercase tracking-wider mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
                  Guided live demo
                </div>
              </Reveal>

              <GlitchTitle delay={0.2}>
                <h1 className="text-3xl md:text-4xl font-bold tracking-wider text-white mb-6 uppercase">
                  See Clara AI
                  <span className="block text-[#00D4AA] mt-1 font-light font-mono">IN ACTION.</span>
                </h1>
              </GlitchTitle>

              <Reveal variant="up" delay={0.3}>
                <p className="text-[11px] leading-relaxed text-[#8B96A8] font-mono uppercase mb-8">
                  The Clara AI demo drops you into a fully populated portfolio — four facilities, 200+ monitored assets, and ten AI models generating live predictive alerts in real time.
                </p>
              </Reveal>

              <Stagger className="space-y-4 mb-8">
                {[
                  { icon: Building2, text: '4 facilities pre-configured (DC, Manufacturing, Commercial, Logistics)' },
                  { icon: BarChart3, text: 'CHL-01 chiller showing 45-day TTF with bearing fault analysis' },
                  { icon: Zap, text: 'Live energy anomaly on Cape Town Assembly at +25% baseline deviation' },
                ].map(item => (
                  <StaggerChild key={item.text} variant="up">
                    <div className="flex items-start gap-3 text-xs text-[#8B96A8] font-mono uppercase">
                      <item.icon className="w-4 h-4 flex-shrink-0 text-[#00D4AA]" />
                      <span>{item.text}</span>
                    </div>
                  </StaggerChild>
                ))}
              </Stagger>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/signup"
                className="relative px-6 py-3 bg-transparent text-white font-mono text-xs border border-[#00D4AA] hover:bg-[#00D4AA] hover:text-black transition-all duration-200 group flex items-center justify-center gap-2"
              >
                <span className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-[#00D4AA]"></span>
                <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-[#00D4AA]"></span>
                REQUEST DEMO ACCESS
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/pricing"
                className="text-xs font-mono text-[#8B96A8] hover:text-white uppercase flex items-center gap-1"
              >
                SEE PRICING <ChevronRight className="w-3.5 h-3.5 text-[#00D4AA]" />
              </Link>
            </div>
          </div>

          {/* Interactive Preview Panel */}
          <Reveal variant="right" className="relative p-6 border border-white/10 bg-[#111620]/60 backdrop-blur-sm flex flex-col justify-between">
            {/* Tech accents */}
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t border-l border-[#00D4AA]"></div>
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b border-r border-[#00D4AA]"></div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#5A6478]">
                  [ PORTFOLIO_HEALTH_PREVIEW ]
                </span>
                <div className="flex items-center gap-1 px-2 py-0.5 border border-[#00D4AA]/40 text-[8px] font-mono bg-[#00D4AA]/10 text-[#00D4AA]">
                  <span className="w-1 h-1 rounded-full bg-[#00D4AA] animate-pulse" />
                  LIVE
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'ESG Score', value: '78.4', unit: '/100', color: '#00D4AA' },
                  { label: 'Portfolio Health', value: '88.0', unit: '%', color: '#00D4AA' },
                  { label: 'Active Alerts', value: '16', unit: 'CRIT', color: '#E5484D' },
                  { label: 'Energy Saved', value: '12.4', unit: 'MWh', color: '#F5A623' },
                ].map(metric => (
                  <div
                    key={metric.label}
                    className="p-3 border border-white/5 bg-[#1C2438]/50 relative"
                  >
                    <div className="text-[8px] text-[#5A6478] font-mono uppercase mb-1">
                      {metric.label}
                    </div>
                    <div className="flex items-end gap-1">
                      <span
                        className="text-xl font-bold font-mono tracking-tight"
                        style={{ color: metric.color }}
                      >
                        {metric.value}
                      </span>
                      <span className="text-[8px] mb-0.5 text-[#5A6478] font-mono uppercase">
                        {metric.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 border border-[#E5484D]/20 bg-[#E5484D]/5 relative">
              <div className="absolute top-0 left-0 w-2 h-px bg-[#E5484D]"></div>
              <div className="absolute bottom-0 right-0 w-2 h-px bg-[#E5484D]"></div>
              <div className="flex items-start gap-3 font-mono text-[10px]">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-[#E5484D] animate-ping" />
                <div>
                  <div className="font-bold text-[#E5484D] uppercase mb-0.5">
                    CRITICAL — CHL-01 JOHANNESBURG DC-1
                  </div>
                  <div className="text-[#5A6478] uppercase">
                    Stage 2 Compressor Shaft Bearing Wear · 45d TTF · 89% confidence
                  </div>
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
