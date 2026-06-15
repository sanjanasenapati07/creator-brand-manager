'use server'

import { auth } from '@clerk/nextjs/server'
import { createAuthClient } from '@/lib/supabase'

export async function getBrands() {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const supabase = createAuthClient(userId)
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export async function createBrand(input: {
  name: string
  contact_email: string
  contact_name: string
  website: string
  notes?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const supabase = createAuthClient(userId)
  const { data, error } = await supabase
    .from('brands')
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data
}