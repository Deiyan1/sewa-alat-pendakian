'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { verifyPayment, updateRentalStatus } from '@/app/admin/rentals/actions'
import { formatRupiah } from '@/utils/format'
import { 
  Search, Calendar, Info, Clock, Check, X, FileText, 
  ExternalLink, Loader2, Landmark, User, MapPin, Phone, AlertCircle
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
  profiles: {
    full_name: string
    phone: string | null
    address: string | null
  }
  rental_items: RentalItem[]
}

interface AdminRentalsClientProps {
  rentals: Rental[]
}

export default function AdminRentalsClient({ rentals }: AdminRentalsClientProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null)
  
  const [rejectionReason, setRejectionReason] = useState<string>('')
  const [showRejectForm, setShowRejectForm] = useState<boolean>(false)
  
  const [isPending, setIsPending] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>('')

  // Filter & Search Logic
  const filteredRentals = rentals.filter((r) => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus
    const matchesQuery = 
      r.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesQuery
  })

  const getStatusLabel = (status: Rental['status']) => {
    const labels = {
      pending_payment: 'Menunggu Bayar',
      pending_verification: 'Butuh Verifikasi',
      confirmed: 'Disetujui',
      rented: 'Sedang Disewa',
      returned: 'Selesai',
      late: 'Terlambat',
      cancelled: 'Dibatalkan'
    }
    return labels[status] || status
  }

  const getStatusColor = (status: Rental['status']) => {
    const colors = {
      pending_payment: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      pending_verification: 'text-blue-500 bg-blue-500/10 border-blue-500/20 animate-pulse',
      confirmed: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      rented: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
      returned: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20',
      late: 'text-red-500 bg-red-500/10 border-red-500/20',
      cancelled: 'text-red-950 dark:text-red-400 bg-red-950/20 border-red-950/40'
    }
    return colors[status] || 'text-zinc-500 border-zinc-500/20'
  }

  const handleVerify = async (action: 'approve' | 'reject') => {
    if (!selectedRental) return
    
    setIsPending(true)
    setErrorMsg('')

    const result = await verifyPayment(
      selectedRental.id, 
      action, 
      action === 'reject' ? rejectionReason : null
    )

    if (result.error) {
      setErrorMsg(result.error)
      setIsPending(false)
    } else {
      setIsPending(false)
      setShowRejectForm(false)
      setRejectionReason('')
      // Update local state copy to prevent requiring full reload for visual feedback
      // In Next.js Server Actions, revalidatePath will refetch in the background, but closing modal is safer.
      closeModal()
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedRental) return
    if (!confirm(`Ubah status transaksi menjadi "${getStatusLabel(newStatus as any)}"?`)) return

    setIsPending(true)
    setErrorMsg('')

    const result = await updateRentalStatus(selectedRental.id, newStatus)

    if (result.error) {
      setErrorMsg(result.error)
      setIsPending(false)
    } else {
      setIsPending(false)
      closeModal()
    }
  }

  const closeModal = () => {
    setSelectedRental(null)
    setShowRejectForm(false)
    setRejectionReason('')
    setErrorMsg('')
  }

  return (
    <div className="space-y-6">
      {/* Title & Info */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Verifikasi & Transaksi Sewa</h1>
        <p className="text-sm text-muted-foreground mt-1">Verifikasi bukti transfer manual pelanggan dan atur status siklus sewa.</p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card border border-border p-4 rounded-2xl shadow-sm">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama pelanggan / ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl py-2 pl-9 pr-4 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Status Category Tabs */}
        <div className="flex flex-wrap gap-1.5 justify-end w-full sm:w-auto">
          {['all', 'pending_verification', 'pending_payment', 'confirmed', 'rented', 'returned', 'late', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                filterStatus === status
                  ? 'bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/10'
                  : 'bg-background border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {status === 'all' ? 'Semua' : getStatusLabel(status as any)}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Grid/Table */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        {filteredRentals.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-1.5">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
            <p className="text-base font-bold text-foreground">Tidak Ada Transaksi</p>
            <p className="text-xs">Tidak ditemukan data transaksi sewa untuk kriteria pencarian ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase border-b border-border/10 bg-muted/10">
                  <th className="px-6 py-4 font-semibold">ID & Pelanggan</th>
                  <th className="px-6 py-4 font-semibold">Durasi Sewa</th>
                  <th className="px-6 py-4 font-semibold">Total Biaya</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/5">
                {filteredRentals.map((rental) => (
                  <tr key={rental.id} className="hover:bg-muted/5 transition-colors">
                    
                    {/* ID & Customer Name */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-foreground">{rental.profiles?.full_name || 'Pelanggan'}</p>
                        <p className="text-[10px] text-muted-foreground font-mono uppercase">
                          ID: #{rental.id.substring(0, 8)}
                        </p>
                      </div>
                    </td>

                    {/* Rental Period */}
                    <td className="px-6 py-4">
                      <div className="text-xs text-foreground/90 font-medium">
                        {rental.start_date} s/d {rental.end_date}
                        <span className="block text-[10px] text-muted-foreground font-semibold mt-0.5 uppercase">
                          Dibuat: {new Date(rental.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </td>

                    {/* Total Price */}
                    <td className="px-6 py-4 font-extrabold text-primary">
                      {formatRupiah(rental.total_price)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(rental.status)}`}>
                        {getStatusLabel(rental.status)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedRental(rental)}
                        className="text-xs font-bold text-primary hover:underline hover:text-primary/90 cursor-pointer"
                      >
                        Detail & Kelola
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-foreground">Detail Transaksi Sewa</h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(selectedRental.status)}`}>
                  {getStatusLabel(selectedRental.status)}
                </span>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {/* Form Actions Errors */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Customer Info Card & Rental Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 border border-border/40 p-4 rounded-2xl text-xs">
                {/* Profile */}
                <div className="space-y-2">
                  <h3 className="font-bold text-foreground flex items-center gap-1.5">
                    <User className="w-4 h-4 text-primary" />
                    Penyewa
                  </h3>
                  <p className="text-foreground"><span className="text-muted-foreground">Nama:</span> <span className="font-semibold">{selectedRental.profiles?.full_name}</span></p>
                  <p className="text-foreground"><span className="text-muted-foreground">Telepon:</span> <span className="font-semibold">{selectedRental.profiles?.phone || '-'}</span></p>
                  <p className="text-foreground flex items-start gap-1"><span className="text-muted-foreground shrink-0">Alamat:</span> <span className="font-semibold">{selectedRental.profiles?.address || '-'}</span></p>
                </div>
                {/* Dates */}
                <div className="space-y-2">
                  <h3 className="font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    Waktu Sewa
                  </h3>
                  <p className="text-foreground"><span className="text-muted-foreground">Mulai:</span> <span className="font-semibold">{selectedRental.start_date}</span></p>
                  <p className="text-foreground"><span className="text-muted-foreground">Selesai:</span> <span className="font-semibold">{selectedRental.end_date}</span></p>
                  <p className="text-foreground"><span className="text-muted-foreground">Dibuat:</span> <span className="font-semibold">{new Date(selectedRental.created_at).toLocaleString('id-ID')}</span></p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Item Penyewaan</h3>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {selectedRental.rental_items?.map((item) => (
                    <div
                      key={item.id}
                      className="bg-background border border-border rounded-xl p-3 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted border border-border/40 shrink-0">
                          {item.products?.image_url && (
                            <Image src={item.products.image_url} alt={item.products.name} fill className="object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{item.products?.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Harga sewa: {formatRupiah(item.price_per_unit)} / hari
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">{item.quantity} Unit</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-border/10">
                  <span className="text-xs font-semibold text-muted-foreground">Total Transaksi:</span>
                  <span className="text-base font-black text-primary">{formatRupiah(selectedRental.total_price)}</span>
                </div>
              </div>

              {/* Payment Proof Verification Form (if pending_verification) */}
              {selectedRental.status === 'pending_verification' && (
                <div className="border-t border-border/10 pt-4 space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Landmark className="w-4 h-4 text-primary" />
                    Bukti Pembayaran Pelanggan
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start bg-muted/20 border border-border/60 p-4 rounded-2xl">
                    <div className="space-y-2 text-xs">
                      <p className="text-muted-foreground">Bank Tujuan: <span className="font-bold text-foreground">{selectedRental.bank_name_destination}</span></p>
                      <p className="text-muted-foreground">Nama Pengirim: <span className="font-bold text-foreground">{selectedRental.sender_name}</span></p>
                      
                      {/* Actions Buttons */}
                      {!showRejectForm ? (
                        <div className="flex gap-2 pt-4">
                          <button
                            onClick={() => handleVerify('approve')}
                            disabled={isPending}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Setujui Pembayaran
                          </button>
                          <button
                            onClick={() => setShowRejectForm(true)}
                            disabled={isPending}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            Tolak Pembayaran
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2.5 pt-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-red-400 uppercase">
                              Alasan Penolakan
                            </label>
                            <input
                              type="text"
                              required
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Contoh: Nominal transfer kurang"
                              className="w-full bg-background border border-red-500/40 focus:border-red-500 rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
                            />
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleVerify('reject')}
                              disabled={isPending || !rejectionReason}
                              className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer"
                            >
                              Kirim Penolakan
                            </button>
                            <button
                              onClick={() => {
                                setShowRejectForm(false)
                                setRejectionReason('')
                              }}
                              className="border border-border hover:bg-muted text-foreground px-3 py-1.5 rounded-lg text-[10px] cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Receipt Image View */}
                    <div className="flex flex-col items-center justify-center">
                      {selectedRental.payment_proof_signed_url ? (
                        <div className="space-y-1.5">
                          <a
                            href={selectedRental.payment_proof_signed_url}
                            target="_blank"
                            rel="noreferrer"
                            className="relative w-44 aspect-[3/4] rounded-xl overflow-hidden border border-border shadow-md block group hover:border-primary transition-all"
                          >
                            <Image src={selectedRental.payment_proof_signed_url} alt="Bukti Transfer Struk" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                              <ExternalLink className="w-4 h-4 mr-1" /> Perbesar
                            </div>
                          </a>
                          <span className="text-[10px] text-muted-foreground text-center block">Klik gambar untuk melihat ukuran penuh</span>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground italic">Gambar struk gagal dimuat</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Status Update Cycle (if NOT pending_payment, pending_verification, cancelled, returned) */}
              {selectedRental.status !== 'pending_payment' && 
               selectedRental.status !== 'pending_verification' && 
               selectedRental.status !== 'cancelled' && 
               selectedRental.status !== 'returned' && (
                <div className="border-t border-border/10 pt-4 space-y-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Kelola Siklus Sewa Alat
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {/* Confirmed -> Rented */}
                    {selectedRental.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusChange('rented')}
                        disabled={isPending}
                        className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer shadow-md shadow-primary/10 transition-transform active:scale-95"
                      >
                        Serahkan Barang (Tandai Sedang Disewa)
                      </button>
                    )}

                    {/* Rented -> Returned / Late */}
                    {(selectedRental.status === 'rented' || selectedRental.status === 'late') && (
                      <>
                        <button
                          onClick={() => handleStatusChange('returned')}
                          disabled={isPending}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer shadow-md transition-transform active:scale-95"
                        >
                          Selesai Sewa (Tandai Sudah Dikembalikan)
                        </button>
                        
                        {selectedRental.status === 'rented' && (
                          <button
                            onClick={() => handleStatusChange('late')}
                            disabled={isPending}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
                          >
                            Tandai Terlambat Mengembalikan
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Cancel Action for Pending Payment */}
              {selectedRental.status === 'pending_payment' && (
                <div className="border-t border-border/10 pt-4">
                  <button
                    onClick={() => handleStatusChange('cancelled')}
                    disabled={isPending}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Batalkan Transaksi Penyewaan
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
