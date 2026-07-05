// The landing page lives at app/page.tsx.
// This (marketing) route group provides layout for /pricing and /demo only.
// If Next.js routes here, redirect to the app.
import { redirect } from 'next/navigation'

export default function MarketingRoot() {
  redirect('/dashboard')
}
