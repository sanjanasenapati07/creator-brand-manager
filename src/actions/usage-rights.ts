'use server'

import { auth } from '@clerk/nextjs/server'
import { createAuthClient } from '@/lib/supabase'

export async function getUsageRights() {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const supabase = createAuthClient(userId)
  const { data, error } = await supabase
    .from('usage_rights')
    .select('*, deals(title, brands(name))')
    .order('expiry_date', { ascending: true })

  if (error) throw error
  return data
}

export async function createUsageRight(input: {
  deal_id: string
  platform: string
  rights_type: string
  expiry_date: string | null
  notes: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const supabase = createAuthClient(userId)
  const { data, error } = await supabase
    .from('usage_rights')
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data
}