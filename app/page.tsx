'use client';

import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Leaf,
  Shield,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Reveal,
  Stagger,
  StaggerChild,
  AnimatedCounter,
  GlitchTitle,
  ScanLine,
  NavReveal,
  HeroReveal,
} from '@/components/ui/motion-wrappers';
import { usePreloaderDone } from '@/components/ui/preloader';
import { FlickeringFooter } from '@/components/ui/flickering-footer';

export default function LandingPage() {
  const preloaderDone = usePreloaderDone();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-[#E4EAF3] font-mono selection:bg-[#00D4AA] selection:text-black">

      {/* ── Background Hero Image — fades in after preloader ──────────────────── */}
      <motion.div
        className="absolute inset-0 h-screen w-full overflow-hidden pointer-events-none z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: preloaderDone ? 1 : 0 }}
        transition={{ duration: 2.0, delay: 0.5, ease: 'easeOut' }}
      >
        <img
          src="/clara_hero_bg.gif"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
        />
        {/* Fading dark overlay (heavier on the left, fading to the right) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10"></div>
      </motion.div>

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <NavReveal className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[90vw] z-50 flex items-center justify-between px-6 lg:px-16 h-16 border-b border-white/10 bg-black/85 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="font-mono text-white text-xl font-bold tracking-widest italic transform -skew-x-12 flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center bg-[#00D4AA]/15 border border-[#00D4AA]/40">
              <Activity className="w-3.5 h-3.5 text-[#00D4AA]" />
            </div>
            CLARA<span className="text-[#00D4AA]">AI</span>
          </div>
          <div className="h-4 w-px bg-white/20 hidden sm:block"></div>
          <span className="text-white/40 text-[9px] font-mono uppercase hidden sm:inline tracking-wider">EST. 2025 // SYSTEM_ACTIVE</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-wider font-mono">
          {[
            { label: 'Product', href: '/product' },
            { label: 'Solutions', href: '/solutions' },
            { label: 'Pricing', href: '/pricing' },
          ].map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="text-white/60 transition-colors hover:text-[#00D4AA]"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <Link href="/login" className="text-white/60 hover:text-white transition-colors">SIGN IN</Link>
          <Link href="/demo" className="relative px-4 py-2 border border-[#00D4AA] text-[#00D4AA] hover:bg-[#00D4AA] hover:text-black transition-all duration-200">VIEW DEMO</Link>
        </div>
      </NavReveal>

      {/* Corner Frame Accents for Viewport */}
      <div className="fixed top-20 left-4 w-6 h-6 border-t-2 border-l-2 border-white/20 z-40 pointer-events-none"></div>
      <div className="fixed top-20 right-4 w-6 h-6 border-t-2 border-r-2 border-white/20 z-40 pointer-events-none"></div>
      <div className="fixed bottom-16 left-4 w-6 h-6 border-b-2 border-l-2 border-white/20 z-40 pointer-events-none"></div>
      <div className="fixed bottom-16 right-4 w-6 h-6 border-b-2 border-r-2 border-white/20 z-40 pointer-events-none"></div>

      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-24 lg:pt-0 z-10">
        <div className="container mx-auto px-6 lg:px-16 lg:ml-[8%]">
          <div className="max-w-xl relative">
            {/* Top decorative line */}
            <HeroReveal delay={0.1} className="flex items-center gap-2 mb-4 opacity-60">
              <div className="w-8 h-px bg-[#00D4AA]"></div>
              <span className="text-[#00D4AA] text-[10px] font-mono tracking-widest">SYSTEM_INIT_001</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </HeroReveal>

            {/* Title — glitch blur slide */}
            <GlitchTitle delay={0.25} className="relative mb-4">
              <div className="hidden lg:block absolute -left-4 top-0 bottom-0 w-1.5 dither-pattern opacity-40"></div>
              <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight font-mono tracking-wider" style={{ letterSpacing: '0.08em' }}>
                PREDICT FAILURES
                <span className="block text-[#00D4AA] mt-1 lg:mt-2 opacity-95">7 DAYS EARLY.</span>
              </h1>
            </GlitchTitle>

            {/* Decorative dots pattern */}
            <HeroReveal delay={0.45} className="flex gap-1 mb-4 opacity-40">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="w-0.5 h-0.5 bg-[#00D4AA] rounded-full"></div>
              ))}
            </HeroReveal>

            {/* Description */}
            <HeroReveal delay={0.55} className="relative mb-6">
              <p className="text-xs lg:text-sm text-gray-300 leading-relaxed font-mono opacity-80">
                Clara AI listens to your HVAC, chillers, and power infrastructure. Ten AI models turn that telemetry into predictive alerts, ESG reports, and energy savings — before problems become outages.
              </p>
              <div className="hidden lg:block absolute -right-6 top-1/2 w-4 h-4 border border-white/20" style={{ transform: 'translateY(-50%)' }}>
                <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-[#00D4AA]" style={{ transform: 'translate(-50%, -50%)' }}></div>
              </div>
            </HeroReveal>

            {/* Action buttons — scale pop */}
            <HeroReveal delay={0.7} className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/demo" className="relative px-6 py-3 bg-transparent text-white font-mono text-xs border border-[#00D4AA] hover:bg-[#00D4AA] hover:text-black transition-all duration-200 group flex items-center justify-center gap-2">
                <span className="hidden lg:block absolute -top-1 -left-1 w-2 h-2 border-t border-l border-[#00D4AA] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="hidden lg:block absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-[#00D4AA] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                EXPLORE THE LIVE DEMO
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/pricing" className="relative px-6 py-3 bg-transparent border border-white/30 text-white font-mono text-xs hover:border-white hover:bg-white/5 transition-all duration-200 flex items-center justify-center gap-2">
                SEE PRICING
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </HeroReveal>

            <HeroReveal delay={0.85} className="flex items-center gap-2 opacity-40">
              <span className="text-white text-[9px] font-mono">◑</span>
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="text-white text-[9px] font-mono tracking-widest uppercase">MONITORING_ACTIVE</span>
            </HeroReveal>
          </div>
        </div>
      </section>

      {/* ── Stats Grid ──────────────────────────────────────────────────────── */}
      <section className="relative py-16 px-6 lg:px-16 border-y border-white/10 bg-black z-10">
        {/* Section accents */}
        <div className="absolute top-0 left-0 w-8 h-px bg-[#00D4AA]"></div>
        <div className="absolute bottom-0 right-0 w-8 h-px bg-[#00D4AA]"></div>

        <Stagger className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '7+', label: 'DAYS ADVANCE WARNING' },
            { value: '89%', label: 'FAULT DETECTION ACCURACY' },
            { value: '10', label: 'AI MODELS PER FACILITY' },
            { value: '15%', label: 'AVG ENERGY SAVINGS' },
          ].map((stat, i) => (
            <StaggerChild key={stat.label} variant="scale">
              <div className="relative group p-4 border border-white/5 hover:border-[#00D4AA]/40 transition-all duration-300">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00D4AA]/60"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00D4AA]/60"></div>
                <AnimatedCounter target={stat.value} className="text-3xl font-bold font-mono text-[#00D4AA] mb-1 tracking-tight block" />
                <div className="text-[9px] text-[#8B96A8] tracking-widest font-mono font-medium">{stat.label}</div>
                <div className="text-[7px] text-white/20 font-mono absolute top-2 right-2">00{i + 1}</div>
              </div>
            </StaggerChild>
          ))}
        </Stagger>
      </section>

      {/* ── Feature Grid ────────────────────────────────────────────────────── */}
      <section className="relative py-24 px-6 lg:px-16 z-10">
        <div className="max-w-5xl mx-auto">
          <GlitchTitle className="text-center mb-16 relative">
            <div className="inline-block relative">
              <span className="text-[10px] text-[#00D4AA] tracking-widest font-mono border border-[#00D4AA]/30 px-3 py-1 bg-[#00D4AA]/5 uppercase">
                Diagnostic Capability
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-white mt-4 mb-3 uppercase">
              Intelligence across every system
            </h2>
            <p className="text-[11px] text-[#8B96A8] tracking-widest uppercase font-mono max-w-xl mx-auto">
              Ten specialised AI models watch your facility around the clock.
            </p>
            <div className="h-px w-24 bg-white/20 mx-auto mt-6"></div>
          </GlitchTitle>

          <Stagger className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((feature, idx) => (
              <StaggerChild key={feature.title} variant="up">
                <FeatureCard index={idx} {...feature} />
              </StaggerChild>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── 10 Clara AI Models Matrix ───────────────────────────────────────── */}
      <section className="relative py-24 px-6 lg:px-16 border-t border-white/10 bg-black z-10 overflow-hidden">
        <ScanLine />
        <div className="absolute top-4 left-4 text-[9px] text-white/20">MODEL_DIRECTORY</div>
        <div className="absolute bottom-4 right-4 text-[9px] text-white/20">CLARA_INTELLIGENCE_MATRIX</div>

        <div className="max-w-5xl mx-auto">
          <GlitchTitle className="text-center mb-16">
            <span className="text-[10px] text-[#00D4AA] tracking-widest font-mono uppercase">Operational Intelligence Engine</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-white mt-2 uppercase">The 10 Clara AI models</h2>
            <p className="text-[11px] text-[#8B96A8] tracking-widest uppercase font-mono max-w-xl mx-auto mt-3">
              Each model watches a different dimension of your facility — together they see everything.
            </p>
          </GlitchTitle>

          <Stagger className="grid md:grid-cols-2 gap-6" staggerDelay={0.08}>
            {MODEL_MATRIX.map((model, idx) => (
              <StaggerChild key={model.name} variant={idx % 2 === 0 ? 'left' : 'right'}>
                <div className="relative p-5 border border-white/5 bg-[#111620]/40 group hover:border-[#00D4AA]/30 transition-all duration-200">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10 group-hover:border-[#00D4AA] transition-colors"></div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 border border-white/10 text-white/40">#{idx + 1}</span>
                      <h3 className="font-semibold text-xs text-white uppercase tracking-wider">{model.name}</h3>
                    </div>
                    <span className="text-[8px] font-mono text-[#00D4AA] tracking-widest uppercase">[ ACTIVE ]</span>
                  </div>
                  <div className="space-y-2 text-[10px] font-mono uppercase text-[#8B96A8] border-t border-white/5 pt-3">
                    <div className="flex justify-between gap-4">
                      <span className="flex-shrink-0">WATCHES:</span>
                      <span className="text-white text-right">{model.watches}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="flex-shrink-0">TELLS YOU:</span>
                      <span className="text-[#00D4AA] text-right">{model.tellsYou}</span>
                    </div>
                  </div>
                </div>
              </StaggerChild>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── How It Works (Pipeline) ─────────────────────────────────────────── */}
      <section className="relative py-24 px-6 lg:px-16 border-y border-white/10 bg-black z-10">
        {/* Dither pattern background strip */}
        <div className="absolute inset-x-0 top-0 h-1.5 dither-pattern opacity-30"></div>
        <div className="absolute inset-x-0 bottom-0 h-1.5 dither-pattern opacity-30"></div>

        <div className="max-w-4xl mx-auto">
          <GlitchTitle className="text-center mb-16">
            <span className="text-[10px] text-[#00D4AA] tracking-widest font-mono uppercase">Signal Pipeline Flow</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-white mt-2 uppercase">From sensor to insight in seconds</h2>
          </GlitchTitle>

          <Stagger className="space-y-4" staggerDelay={0.1}>
            {PIPELINE.map((step, i) => (
              <StaggerChild key={step.label} variant="left">
                <div className="group relative flex items-start gap-5 p-5 border border-white/5 bg-black/40 hover:border-white/20 transition-all duration-200">
                  <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#00D4AA]/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#00D4AA]/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-mono text-xs border border-[#00D4AA]/30 bg-[#00D4AA]/10 text-[#00D4AA]">{i + 1}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-xs tracking-wider text-[#E4EAF3] uppercase mb-1 flex items-center justify-between">
                      <span>{step.label}</span>
                      <span className="text-[9px] text-white/20 font-mono group-hover:text-[#00D4AA]/40 transition-colors">[ STAGE_0{i + 1} ]</span>
                    </div>
                    <div className="text-[11px] leading-relaxed text-[#8B96A8] font-mono uppercase">{step.description}</div>
                  </div>
                </div>
              </StaggerChild>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Field Imagery Strip ─────────────────────────────────────────────── */}
      <section className="relative py-16 px-6 lg:px-16 z-10 bg-black overflow-hidden">
        <ScanLine />
        <div className="max-w-5xl mx-auto">
          <Reveal className="flex items-center gap-2 mb-6 opacity-50">
            <div className="w-8 h-px bg-[#00D4AA]"></div>
            <span className="text-[#00D4AA] text-[10px] font-mono tracking-widest uppercase">[ DEPLOYED_IN_THE_FIELD ]</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </Reveal>

          <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-4" staggerDelay={0.15}>
            {FIELD_IMAGES.map((img, i) => (
              <StaggerChild key={img.label} variant="flip">
                <div className="group relative border border-white/10 overflow-hidden h-[140px]">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00D4AA]/60 z-10"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00D4AA]/60 z-10"></div>
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className="w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 transition-all duration-300"
                  />
                  <div className="absolute bottom-1 right-2 text-[7px] text-white/40 bg-black/60 px-1 font-mono uppercase">
                    Ref: {img.label}_0{i + 1}
                  </div>
                </div>
              </StaggerChild>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── ESG Section ─────────────────────────────────────────────────────── */}
      <section className="relative py-24 px-6 lg:px-16 z-10">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <Reveal variant="left">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#00D4AA]/30 bg-[#00D4AA]/5 text-[10px] font-mono text-[#00D4AA] uppercase tracking-wider mb-6">
              <Leaf className="w-3 h-3 text-[#00D4AA]" />
              ESG Compliance Reporting
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-white mb-6 uppercase">
              Automated GHG reporting.
              <span className="block text-[#00D4AA] mt-1 font-light font-mono">SCOPE 1, 2, AND 3.</span>
            </h2>
            <p className="text-[11px] leading-relaxed text-[#8B96A8] font-mono uppercase mb-8">
              Clara AI generates GRI 302, GHG Protocol, and ISO 50001 reports directly from your operational data. No spreadsheets, no manual audits, no missed deadlines.
            </p>
            <div className="space-y-3 mb-6">
              {[
                'GHG Protocol Scope 1/2/3 reporting',
                'GRI 302 energy framework',
                'ISO 50001 energy management',
                'Audit-ready PDF reports on demand',
              ].map(item => (
                <div key={item} className="flex items-center gap-3 text-xs text-[#8B96A8] font-mono uppercase">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#00D4AA]" />
                  {item}
                </div>
              ))}
            </div>
            <div className="group relative border border-white/10 overflow-hidden h-[100px]">
              <img src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80"
                alt="Solar panel array" loading="lazy"
                className="w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 transition-all duration-300" />
              <div className="absolute bottom-1 right-2 text-[7px] text-white/40 bg-black/60 px-1 font-mono uppercase">Ref: RENEWABLE_MIX_01</div>
            </div>
          </Reveal>

          {/* ESG Panel — slides in from right */}
          <Reveal variant="right">
            <div className="relative p-6 border border-white/10 bg-[#111620]/60 backdrop-blur-sm">
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t border-l border-[#00D4AA]"></div>
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b border-r border-[#00D4AA]"></div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#5A6478]">[ ESG_INSIGHT_SCORE ]</span>
                <span className="text-[8px] font-mono text-[#00D4AA]">STATUS: STABLE</span>
              </div>
              <div className="flex items-end gap-3 mb-6">
                <AnimatedCounter target="78.4" className="text-5xl font-light font-mono text-[#00D4AA] tracking-tighter" />
                <span className="text-xl mb-1.5 font-mono text-[#5A6478]">/ 100</span>
              </div>
              <div className="space-y-3 border-t border-white/5 pt-4">
                {[
                  { label: 'Scope 1 Emissions', value: '142 tCO₂e', delta: '-8%' },
                  { label: 'Scope 2 Emissions', value: '891 tCO₂e', delta: '-12%' },
                  { label: 'Energy Intensity', value: '0.42 kWh/sqm', delta: '-6%' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-white/5 text-[11px] font-mono uppercase">
                    <span className="text-[#8B96A8]">{row.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-mono">{row.value}</span>
                      <span className="text-[#00D4AA] font-mono">{row.delta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────────────────────────────── */}
      <section className="relative py-24 px-6 lg:px-16 border-t border-white/10 bg-black z-10 text-center overflow-hidden">
        <ScanLine />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[#00D4AA] to-transparent"></div>
        <Reveal variant="scale" className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
            <span className="text-white text-[9px] font-mono">-- [ INTERACTIVE_DEMO_LAUNCHER ] --</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold tracking-wider text-white mb-6 uppercase">Ready to see it live?</h2>
          <p className="text-[12px] text-[#8B96A8] tracking-widest font-mono uppercase mb-10 max-w-lg mx-auto">
            Explore a fully populated demo facility — live dashboards, predictive alerts, and ESG reports. No hardware, no setup, no credit card.
          </p>
          <Stagger className="flex flex-col sm:flex-row gap-4 justify-center">
            <StaggerChild variant="left">
              <Link href="/demo" className="relative px-8 py-4 bg-transparent text-white font-mono text-xs border border-[#00D4AA] hover:bg-[#00D4AA] hover:text-black transition-all duration-200 group flex items-center justify-center gap-2">
                <span className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-[#00D4AA]"></span>
                <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-[#00D4AA]"></span>
                ACCESS LIVE DEMO
              </Link>
            </StaggerChild>
            <StaggerChild variant="right">
              <Link href="/pricing" className="px-8 py-4 border border-white/20 text-white font-mono text-xs hover:border-white hover:bg-white/5 transition-all duration-200 flex items-center justify-center">
                VIEW PRICING
              </Link>
            </StaggerChild>
          </Stagger>
        </Reveal>
      </section>

      {/* ── Flickering Footer ─────────────────────────────────────────────────── */}
      <FlickeringFooter />
    </div>
  );
}

// ─── Feature Card Component ────────────────────────────────────────────────────

function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <div
      className="group relative p-5 border border-white/5 bg-black/30 hover:border-white/20 transition-all duration-200"
    >
      {/* Corner Bracket Accents */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/10 group-hover:border-[#00D4AA] transition-colors"></div>
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/10 group-hover:border-[#00D4AA] transition-colors"></div>

      <div
        className="w-9 h-9 rounded flex items-center justify-center mb-4 transition-all duration-300 border border-white/10 bg-white/5 group-hover:border-[#00D4AA]/40 group-hover:bg-[#00D4AA]/10"
      >
        <Icon className="w-4 h-4 text-white group-hover:text-[#00D4AA] transition-colors" />
      </div>

      <h3 className="font-semibold text-xs tracking-wider text-white uppercase mb-2">
        {title}
      </h3>

      <p className="text-[11px] leading-relaxed text-[#5A6478] font-mono uppercase group-hover:text-[#8B96A8] transition-colors">
        {description}
      </p>

      <span className="absolute top-2 right-2 text-[8px] font-mono text-white/10 group-hover:text-[#00D4AA]/30 transition-colors">
        [ SYS_0{index + 1} ]
      </span>
    </div>
  );
}

// ─── Content ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Activity,
    title: 'Failure Forecast',
    description:
      'Know which asset fails next — 7+ days before it does — with confidence ranges and time-to-failure estimates.',
  },
  {
    icon: Cpu,
    title: 'Fault Type Identifier',
    description:
      'Pinpoints the root cause — bearing wear, misalignment, imbalance — from each machine’s unique vibration signature.',
  },
  {
    icon: Zap,
    title: 'Energy Waste Detector',
    description:
      'Flags consumption that drifts from your facility’s learned energy baseline the moment it happens.',
  },
  {
    icon: BarChart3,
    title: 'PUE Optimiser',
    description:
      'Recommends cooling setpoints that push Power Usage Effectiveness towards 1.2 and below.',
  },
  {
    icon: Shield,
    title: 'Safe Operating Range',
    description:
      'ISO 10816-aligned operating envelopes raise advisory alerts before vibration ever reaches a critical zone.',
  },
  {
    icon: Leaf,
    title: 'ESG Reporting',
    description:
      'GHG Protocol Scope 1/2/3 and GRI 302 reports generated automatically from live operational data.',
  },
];

const MODEL_MATRIX = [
  {
    name: 'Failure Forecast',
    watches: 'Vibration, temperature & load trends',
    tellsYou: 'Which asset fails next — and when',
  },
  {
    name: 'Fault Type Identifier',
    watches: 'Each machine’s vibration signature',
    tellsYou: 'The named root cause, with confidence',
  },
  {
    name: 'Energy Baseline',
    watches: 'Weather, occupancy & consumption',
    tellsYou: 'What your energy use should be, hour by hour',
  },
  {
    name: 'Energy Waste Detector',
    watches: 'Live draw vs expected baseline',
    tellsYou: 'Where energy is being wasted, and how much',
  },
  {
    name: 'Sound Health Monitor',
    watches: 'The acoustic signature of machinery',
    tellsYou: 'Acoustic health score & sound anomalies',
  },
  {
    name: 'Safe Operating Range',
    watches: 'Vibration vs ISO 10816 envelopes',
    tellsYou: 'Advisory alerts before critical zones',
  },
  {
    name: 'Clara AI Insights',
    watches: 'Every active alert & its history',
    tellsYou: 'Plain-English root cause + next actions',
  },
  {
    name: 'PUE Optimiser',
    watches: 'Cooling setpoints & IT load',
    tellsYou: 'Setpoint changes that cut your PUE',
  },
  {
    name: 'Hot Spot Tracker',
    watches: 'Temperature across the facility floor',
    tellsYou: 'Thermal hot spots mapped to your floor plan',
  },
  {
    name: 'Power Quality Guard',
    watches: 'The quality of your electrical supply',
    tellsYou: 'Power quality score & surge alerts',
  },
];

const PIPELINE = [
  {
    label: 'Connect',
    description:
      'Clara connects to the building systems you already run — HVAC, chillers, UPS, power meters. No rip-and-replace.',
  },
  {
    label: 'Stream',
    description:
      'Telemetry streams securely to the Clara platform — hundreds of data points per asset, around the clock.',
  },
  {
    label: 'Analyse',
    description:
      'Ten AI models score every asset continuously across health, energy, acoustics, thermals, and power quality.',
  },
  {
    label: 'Alert',
    description:
      'When risk crosses a threshold, Clara raises a prioritised alert with the predicted root cause and recommended actions.',
  },
  {
    label: 'Act',
    description:
      'Your team sees everything on a live dashboard — and acts days before a failure, not hours after one.',
  },
];

const FIELD_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&q=80',
    alt: 'Industrial HVAC machinery in a data centre',
    label: 'HVAC_UNIT',
  },
  {
    src: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
    alt: 'Server room with rack-mounted equipment',
    label: 'SERVER_RACK',
  },
  {
    src: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
    alt: 'Electrical switchgear and power distribution panel',
    label: 'POWER_DIST',
  },
];
