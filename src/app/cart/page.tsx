import React from 'react'
import { createClient } from '@/utils/supabase/server'
import Header from '@/components/Header'
import CartPageClient from '@/components/CartPageClient'

export default async function CartPage() {
  const supabase = await createClient()
  
  // Ambil user di server
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-background">
        <CartPageClient user={user} />
      </main>
      
      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 text-center text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 SewaAdventure Indonesia. Semua hak cipta dilindungi undang-undang.</p>
        </div>
      </footer>
    </div>
  )
}
