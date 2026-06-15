export type Brand = {
  id: string
  user_id: string
  name: string
  contact_email: string | null
  contact_name: string | null
  website: string | null
  notes: string | null
  created_at: string
}

export type DealStage =
  | 'outreach'
  | 'negotiation'
  | 'active'
  | 'invoicing'
  | 'done'
  | 'cancelled'

export type Deal = {
  id: string
  user_id: string
  brand_id: string
  title: string
  value: number | null
  currency: string
  stage: DealStage
  start_date: string | null
  end_date: string | null
  notes: string | null
  created_at: string
  brands?: Brand // joined from Supabase
}

export type Deliverable = {
  id: string
  user_id: string
  deal_id: string
  type: string
  description: string | null
  due_date: string | null
  completed: boolean
  created_at: string
}

export type Invoice = {
  id: string
  user_id: string
  deal_id: string
  invoice_number: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  due_date: string | null
  paid_at: string | null
  created_at: string
  deals?: Deal // joined
}

export type UsageRight = {
  id: string
  user_id: string
  deal_id: string
  platform: string
  rights_type: string
  expiry_date: string | null
  notes: string | null
  created_at: string
  deals?: Deal // joined
}