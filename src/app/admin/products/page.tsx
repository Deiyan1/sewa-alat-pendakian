import React from 'react'
import { createClient } from '@/utils/supabase/server'
import AdminProductsClient from '@/components/AdminProductsClient'

export default async function AdminProductsPage() {
  const supabase = await createClient()

  // 1. Ambil data produk dengan relasi kategori
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })

  // 2. Ambil data kategori untuk form option
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  return (
    <AdminProductsClient
      products={(products as any) || []}
      categories={categories || []}
    />
  )
}
