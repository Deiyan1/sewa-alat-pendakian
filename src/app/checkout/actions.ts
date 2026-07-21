'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface CartItem {
  id: string
  quantity: number
  price_per_day: number
}

export async function createRentalOrder(
  startDate: string,
  endDate: string,
  items: CartItem[]
) {
  const supabase = await createClient()

  // 1. Ambil user terautentikasi
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Anda harus masuk terlebih dahulu.' }
  }

  if (!startDate || !endDate) {
    return { error: 'Tanggal mulai dan selesai sewa harus dipilih.' }
  }

  if (!items || items.length === 0) {
    return { error: 'Keranjang belanja kosong.' }
  }

  // 2. Hitung jumlah hari sewa
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

  if (isNaN(rentalDays) || rentalDays <= 0) {
    return { error: 'Durasi sewa tidak valid.' }
  }

  // 3. Hitung harga total
  let totalPrice = 0
  for (const item of items) {
    totalPrice += item.price_per_day * item.quantity * rentalDays
  }

  // 4. Periksa ketersediaan stok produk sebelum membuat pesanan
  for (const item of items) {
    const { data: prod } = await supabase
      .from('products')
      .select('stock, name')
      .eq('id', item.id)
      .single()

    if (!prod) {
      return { error: `Produk dengan ID ${item.id} tidak ditemukan.` }
    }

    if (prod.stock < item.quantity) {
      return { error: `Stok produk "${prod.name}" tidak mencukupi (Tersisa: ${prod.stock}).` }
    }
  }

  // 5. Buat transaksi header rentals
  const { data: rental, error: rentalError } = await supabase
    .from('rentals')
    .insert({
      user_id: user.id,
      start_date: startDate,
      end_date: endDate,
      total_price: totalPrice,
      status: 'pending_payment'
    })
    .select()
    .single()

  if (rentalError || !rental) {
    return { error: `Gagal membuat pesanan sewa: ${rentalError?.message}` }
  }

  // 6. Buat detail transaksi rental_items
  const itemsToInsert = items.map((item) => ({
    rental_id: rental.id,
    product_id: item.id,
    quantity: item.quantity,
    price_per_unit: item.price_per_day
  }))

  const { error: itemsError } = await supabase
    .from('rental_items')
    .insert(itemsToInsert)

  if (itemsError) {
    // Rollback manual: hapus rental header jika detailnya gagal masuk
    await supabase.from('rentals').delete().eq('id', rental.id)
    return { error: `Gagal menyimpan rincian item sewa: ${itemsError.message}` }
  }

  // 7. Kurangi stok produk secara real-time
  for (const item of items) {
    const { data: prod } = await supabase
      .from('products')
      .select('stock')
      .eq('id', item.id)
      .single()
      
    if (prod) {
      await supabase
        .from('products')
        .update({ stock: prod.stock - item.quantity })
        .eq('id', item.id)
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin/rentals')
  
  return { success: true, rentalId: rental.id }
}
