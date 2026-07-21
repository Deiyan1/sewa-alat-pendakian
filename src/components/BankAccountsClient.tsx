'use client'

import React, { useActionState, useState } from 'react'
import { createBankAccount, toggleBankAccount, deleteBankAccount } from '@/app/admin/bank-accounts/actions'
import { Plus, Trash2, Power, Loader2, AlertCircle, Landmark, CreditCard, Check } from 'lucide-react'

interface BankAccount {
  id: number
  bank_name: string
  account_number: string
  account_holder: string
  is_active: boolean
  created_at: string
}

interface BankAccountsClientProps {
  bankAccounts: BankAccount[]
}

export default function BankAccountsClient({ bankAccounts }: BankAccountsClientProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null)

  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await createBankAccount(prevState, formData)
  }, null)

  const handleToggle = async (id: number, isActive: boolean) => {
    setLoadingId(id)
    await toggleBankAccount(id, isActive)
    setLoadingId(null)
  }

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Hapus rekening "${name}"?`)) {
      setLoadingId(id)
      const res = await deleteBankAccount(id)
      if (res.error) alert(res.error)
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Rekening Bank Pembayaran</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola rekening bank tujuan transfer pelanggan saat checkout.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Existing Accounts */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border/60">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Landmark className="w-4.5 h-4.5 text-primary" />
              Daftar Rekening
            </h2>
          </div>
          
          {bankAccounts.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              Belum ada rekening bank yang terdaftar.
            </div>
          ) : (
            <div className="divide-y divide-border/5">
              {bankAccounts.map((acc) => (
                <div key={acc.id} className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <CreditCard className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{acc.bank_name}</p>
                      <p className="font-mono text-xs text-foreground/80 mt-0.5">{acc.account_number}</p>
                      <p className="text-xs text-muted-foreground">a/n {acc.account_holder}</p>
                      <span className={`mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${acc.is_active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                        {acc.is_active ? <Check className="w-2.5 h-2.5" /> : null}
                        {acc.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggle(acc.id, acc.is_active)}
                      disabled={loadingId === acc.id}
                      title={acc.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${acc.is_active ? 'text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10' : 'text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10'}`}
                    >
                      {loadingId === acc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(acc.id, acc.bank_name)}
                      disabled={loadingId === acc.id}
                      title="Hapus rekening"
                      className="p-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Account Form */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-4 mb-5">
            <Plus className="w-4.5 h-4.5 text-primary" />
            Tambah Rekening Baru
          </h2>

          {state?.error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200 flex gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">
              Rekening berhasil ditambahkan!
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Nama Bank</label>
              <input name="bankName" type="text" required placeholder="Contoh: Bank Central Asia (BCA)"
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Nomor Rekening</label>
              <input name="accountNumber" type="text" required placeholder="Contoh: 1234567890"
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Atas Nama</label>
              <input name="accountHolder" type="text" required placeholder="Nama pemilik rekening"
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
            <button type="submit" disabled={isPending}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-primary/10 disabled:opacity-50">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {isPending ? 'Menyimpan...' : 'Tambah Rekening'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
