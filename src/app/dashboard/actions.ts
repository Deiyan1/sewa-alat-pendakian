'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadPaymentProof(state: any, formData: FormData) {
  const supabase = await createClient()

  // 1. Ambil user terautentikasi
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Anda harus login terlebih dahulu.' }
  }

  const rentalId = formData.get('rentalId') as string
  const senderName = formData.get('senderName') as string
  const bankName = formData.get('bankName') as string
  const file = formData.get('file') as File

  if (!rentalId || !senderName || !bankName || !file || file.size === 0) {
    return { error: 'Semua kolom formulir dan file bukti transfer wajib diisi.' }
  }

  // Validasi tipe file (hanya gambar)
  if (!file.type.startsWith('image/')) {
    return { error: 'Format file tidak didukung. Harap unggah file gambar (JPG/PNG/WEBP).' }
  }

  // Validasi ukuran file (maksimal 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'Ukuran file terlalu besar. Maksimal ukuran file adalah 5MB.' }
  }

  try {
    // 2. Pastikan pesanan rental benar milik user tersebut
    const { data: rental, error: fetchError } = await supabase
      .from('rentals')
      .select('id, user_id')
      .eq('id', rentalId)
      .single()

    if (fetchError || !rental) {
      return { error: 'Pesanan sewa tidak ditemukan.' }
    }

    if (rental.user_id !== user.id) {
      return { error: 'Akses ditolak. Anda tidak berhak mengubah pesanan ini.' }
    }

    // 3. Unggah file bukti ke Supabase Storage (bucket: payment-proofs)
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${user.id}/${rentalId}_${Date.now()}.${fileExt}`
    
    // Ubah file ke ArrayBuffer untuk diunggah
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      return { error: `Gagal mengunggah gambar ke storage: ${uploadError.message}` }
    }

    // 4. Update data rentals di database
    const { error: updateError } = await supabase
      .from('rentals')
      .update({
        payment_proof_url: fileName, // Menyimpan file path
        sender_name: senderName,
        bank_name_destination: bankName,
        status: 'pending_verification',
        rejection_reason: null // Hapus alasan penolakan sebelumnya jika ada
      })
      .eq('id', rentalId)

    if (updateError) {
      // Hapus kembali file di storage jika database update gagal agar tidak menumpuk sampah
      await supabase.storage.from('payment-proofs').remove([fileName])
      return { error: `Gagal memperbarui transaksi: ${updateError.message}` }
    }

    revalidatePath('/dashboard')
    revalidatePath('/admin/rentals')
    
    return { success: true }
  } catch (e: any) {
    return { error: `Terjadi kesalahan sistem: ${e?.message || e}` }
  }
}
