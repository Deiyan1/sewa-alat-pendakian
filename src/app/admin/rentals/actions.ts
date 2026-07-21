'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Verifikasi Pembayaran (Approve / Reject)
export async function verifyPayment(
  rentalId: string,
  action: 'approve' | 'reject',
  rejectionReason: string | null
) {
  const supabase = await createClient()

  // Verifikasi hak akses admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Akses ditolak.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Akses ditolak.' }
  }

  try {
    if (action === 'approve') {
      const { error } = await supabase
        .from('rentals')
        .update({
          status: 'confirmed',
          rejection_reason: null
        })
        .eq('id', rentalId)

      if (error) return { error: error.message }
    } else {
      if (!rejectionReason) {
        return { error: 'Alasan penolakan wajib diisi jika menolak pembayaran.' }
      }

      const { error } = await supabase
        .from('rentals')
        .update({
          status: 'pending_payment', // Kembali ke status pending agar user bisa re-upload
          rejection_reason: rejectionReason
        })
        .eq('id', rentalId)

      if (error) return { error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/admin/rentals')
    revalidatePath('/admin/dashboard')
    return { success: true }
  } catch (e: any) {
    return { error: e?.message || e }
  }
}

// Perbarui Status Siklus Sewa (rented, returned, late, cancelled)
export async function updateRentalStatus(rentalId: string, newStatus: string) {
  const supabase = await createClient()

  // Verifikasi hak akses admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Akses ditolak.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Akses ditolak.' }
  }

  try {
    // Ambil data transaksi beserta item sewa
    const { data: rental, error: fetchError } = await supabase
      .from('rentals')
      .select('*, rental_items(*)')
      .eq('id', rentalId)
      .single()

    if (fetchError || !rental) {
      return { error: 'Transaksi tidak ditemukan.' }
    }

    // Jika status baru adalah 'returned' atau 'cancelled', kita kembalikan stok produk
    if ((newStatus === 'returned' || newStatus === 'cancelled') && rental.status !== 'returned' && rental.status !== 'cancelled') {
      for (const item of rental.rental_items) {
        const { data: prod } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single()

        if (prod) {
          await supabase
            .from('products')
            .update({ stock: prod.stock + item.quantity })
            .eq('id', item.product_id)
        }
      }
    }

    // Perbarui status rental
    const { error: updateError } = await supabase
      .from('rentals')
      .update({ status: newStatus })
      .eq('id', rentalId)

    if (updateError) {
      return { error: updateError.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/admin/rentals')
    revalidatePath('/admin/dashboard')
    return { success: true }
  } catch (e: any) {
    return { error: e?.message || e }
  }
}
