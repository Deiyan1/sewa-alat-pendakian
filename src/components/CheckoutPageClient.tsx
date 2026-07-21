'use client'

import React, { useState, startTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { createRentalOrder } from '@/app/checkout/actions'
import { formatRupiah } from '@/utils/format'
import { CreditCard, Landmark, Clipboard, CheckCircle, ArrowRight, User, Phone, MapPin, Loader2, AlertCircle } from 'lucide-react'

interface BankAccount {
  id: string | number
  bank_name: string
  account_number: string
  account_holder: string
}

interface Profile {
  id: string
  full_name: string
  phone: string | null
  address: string | null
}

interface CheckoutPageClientProps {
  profile: Profile
  bankAccounts: BankAccount[]
}

export default function CheckoutPageClient({ profile, bankAccounts }: CheckoutPageClientProps) {
  const router = useRouter()
  const { cart, startDate, endDate, rentalDays, clearCart } = useCart()
  const [copiedId, setCopiedId] = useState<string | number | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, setIsPending] = useState(false)

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price_per_day * item.quantity * rentalDays, 0)
  }

  const copyToClipboard = (text: string, id: string | number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      setErrorMsg('Keranjang Anda kosong.')
      return
    }

    setIsPending(true)
    setErrorMsg('')

    try {
      const itemsPayload = cart.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price_per_day: item.price_per_day
      }))

      const result = await createRentalOrder(startDate, endDate, itemsPayload)

      if (result.error) {
        setErrorMsg(result.error)
        setIsPending(false)
      } else {
        // Clear local cart
        clearCart()
        // Redirect to user dashboard where they upload proof
        router.push('/dashboard?order_created=true')
      }
    } catch (e) {
      setErrorMsg('Terjadi kesalahan koneksi. Silakan coba lagi.')
      setIsPending(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-2">Checkout Tidak Tersedia</h2>
        <p className="text-muted-foreground mb-6">Keranjang belanja Anda kosong.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-2.5 rounded-xl"
        >
          Belanja Alat
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-8 flex items-center gap-2">
        <CreditCard className="w-8 h-8 text-primary" />
        Checkout Pembayaran
      </h1>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-sm text-red-200 font-semibold">{errorMsg}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Checkout Details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* User Info (Read-only) */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-3">
              <User className="w-5 h-5 text-primary" />
              Informasi Penyewa
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground block">Nama Lengkap</span>
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  {profile.full_name}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block">Nomor Telepon</span>
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {profile.phone || 'Belum diisi'}
                </span>
              </div>
              <div className="space-y-1 sm:col-span-2 border-t border-border/10 pt-3">
                <span className="text-muted-foreground block">Alamat Pengambilan / Pengiriman</span>
                <span className="font-semibold text-foreground flex items-start gap-1.5">
                  <MapPin className="w-4.5 h-4.5 text-muted-foreground shrink-0 mt-0.5" />
                  {profile.address || 'Belum diisi'}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Details (Transfer Bank) */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-3">
              <Landmark className="w-5 h-5 text-primary" />
              Rekening Bank Tujuan Transfer
            </h2>
            <p className="text-xs text-muted-foreground">
              Transfer nominal total ke salah satu rekening di bawah ini. Anda wajib mengunggah bukti struk transfer di halaman dashboard setelah pesanan dibuat.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bankAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="border border-border/60 bg-muted/20 rounded-2xl p-4 flex flex-col justify-between hover:border-primary/20 transition-all"
                >
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-primary uppercase">{acc.bank_name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-base font-extrabold text-foreground">{acc.account_number}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(acc.account_number, acc.id)}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        title="Salin nomor rekening"
                      >
                        {copiedId === acc.id ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Clipboard className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">a/n {acc.account_holder}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Rental Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-md space-y-5">
            <h2 className="font-extrabold text-lg text-foreground border-b border-border/10 pb-3">
              Ringkasan Transaksi
            </h2>

            {/* Date Details */}
            <div className="space-y-2 bg-muted/40 border border-border/50 rounded-2xl p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal Mulai:</span>
                <span className="font-semibold">{startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal Selesai:</span>
                <span className="font-semibold">{endDate}</span>
              </div>
              <div className="flex justify-between border-t border-border/10 pt-2 mt-2 font-bold text-foreground">
                <span>Durasi Sewa:</span>
                <span className="text-primary">{rentalDays} Hari</span>
              </div>
            </div>

            {/* Product items summary list */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-xs border-b border-border/5 pb-2">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {item.quantity} Unit x {formatRupiah(item.price_per_day)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations and CTA */}
            <div className="border-t border-border/10 pt-4 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold text-foreground">Total Transfer</span>
                <span className="text-xl font-black text-primary">{formatRupiah(calculateTotal())}</span>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isPending}
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-4 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Membuat Pesanan...
                  </>
                ) : (
                  <>
                    Buat Pesanan & Bayar
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
