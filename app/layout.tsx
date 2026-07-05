import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { Preloader } from '@/components/ui/preloader'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clara AI — ESG Intelligence Platform',
  description: 'Predictive maintenance and ESG intelligence for industrial and commercial facilities.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-full antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <Preloader>
            {children}
          </Preloader>
        </ThemeProvider>
      </body>
    </html>
  )
}
