'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProduct(state: any, formData: FormData) {
  const supabase = await createClient()

  // Verifikasi hak akses admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Akses ditolak. Silakan login kembali.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Akses ditolak. Anda bukan administrator.' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const pricePerDay = parseFloat(formData.get('pricePerDay') as string)
  const stock = parseInt(formData.get('stock') as string)
  const categoryId = formData.get('categoryId') as string
  const imageFile = formData.get('imageFile') as File

  if (!name || isNaN(pricePerDay) || isNaN(stock) || !categoryId) {
    return { error: 'Nama, harga sewa per hari, jumlah stok, dan kategori wajib diisi.' }
  }

  let imageUrl: string | null = null

  // Jika admin mengunggah file foto produk
  if (imageFile && imageFile.size > 0) {
    // Validasi tipe file
    if (!imageFile.type.startsWith('image/')) {
      return { error: 'Format foto produk tidak didukung. Gunakan JPG/PNG/WEBP.' }
    }

    const fileExt = imageFile.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}.${fileExt}`

    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: imageFile.type,
        upsert: true
      })

    if (uploadError) {
      return { error: `Gagal mengunggah foto ke storage: ${uploadError.message}` }
    }

    // Dapatkan Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    imageUrl = publicUrl
  }

  const { error: insertError } = await supabase
    .from('products')
    .insert({
      name,
      description,
      price_per_day: pricePerDay,
      stock,
      category_id: parseInt(categoryId),
      image_url: imageUrl
    })

  if (insertError) {
    return { error: `Gagal menyimpan produk ke database: ${insertError.message}` }
  }

  revalidatePath('/')
  revalidatePath('/admin/products')
  
  return { success: true }
}

export async function updateProduct(state: any, formData: FormData) {
  const supabase = await createClient()

  // Verifikasi hak akses admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Akses ditolak. Silakan login kembali.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Akses ditolak. Anda bukan administrator.' }
  }

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const pricePerDay = parseFloat(formData.get('pricePerDay') as string)
  const stock = parseInt(formData.get('stock') as string)
  const categoryId = formData.get('categoryId') as string
  const imageFile = formData.get('imageFile') as File
  const currentImageUrl = formData.get('currentImageUrl') as string

  if (!id || !name || isNaN(pricePerDay) || isNaN(stock) || !categoryId) {
    return { error: 'Data produk tidak lengkap.' }
  }

  let imageUrl = currentImageUrl

  // Jika admin mengunggah file foto produk baru
  if (imageFile && imageFile.size > 0) {
    if (!imageFile.type.startsWith('image/')) {
      return { error: 'Format foto produk tidak didukung. Gunakan JPG/PNG/WEBP.' }
    }

    const fileExt = imageFile.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}.${fileExt}`

    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: imageFile.type,
        upsert: true
      })

    if (uploadError) {
      return { error: `Gagal mengunggah foto baru ke storage: ${uploadError.message}` }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    imageUrl = publicUrl
  }

  const { error: updateError } = await supabase
    .from('products')
    .update({
      name,
      description,
      price_per_day: pricePerDay,
      stock,
      category_id: parseInt(categoryId),
      image_url: imageUrl
    })
    .eq('id', id)

  if (updateError) {
    return { error: `Gagal memperbarui produk: ${updateError.message}` }
  }

  revalidatePath('/')
  revalidatePath(`/products/${id}`)
  revalidatePath('/admin/products')
  
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()

  // Verifikasi hak akses admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Akses ditolak. Silakan login kembali.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Akses ditolak. Anda bukan administrator.' }
  }

  // Cari image_url lama untuk dihapus dari storage jika ada
  const { data: product } = await supabase
    .from('products')
    .select('image_url')
    .eq('id', id)
    .single()

  if (product?.image_url) {
    // Cek jika link gambar tersebut merupakan storage kita
    const bucketMark = '/storage/v1/object/public/product-images/'
    if (product.image_url.includes(bucketMark)) {
      const fileName = product.image_url.split(bucketMark).pop()
      if (fileName) {
        await supabase.storage.from('product-images').remove([fileName])
      }
    }
  }

  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return { error: `Gagal menghapus produk dari database: ${deleteError.message}` }
  }

  revalidatePath('/')
  revalidatePath('/admin/products')
  
  return { success: true }
}
