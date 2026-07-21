'use client'

import React, { useActionState, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { uploadPaymentProof } from '@/app/dashboard/actions'
import { formatRupiah } from '@/utils/format'
import { 
  User, Phone, MapPin, Calendar, Clock, CheckCircle2, 
  XCircle, UploadCloud, ChevronDown, ChevronUp, Landmark, Info, Loader2, AlertCircle, FileText
} from 'lucide-react'

interface RentalItem {
  id: string
  quantity: number
  price_per_unit: number
  products: {
    name: string
    image_url: string
  }
}

interface Rental {
  id: string
  start_date: string
  end_date: string
  total_price: number
  status: 'pending_payment' | 'pending_verification' | 'confirmed' | 'rented' | 'returned' | 'late' | 'cancelled'
  payment_proof_url: string | null
  payment_proof_signed_url: string | null
  bank_name_destination: string | null
  sender_name: string | null
  rejection_reason: string | null
  created_at: string
  rental_items: RentalItem[]
}

interface BankAccount {
  id: string | number
  bank_name: string
}

interface DashboardClientProps {
  profile: {
    full_name: string
    phone: string | null
    address: string | null
  }
  rentals: Rental[]
  bankAccounts: BankAccount[]
}

export default function DashboardClient({ profile, rentals, bankAccounts }: DashboardClientProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  
  const [state, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    const res = await uploadPaymentProof(prevState, formData)
    if (res.success) {
      setUploadingId(null)
      setFilePreview(null)
    }
    return res
  }, null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result as string)
      };
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }

  const getStatusBadge = (status: Rental['status']) => {
    const styles = {
      pending_payment: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      pending_verification: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      confirmed: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      rented: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
      returned: 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400',
      late: 'bg-red-500/10 border-red-500/30 text-red-400',
      cancelled: 'bg-red-950/20 border-red-950/40 text-red-900 dark:text-red-400'
    }

    const labels = {
      pending_payment: 'Menunggu Pembayaran',
      pending_verification: 'Menunggu Verifikasi',
      confirmed: 'Pembayaran Disetujui',
      rented: 'Sedang Disewa',
      returned: 'Selesai Dikembalikan',
      late: 'Terlambat',
      cancelled: 'Dibatalkan'
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getStatusExplanation = (status: Rental['status']) => {
    switch (status) {
      case 'pending_payment':
        return 'Silakan lakukan transfer ke rekening admin di bawah dan unggah bukti transfer.'
      case 'pending_verification':
        return 'Bukti pembayaran telah dikirim. Admin akan memverifikasi dalam waktu maksimal 1x24 jam.'
      case 'confirmed':
        return 'Pembayaran Anda disetujui! Silakan ambil barang di gerai outdoor kami sesuai tanggal mulai sewa.'
      case 'rented':
        return 'Barang sedang Anda bawa. Jaga kondisi perlengkapan dengan baik dan kembalikan tepat waktu.'
      case 'returned':
        return 'Transaksi selesai. Terima kasih telah menyewa perlengkapan di SewaAdventure!'
      case 'late':
        return 'Anda terlambat mengembalikan barang! Harap segera kembalikan ke gerai atau hubungi admin.'
      case 'cancelled':
        return 'Transaksi ini telah dibatalkan.'
      default:
        return ''
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Profile Card Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-md space-y-4">
            <h2 className="text-lg font-bold text-foreground border-b border-border/10 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profil Pelanggan
            </h2>
            <div className="space-y-3.5 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold">Nama Lengkap</span>
                <span className="font-bold text-foreground text-base">{profile.full_name}</span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold">Nomor Telepon</span>
                <span className="font-semibold text-foreground">{profile.phone || 'Belum diisi'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold">Alamat Lengkap</span>
                <span className="font-semibold text-foreground flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  {profile.address || 'Belum diisi'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rentals List */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="w-7 h-7 text-primary" />
            Riwayat Sewa Saya
          </h2>

          {rentals.length === 0 ? (
            <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-sm">
              <p className="text-muted-foreground mb-4">Anda belum memiliki riwayat transaksi penyewaan.</p>
              <Link
                href="/"
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md"
              >
                Cari Perlengkapan
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {rentals.map((rental) => {
                const isExpanded = expandedId === rental.id
                const isUploading = uploadingId === rental.id

                return (
                  <div
                    key={rental.id}
                    className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:border-primary/10 transition-all"
                  >
                    {/* Rental Card Header */}
                    <div
                      onClick={() => toggleExpand(rental.id)}
                      className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-muted/10 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground font-mono">
                            ID: {rental.id.substring(0, 8).toUpperCase()}...
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(rental.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-foreground">
                          Periode: {rental.start_date} s/d {rental.end_date}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Total Transaksi</p>
                          <p className="font-extrabold text-primary">{formatRupiah(rental.total_price)}</p>
                        </div>
                        {getStatusBadge(rental.status)}
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>

                    {/* Rental Card Details */}
                    {isExpanded && (
                      <div className="border-t border-border/10 p-5 bg-muted/5 space-y-6">
                        
                        {/* Status Description */}
                        <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 text-sm flex items-start gap-2.5">
                          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-foreground">Keterangan Status:</p>
                            <p className="text-muted-foreground text-xs mt-0.5">{getStatusExplanation(rental.status)}</p>
                          </div>
                        </div>

                        {/* Rejection Alert */}
                        {rental.status === 'pending_payment' && rental.rejection_reason && (
                          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-sm flex items-start gap-2.5">
                            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-red-200">Pembayaran Ditolak Admin!</p>
                              <p className="text-red-300 text-xs mt-0.5">Alasan: {rental.rejection_reason}</p>
                              <p className="text-red-400 text-[10px] mt-1">Silakan lakukan transfer ulang dan unggah bukti baru di bawah.</p>
                            </div>
                          </div>
                        )}

                        {/* Rented Items List */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Item Yang Disewa</h3>
                          <div className="space-y-2">
                            {rental.rental_items?.map((item) => (
                              <div
                                key={item.id}
                                className="bg-card border border-border/50 rounded-2xl p-3 flex items-center justify-between gap-3 text-sm"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="relative w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0">
                                    {item.products?.image_url ? (
                                      <Image src={item.products.image_url} alt={item.products.name} fill className="object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                                        No Img
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-bold text-foreground">{item.products?.name}</p>
                                    <p className="text-xs text-muted-foreground">Harga: {formatRupiah(item.price_per_unit)} / hari</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-foreground">{item.quantity} Unit</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Upload Proof Area */}
                        {rental.status === 'pending_payment' && (
                          <div className="border-t border-border/10 pt-5 space-y-4">
                            <div className="flex justify-between items-center">
                              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Upload Bukti Pembayaran
                              </h3>
                              {!isUploading && (
                                <button
                                  type="button"
                                  onClick={() => setUploadingId(rental.id)}
                                  className="text-xs font-semibold bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 rounded-xl cursor-pointer"
                                >
                                  Konfirmasi Bayar
                                </button>
                              )}
                            </div>

                            {isUploading && (
                              <form
                                action={action}
                                className="bg-muted/30 border border-border/60 rounded-2xl p-5 space-y-4"
                              >
                                <input type="hidden" name="rentalId" value={rental.id} />

                                {/* Form Errors */}
                                {state?.error && (
                                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                    <span>{state.error}</span>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {/* Sender Bank Name */}
                                  <div className="space-y-1">
                                    <label htmlFor="bankName" className="text-xs font-semibold text-muted-foreground uppercase">
                                      Bank Tujuan Transfer
                                    </label>
                                    <select
                                      id="bankName"
                                      name="bankName"
                                      required
                                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                                    >
                                      <option value="">Pilih Bank Tujuan...</option>
                                      {bankAccounts.map((b) => (
                                        <option key={b.id} value={b.bank_name}>
                                          {b.bank_name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Sender Name */}
                                  <div className="space-y-1">
                                    <label htmlFor="senderName" className="text-xs font-semibold text-muted-foreground uppercase">
                                      Nama Pengirim (Sesuai Struk)
                                    </label>
                                    <input
                                      id="senderName"
                                      name="senderName"
                                      type="text"
                                      required
                                      placeholder="Nama Rekening Pengirim"
                                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                                    />
                                  </div>
                                </div>

                                {/* Drag-Drop/Click File Upload */}
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                                    Unggah File Struk / Bukti Transfer
                                  </label>
                                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/50 rounded-2xl py-6 px-4 bg-background/50 hover:bg-background transition-all relative">
                                    <input
                                      type="file"
                                      id="file"
                                      name="file"
                                      required
                                      accept="image/*"
                                      onChange={handleFileChange}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {filePreview ? (
                                      <div className="relative w-full max-w-[200px] aspect-[3/4] rounded-lg overflow-hidden border border-border">
                                        <Image src={filePreview} alt="Bukti Transfer Preview" fill className="object-cover" />
                                      </div>
                                    ) : (
                                      <>
                                        <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
                                        <span className="text-xs font-bold text-foreground">Klik untuk pilih gambar</span>
                                        <span className="text-[10px] text-muted-foreground mt-0.5">Format JPG/PNG/WEBP (Maksimal 5MB)</span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end gap-2.5 pt-2 border-t border-border/10">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setUploadingId(null)
                                      setFilePreview(null)
                                    }}
                                    className="px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
                                  >
                                    Batal
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                                  >
                                    {isPending ? (
                                      <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Mengunggah...
                                      </>
                                    ) : (
                                      'Kirim Bukti'
                                    )}
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>
                        )}

                        {/* Display Uploaded Proof Info */}
                        {rental.status !== 'pending_payment' && rental.payment_proof_url && (
                          <div className="border-t border-border/10 pt-5 space-y-3">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              Bukti Pembayaran Terunggah
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                              <div className="space-y-1.5">
                                <p className="text-muted-foreground">Bank Tujuan: <span className="font-semibold text-foreground">{rental.bank_name_destination}</span></p>
                                <p className="text-muted-foreground">Nama Pengirim: <span className="font-semibold text-foreground">{rental.sender_name}</span></p>
                              </div>
                              <div className="flex justify-center sm:justify-end">
                                {rental.payment_proof_signed_url ? (
                                  <a
                                    href={rental.payment_proof_signed_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="relative w-32 h-20 rounded-xl overflow-hidden border border-border group hover:border-primary transition-colors block shadow-sm"
                                    title="Klik untuk perbesar"
                                  >
                                    <Image src={rental.payment_proof_signed_url} alt="Bukti Transfer" fill className="object-cover group-hover:scale-102 transition-transform" />
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground italic">Gambar gagal diunduh</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
