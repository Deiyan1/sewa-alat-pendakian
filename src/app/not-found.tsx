import Link from 'next/link'
import { Tent, MountainSnow, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-[#1e3d30] via-[#0f1412] to-[#0a0c0b] px-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px]" />

      <div className="text-center z-10 max-w-lg">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <MountainSnow className="w-12 h-12 text-primary" />
          </div>
        </div>

        <h1 className="text-8xl font-black text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-3">Jalur Tidak Ditemukan</h2>
        <p className="text-muted-foreground mb-8">
          Sepertinya Anda tersesat di alam terbuka. Halaman yang Anda cari tidak ada atau sudah dipindahkan.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
