type RentalStatus = 
  | 'pending_payment' 
  | 'pending_verification' 
  | 'confirmed' 
  | 'rented' 
  | 'returned' 
  | 'late' 
  | 'cancelled'

interface StatusBadgeProps {
  status: RentalStatus
  size?: 'sm' | 'md'
}

const STATUS_CONFIG: Record<RentalStatus, { label: string; className: string }> = {
  pending_payment: {
    label: 'Menunggu Pembayaran',
    className: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
  },
  pending_verification: {
    label: 'Menunggu Verifikasi',
    className: 'bg-blue-500/10 border-blue-500/30 text-blue-500',
  },
  confirmed: {
    label: 'Pembayaran Disetujui',
    className: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500',
  },
  rented: {
    label: 'Sedang Disewa',
    className: 'bg-violet-500/10 border-violet-500/30 text-violet-500',
  },
  returned: {
    label: 'Selesai Dikembalikan',
    className: 'bg-zinc-500/10 border-zinc-500/30 text-zinc-500',
  },
  late: {
    label: 'Terlambat',
    className: 'bg-red-500/10 border-red-500/30 text-red-500',
  },
  cancelled: {
    label: 'Dibatalkan',
    className: 'bg-red-950/20 border-red-950/40 text-red-400 dark:text-red-400',
  },
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  
  const sizeClass = size === 'sm' 
    ? 'px-2 py-0.5 text-[10px]' 
    : 'px-3 py-1 text-xs'

  return (
    <span className={`inline-flex items-center rounded-full font-bold border ${sizeClass} ${config.className}`}>
      {config.label}
    </span>
  )
}
