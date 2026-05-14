import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/CartProvider'
import { Navbar } from '@/components/Navbar'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
})

export const metadata: Metadata = {
  title: 'Comfort Bedding Portal',
  description: 'B2B ordering portal for Comfort Bedding Manufacturing clients',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body style={{ fontFamily: 'var(--font-plus-jakarta, sans-serif)' }}>
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </CartProvider>
      </body>
    </html>
  )
}
