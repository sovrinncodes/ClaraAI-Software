const fs = require('fs');
const path = require('path');

const pages = [
  { name: 'About', slug: 'about' },
  { name: 'Contact', slug: 'contact' },
  { name: 'Blog', slug: 'blog' },
  { name: 'Privacy Policy', slug: 'privacy' },
  { name: 'Terms of Service', slug: 'terms' },
  { name: 'Security', slug: 'security' },
  { name: 'Cookie Policy', slug: 'cookies' },
];

const template = (title) => `import { Activity } from 'lucide-react';
import Link from 'next/link';

import { NavReveal, GlitchTitle, Reveal } from '@/components/ui/motion-wrappers';
import { FlickeringFooter } from '@/components/ui/flickering-footer';

export default function ${title.replace(/\s+/g, '')}Page() {
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
      <main className="relative flex-1 flex flex-col items-center justify-center px-6 py-32 z-10">
        <div className="max-w-2xl text-center">
          <GlitchTitle>
            <h1 className="text-3xl md:text-5xl font-bold tracking-wider text-white mb-6 uppercase">
              ${title}
            </h1>
          </GlitchTitle>
          <Reveal variant="up" delay={0.2}>
            <p className="text-xs sm:text-sm text-[#8B96A8] uppercase tracking-widest leading-relaxed mb-8">
              This page is currently under construction. Please check back later.
            </p>
            <Link
              href="/"
              className="inline-flex px-6 py-3 border border-white/20 text-white font-mono text-xs hover:border-white hover:bg-white/5 transition-all duration-200"
            >
              RETURN HOME
            </Link>
          </Reveal>
        </div>
      </main>

      {/* Footer */}
      <FlickeringFooter />
    </div>
  );
}
`;

const baseDir = path.join(__dirname, '..', 'app', '(marketing)');

pages.forEach(page => {
  const dirPath = path.join(baseDir, page.slug);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(path.join(dirPath, 'page.tsx'), template(page.name));
  console.log(`Created ${page.slug}/page.tsx`);
});
