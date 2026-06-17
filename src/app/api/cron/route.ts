import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date()
    const in7days = new Date(today)
    in7days.setDate(today.getDate() + 7)
    const in30days = new Date(today)
    in30days.setDate(today.getDate() + 30)

    const todayStr = today.toISOString().split('T')[0]
    const in7daysStr = in7days.toISOString().split('T')[0]
    const in30daysStr = in30days.toISOString().split('T')[0]

    // Get deals ending soon
    const { data: deals } = await supabase
      .from('deals')
      .select('*, brands(name)')
      .lte('end_date', in7daysStr)
      .gte('end_date', todayStr)
      .neq('stage', 'done')
      .neq('stage', 'cancelled')

    // Get usage rights expiring soon
    const { data: rights } = await supabase
      .from('usage_rights')
      .select('*, deals(title, brands(name))')
      .lte('expiry_date', in30daysStr)
      .gte('expiry_date', todayStr)

    // Get invoices overdue
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*, deals(title, brands(name))')
      .lt('due_date', todayStr)
      .eq('status', 'sent')

    const dealsCount = deals?.length || 0
    const rightsCount = rights?.length || 0
    const invoicesCount = invoices?.length || 0

    if (dealsCount === 0 && rightsCount === 0 && invoicesCount === 0) {
      return NextResponse.json({ message: 'No reminders needed today' })
    }

    // Build email HTML
    const emailHtml = buildEmailHtml({ deals, rights, invoices, today })

    // Get all unique user emails from Clerk
    // For now send to the admin email from env
    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail) {
      return NextResponse.json({ error: 'No admin email set' }, { status: 500 })
    }

    await resend.emails.send({
      from: 'Brand Manager <onboarding@resend.dev>',
      to: adminEmail,
      subject: 'Daily Brand Deal Reminder - ' + today.toLocaleDateString(),
      html: emailHtml,
    })

    return NextResponse.json({
      message: 'Reminders sent',
      deals: dealsCount,
      rights: rightsCount,
      invoices: invoicesCount,
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

function buildEmailHtml({ deals, rights, invoices, today }: any) {
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  let sections = ''

  if (deals && deals.length > 0) {
    sections += '<div style="margin-bottom:24px">'
    sections += '<h2 style="font-size:16px;color:#c9a84c;margin-bottom:12px;font-family:Georgia,serif">Deals Ending This Week</h2>'
    deals.forEach((deal: any) => {
      sections += '<div style="background:#1a1410;border:1px solid #2a1f14;border-radius:8px;padding:12px 16px;margin-bottom:8px">'
      sections += '<p style="color:#e8d9b8;font-size:14px;margin:0 0 4px">' + deal.title + '</p>'
      sections += '<p style="color:#8a7a62;font-size:12px;margin:0">' + (deal.brands?.name || 'Unknown') + ' · Ends ' + deal.end_date + '</p>'
      sections += '</div>'
    })
    sections += '</div>'
  }

  if (rights && rights.length > 0) {
    sections += '<div style="margin-bottom:24px">'
    sections += '<h2 style="font-size:16px;color:#c9a84c;margin-bottom:12px;font-family:Georgia,serif">Usage Rights Expiring Soon</h2>'
    rights.forEach((right: any) => {
      sections += '<div style="background:#1a1410;border:1px solid #2a1f14;border-radius:8px;padding:12px 16px;margin-bottom:8px">'
      sections += '<p style="color:#e8d9b8;font-size:14px;margin:0 0 4px">' + right.platform + ' - ' + right.rights_type + '</p>'
      sections += '<p style="color:#8a7a62;font-size:12px;margin:0">' + (right.deals?.brands?.name || 'Unknown') + ' · Expires ' + right.expiry_date + '</p>'
      sections += '</div>'
    })
    sections += '</div>'
  }

  if (invoices && invoices.length > 0) {
    sections += '<div style="margin-bottom:24px">'
    sections += '<h2 style="font-size:16px;color:#c9a84c;margin-bottom:12px;font-family:Georgia,serif">Overdue Invoices</h2>'
    invoices.forEach((invoice: any) => {
      sections += '<div style="background:#1a1410;border:1px solid #3a1a1a;border-radius:8px;padding:12px 16px;margin-bottom:8px">'
      sections += '<p style="color:#e8d9b8;font-size:14px;margin:0 0 4px">' + invoice.invoice_number + ' - $' + invoice.amount + '</p>'
      sections += '<p style="color:#8a7a62;font-size:12px;margin:0">' + (invoice.deals?.brands?.name || 'Unknown') + ' · Due ' + invoice.due_date + '</p>'
      sections += '</div>'
    })
    sections += '</div>'
  }

  return '<div style="background:#0e0c0a;min-height:100vh;padding:40px 20px;font-family:Inter,sans-serif">' +
    '<div style="max-width:560px;margin:0 auto">' +
    '<div style="border-bottom:1px solid #2a1f14;padding-bottom:24px;margin-bottom:32px">' +
    '<p style="font-size:12px;color:#5c3d1a;letter-spacing:0.12em;margin:0 0 8px">DAILY DIGEST</p>' +
    '<h1 style="font-family:Georgia,serif;font-size:28px;color:#e8d9b8;margin:0 0 8px">' + dateStr + '</h1>' +
    '<p style="color:#6a5848;font-size:14px;margin:0">Your brand deal reminders for today</p>' +
    '</div>' +
    sections +
    '<div style="border-top:1px solid #2a1f14;padding-top:20px;margin-top:8px">' +
    '<p style="color:#3a2e1a;font-size:11px;margin:0">Creator Brand Manager · Daily Reminder</p>' +
    '</div>' +
    '</div>' +
    '</div>'
}