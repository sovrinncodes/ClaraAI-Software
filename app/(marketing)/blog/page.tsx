import { Activity } from 'lucide-react';
import Link from 'next/link';

import { NavReveal, GlitchTitle, Reveal } from '@/components/ui/motion-wrappers';
import { FlickeringFooter } from '@/components/ui/flickering-footer';

export default function BlogPage() {
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
        <div className="max-w-5xl mx-auto">
          <GlitchTitle>
            <h1 className="text-3xl md:text-5xl font-bold tracking-wider text-white mb-12 uppercase text-center">
              System Logs & Updates
            </h1>
          </GlitchTitle>
          
          <Reveal variant="up" delay={0.2}>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  date: '2026.07.01',
                  category: 'PRODUCT',
                  title: 'Clara AI 2.0: The New Intelligence Layer',
                  desc: 'Introducing our updated scoring algorithms and real-time dashboard redesign for higher fidelity asset tracking.'
                },
                {
                  date: '2026.06.15',
                  category: 'INDUSTRY',
                  title: 'Automating ESG Reporting for Scope 3',
                  desc: 'How machine learning is removing the manual guesswork from supply chain emissions calculations.'
                },
                {
                  date: '2026.05.28',
                  category: 'ENGINEERING',
                  title: 'Zero Leakage: Our Tenant Isolation Architecture',
                  desc: 'A deep dive into how we isolate and encrypt telemetry data at scale for multi-tenant data centres.'
                },
                {
                  date: '2026.05.10',
                  category: 'CASE STUDY',
                  title: 'Reducing Cooling Costs by 15% in Johannesburg',
                  desc: 'How predictive bearing fault detection prevented catastrophic chiller failure and optimized PUE.'
                }
              ].map((post, idx) => (
                <Link key={idx} href="#" className="group block p-6 border border-white/10 bg-[#111620]/40 hover:border-[#00D4AA]/40 hover:bg-[#00D4AA]/5 transition-all duration-300 relative">
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/10 group-hover:border-[#00D4AA] transition-colors"></div>
                  
                  <div className="flex items-center gap-3 mb-4 text-[10px] font-mono tracking-widest uppercase">
                    <span className="text-[#00D4AA]">{post.date}</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                    <span className="text-white/40">{post.category}</span>
                  </div>
                  
                  <h2 className="text-lg text-white font-semibold uppercase tracking-wider mb-3 group-hover:text-[#00D4AA] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-xs text-[#8B96A8] leading-relaxed font-mono uppercase">
                    {post.desc}
                  </p>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </main>

      {/* Footer */}
      <FlickeringFooter />
    </div>
  );
}
