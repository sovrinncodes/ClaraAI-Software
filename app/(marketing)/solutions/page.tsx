'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Cpu,
  Leaf,
  Shield,
  CheckCircle2,
} from 'lucide-react';

import { NavReveal, GlitchTitle, Reveal, Stagger, StaggerChild } from '@/components/ui/motion-wrappers';
import { FlickeringFooter } from '@/components/ui/flickering-footer';

type VerticalId = 'datacenter' | 'manufacturing' | 'logistics' | 'reit';

export default function SolutionsPage() {
  const [activeTab, setActiveTab] = useState<VerticalId>('datacenter');

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
          <Link href="/solutions" className="text-[#00D4AA] transition-colors hover:text-[#00D4AA]">
            Solutions
          </Link>
          {['Product', 'Pricing'].map(item => (
            <Link
              key={item}
              href={item === 'Pricing' ? '/pricing' : item === 'Product' ? '/product' : '#'}
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
          <Reveal variant="up" delay={0.1}>
            <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
              <span className="text-[#00D4AA] text-[10px] font-mono tracking-widest uppercase">
                -- [ TARGET_VERTICALS_DIRECTORY ] --
              </span>
            </div>
          </Reveal>

          <GlitchTitle delay={0.2}>
            <h1 className="text-3xl md:text-5xl font-bold tracking-wider text-white mb-4 uppercase">
              Tailored Industry Solutions
            </h1>
          </GlitchTitle>

          <Reveal variant="up" delay={0.3}>
            <p className="text-xs sm:text-sm max-w-2xl mx-auto text-[#8B96A8] uppercase tracking-widest leading-relaxed">
              Predictive infrastructure management and carbon reporting calibrated for high-stakes facilities.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Interactive Tabs Section */}
      <section className="relative px-6 pb-24 z-10">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Vertical Navigation Tabs */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {(Object.keys(VERTICALS) as VerticalId[]).map((vid) => {
              const vertical = VERTICALS[vid];
              const isActive = activeTab === vid;
              return (
                <button
                  key={vid}
                  onClick={() => setActiveTab(vid)}
                  className={`text-left p-4 border transition-all duration-200 relative group uppercase font-mono text-xs`}
                  style={{
                    borderColor: isActive ? '#00D4AA' : 'rgba(255,255,255,0.08)',
                    backgroundColor: isActive ? 'rgba(0,212,170,0.06)' : 'transparent',
                  }}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#00D4AA]"></span>
                  )}
                  <div className="flex justify-between items-center">
                    <span className={isActive ? 'text-white font-bold' : 'text-[#8B96A8]'}>
                      {vertical.title}
                    </span>
                    <span className={`text-[8px] font-mono ${isActive ? 'text-[#00D4AA]' : 'text-white/20'}`}>
                      [ VERT_0{vertical.idx} ]
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Tab Telemetry Dashboard Display */}
          <div className="lg:col-span-8 flex flex-col justify-between p-6 border border-white/10 bg-[#111620]/60 relative">
            {/* Tech details */}
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00D4AA]"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#00D4AA]"></div>

            <div className="mb-6">
              <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-3">
                <div>
                  <span className="text-[9px] text-[#00D4AA] tracking-widest font-mono uppercase block mb-1">
                    [ STREAMING_DIAGNOSTICS_PREVIEW ]
                  </span>
                  <h3 className="text-xl font-bold text-white uppercase">
                    {VERTICALS[activeTab].title} dashboard
                  </h3>
                </div>
                <div className="px-2 py-0.5 border border-[#00D4AA]/40 text-[8px] bg-[#00D4AA]/10 text-[#00D4AA] animate-pulse uppercase">
                  Telemetry Active
                </div>
              </div>
              
              <p className="text-[11px] text-[#8B96A8] leading-relaxed uppercase mb-6">
                {VERTICALS[activeTab].desc}
              </p>

              {/* Dynamic Live Telemetry Mock and Stock Image */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div>
                  <span className="text-[9px] text-white/40 block mb-2 font-mono uppercase">// Active Sensor Matrix Loop</span>
                  <LiveTelemetryVertical type={activeTab} />
                </div>
                <div className="relative border border-white/10 overflow-hidden h-[120px] md:h-auto">
                  <img
                    src={VERTICALS[activeTab].imageUrl}
                    alt={VERTICALS[activeTab].title}
                    className="w-full h-full object-cover filter grayscale contrast-125 hover:grayscale-0 transition-all duration-300"
                  />
                  <div className="absolute bottom-1 right-2 text-[7px] text-white/30 bg-black/60 px-1 font-mono uppercase">
                    Ref: VERT_IMG_0{VERTICALS[activeTab].idx}
                  </div>
                </div>
              </div>

              {/* Grid of details */}
              <div className="grid md:grid-cols-2 gap-6 border-t border-white/5 pt-6">
                <div>
                  <h4 className="text-[10px] text-[#00D4AA] font-bold tracking-widest uppercase mb-3">
                    [ Monitored Infrastructure ]
                  </h4>
                  <ul className="space-y-2 text-[10px] text-[#8B96A8] uppercase">
                    {VERTICALS[activeTab].assets.map(a => (
                      <li key={a} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#00D4AA]/80 rounded-full"></span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] text-[#00D4AA] font-bold tracking-widest uppercase mb-3">
                    [ Clara AI Models Applied ]
                  </h4>
                  <ul className="space-y-2 text-[10px] text-[#8B96A8] uppercase">
                    {VERTICALS[activeTab].models.map(m => (
                      <li key={m} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00D4AA]/60 flex-shrink-0" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 text-[9px] text-white/30 uppercase flex justify-between">
              <span>DATA_ISOLATION: ENFORCED</span>
              <span>Grid Zone: {VERTICALS[activeTab].zone}</span>
            </div>
          </div>

        </div>
      </section>

      {/* Core Value Propositions */}
      <section className="relative py-24 px-6 border-t border-white/10 bg-black z-10">
        <div className="max-w-5xl mx-auto">
          <GlitchTitle className="text-center mb-16">
            <span className="text-[10px] text-[#00D4AA] tracking-widest font-mono uppercase">
              Engineered for Operations
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-white mt-2 uppercase">
              Core Technical Advantages
            </h2>
          </GlitchTitle>

          <Stagger className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Zero Leakage Isolation',
                desc: 'Your data is isolated at every layer of the platform — dashboards, APIs, and storage. No other organisation can ever see your telemetry.',
              },
              {
                icon: Cpu,
                title: 'Always-On Intelligence',
                desc: 'Ten AI models re-score every monitored asset continuously, around the clock. Insights reach your dashboard in near real time.',
              },
              {
                icon: Leaf,
                title: 'Regulatory-Ready ESG',
                desc: 'Auto-calculates Scope 1, 2, and 3 emissions against regional carbon factors (e.g. Eskom grid), exporting fully ISO/GRI-compliant reports.',
              },
            ].map((prop, idx) => (
              <StaggerChild key={prop.title} variant="up">
                <div className="p-5 border border-white/5 bg-black/40 relative group hover:border-[#00D4AA]/30 transition-all duration-200">
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/10 group-hover:border-[#00D4AA] transition-colors"></div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/10 group-hover:border-[#00D4AA] transition-colors"></div>
                  <div className="w-8 h-8 rounded flex items-center justify-center mb-4 bg-white/5 border border-white/10 group-hover:border-[#00D4AA]/40 group-hover:bg-[#00D4AA]/10 transition-all">
                    <prop.icon className="w-4 h-4 text-white group-hover:text-[#00D4AA]" />
                  </div>
                  <h3 className="font-semibold text-xs tracking-wider text-white uppercase mb-2">
                    {prop.title}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-[#5A6478] font-mono uppercase group-hover:text-[#8B96A8] transition-colors">
                    {prop.desc}
                  </p>
                  <span className="absolute top-2 right-2 text-[8px] font-mono text-white/10">[ ADV_0{idx + 1} ]</span>
                </div>
              </StaggerChild>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6 text-center z-10 border-t border-white/10">
        <Reveal variant="up" className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-white mb-6 uppercase">
            See your industry in action
          </h2>
          <p className="text-[12px] text-[#8B96A8] tracking-widest font-mono uppercase mb-8">
            Explore a fully populated demo facility — live dashboards, predictive alerts, and ESG reports.
          </p>
          <Link
            href="/demo"
            className="relative px-6 py-3 bg-transparent text-white font-mono text-xs border border-[#00D4AA] hover:bg-[#00D4AA] hover:text-black transition-all duration-200 group inline-flex items-center justify-center gap-2"
          >
            <span className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-[#00D4AA]"></span>
            <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-[#00D4AA]"></span>
            LAUNCH DEMO ENVIRONMENT <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Reveal>
      </section>

      {/* Footer */}
      <FlickeringFooter />
    </div>
  );
}

// ─── Live Telemetry Widget for Solutions tabs ───────────────────────────────

function LiveTelemetryVertical({ type }: { type: VerticalId }) {
  const [metrics, setMetrics] = useState({
    pue: 1.23,
    temp: 7.2,
    vib: 2.15,
    load: 74.2,
    flow: 18.4,
    rh: 52.4,
    co2: 412
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        pue: parseFloat((1.21 + Math.random() * 0.04).toFixed(2)),
        temp: parseFloat((6.8 + Math.random() * 0.9).toFixed(1)),
        vib: parseFloat((1.9 + Math.random() * 0.5).toFixed(2)),
        load: parseFloat((70.0 + Math.random() * 8.0).toFixed(1)),
        flow: parseFloat((17.9 + Math.random() * 1.2).toFixed(1)),
        rh: parseFloat((50.1 + Math.random() * 4.0).toFixed(1)),
        co2: Math.floor(400 + Math.random() * 30)
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  if (type === 'datacenter') {
    return (
      <pre className="text-[10px] leading-relaxed font-mono text-[#00D4AA] bg-black/45 p-4 border border-white/5 block select-none">
{`  [FACILITY: CPT-JHB-DC-01 // RACK GROUP A]
  -----------------------------------------------
  POWER USAGE EFFECTIVENESS : ${metrics.pue} [OPTIMAL]
  COOLING WATER SUPPLY TEMP : ${metrics.temp}°C
  CRAC FAN OPERATING SPEED  : 1420 RPM
  TOTAL GRID ACTIVE POWER   : 1.84 MW [STABLE]
  ALERT STATUS              : ACTIVE:00 // CRIT:00`}
      </pre>
    );
  }

  if (type === 'manufacturing') {
    return (
      <pre className="text-[10px] leading-relaxed font-mono text-[#00D4AA] bg-black/45 p-4 border border-white/5 block select-none">
{`  [FACILITY: CPT-CPT-MFG-03 // LINE 2 MOTOR]
  -----------------------------------------------
  VIBRATION VELOCITY RMS    : ${metrics.vib} mm/s [ISO CLASS I]
  COMPRESSOR OPERATING LOAD : ${metrics.load}%
  BEARING THERMAL STATE     : 58.2°C [STABLE]
  Sound Health Score        : 92.4% [OPTIMAL]
  ALERT STATUS              : ACTIVE:01 // CRIT:00`}
      </pre>
    );
  }

  if (type === 'logistics') {
    return (
      <pre className="text-[10px] leading-relaxed font-mono text-[#00D4AA] bg-black/45 p-4 border border-white/5 block select-none">
{`  [FACILITY: CPT-DBN-LOG-02 // COLD VAULT C]
  -----------------------------------------------
  REFRIGERATION TEMPERATURE : -18.4°C [OK]
  RELATIVE HUMIDITY         : ${metrics.rh}% [OK]
  WATER CONDENSER WATER FLOW : ${metrics.flow} L/s
  DEFROST CYCLE STATUS      : STANDBY
  ALERT STATUS              : ACTIVE:00 // CRIT:00`}
      </pre>
    );
  }

  return (
    <pre className="text-[10px] leading-relaxed font-mono text-[#00D4AA] bg-black/45 p-4 border border-white/5 block select-none">
{`  [FACILITY: CPT-REIT-JHB-01 // OFFICE BLOCK A]
  -----------------------------------------------
  INDOOR CO2 AIR CONCENTRATION : ${metrics.co2} PPM [EXCELLENT]
  HVAC COEFFICIENT OF PERF (COP): 4.12
  TOTAL FACILITY ACTIVE LOAD   : 342.1 kW
  OCCUPANCY THERMAL BASELINE   : 74%
  ALERT STATUS                 : ACTIVE:00 // CRIT:00`}
    </pre>
  );
}

// ─── Verticals Data ────────────────────────────────────────────────────────────

const VERTICALS = {
  datacenter: {
    idx: 1,
    title: 'Data Center Operators',
    desc: 'Minimize Power Usage Effectiveness (PUE) below 1.2 and forecast cooling system failures (chillers, CRAC units, cooling towers) before they cause thermal overrides.',
    assets: ['Chillers & Condenser Loops', 'CRAC & CRAH Fan Units', 'UPS & PDU battery backup arrays', 'Generators & Switchgear'],
    models: ['Failure Forecast', 'PUE Optimiser', 'Power Quality Guard', 'Energy Waste Detector'],
    zone: 'CPT City Power G-3',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
  },
  manufacturing: {
    idx: 2,
    title: 'Industrial Manufacturing',
    desc: 'Predict line motor failures, compressor shaft misalignment, and bearing wear via acoustic and vibration FFT analysis, reducing un-scheduled maintenance downtime.',
    assets: ['Compressors & Motors', 'Conveyor Drive Shafts', 'Ventilation Fan Motors', 'Secondary Pump systems'],
    models: ['Fault Type Identifier', 'Sound Health Monitor', 'Safe Operating Range (ISO 10816)', 'Failure Forecast'],
    zone: 'DBN eThekwini Industrial M-1',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
  },
  logistics: {
    idx: 3,
    title: 'Logistics & Warehousing',
    desc: 'Monitor cold chain environment sensors (temp, humidity, refrigerant flow) to avoid cargo degradation, automating grid energy usage profiles to match off-peak hours.',
    assets: ['Refrigeration Compressors', 'Air Handling Units (AHUs)', 'Cold Room Vault Sensors', 'Energy meters & Chillers'],
    models: ['Energy Baseline', 'Energy Waste Detector', 'Failure Forecast', 'Clara AI Insights'],
    zone: 'CPT City Power M-2',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
  },
  reit: {
    idx: 4,
    title: 'Commercial REITs & Office',
    desc: 'Track aggregate commercial block HVAC efficiency, detect power quality surges, and automate GHG Protocol Scope 1, 2, and 3 reporting profiles for GRI compliance.',
    assets: ['Central Chilled Water Loops', 'Indoor Air Quality CO2 sensors', 'Sub-meter electrical boards', 'Roof Ventilation Fans'],
    models: ['ESG Reporting (GRI/GHG)', 'Energy Baseline', 'Energy Waste Detector', 'Hot Spot Tracker'],
    zone: 'JHB City Power Commercial R-1',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  },
};
