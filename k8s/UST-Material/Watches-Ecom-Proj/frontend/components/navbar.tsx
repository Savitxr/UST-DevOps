'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, User, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'
import { CartPanel } from '@/components/cart-panel'
import { useAuth } from '@/lib/auth-context'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/sell', label: 'Sell' },
  { href: '/orders', label: 'Orders' },
]

export function Navbar() {
  const pathname = usePathname()
  const { totalItems, isCartOpen, setIsCartOpen } = useCart()
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
              Meridian
            </span>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'text-sm uppercase tracking-widest transition-colors duration-200 hover:text-accent',
                    pathname === link.href
                      ? 'text-accent'
                      : 'text-muted-foreground'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <Link
              href={user ? '/profile' : '/login'}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Profile"
            >
              <User className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {totalItems}
                </span>
              )}
            </button>
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-foreground md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="border-t border-border bg-background px-6 pb-6 md:hidden">
            <ul className="flex flex-col gap-4 pt-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block text-sm uppercase tracking-widest transition-colors',
                      pathname === link.href
                        ? 'text-accent'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>
      <CartPanel open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
