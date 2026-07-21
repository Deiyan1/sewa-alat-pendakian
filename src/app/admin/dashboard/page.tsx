import React from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { formatRupiah } from '@/utils/format'
import { 
  Package, Receipt, ShieldAlert, BadgeDollarSign, Calendar, ArrowRight, User
} from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // 1. Hitung total produk
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  // 2. Hitung jumlah pesanan pending verification
  const { count: pendingVerification } = await supabase
    .from('rentals')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_verification')

  // 3. Hitung jumlah pesanan sedang disewa (rented)
  const { count: activeRentals } = await supabase
    .from('rentals')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rented')

  // 4. Hitung total pendapatan (status selain pending_payment, pending_verification, cancelled)
  const { data: incomeData } = await supabase
    .from('rentals')
    .select('total_price')
    .in('status', ['confirmed', 'rented', 'returned', 'late'])

  const totalIncome = incomeData?.reduce((sum, item) => sum + Number(item.total_price), 0) || 0

  // 5. Ambil 5 transaksi terbaru
  const { data: recentRentals } = await supabase
    .from('rentals')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending_payment: 'Menunggu Bayar',
      pending_verification: 'Butuh Verifikasi',
      confirmed: 'Disetujui',
      rented: 'Disewakan',
      returned: 'Selesai',
      late: 'Terlambat',
      cancelled: 'Dibatalkan'
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending_payment: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      pending_verification: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      confirmed: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      rented: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
      returned: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20',
      late: 'text-red-500 bg-red-500/10 border-red-500/20',
      cancelled: 'text-red-900 dark:text-red-400 bg-red-950/20 border-red-950/40'
    }
    return colors[status] || 'text-zinc-500 border-zinc-500/20'
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Ringkasan Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Status dan statistik terkini penyewaan alat pendakian.</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Income Card */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <BadgeDollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-semibold uppercase tracking-wider">Total Pendapatan</span>
            <span className="text-xl font-black text-foreground">{formatRupiah(totalIncome)}</span>
          </div>
        </div>

        {/* Pending Verification Card */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-semibold uppercase tracking-wider">Butuh Verifikasi</span>
            <span className="text-2xl font-black text-foreground">{pendingVerification || 0} Transaksi</span>
          </div>
        </div>

        {/* Active Rentals Card */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-semibold uppercase tracking-wider">Sedang Disewa</span>
            <span className="text-2xl font-black text-foreground">{activeRentals || 0} Aktif</span>
          </div>
        </div>

        {/* Total Products Card */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-semibold uppercase tracking-wider">Total Katalog</span>
            <span className="text-2xl font-black text-foreground">{totalProducts || 0} Produk</span>
          </div>
        </div>

      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-border/10 pb-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Transaksi Terbaru
            </h2>
            <Link
              href="/admin/rentals"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Semua Transaksi
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {recentRentals && recentRentals.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs text-muted-foreground uppercase border-b border-border/10">
                    <th className="py-3 font-semibold">Pelanggan</th>
                    <th className="py-3 font-semibold">Durasi</th>
                    <th className="py-3 font-semibold">Total</th>
                    <th className="py-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                  {recentRentals.map((rental) => (
                    <tr key={rental.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3.5 font-bold text-foreground">
                        {rental.profiles?.full_name || 'Pelanggan'}
                      </td>
                      <td className="py-3.5 text-xs text-muted-foreground">
                        {rental.start_date} - {rental.end_date}
                      </td>
                      <td className="py-3.5 font-semibold text-primary">
                        {formatRupiah(rental.total_price)}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(rental.status)}`}>
                          {getStatusLabel(rental.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">Tidak ada transaksi terbaru.</div>
            )}
          </div>
        </div>

        {/* Quick Utilities / Info */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-foreground border-b border-border/10 pb-3 flex items-center gap-2">
            Pintasan Tindakan
          </h2>
          <div className="space-y-3">
            <Link
              href="/admin/rentals?status=pending_verification"
              className="w-full flex justify-between items-center px-4 py-3 bg-muted/20 border border-border/40 hover:border-primary/20 hover:bg-muted/50 rounded-2xl transition-all font-semibold text-sm text-foreground"
            >
              <span>Verifikasi Bukti Transfer</span>
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                {pendingVerification || 0}
              </span>
            </Link>

            <Link
              href="/admin/products"
              className="w-full flex justify-between items-center px-4 py-3 bg-muted/20 border border-border/40 hover:border-primary/20 hover:bg-muted/50 rounded-2xl transition-all font-semibold text-sm text-foreground"
            >
              <span>Tambah Produk Baru</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
