import React from 'react'
import { createClient } from '@/utils/supabase/server'
import HeaderClient from './HeaderClient'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let role: string | null = null
  let fullName: string | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()
      
    if (profile) {
      role = profile.role
      fullName = profile.full_name
    }
  }

  return <HeaderClient user={user} role={role} fullName={fullName} />
}
