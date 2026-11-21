import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { Navbar } from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'AetherAuction | Live Auction Platform',
  description: 'Ultra-low latency real-time live auction platform with anti-sniping dynamic extensions and atomic single-winner resolution.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
