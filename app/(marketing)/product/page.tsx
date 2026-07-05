'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Shield,
  Server,
  Database,
  CheckCircle2,
} from 'lucide-react';

import { NavReveal, GlitchTitle, Reveal, Stagger, StaggerChild } from '@/components/ui/motion-wrappers';
import { FlickeringFooter } from '@/components/ui/flickering-footer';

export default function ProductPage() {
  const [activeCodeTab, setActiveCodeTab] = useState<'json' | 'curl'>('json');

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
          <Link href="/product" className="text-[#00D4AA] transition-colors hover:text-[#00D4AA]">
            Product
          </Link>
          <Link href="/solutions" className="text-white/60 transition-colors hover:text-[#00D4AA]">
            Solutions
          </Link>
          <Link href="/pricing" className="text-white/60 transition-colors hover:text-[#00D4AA]">
            Pricing
          </Link>
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
          <Reveal variant="up" delay={0.1}>
            <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
              <span className="text-[#00D4AA] text-[10px] font-mono tracking-widest uppercase">
                -- [ PLATFORM_OVERVIEW ] --
              </span>
            </div>
          </Reveal>

          <GlitchTitle delay={0.2}>
            <h1 className="text-3xl md:text-5xl font-bold tracking-wider text-white mb-4 uppercase">
              The Clara AI Platform
            </h1>
          </GlitchTitle>

          <Reveal variant="up" delay={0.3}>
            <p className="text-xs sm:text-sm max-w-2xl mx-auto text-[#8B96A8] uppercase tracking-widest leading-relaxed">
              Real-time telemetry, ten AI models, and enterprise-grade security — one platform from sensor to insight.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ASCII Platform Flowchart */}
      <section className="relative px-6 pb-24 z-10">
        <Reveal variant="up" className="max-w-4xl mx-auto border border-white/10 bg-[#111620]/60 p-6 relative">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#00D4AA]"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#00D4AA]"></div>

          <span className="text-[9px] text-[#00D4AA] tracking-widest font-mono uppercase block mb-4">
            [ SIGNAL_FLOW_SCHEMATIC ]
          </span>

          <pre className="text-[9px] sm:text-[11px] leading-5 font-mono text-[#00D4AA] select-none overflow-x-auto whitespace-pre p-2 bg-black/45 border border-white/5">
{`
   [YOUR SENSORS & BUILDING SYSTEMS] --(secure stream)--> [CLARA INGESTION LAYER]
                                                                   |
                                                                   v
                                              [CLARA INTELLIGENCE CORE // 10 AI MODELS]
                                                     |                        |
                                                     v                        v
                                        [PREDICTIVE ALERTS +        [ENERGY, PUE & ESG
                                         ASSET HEALTH SCORES]        ANALYTICS ENGINE]
                                                     |                        |
                                                     +-----------+------------+
                                                                 |
                                                                 v (live updates)
                                                     [YOUR CLARA DASHBOARD]
`}
          </pre>
        </Reveal>
      </section>

      {/* Telemetry Ingestion Specs */}
      <section className="relative py-24 px-6 border-y border-white/10 bg-black/60 backdrop-blur-sm z-10">
        {/* Dither pattern background strip */}
        <div className="absolute inset-x-0 top-0 h-1 dither-pattern opacity-20"></div>
        <div className="absolute inset-x-0 bottom-0 h-1 dither-pattern opacity-20"></div>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-5">
            <GlitchTitle>
              <span className="text-[10px] text-[#00D4AA] tracking-widest font-mono uppercase block mb-4">
                Works With What You Have
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-white mb-6 uppercase">
                Connect Any Sensor
              </h2>
            </GlitchTitle>
            <Reveal variant="up" delay={0.1}>
              <p className="text-[11px] leading-relaxed text-[#8B96A8] font-mono uppercase mb-6">
                Clara AI ingests data from the sensors and building systems you already run — via a simple, secure API. No proprietary hardware required.
              </p>
            </Reveal>

            <Stagger className="space-y-4 mb-6">
              {[
                { icon: Server, title: 'Open Sensor Integration', desc: 'Standard industrial protocols and a documented REST API. If it produces a reading, Clara can ingest it.' },
                { icon: Database, title: 'Built for High Frequency', desc: 'Hundreds of data points per asset, streaming continuously — with months of history available on demand.' },
              ].map(item => (
                <StaggerChild key={item.title} variant="up">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded border border-white/15 bg-white/5 flex items-center justify-center flex-shrink-0 text-white">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs tracking-wider text-white uppercase mb-1">
                        {item.title}
                      </h3>
                      <p className="text-[10px] text-[#5A6478] font-mono uppercase leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </StaggerChild>
              ))}
            </Stagger>

            {/* Telemetry Connection Stock Image */}
            <div className="relative border border-white/10 overflow-hidden h-[100px]">
              <img
                src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80"
                alt="High-speed optical fiber data connection"
                className="w-full h-full object-cover filter grayscale contrast-125 hover:grayscale-0 transition-all duration-300"
              />
              <div className="absolute bottom-1 right-2 text-[7px] text-white/30 bg-black/60 px-1 font-mono uppercase">
                Ref: DATA_CONN_01
              </div>
            </div>
          </div>

          {/* Interactive Code Switcher Panel */}
          <Reveal variant="right" className="lg:col-span-7 border border-white/10 bg-black/80 p-6 relative">
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00D4AA]"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#00D4AA]"></div>

            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveCodeTab('json')}
                  className={`text-[10px] px-3 py-1 border transition-colors ${activeCodeTab === 'json' ? 'border-[#00D4AA] text-[#00D4AA] bg-[#00D4AA]/5' : 'border-white/10 text-white/50'}`}
                >
                  PAYLOAD.JSON
                </button>
                <button
                  onClick={() => setActiveCodeTab('curl')}
                  className={`text-[10px] px-3 py-1 border transition-colors ${activeCodeTab === 'curl' ? 'border-[#00D4AA] text-[#00D4AA] bg-[#00D4AA]/5' : 'border-white/10 text-white/50'}`}
                >
                  INGEST.SH
                </button>
              </div>
              <span className="text-[8px] text-white/30 font-mono">CONTENT-TYPE: APPLICATION/JSON</span>
            </div>

            {activeCodeTab === 'json' ? (
              <pre className="text-[10px] font-mono text-[#00D4AA] select-all p-3 bg-black/40 border border-white/5 overflow-x-auto leading-relaxed">
{`{
  "siteId": "site-example-01",
  "sensorId": "vib-chiller-01",
  "metrics": {
    "vibration_rms": 2.82,
    "temperature": 58.2,
    "current_load": 74.5
  },
  "timestamp": "2026-07-02T08:00:00Z"
}`}
              </pre>
            ) : (
              <pre className="text-[10px] font-mono text-[#00D4AA] select-all p-3 bg-black/40 border border-white/5 overflow-x-auto leading-relaxed">
{`curl -X POST https://api.claraai.com/v1/telemetry \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "siteId": "site-example-01",
    "sensorId": "vib-chiller-01",
    "metrics": {
      "vibration_rms": 2.82,
      "temperature": 58.2,
      "current_load": 74.5
    },
    "timestamp": "2026-07-02T08:00:00Z"
  }'`}
              </pre>
            )}

            <div className="mt-4 text-[9px] text-[#5A6478] font-mono uppercase">
              // Authenticated with scoped API keys per site.
            </div>
          </Reveal>

        </div>
      </section>

      {/* Security & Multi-Tenancy Details */}
      <section className="relative py-24 px-6 z-10 bg-black/80">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          <div className="relative p-6 border border-white/10 bg-[#111620]/60 backdrop-blur-sm">
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t border-l border-[#00D4AA]"></div>
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b border-r border-[#00D4AA]"></div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#5A6478]">
                [ TENANT_ISOLATION_STATUS ]
              </span>
              <span className="text-[8px] font-mono text-[#00D4AA]">ISOLATION: ACTIVE</span>
            </div>

            <div className="space-y-3">
              {[
                { layer: 'API LAYER', status: 'VERIFIED' },
                { layer: 'APPLICATION LAYER', status: 'VERIFIED' },
                { layer: 'DATABASE LAYER', status: 'VERIFIED' },
                { layer: 'ENCRYPTION AT REST', status: 'AES-256' },
                { layer: 'ENCRYPTION IN TRANSIT', status: 'TLS 1.2+' },
              ].map(row => (
                <div
                  key={row.layer}
                  className="flex items-center justify-between py-2 border-b border-white/5 text-[10px] font-mono uppercase"
                >
                  <span className="text-[#8B96A8]">{row.layer}</span>
                  <span className="text-[#00D4AA] flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" />
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Reveal variant="up" delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#00D4AA]/30 bg-[#00D4AA]/5 text-[10px] font-mono text-[#00D4AA] uppercase tracking-wider mb-6">
                <Shield className="w-3 h-3 text-[#00D4AA]" />
                Data Security & Privacy
              </div>
            </Reveal>

            <GlitchTitle>
              <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-white mb-6 uppercase">
                Your Data Stays Yours
              </h2>
            </GlitchTitle>

            <Reveal variant="up" delay={0.1}>
              <p className="text-[11px] leading-relaxed text-[#8B96A8] font-mono uppercase mb-6">
                Every record in Clara AI is scoped to your organisation, and isolation is enforced independently at every layer of the platform — not just at the login screen.
              </p>
            </Reveal>

            <div className="space-y-3 mb-6">
              {[
                'Isolation enforced at API, application & database layers',
                'Encryption at rest and in transit, end to end',
                'Role-based access control for your whole team',
                'Full audit trail of alerts, actions & report generation',
              ].map(item => (
                <div key={item} className="flex items-center gap-3 text-xs text-[#8B96A8] font-mono uppercase">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#00D4AA]" />
                  {item}
                </div>
              ))}
            </div>

            {/* Database Security Stock Image */}
            <div className="relative border border-white/10 overflow-hidden h-[100px]">
              <img
                src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"
                alt="Secure biometric hardware authorization"
                className="w-full h-full object-cover filter grayscale contrast-125 hover:grayscale-0 transition-all duration-300"
              />
              <div className="absolute bottom-1 right-2 text-[7px] text-white/30 bg-black/60 px-1 font-mono uppercase">
                Ref: SECURE_CORE_01
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6 text-center z-10 border-t border-white/10 bg-gradient-to-b from-[#111620]/30 to-[#0A0D14]">
        <Reveal variant="up" className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-white mb-6 uppercase">
            See the platform in action
          </h2>
          <p className="text-[12px] text-[#8B96A8] tracking-widest font-mono uppercase mb-10 max-w-lg mx-auto">
            Watch live telemetry become health scores, alerts, and ESG reports in a fully populated demo facility.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demo"
              className="relative px-8 py-4 bg-transparent text-white font-mono text-xs border border-[#00D4AA] hover:bg-[#00D4AA] hover:text-black transition-all duration-200 group flex items-center justify-center gap-2"
            >
              <span className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-[#00D4AA]"></span>
              <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-[#00D4AA]"></span>
              ACCESS LIVE DEMO
            </Link>

            <Link
              href="/pricing"
              className="px-8 py-4 border border-white/20 text-white font-mono text-xs hover:border-white hover:bg-white/5 transition-all duration-200 flex items-center justify-center"
            >
              VIEW PRICING
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <FlickeringFooter />
    </div>
  );
}
