'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { formatRupiah } from '@/utils/format'
import { Trash2, ArrowRight, ChevronLeft, Plus, Minus, Calendar, ShoppingBag, AlertTriangle, ShoppingCart } from 'lucide-react'

interface CartPageClientProps {
  user: any
}

export default function CartPageClient({ user }: CartPageClientProps) {
  const router = useRouter()
  const { cart, removeFromCart, updateQuantity, clearCart, startDate, endDate, rentalDays } = useCart()

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price_per_day * item.quantity * rentalDays, 0)
  }

  const handleCheckoutRedirect = () => {
    if (!user) {
      router.push('/login?next=/checkout')
    } else {
      router.push('/checkout')
    }
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-6">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Keranjang Belanja Kosong</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Anda belum menambahkan perlengkapan outdoor apa pun ke keranjang belanja Anda.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:scale-[1.01] active:scale-[0.99]"
        >
          <ChevronLeft className="w-4 h-4" />
          Mulai Cari Alat
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-8 flex items-center gap-2">
        <ShoppingCart className="w-8 h-8 text-primary" />
        Keranjang Belanja
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center border-b border-border/10 pb-4">
            <span className="text-sm font-semibold text-muted-foreground">{cart.length} Jenis Perlengkapan</span>
            <button
              onClick={() => {
                if (confirm('Kosongkan semua barang di keranjang?')) clearCart()
              }}
              className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Kosongkan Keranjang
            </button>
          </div>

          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0 mx-auto sm:mx-0">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>

                {/* Product details */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <h3 className="font-bold text-foreground hover:text-primary transition-colors text-base truncate">
                    <Link href={`/products/${item.id}`}>{item.name}</Link>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Harga sewa: {formatRupiah(item.price_per_day)} / hari
                  </p>
                </div>

                {/* Actions: Quantity Selector & Pricing */}
                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-border/10 sm:border-0">
                  {/* Quantity Control */}
                  <div className="flex items-center border border-border rounded-xl bg-background mx-auto sm:mx-0">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal Item */}
                  <div className="text-right sm:min-w-[120px] w-full sm:w-auto">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Subtotal</p>
                    <p className="font-extrabold text-primary">
                      {formatRupiah(item.price_per_day * item.quantity * rentalDays)}
                    </p>
                  </div>

                  {/* Delete Item */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                    title="Hapus Barang"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-md space-y-6">
            <h2 className="font-extrabold text-lg text-foreground flex items-center gap-2 border-b border-border/10 pb-4">
              <Calendar className="w-5 h-5 text-primary" />
              Detail Rencana Sewa
            </h2>

            {/* Date Details */}
            <div className="space-y-3 bg-muted/30 border border-border/50 rounded-2xl p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mulai Sewa:</span>
                <span className="font-semibold text-foreground">{startDate || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Selesai Sewa:</span>
                <span className="font-semibold text-foreground">{endDate || '-'}</span>
              </div>
              <div className="flex justify-between border-t border-border/10 pt-2 mt-2 font-bold text-foreground">
                <span>Durasi:</span>
                <span className="text-primary">{rentalDays} Hari</span>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-3 pt-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Total Barang</span>
                <span>{cart.reduce((t, item) => t + item.quantity, 0)} Unit</span>
              </div>
              
              <div className="flex justify-between text-base font-extrabold text-foreground border-t border-border/10 pt-4 mt-2">
                <span>Total Sewa</span>
                <span className="text-xl text-primary font-black">{formatRupiah(calculateTotal())}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={handleCheckoutRedirect}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-4 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              Lanjut ke Pembayaran
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/90 flex gap-2">
            <AlertTriangle className="w-4.5 h-4.5 text-accent shrink-0 mt-0.5" />
            <span>
              Silakan periksa kembali perlengkapan dan tanggal sewa Anda sebelum melanjutkan ke pembayaran.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
