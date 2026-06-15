'use server'

import { auth } from '@clerk/nextjs/server'
import { createAuthClient } from '@/lib/supabase'

export async function getInvoices() {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const supabase = createAuthClient(userId)
  const { data, error } = await supabase
    .from('invoices')
    .select('*, deals(title, brands(name))')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createInvoice(input: {
  deal_id: string
  invoice_number: string
  amount: number
  due_date: string | null
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const supabase = createAuthClient(userId)
  const { data, error } = await supabase
    .from('invoices')
    .insert({ ...input, user_id: userId, status: 'draft' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: 'draft' | 'sent' | 'paid' | 'overdue'
) {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const supabase = createAuthClient(userId)
  const { error } = await supabase
    .from('invoices')
    .update({ status, ...(status === 'paid' ? { paid_at: new Date().toISOString() } : {}) })
    .eq('id', invoiceId)
    .eq('user_id', userId)

  if (error) throw error
}