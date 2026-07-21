import React from 'react'
import { createClient } from '@/utils/supabase/server'
import AdminRentalsClient from '@/components/AdminRentalsClient'

export default async function AdminRentalsPage() {
  const supabase = await createClient()

  // 1. Ambil data semua transaksi sewa beserta data pelanggan dan item sewa
  const { data: rentals } = await supabase
    .from('rentals')
    .select('*, profiles(full_name, phone, address), rental_items(*, products(name, image_url))')
    .order('created_at', { ascending: false })

  // 2. Generate signed URLs untuk bukti pembayaran yang bersifat private/restricted
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
              console.error('Error generating signed url for admin', err)
            }
          }
          return {
            ...rental,
            payment_proof_signed_url: signedUrl
          }
        })
      )
    : []

  return <AdminRentalsClient rentals={rentalsWithSignedUrls as any} />
}
