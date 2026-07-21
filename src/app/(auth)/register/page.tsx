'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { signup } from '../actions'
import { Tent, Loader2, KeyRound, Mail, User, Phone, MapPin, AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const [state, action, isPending] = useActionState(signup, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-[#1e3d30] via-[#0f1412] to-[#0a0c0b] px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px]" />

      <div className="w-full max-w-md z-10">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg border border-primary/20 mb-3 animate-pulse">
            <Tent className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">SewaAdventure</h1>
          <p className="text-sm text-muted-foreground mt-1">Buat akun untuk mulai menyewa perlengkapan</p>
        </div>

        {/* Card */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/20 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Daftar Akun Baru</h2>

          {/* Error Alert */}
          {state?.error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm text-red-200">
                {state.error}
              </div>
            </div>
          )}

          <form action={action} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="fullName" className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full bg-black/20 border border-border/30 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="john@example.com"
                  className="w-full bg-black/20 border border-border/30 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label htmlFor="phone" className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                Nomor Telepon / WA
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="081234567890"
                  className="w-full bg-black/20 border border-border/30 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label htmlFor="address" className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                Alamat Lengkap
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Jl. Raya Pendaki No. 10..."
                  className="w-full bg-black/20 border border-border/30 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                Kata Sandi (Min. 6 Karakter)
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-black/20 border border-border/30 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                'Daftar Sekarang'
              )}
            </button>
          </form>

          {/* Footer Card */}
          <div className="mt-6 text-center text-sm text-muted-foreground border-t border-border/10 pt-4">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-accent hover:text-accent/80 font-medium transition-colors">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
