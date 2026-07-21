'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBankAccount(state: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Akses ditolak.' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') return { error: 'Akses ditolak.' }

  const bankName = formData.get('bankName') as string
  const accountNumber = formData.get('accountNumber') as string
  const accountHolder = formData.get('accountHolder') as string

  if (!bankName || !accountNumber || !accountHolder) {
    return { error: 'Semua field wajib diisi.' }
  }

  const { error } = await supabase.from('bank_accounts').insert({ bank_name: bankName, account_number: accountNumber, account_holder: accountHolder })
  if (error) return { error: error.message }

  revalidatePath('/admin/bank-accounts')
  revalidatePath('/checkout')
  return { success: true }
}

export async function toggleBankAccount(id: number, isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Akses ditolak.' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') return { error: 'Akses ditolak.' }

  const { error } = await supabase.from('bank_accounts').update({ is_active: !isActive }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/bank-accounts')
  revalidatePath('/checkout')
  return { success: true }
}

export async function deleteBankAccount(id: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Akses ditolak.' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') return { error: 'Akses ditolak.' }

  const { error } = await supabase.from('bank_accounts').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/bank-accounts')
  revalidatePath('/checkout')
  return { success: true }
}
