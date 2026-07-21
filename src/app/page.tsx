import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'
import Header from '@/components/Header'
import CatalogFilters from '@/components/CatalogFilters'
import { formatRupiah } from '@/utils/format'
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react'

// Menyesuaikan type PageProps untuk Next.js 16 async dynamic API
type PageProps = {
  params: Promise<{ [key: string]: string | string[] | undefined }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Home(props: PageProps) {
  const searchParams = await props.searchParams
  const currentCategory = (searchParams?.category as string) || ''
  const currentQuery = (searchParams?.query as string) || ''

  const supabase = await createClient()

  // 1. Ambil daftar kategori
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  // 2. Ambil produk terfilter
  let dbQuery = supabase.from('products').select('*, categories(id, name, slug)')
  
  if (currentCategory) {
    dbQuery = supabase
      .from('products')
      .select('*, categories!inner(id, name, slug)')
      .eq('categories.slug', currentCategory)
  }

  if (currentQuery) {
    dbQuery = dbQuery.ilike('name', `%${currentQuery}%`)
  }

  const { data: products } = await dbQuery.order('name')

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-radial from-[#133024] via-background to-background py-16 sm:py-24 border-b border-border/10">
          <div className="absolute top-[-10%] left-[20%] w-[30%] h-[30%] rounded-full bg-primary/10 blur-[100px]" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Sewa Alat Gunung Premium
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
              Jelajahi Alam Bebas Dengan<br />
              <span className="text-primary bg-clip-text">Perlengkapan Terbaik</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground mb-8">
              Penyewaan alat gunung lengkap, higienis, dan terawat. Pembayaran mudah via transfer bank dan diverifikasi cepat oleh admin. Siap temani petualangan Anda!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-primary" />
                Alat Bersih & Higienis
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-primary" />
                Stok Selalu Update
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-primary" />
                Verifikasi Cepat
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Title & Filters */}
          <div className="mb-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-4">Katalog Perlengkapan</h2>
            <CatalogFilters
              categories={categories || []}
              currentCategory={currentCategory}
              currentQuery={currentQuery}
            />
          </div>

          {/* Products Grid */}
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square w-full bg-muted overflow-hidden">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        No Image
                      </div>
                    )}
                    
                    {/* Category Tag */}
                    {product.categories && (
                      <span className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/10">
                        {product.categories.name}
                      </span>
                    )}

                    {/* Stock Badge */}
                    <span
                      className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full border ${
                        product.stock > 0
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                      }`}
                    >
                      {product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {product.description || 'Tidak ada deskripsi.'}
                    </p>
                    
                    {/* Price and Action */}
                    <div className="flex items-center justify-between border-t border-border/10 pt-4 mt-auto">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Harga sewa</p>
                        <p className="font-extrabold text-primary text-base">
                          {formatRupiah(product.price_per_day)}
                          <span className="text-[10px] text-muted-foreground font-normal"> / hari</span>
                        </p>
                      </div>
                      
                      <Link
                        href={`/products/${product.id}`}
                        className={`inline-flex items-center justify-center p-2 rounded-xl text-primary-foreground transition-all ${
                          product.stock > 0
                            ? 'bg-primary hover:bg-primary/95 group-hover:px-4 hover:gap-1.5'
                            : 'bg-muted text-muted-foreground pointer-events-none'
                        }`}
                      >
                        <span className="text-xs font-bold max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-300">
                          Detail
                        </span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card border border-border rounded-3xl">
              <p className="text-lg text-muted-foreground">Tidak ada perlengkapan ditemukan.</p>
              <Link href="/" className="text-primary hover:underline font-semibold mt-2 inline-block">
                Reset Filter
              </Link>
            </div>
          )}
        </section>
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
