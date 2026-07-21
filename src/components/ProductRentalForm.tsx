'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { formatRupiah } from '@/utils/format'
import { Calendar, Info, ShoppingBag, Plus, Minus } from 'lucide-react'

interface Product {
  id: string
  name: string
  price_per_day: number
  stock: number
  image_url: string
}

interface ProductRentalFormProps {
  product: Product
}

export default function ProductRentalForm({ product }: ProductRentalFormProps) {
  const router = useRouter()
  const { addToCart, startDate, setStartDate, endDate, setEndDate, rentalDays } = useCart()
  const [qty, setQty] = useState(1)
  const [errorMsg, setErrorMsg] = useState('')

  // Menetapkan tanggal default jika kosong (Mulai besok, Selesai lusa)
  useEffect(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    const dayAfter = new Date(tomorrow)
    dayAfter.setDate(tomorrow.getDate() + 2) // Default sewa 3 hari

    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    if (!startDate) {
      setStartDate(formatDate(tomorrow))
    }
    if (!endDate) {
      setEndDate(formatDate(dayAfter))
    }
  }, [startDate, endDate, setStartDate, setEndDate])

  const minStartDate = () => {
    // Tanggal sewa paling cepat adalah besok
    const today = new Date()
    today.setDate(today.getDate() + 1)
    return today.toISOString().split('T')[0]
  }

  const minEndDate = () => {
    // Tanggal selesai paling cepat sama dengan tanggal mulai
    if (startDate) return startDate
    return minStartDate()
  }

  const handleQtyChange = (val: number) => {
    const newQty = Math.min(Math.max(1, val), product.stock)
    setQty(newQty)
  }

  const handleAddToCart = () => {
    if (!startDate || !endDate) {
      setErrorMsg('Silakan pilih tanggal mulai dan tanggal selesai sewa.')
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (end < start) {
      setErrorMsg('Tanggal selesai tidak boleh sebelum tanggal mulai.')
      return
    }

    setErrorMsg('')
    
    // Tambahkan ke Cart Context
    addToCart(
      {
        id: product.id,
        name: product.name,
        price_per_day: product.price_per_day,
        image_url: product.image_url,
        stock: product.stock,
      },
      qty
    )

    // Arahkan ke halaman Keranjang Belanja
    router.push('/cart')
  }

  const subtotal = product.price_per_day * qty * rentalDays

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-lg">
      <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary" />
        Atur Waktu & Jumlah Sewa
      </h3>

      <div className="space-y-4">
        {/* Date Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Mulai Sewa</label>
            <input
              type="date"
              min={minStartDate()}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                if (endDate && new Date(e.target.value) > new Date(endDate)) {
                  setEndDate(e.target.value)
                }
              }}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Selesai Sewa</label>
            <input
              type="date"
              min={minEndDate()}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Jumlah Unit</label>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border rounded-xl bg-background">
              <button
                type="button"
                onClick={() => handleQtyChange(qty - 1)}
                disabled={qty <= 1}
                className="p-3 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-sm font-semibold">{qty}</span>
              <button
                type="button"
                onClick={() => handleQtyChange(qty + 1)}
                disabled={qty >= product.stock}
                className="p-3 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground">
              Maksimal sewa {product.stock} unit
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200 flex items-start gap-2">
            <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Pricing Summary */}
        <div className="border-t border-border/10 pt-4 mt-6 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Harga Sewa / Hari</span>
            <span>{formatRupiah(product.price_per_day)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Durasi Sewa</span>
            <span>{rentalDays} Hari</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Kuantitas</span>
            <span>{qty} Unit</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-foreground border-t border-border/10 pt-3 mt-1">
            <span>Estimasi Total</span>
            <span className="text-primary">{formatRupiah(subtotal)}</span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all mt-4 cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5" />
          Sewa & Masukkan Keranjang
        </button>
      </div>
    </div>
  )
}
