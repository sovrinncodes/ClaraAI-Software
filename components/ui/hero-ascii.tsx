import Link from 'next/link';

/**
 * Clara AI hero — adapted from the "hero-ascii" template.
 * Full-viewport technical/terminal aesthetic: mono type, corner frames,
 * dither accents, and the Clara system-architecture animation backdrop.
 * The landing page (app/page.tsx) embeds this same hero inline with nav;
 * use this component for standalone hero placements.
 */
export default function HeroAscii() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black w-full font-mono">
      {/* Animated backdrop */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <img
          src="/clara_hero_bg.gif"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
        />
        {/* Fading dark overlay (heavier on the left, fading to the right) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10"></div>
      </div>

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-20 border-b border-white/20">
        <div className="container mx-auto px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="font-mono text-white text-xl lg:text-2xl font-bold tracking-widest italic transform -skew-x-12">
              CLARA<span className="text-[#00D4AA]">AI</span>
            </div>
            <div className="h-3 lg:h-4 w-px bg-white/40"></div>
            <span className="text-white/60 text-[8px] lg:text-[10px] font-mono">EST. 2025</span>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-[10px] font-mono text-white/60">
            <span>SYSTEM_ACTIVE</span>
            <div className="w-1 h-1 bg-[#00D4AA] rounded-full animate-pulse"></div>
            <span>MONITORING</span>
          </div>
        </div>
      </div>

      {/* Corner Frame Accents */}
      <div className="absolute top-0 left-0 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-l-2 border-white/30 z-20"></div>
      <div className="absolute top-0 right-0 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-r-2 border-white/30 z-20"></div>
      <div className="absolute left-0 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-l-2 border-white/30 z-20" style={{ bottom: '5vh' }}></div>
      <div className="absolute right-0 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-r-2 border-white/30 z-20" style={{ bottom: '5vh' }}></div>

      <div className="relative z-10 flex min-h-screen items-center pt-16 lg:pt-0" style={{ marginTop: '5vh' }}>
        <div className="container mx-auto px-6 lg:px-16 lg:ml-[10%]">
          <div className="max-w-lg relative">
            {/* Top decorative line */}
            <div className="flex items-center gap-2 mb-3 opacity-60">
              <div className="w-8 h-px bg-[#00D4AA]"></div>
              <span className="text-[#00D4AA] text-[10px] font-mono tracking-wider">001</span>
              <div className="flex-1 h-px bg-white"></div>
            </div>

            {/* Title with dithered accent */}
            <div className="relative">
              <div className="hidden lg:block absolute -left-3 top-0 bottom-0 w-1 dither-pattern opacity-40"></div>
              <h1 className="text-2xl lg:text-5xl font-bold text-white mb-3 lg:mb-4 leading-tight font-mono tracking-wider" style={{ letterSpacing: '0.1em' }}>
                PREDICT FAILURES
                <span className="block text-[#00D4AA] mt-1 lg:mt-2 opacity-90">
                  7 DAYS EARLY
                </span>
              </h1>
            </div>

            {/* Decorative dots pattern - desktop only */}
            <div className="hidden lg:flex gap-1 mb-3 opacity-40">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="w-0.5 h-0.5 bg-white rounded-full"></div>
              ))}
            </div>

            {/* Description */}
            <div className="relative">
              <p className="text-xs lg:text-base text-gray-300 mb-5 lg:mb-6 leading-relaxed font-mono opacity-80">
                ESG intelligence and predictive maintenance for the facilities that can never go down.
              </p>

              {/* Technical corner accent - desktop only */}
              <div className="hidden lg:block absolute -right-4 top-1/2 w-3 h-3 border border-white opacity-30" style={{ transform: 'translateY(-50%)' }}>
                <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white" style={{ transform: 'translate(-50%, -50%)' }}></div>
              </div>
            </div>

            {/* Buttons with technical accents */}
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
              <Link href="/demo" className="relative px-5 lg:px-6 py-2 lg:py-2.5 bg-transparent text-white font-mono text-xs lg:text-sm border border-[#00D4AA] hover:bg-[#00D4AA] hover:text-black transition-all duration-200 group text-center">
                <span className="hidden lg:block absolute -top-1 -left-1 w-2 h-2 border-t border-l border-[#00D4AA] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="hidden lg:block absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-[#00D4AA] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                VIEW LIVE DEMO
              </Link>

              <Link href="/product" className="relative px-5 lg:px-6 py-2 lg:py-2.5 bg-transparent border border-white text-white font-mono text-xs lg:text-sm hover:bg-white hover:text-black transition-all duration-200 text-center">
                LEARN MORE
              </Link>
            </div>

            {/* Bottom technical notation - desktop only */}
            <div className="hidden lg:flex items-center gap-2 mt-6 opacity-40">
              <span className="text-white text-[9px] font-mono">∞</span>
              <div className="flex-1 h-px bg-white"></div>
              <span className="text-white text-[9px] font-mono">CLARA_AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="absolute left-0 right-0 z-20 border-t border-white/20 bg-black/40 backdrop-blur-sm" style={{ bottom: '5vh' }}>
        <div className="container mx-auto px-4 lg:px-8 py-2 lg:py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-6 text-[8px] lg:text-[9px] font-mono text-white/50">
            <span className="hidden lg:inline">SYSTEM.ACTIVE</span>
            <span className="lg:hidden">SYS.ACT</span>
            <span>V1.0.0</span>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 text-[8px] lg:text-[9px] font-mono text-white/50">
            <span className="hidden lg:inline">◐ MONITORING</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="hidden lg:inline">FRAME: ∞</span>
          </div>
        </div>
      </div>
    </main>
  );
}
