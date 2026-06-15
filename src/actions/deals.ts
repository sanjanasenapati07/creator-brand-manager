'use server'

import { auth } from '@clerk/nextjs/server'
import { createAuthClient } from '@/lib/supabase'
import { Deal, DealStage } from '@/types'

export async function getDeals() {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const supabase = createAuthClient(userId)
  const { data, error } = await supabase
    .from('deals')
    .select('*, brands(name)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createDeal(input: {
  title: string
  brand_id: string
  value: number
  stage: DealStage
  end_date: string | null
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const supabase = createAuthClient(userId)
  const { data, error } = await supabase
    .from('deals')
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateDealStage(dealId: string, stage: DealStage) {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const supabase = createAuthClient(userId)
  const { error } = await supabase
    .from('deals')
    .update({ stage })
    .eq('id', dealId)
    .eq('user_id', userId)

  if (error) throw error
}