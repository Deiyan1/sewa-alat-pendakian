import React from 'react'
import { createClient } from '@/utils/supabase/server'
import BankAccountsClient from '@/components/BankAccountsClient'

export default async function AdminBankAccountsPage() {
  const supabase = await createClient()
  const { data: bankAccounts } = await supabase
    .from('bank_accounts')
    .select('*')
    .order('created_at', { ascending: false })

  return <BankAccountsClient bankAccounts={bankAccounts || []} />
}
