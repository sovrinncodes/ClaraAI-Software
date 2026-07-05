'use client';

import Link from 'next/link';
import { Activity, ArrowRight, Check, Zap } from 'lucide-react';
import { NavReveal, GlitchTitle, Reveal, Stagger, StaggerChild } from '@/components/ui/motion-wrappers';
import { FlickeringFooter } from '@/components/ui/flickering-footer';

const PLANS = [
  {
    name: 'Starter',
    price: 'R 4,990',
    period: '/mo',
    description: 'For single-facility operators getting started with predictive maintenance.',
    highlight: false,
    cta: 'Start Free Trial',
    ctaHref: '/signup',
    features: [
      '1 facility',
      'Up to 50 monitored assets',
      'Failure Forecast model',
      'Energy Waste Detector',
      'Email alerts',
      '30-day data retention',
      'GHG Protocol reporting',
      'Standard support',
    ],
  },
  {
    name: 'Professional',
    price: 'R 14,990',
    period: '/mo',
    description: 'For multi-facility operators needing full ML coverage and ESG reporting.',
    highlight: true,
    badge: 'Most Popular',
    cta: 'Start Free Trial',
    ctaHref: '/signup',
    features: [
      'Up to 5 facilities',
      'Up to 500 monitored assets',
      'All 10 Clara AI models',
      'Real-time live dashboard',
      'ESG compliance reports (GRI 302)',
      '1-year data retention',
      'Priority alert routing',
      'PUE Optimiser',
      'API access',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description:
      'For large-scale industrial operators, REITs, and data centre portfolios with custom requirements.',
    highlight: false,
    cta: 'Contact Sales',
    ctaHref: 'mailto:sales@claraai.com',
    features: [
      'Unlimited facilities',
      'Unlimited assets',
      'All 10 Clara AI models + custom models',
      'Dedicated model capacity',
      'White-label dashboard option',
      'On-premise deployment available',
      'Custom ESG framework mapping',
      'Unlimited data retention',
      'SLA with 99.9% uptime guarantee',
      'Dedicated success manager',
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="relative min-h-screen bg-black text-[#E4EAF3] font-mono selection:bg-[#00D4AA] selection:text-black">
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

      {/* Header */}
      <section className="relative pt-32 pb-16 px-6 text-center z-10">
        <div className="max-w-3xl mx-auto">
          {/* Top line decoration */}
          <Reveal variant="up" delay={0.1}>
            <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
              <span className="text-[#00D4AA] text-[10px] font-mono tracking-widest uppercase">
                -- [ SUBSCRIPTION_DIRECTORY ] --
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#00D4AA]/30 bg-[#00D4AA]/5 text-[10px] font-mono text-[#00D4AA] uppercase tracking-wider mb-6">
              <Zap className="w-3 h-3 text-[#00D4AA]" />
              30-DAY FREE TRIAL ON ALL PLANS
            </div>
          </Reveal>
          
          <GlitchTitle delay={0.2}>
            <h1 className="text-3xl md:text-5xl font-bold tracking-wider text-white mb-4 uppercase">
              Simple, transparent pricing
            </h1>
          </GlitchTitle>

          <Reveal variant="up" delay={0.3}>
            <p className="text-xs sm:text-sm max-w-xl mx-auto text-[#8B96A8] uppercase tracking-widest">
              All prices in South African Rand (ZAR). Scale as your portfolio grows.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Plans */}
      <section className="relative px-6 pb-24 z-10">
        <Stagger className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {PLANS.map((plan, idx) => (
            <StaggerChild key={plan.name} variant="up">
              <PlanCard index={idx} plan={plan} />
            </StaggerChild>
          ))}
        </Stagger>
      </section>

      {/* FAQ */}
      <section className="relative py-20 px-6 border-y border-white/10 bg-black z-10">
        {/* Dither pattern background strip */}
        <div className="absolute inset-x-0 top-0 h-1 dither-pattern opacity-20"></div>
        <div className="absolute inset-x-0 bottom-0 h-1 dither-pattern opacity-20"></div>

        <div className="max-w-3xl mx-auto">
          <GlitchTitle>
            <h2 className="text-2xl font-bold tracking-wider mb-12 text-center text-white uppercase">
              Frequently asked questions
            </h2>
          </GlitchTitle>
          <Stagger className="space-y-4">
            {FAQS.map(faq => (
              <StaggerChild key={faq.q} variant="up">
                <div
                  className="group relative p-5 border border-white/5 bg-black/40 hover:border-white/20 transition-all duration-200"
                >
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00D4AA]/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#00D4AA]/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <h3 className="font-semibold text-xs tracking-wider text-white uppercase mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-[#8B96A8] font-mono uppercase">
                    {faq.a}
                  </p>
                </div>
              </StaggerChild>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6 text-center z-10">
        <Reveal variant="up" className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-white mb-6 uppercase">
            See it before you commit
          </h2>
          <p className="text-[12px] text-[#8B96A8] tracking-widest font-mono uppercase mb-8">
            Explore a fully populated demo data centre — live dashboards, predictive alerts, and ESG reports.
          </p>
          <Link
            href="/demo"
            className="relative px-6 py-3 bg-transparent text-white font-mono text-xs border border-[#00D4AA] hover:bg-[#00D4AA] hover:text-black transition-all duration-200 group inline-flex items-center justify-center gap-2"
          >
            <span className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-[#00D4AA]"></span>
            <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-[#00D4AA]"></span>
            ACCESS LIVE DEMO <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Reveal>
      </section>

      {/* Footer */}
      <FlickeringFooter />
    </div>
  );
}

// ─── Plan Card Component ────────────────────────────────────────────────────────────────

function PlanCard({ plan, index }: { plan: (typeof PLANS)[0]; index: number }) {
  return (
    <div
      className="group relative flex flex-col p-6 border transition-all duration-200"
      style={{
        backgroundColor: plan.highlight ? '#111620/60' : 'rgba(10, 13, 20, 0.4)',
        borderColor: plan.highlight ? '#00D4AA' : 'rgba(255,255,255,0.08)',
      }}
    >
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/10 group-hover:border-[#00D4AA] transition-colors"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/10 group-hover:border-[#00D4AA] transition-colors"></div>

      {plan.badge && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 border border-[#00D4AA] text-[9px] font-mono uppercase bg-black text-[#00D4AA] tracking-wider"
        >
          {plan.badge}
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-xs tracking-wider text-white uppercase">
            {plan.name}
          </h3>
          <span className="text-[7px] text-white/20 font-mono">[ PL_0{index + 1} ]</span>
        </div>
        <p className="text-[10px] text-[#5A6478] uppercase mb-4 leading-relaxed font-mono">
          {plan.description}
        </p>
        <div className="flex items-end gap-1">
          <span
            className="text-3xl font-bold font-mono tracking-tight text-[#00D4AA]"
          >
            {plan.price}
          </span>
          {plan.period && (
            <span className="text-[10px] mb-1 text-[#5A6478] font-mono">
              {plan.period}
            </span>
          )}
        </div>
      </div>

      <Link
        href={plan.ctaHref}
        className="block text-center py-2.5 px-4 text-xs font-mono font-medium mb-6 transition-all duration-200 border uppercase"
        style={
          plan.highlight
            ? { backgroundColor: '#00D4AA', color: '#0A0D14', borderColor: '#00D4AA' }
            : { backgroundColor: 'transparent', color: '#E4EAF3', borderColor: 'rgba(255,255,255,0.15)' }
        }
      >
        {plan.cta}
      </Link>

      <ul className="space-y-2 mt-auto text-[11px] font-mono uppercase text-[#8B96A8]">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2.5">
            <CheckCircle2
              className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#00D4AA]/80"
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── FAQ Data ───────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'How does the free trial work?',
    a: 'All plans include a 30-day free trial with full feature access. No credit card required. The trial includes a fully populated demo facility so you can explore every Clara AI model before connecting your own hardware.',
  },
  {
    q: 'Can I connect real sensors during the trial?',
    a: 'Yes. Clara AI ingests data from standard industrial sensors over common protocols and a documented API. Our team provides onboarding guidance to get your first assets streaming.',
  },
  {
    q: 'What counts as a "monitored asset"?',
    a: 'Any physical equipment with at least one telemetry data stream — a chiller, UPS unit, CRAC unit, motor, etc. Assets with multiple sensors (vibration + temperature + current) count as one monitored asset.',
  },
  {
    q: 'Is my data stored in South Africa?',
    a: 'Yes. By default, all data is stored in South Africa (Cape Town region). Enterprise customers can arrange dedicated regions or on-premise deployment.',
  },
  {
    q: 'What happens after my trial ends?',
    a: 'You will be prompted to select a plan. Your data and alert history are preserved. If you choose not to upgrade, read-only access continues for 14 days before data is archived.',
  },
];
