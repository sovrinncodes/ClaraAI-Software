import Link from 'next/link'
import { Activity } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-black font-mono selection:bg-[#00D4AA] selection:text-black overflow-hidden">
      {/* Stars Background */}
      <div className="absolute inset-0 w-full h-full stars-bg opacity-25 pointer-events-none z-0"></div>

      {/* Viewport frame accents */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/20 pointer-events-none"></div>
      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/20 pointer-events-none"></div>
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/20 pointer-events-none"></div>
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/20 pointer-events-none"></div>

      <div className="w-full max-w-sm relative z-10">
        {/* Brand mark */}
        <div className="mb-6 text-center">
          <Link href="/" className="font-mono text-white text-xl font-bold tracking-widest italic transform -skew-x-12 inline-flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center bg-[#00D4AA]/15 border border-[#00D4AA]/40">
              <Activity className="w-3.5 h-3.5 text-[#00D4AA]" />
            </div>
            CLARA<span className="text-[#00D4AA]">AI</span>
          </Link>
          <div className="flex items-center justify-center gap-2 mt-2 opacity-50">
            <span className="text-white text-[8px] tracking-widest uppercase">SECURE_GATEWAY // PROT_SSL</span>
          </div>
        </div>

        {/* Main Panel wrapper */}
        <div className="relative border border-white/10 bg-[#111620]/80 p-8">
          {/* Tech accents */}
          <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t border-l border-[#00D4AA]"></div>
          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b border-r border-[#00D4AA]"></div>
          
          {children}
        </div>
      </div>
    </div>
  )
}
