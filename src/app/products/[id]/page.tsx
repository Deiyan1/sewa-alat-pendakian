import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'
import Header from '@/components/Header'
import ProductRentalForm from '@/components/ProductRentalForm'
import { formatRupiah } from '@/utils/format'
import { ChevronLeft, Info, Package, AlertCircle } from 'lucide-react'

// Next.js 16 Page Props interface
type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProductDetailPage(props: PageProps) {
  const params = await props.params
  const id = params.id

  const supabase = await createClient()

  // Ambil detail produk berdasarkan ID beserta data kategorinya
  const { data: product, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('id', id)
    .single()

  if (error || !product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-16 text-center flex flex-col items-center justify-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2">Produk Tidak Ditemukan</h2>
          <p className="text-muted-foreground mb-6">
            Maaf, perlengkapan outdoor dengan ID tersebut tidak tersedia atau telah dihapus.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Katalog
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Kembali ke Katalog
            </Link>
          </div>

          {/* Product Detail Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Image Column */}
            <div className="lg:col-span-7 bg-card border border-border rounded-3xl overflow-hidden p-4">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-muted">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-w-768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Tidak ada gambar
                  </div>
                )}
              </div>
            </div>

            {/* Info & Form Column */}
            <div className="lg:col-span-5 space-y-6">
              {/* Product Info */}
              <div className="space-y-3">
                {product.categories && (
                  <span className="inline-block bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full">
                    {product.categories.name}
                  </span>
                )}
                
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  {product.name}
                </h1>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-primary">{formatRupiah(product.price_per_day)}</span>
                  <span className="text-sm text-muted-foreground"> / hari</span>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-b border-border/10 py-5 space-y-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Package className="w-4 h-4" />
                  Deskripsi Perlengkapan
                </h2>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {product.description || 'Tidak ada deskripsi produk.'}
                </p>
              </div>

              {/* Rental Form */}
              <ProductRentalForm product={product} />

              {/* Guarantee / Notes Info */}
              <div className="p-4 rounded-2xl bg-muted/50 border border-border/40 text-xs text-muted-foreground flex items-start gap-2.5">
                <Info className="w-4.5 h-4.5 text-accent shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">Catatan Penyewaan:</p>
                  <p>1. Pengambilan alat wajib membawa identitas diri asli (KTP/SIM) sesuai akun.</p>
                  <p>2. Kerusakan atau kehilangan unit akan dikenakan denda penggantian sesuai kesepakatan.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
