'use client'

import React, { useActionState, useState, startTransition } from 'react'
import Image from 'next/image'
import { createProduct, updateProduct, deleteProduct } from '@/app/admin/products/actions'
import { formatRupiah } from '@/utils/format'
import { 
  Plus, Pencil, Trash2, X, UploadCloud, Loader2, AlertCircle, Package, Layers, Info
} from 'lucide-react'

interface Category {
  id: number
  name: string
}

interface Product {
  id: string
  name: string
  description: string | null
  price_per_day: number
  stock: number
  image_url: string | null
  category_id: number | null
  categories: {
    name: string
  } | null
}

interface AdminProductsClientProps {
  products: Product[]
  categories: Category[]
}

export default function AdminProductsClient({ products, categories }: AdminProductsClientProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)

  // Gunakan action untuk tambah / edit
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    let res;
    if (editingProduct) {
      formData.append('id', editingProduct.id)
      res = await updateProduct(prevState, formData)
    } else {
      res = await createProduct(prevState, formData)
    }

    if (res.success) {
      closeModal()
    }
    return res
  }, null)

  const openAddModal = () => {
    setEditingProduct(null)
    setFilePreview(null)
    setIsOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFilePreview(product.image_url)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setEditingProduct(null)
    setFilePreview(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreview(editingProduct?.image_url || null)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) {
      setIsDeletingId(id)
      const res = await deleteProduct(id)
      if (res.error) {
        alert(res.error)
      }
      setIsDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Kelola Katalog Produk</h1>
          <p className="text-sm text-muted-foreground mt-1">Tambah, edit, dan hapus perlengkapan pendakian gunung.</p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-primary/10 transition-transform active:scale-95"
        >
          <Plus className="w-4.5 h-4.5" />
          Tambah Produk
        </button>
      </div>

      {/* Products Table/List */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        {products.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-2">
            <Package className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
            <p className="text-base font-semibold">Belum Ada Produk</p>
            <p className="text-xs">Klik tombol &quot;Tambah Produk&quot; untuk memasukkan barang baru ke katalog.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase border-b border-border/10 bg-muted/10">
                  <th className="px-6 py-4 font-semibold">Produk</th>
                  <th className="px-6 py-4 font-semibold">Kategori</th>
                  <th className="px-6 py-4 font-semibold">Harga Sewa / Hari</th>
                  <th className="px-6 py-4 font-semibold">Sisa Stok</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/5">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/5 transition-colors">
                    {/* Product Name & Image */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0 border border-border/40">
                          {product.image_url ? (
                            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                              No Img
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground text-sm truncate max-w-[200px]" title={product.name}>
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]" title={product.description || ''}>
                            {product.description || 'Tidak ada deskripsi'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs text-foreground bg-muted/65 border border-border/60 px-2.5 py-1 rounded-full">
                        <Layers className="w-3 h-3 text-primary" />
                        {product.categories?.name || 'Umum'}
                      </span>
                    </td>

                    {/* Rent price */}
                    <td className="px-6 py-4 font-extrabold text-primary">
                      {formatRupiah(product.price_per_day)}
                    </td>

                    {/* Stock level */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          product.stock > 0
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}
                      >
                        {product.stock} Unit
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-xl transition-colors cursor-pointer"
                          title="Edit Produk"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={isDeletingId === product.id}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                          title="Hapus Produk"
                        >
                          {isDeletingId === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal (Add / Edit) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form action={formAction} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Form Errors */}
              {state?.error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
                  <span>{state.error}</span>
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-1">
                <label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase">
                  Nama Produk
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  defaultValue={editingProduct?.name || ''}
                  placeholder="Contoh: Tenda Eiger Shaba 4P"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Category Field */}
              <div className="space-y-1">
                <label htmlFor="categoryId" className="text-xs font-semibold text-muted-foreground uppercase">
                  Kategori
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  defaultValue={editingProduct?.category_id || ''}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                >
                  <option value="">Pilih Kategori...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Price per Day Field */}
                <div className="space-y-1">
                  <label htmlFor="pricePerDay" className="text-xs font-semibold text-muted-foreground uppercase">
                    Harga Sewa / Hari (Rp)
                  </label>
                  <input
                    id="pricePerDay"
                    name="pricePerDay"
                    type="number"
                    required
                    min="0"
                    defaultValue={editingProduct?.price_per_day || ''}
                    placeholder="Contoh: 50000"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all font-mono"
                  />
                </div>

                {/* Stock Field */}
                <div className="space-y-1">
                  <label htmlFor="stock" className="text-xs font-semibold text-muted-foreground uppercase">
                    Jumlah Ketersediaan Stok
                  </label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    required
                    min="0"
                    defaultValue={editingProduct?.stock !== undefined ? editingProduct.stock : ''}
                    placeholder="Contoh: 5"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all font-mono"
                  />
                </div>
              </div>

              {/* Description Field */}
              <div className="space-y-1">
                <label htmlFor="description" className="text-xs font-semibold text-muted-foreground uppercase">
                  Deskripsi Perlengkapan
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={editingProduct?.description || ''}
                  placeholder="Jelaskan spesifikasi alat, kapasitas, kondisi, dsb."
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Image Upload Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Foto Produk
                </label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/50 rounded-2xl py-6 px-4 bg-background/50 hover:bg-background transition-all relative">
                  <input
                    type="file"
                    id="imageFile"
                    name="imageFile"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {editingProduct && (
                    <input type="hidden" name="currentImageUrl" value={editingProduct.image_url || ''} />
                  )}
                  {filePreview ? (
                    <div className="relative w-full max-w-[150px] aspect-square rounded-xl overflow-hidden border border-border shadow-sm">
                      <Image src={filePreview} alt="Product Preview" fill className="object-cover" />
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-9 h-9 text-muted-foreground mb-1.5" />
                      <span className="text-xs font-bold text-foreground">Pilih foto produk</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">Format JPG/PNG/WEBP</span>
                    </>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-border/60 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Produk'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
