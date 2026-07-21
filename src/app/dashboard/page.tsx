import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Header from '@/components/Header'
import DashboardClient from '@/components/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Ambil data user saat ini
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Ambil profil pelanggan
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // 3. Ambil rekening bank aktif (untuk dropdown form upload)
  const { data: bankAccounts } = await supabase
    .from('bank_accounts')
    .select('id, bank_name')
    .eq('is_active', true)
    .order('bank_name')

  // 4. Ambil riwayat sewa dari user
  const { data: rentals } = await supabase
    .from('rentals')
    .select('*, rental_items(*, products(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // 5. Generate signed URLs untuk bukti pembayaran yang bersifat private/restricted
  const rentalsWithSignedUrls = rentals
    ? await Promise.all(
        rentals.map(async (rental) => {
          let signedUrl = null
          if (rental.payment_proof_url) {
            try {
              const { data } = await supabase.storage
                .from('payment-proofs')
                .createSignedUrl(rental.payment_proof_url, 3600) // valid 1 jam
              signedUrl = data?.signedUrl
            } catch (err) {
              console.error('Error generating signed url', err)
            }
          }
          return {
            ...rental,
            payment_proof_signed_url: signedUrl
          }
        })
      )
    : []

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-background">
        <DashboardClient
          profile={profile}
          rentals={rentalsWithSignedUrls as any}
          bankAccounts={bankAccounts || []}
        />
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
