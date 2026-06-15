'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { getDeals } from '@/actions/deals'
import { getInvoices } from '@/actions/invoices'
import { getUsageRights } from '@/actions/usage-rights'

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number, prefix?: string, suffix?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const step = value / (1000 / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [value])
  return <>{prefix}{display.toLocaleString()}{suffix}</>
}

function FloatCard({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
      transition: 'opacity 0.6s ease, transform 0.6s ease',
    }}>
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useUser()
  const [stats, setStats] = useState({ pipeline: 0, earned: 0, active: 0, expiring: 0 })
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const [deals, invoices, rights] = await Promise.all([
          getDeals(), getInvoices(), getUsageRights()
        ])
        const pipeline = (deals || []).reduce((s: number, d: any) => s + (d.value || 0), 0)
        const earned = (invoices || []).filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + i.amount, 0)
        const active = (deals || []).filter((d: any) => d.stage === 'active').length
        const expiring = (rights || []).filter((r: any) => {
          if (!r.expiry_date) return false
          const days = Math.ceil((new Date(r.expiry_date).getTime() - Date.now()) / 86400000)
          return days >= 0 && days <= 30
        }).length
        setStats({ pipeline, earned, active, expiring })
      } catch (e) { console.error(e) }
    }
    load()
  }, [])

  const hour = time.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.firstName || 'Creator'

  const statCards = [
    { label: 'Total Pipeline', value: stats.pipeline, prefix: '$', color: '#294246', glow: 'rgba(41,66,70,0.5)' },
    { label: 'Total Earned', value: stats.earned, prefix: '$', color: '#452F29', glow: 'rgba(69,47,41,0.5)' },
    { label: 'Active Deals', value: stats.active, color: '#294246', glow: 'rgba(41,66,70,0.4)' },
    { label: 'Expiring Rights', value: stats.expiring, color: '#655150', glow: 'rgba(101,81,80,0.4)' },
  ]

  const quickActions = [
    { label: 'New deal', desc: 'Track a brand partnership', href: '/dashboard/deals', emoji: '⬡' },
    { label: 'Create invoice', desc: 'Generate a PDF invoice', href: '/dashboard/invoices', emoji: '◎' },
    { label: 'Log rights', desc: 'Track content permissions', href: '/dashboard/usage-rights', emoji: '◷' },
    { label: 'View analytics', desc: 'See your earnings chart', href: '/dashboard/analytics', emoji: '◬' },
  ]

  return (
    <div style={{ padding: '40px', minHeight: '100vh' }}>

      {/* Header */}
      <FloatCard delay={0}>
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <p style={{
                fontSize: '11px',
                color: '#655150',
                letterSpacing: '0.16em',
                marginBottom: '10px',
                fontFamily: 'Inter, sans-serif',
              }}>
                {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
              </p>
              <h1 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '40px',
                fontWeight: '600',
                color: '#e8e4de',
                lineHeight: '1.15',
                marginBottom: '8px',
              }}>
                {greeting},<br />{firstName}.
              </h1>
              <p style={{ color: '#7a736a', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                Here is what is happening with your brand deals today.
              </p>
            </div>

            {/* Live clock */}
            <div style={{
              textAlign: 'right',
              padding: '16px 20px',
              background: 'rgba(22,38,42,0.6)',
              border: '1px solid rgba(41,66,70,0.2)',
              borderRadius: '14px',
              backdropFilter: 'blur(12px)',
            }}>
              <p style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '32px',
                color: '#9a938a',
                letterSpacing: '0.05em',
                lineHeight: 1,
              }}>
                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p style={{ fontSize: '10px', color: '#452F29', letterSpacing: '0.1em', marginTop: '4px' }}>
                LOCAL TIME
              </p>
            </div>
          </div>
        </div>
      </FloatCard>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '32px' }}>
        {statCards.map((stat, i) => (
          <FloatCard key={stat.label} delay={100 + i * 80}>
            <div style={{
              background: 'rgba(16,28,32,0.7)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(41,66,70,0.2)',
              borderRadius: '18px',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'default',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 12px 40px ' + stat.glow
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                position: 'absolute', top: 0, right: 0,
                width: '100px', height: '100px',
                background: 'radial-gradient(circle, ' + stat.color + ' 0%, transparent 70%)',
                opacity: 0.15,
                borderRadius: '0 18px 0 100px',
              }} />
              <p style={{
                fontSize: '10px',
                color: '#655150',
                letterSpacing: '0.12em',
                marginBottom: '16px',
                fontFamily: 'Inter, sans-serif',
              }}>
                {stat.label.toUpperCase()}
              </p>
              <p style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '34px',
                fontWeight: '600',
                color: '#d4cfc9',
                lineHeight: 1,
              }}>
                <AnimatedNumber value={stat.value} prefix={stat.prefix || ''} />
              </p>
            </div>
          </FloatCard>
        ))}
      </div>

      {/* Quick actions */}
      <FloatCard delay={500}>
        <div style={{
          background: 'rgba(16,28,32,0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(41,66,70,0.2)',
          borderRadius: '20px',
          padding: '28px',
        }}>
          <p style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '18px',
            color: '#d4cfc9',
            marginBottom: '20px',
          }}>
            Quick actions
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
            {quickActions.map((action, i) => (
              <a
                key={action.href}
                href={action.href}
                style={{
                  display: 'block',
                  padding: '18px',
                  background: 'rgba(41,66,70,0.08)',
                  border: '1px solid rgba(41,66,70,0.15)',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  transition: 'all 0.25s ease',
                  opacity: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(41,66,70,0.18)'
                  e.currentTarget.style.borderColor = 'rgba(41,66,70,0.35)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(41,66,70,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(41,66,70,0.15)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <span style={{ fontSize: '20px', display: 'block', marginBottom: '10px' }}>
                  {action.emoji}
                </span>
                <p style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#b8b2aa',
                  marginBottom: '4px',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {action.label}
                </p>
                <p style={{ fontSize: '11px', color: '#4a4340', fontFamily: 'Inter, sans-serif' }}>
                  {action.desc}
                </p>
              </a>
            ))}
          </div>
        </div>
      </FloatCard>
    </div>
  )
}