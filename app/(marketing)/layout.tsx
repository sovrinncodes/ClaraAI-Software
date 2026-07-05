import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Clara AI',
    default: 'Clara AI — ESG Intelligence Platform',
  },
  description:
    'Predictive maintenance and ESG intelligence for industrial and commercial facilities. Prevent failures 7+ days in advance.',
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0D14', color: '#E4EAF3' }}>
      {children}
    </div>
  )
}
