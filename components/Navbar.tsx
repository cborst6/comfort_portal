'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'
import { useCart } from './CartProvider'

export function Navbar() {
  const { totalItems, isHydrated } = useCart()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/catalog" className="flex items-center">
            <Image
              src="/logo.webp"
              alt="Comfort Bedding Mfg."
              width={160}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/catalog"
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith('/catalog')
                  ? 'text-[#2AB9D4]'
                  : 'text-gray-600 hover:text-[#2AB9D4]'
              }`}
            >
              Catalog
            </Link>
          </nav>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-[#2AB9D4] hover:text-[#2AB9D4] transition-all group"
          >
            <ShoppingCart size={18} className="text-gray-500 group-hover:text-[#2AB9D4] transition-colors" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-[#2AB9D4] transition-colors">
              Cart
            </span>
            {isHydrated && totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#2AB9D4] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
