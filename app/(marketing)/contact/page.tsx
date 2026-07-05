import { Activity } from 'lucide-react';
import Link from 'next/link';

import { NavReveal, GlitchTitle, Reveal } from '@/components/ui/motion-wrappers';
import { FlickeringFooter } from '@/components/ui/flickering-footer';

export default function ContactPage() {
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
              System Contact
            </h1>
          </GlitchTitle>
          
          <Reveal variant="up" delay={0.2}>
            <div className="grid md:grid-cols-2 gap-12 font-mono text-sm leading-relaxed text-[#8B96A8]">
              <div>
                <p className="mb-8 uppercase tracking-widest text-xs">
                  Initiate a secure comms channel with the Clara AI engineering and sales teams.
                </p>

                <div className="space-y-6">
                  <div className="p-4 border border-white/10 bg-[#111620]/60 relative">
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00D4AA]"></div>
                    <h3 className="text-[#00D4AA] text-[10px] uppercase tracking-widest mb-2">[ GENERAL_INQUIRIES ]</h3>
                    <p className="text-white text-sm">hello@claraai.com</p>
                  </div>
                  
                  <div className="p-4 border border-white/10 bg-[#111620]/60 relative">
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00D4AA]"></div>
                    <h3 className="text-[#00D4AA] text-[10px] uppercase tracking-widest mb-2">[ TECHNICAL_SUPPORT ]</h3>
                    <p className="text-white text-sm">support@claraai.com</p>
                  </div>

                  <div className="p-4 border border-white/10 bg-[#111620]/60 relative">
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00D4AA]"></div>
                    <h3 className="text-[#00D4AA] text-[10px] uppercase tracking-widest mb-2">[ HQ_COORDINATES ]</h3>
                    <p className="text-white text-sm uppercase">Johannesburg, South Africa</p>
                    <p className="text-xs mt-1">Operating globally</p>
                  </div>
                </div>
              </div>

              {/* Form Scaffold */}
              <div className="p-6 border border-white/10 bg-[#111620]/80">
                <h3 className="text-white text-sm uppercase tracking-wider mb-6">Direct Message</h3>
                <form className="space-y-4" action="#">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest mb-2 text-[#5A6478]">Name</label>
                    <input type="text" className="w-full bg-black border border-white/10 p-3 text-white focus:border-[#00D4AA] outline-none transition-colors" placeholder="Enter your name" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest mb-2 text-[#5A6478]">Email</label>
                    <input type="email" className="w-full bg-black border border-white/10 p-3 text-white focus:border-[#00D4AA] outline-none transition-colors" placeholder="Enter your email" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest mb-2 text-[#5A6478]">Message</label>
                    <textarea rows={4} className="w-full bg-black border border-white/10 p-3 text-white focus:border-[#00D4AA] outline-none transition-colors resize-none" placeholder="Enter your message"></textarea>
                  </div>
                  <button type="submit" className="w-full px-6 py-3 border border-[#00D4AA] text-[#00D4AA] hover:bg-[#00D4AA] hover:text-black transition-all duration-200 uppercase tracking-widest text-xs">
                    Transmit Message
                  </button>
                </form>
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
