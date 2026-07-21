'use client'

import React, { startTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { logout } from '@/app/(auth)/actions'
import { Tent, ShoppingCart, User, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react'

interface HeaderClientProps {
  user: any
  role: string | null
  fullName: string | null
}

export default function HeaderClient({ user, role, fullName }: HeaderClientProps) {
  const pathname = usePathname()
  const { cartCount } = useCart()

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      startTransition(async () => {
        await logout()
      })
    }
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-all">
                <Tent className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                SewaAdventure
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Katalog Alat
            </Link>
            
            {user && role === 'admin' && (
              <Link
                href="/admin/dashboard"
                className={`text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-primary ${
                  isActive('/admin/dashboard') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-accent" />
                Dashboard Admin
              </Link>
            )}

            {user && role === 'customer' && (
              <Link
                href="/dashboard"
                className={`text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-primary ${
                  pathname.startsWith('/dashboard') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard Saya
              </Link>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative p-2 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-muted"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-foreground transform translate-x-1/2 -translate-y-1/2 bg-accent rounded-full animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-4 border-l border-border pl-4">
                <div className="hidden lg:block text-right">
                  <p className="text-xs text-muted-foreground">Halo,</p>
                  <p className="text-sm font-semibold truncate max-w-[120px]" title={fullName || ''}>
                    {fullName}
                  </p>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full cursor-pointer transition-colors"
                  title="Keluar"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-border pl-4">
                <Link
                  href="/login"
                  className="text-sm font-medium hover:text-primary px-3 py-1.5 rounded-lg hover:bg-muted transition-all"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
