import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { logout } from '@/app/(auth)/actions'
import { 
  Tent, LayoutDashboard, Package, Receipt, ArrowLeft, LogOut, Landmark
} from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Ambil user di server
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Cek apakah benar admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-card border-r border-border flex flex-col justify-between shrink-0">
        <div className="flex flex-col flex-1">
          {/* Sidebar Header */}
          <div className="h-16 flex items-center px-6 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
                <Tent className="w-4.5 h-4.5" />
              </div>
              <span className="font-extrabold text-foreground tracking-tight text-sm uppercase">SewaAdmin</span>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-border/40 bg-muted/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                AD
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Administrator</p>
                <p className="text-sm font-semibold truncate text-foreground">{profile.full_name}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <LayoutDashboard className="w-4.5 h-4.5 text-primary" />
              Ringkasan Dashboard
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <Package className="w-4.5 h-4.5 text-primary" />
              Kelola Produk
            </Link>

            <Link
              href="/admin/rentals"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <Receipt className="w-4.5 h-4.5 text-primary" />
              Transaksi Sewa
            </Link>

            <Link
              href="/admin/bank-accounts"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <Landmark className="w-4.5 h-4.5 text-primary" />
              Rekening Bank
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border/60 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Katalog
          </Link>
          
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-background">
        <div className="p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
