import type { Metadata } from 'next'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { ImpersonationBanner } from '@/components/layout/impersonation-banner'
import { QueryProvider } from '@/providers/query-provider'
import { AppTenantProvider } from '@/providers/app-tenant-provider'

export const metadata: Metadata = {
  title: { template: '%s | Clara AI', default: 'Clara AI' },
  description: 'ESG intelligence and predictive maintenance for industrial and commercial facilities.',
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AppTenantProvider>
        <div
          className="flex h-screen overflow-hidden"
          style={{ backgroundColor: 'var(--bg-base)' }}
        >
          <Sidebar />

          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <ImpersonationBanner />
            <Header />

            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </AppTenantProvider>
    </QueryProvider>
  )
}
