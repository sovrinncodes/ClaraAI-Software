import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { extractPlatformRoleFromHeaders } from '@/lib/utils/staff'

export const metadata: Metadata = {
  title: { template: '%s | Clara Staff', default: 'Clara Staff' },
  description: 'Clara AI platform administration.',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Defense in depth: the proxy already 404s non-staff, re-check here too.
  const role = extractPlatformRoleFromHeaders(await headers())
  if (!role) notFound()

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      <AdminSidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminHeader role={role} />

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
