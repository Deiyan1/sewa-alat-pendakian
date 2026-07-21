import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Header from '@/components/Header'
import CheckoutPageClient from '@/components/CheckoutPageClient'

export default async function CheckoutPage() {
  const supabase = await createClient()

  // Ambil data user saat ini di server
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?next=/checkout')
  }

  // Ambil profil penyewa
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Ambil rekening bank aktif
  const { data: bankAccounts } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('is_active', true)
    .order('bank_name')

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-background">
        {profile && (
          <CheckoutPageClient
            profile={profile}
            bankAccounts={bankAccounts || []}
          />
        )}
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
