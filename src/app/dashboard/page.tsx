'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { getDeals } from '@/actions/deals'
import { getInvoices } from '@/actions/invoices'
import { getUsageRights } from '@/actions/usage-rights'

const AVATAR_STYLES = [
  { id: 'avataaars', label: 'Cartoon', bg: 'b6e3f4' },
  { id: 'bottts-neutral', label: 'Robot', bg: 'c0aede' },
  { id: 'adventurer', label: 'Adventurer', bg: 'ffd5dc' },
  { id: 'big-ears-neutral', label: 'Big Ears', bg: 'd1f4d1' },
  { id: 'fun-emoji', label: 'Emoji', bg: 'ffeaa7' },
  { id: 'lorelei-neutral', label: 'Artistic', bg: 'ffcba4' },
  { id: 'notionists-neutral', label: 'Notion', bg: 'c9e4ca' },
  { id: 'open-peeps', label: 'Peeps', bg: 'ffd6e0' },
  { id: 'personas', label: 'Persona', bg: 'c7ceea' },
  { id: 'pixel-art-neutral', label: 'Pixel', bg: '2a1f14' },
  { id: 'rings', label: 'Rings', bg: 'e8d5b7' },
  { id: 'thumbs', label: 'Thumbs', bg: 'ffd6a5' },
]

function getAvatarUrl(style: string, seed: string) {
  const styleObj = AVATAR_STYLES.find((s) => s.id === style)
  const bg = styleObj ? styleObj.bg : '2a1f14'
  return 'https://api.dicebear.com/7.x/' + style + '/svg?seed=' + encodeURIComponent(seed) + '&backgroundColor=' + bg + '&radius=50'
}

function AvatarPicker({ seed, onClose }: { seed: string; onClose: () => void }) {
  const [preview, setPreview] = useState(() => localStorage.getItem('avatar_style') || 'avataaars')

  const handleSave = () => {
    localStorage.setItem('avatar_style', preview)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(5,4,3,0.88)',
      backdropFilter: 'blur(12px)',
      zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'rgba(16,12,8,0.99)',
        border: '1px solid rgba(139,105,20,0.25)',
        borderRadius: '24px',
        padding: '32px',
        width: '540px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
      }}>
        <h3 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '22px', color: '#e8d9b8', marginBottom: '6px',
        }}>
          Choose your avatar
        </h3>
        <p style={{ fontSize: '12px', color: '#5c3d1a', marginBottom: '24px', fontFamily: 'Inter, sans-serif' }}>
          Pick a style that fits your vibe
        </p>

        {/* Big preview */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%',
            border: '3px solid rgba(139,105,20,0.4)',
            boxShadow: '0 0 40px rgba(139,105,20,0.3), 0 0 80px rgba(139,105,20,0.1)',
            overflow: 'hidden', background: '#2a1f14',
            transition: 'all 0.3s ease',
          }}>
            <img src={getAvatarUrl(preview, seed)} alt="Preview" style={{ width: '100%', height: '100%' }} />
          </div>
        </div>

        {/* Style grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px', marginBottom: '24px',
          maxHeight: '280px', overflowY: 'auto',
          paddingRight: '4px',
        }}>
          {AVATAR_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setPreview(style.id)}
              style={{
                background: preview === style.id ? 'rgba(139,105,20,0.25)' : 'rgba(42,31,20,0.3)',
                border: preview === style.id ? '2px solid rgba(201,168,76,0.5)' : '1px solid rgba(139,105,20,0.1)',
                borderRadius: '14px', padding: '12px 6px', cursor: 'pointer',
                transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '8px',
                transform: preview === style.id ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                overflow: 'hidden', background: '#' + style.bg,
                boxShadow: preview === style.id ? '0 0 16px rgba(201,168,76,0.3)' : 'none',
              }}>
                <img src={getAvatarUrl(style.id, seed)} alt={style.label} style={{ width: '100%', height: '100%' }} />
              </div>
              <span style={{
                fontSize: '10px',
                color: preview === style.id ? '#c9a84c' : '#6a5848',
                fontFamily: 'Inter, sans-serif', letterSpacing: '0.04em',
                fontWeight: preview === style.id ? '500' : '400',
              }}>
                {style.label}
              </span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '12px', background: 'transparent',
              border: '1px solid rgba(139,105,20,0.2)', borderRadius: '12px',
              color: '#6a5848', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s ease',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 2, padding: '12px',
              background: 'linear-gradient(135deg, #8b6914, #5c3d1a)',
              border: '1px solid rgba(139,105,20,0.4)', borderRadius: '12px',
              color: '#f0e6d0', fontSize: '13px', fontWeight: '500',
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              boxShadow: '0 0 20px rgba(139,105,20,0.2)',
              transition: 'all 0.2s ease',
            }}
          >
            Save avatar
          </button>
        </div>
      </div>
    </div>
  )
}

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number, prefix?: string, suffix?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (value === 0) return
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
  const [time, setTime] = useState<Date | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [avatarStyle, setAvatarStyle] = useState('avataaars')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('avatar_style')
    if (saved) setAvatarStyle(saved)
    setHydrated(true)
  }, [])

  useEffect(() => {
    setTime(new Date())
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

  const handlePickerClose = () => {
    const saved = localStorage.getItem('avatar_style')
    if (saved) setAvatarStyle(saved)
    setShowPicker(false)
  }

  const hour = time ? time.getHours() : 12
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.firstName || 'Creator'
  const seed = user?.username || user?.emailAddresses?.[0]?.emailAddress || 'creator'

  const statCards = [
    { label: 'Total Pipeline', value: stats.pipeline, prefix: '$', color: '#294246', glow: 'rgba(41,66,70,0.5)' },
    { label: 'Total Earned', value: stats.earned, prefix: '$', color: '#8b6914', glow: 'rgba(139,105,20,0.4)' },
    { label: 'Active Deals', value: stats.active, color: '#5c3d1a', glow: 'rgba(92,61,26,0.4)' },
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

      {showPicker && hydrated && (
        <AvatarPicker seed={seed} onClose={handlePickerClose} />
      )}

      <FloatCard delay={0}>
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', marginBottom: '48px',
          flexWrap: 'wrap', gap: '24px',
        }}>
          <div>
            <p style={{
              fontSize: '11px', color: '#5c3d1a',
              letterSpacing: '0.16em', marginBottom: '10px', fontFamily: 'Inter, sans-serif',
            }}>
              {time ? time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase() : ''}
            </p>
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '40px', fontWeight: '600',
              color: '#e8e4de', lineHeight: '1.15', marginBottom: '8px',
            }}>
              {greeting},<br />{firstName}.
            </h1>
            <p style={{ color: '#7a736a', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
              Here is what is happening with your brand deals today.
            </p>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>

            {/* Avatar card */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 18px',
              background: 'rgba(20,16,12,0.7)',
              border: '1px solid rgba(139,105,20,0.18)',
              borderRadius: '16px', backdropFilter: 'blur(12px)',
            }}>
              {hydrated && (
                <button
                  onClick={() => setShowPicker(true)}
                  title="Change avatar"
                  style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    border: '2px solid rgba(139,105,20,0.4)',
                    boxShadow: '0 0 20px rgba(139,105,20,0.25)',
                    overflow: 'hidden', background: '#2a1f14',
                    cursor: 'pointer', padding: 0,
                    position: 'relative', flexShrink: 0,
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(201,168,76,0.5)'
                    e.currentTarget.style.borderColor = 'rgba(201,168,76,0.7)'
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(139,105,20,0.25)'
                    e.currentTarget.style.borderColor = 'rgba(139,105,20,0.4)'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  <img
                    src={getAvatarUrl(avatarStyle, seed)}
                    alt="Your avatar"
                    style={{ width: '100%', height: '100%' }}
                  />
                </button>
              )}

              <div>
                <p style={{
                  fontSize: '14px', fontWeight: '500', color: '#e8d9b8',
                  fontFamily: 'Playfair Display, serif', marginBottom: '2px',
                }}>
                  {user?.fullName || firstName}
                </p>
                <p style={{
                  fontSize: '10px', color: '#5c3d1a',
                  letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif', marginBottom: '4px',
                }}>
                  BOOKSTAGRAMMER
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: '#6db88a',
                    boxShadow: '0 0 6px rgba(109,184,138,0.8)',
                    animation: 'breathe 2s ease-in-out infinite',
                  }} />
                  <span style={{ fontSize: '10px', color: '#6db88a', fontFamily: 'Inter, sans-serif' }}>
                    Online
                  </span>
                </div>
              </div>
            </div>

            {/* Clock */}
            <div style={{
              textAlign: 'right', padding: '12px 18px',
              background: 'rgba(20,16,12,0.7)',
              border: '1px solid rgba(139,105,20,0.1)',
              borderRadius: '14px', backdropFilter: 'blur(12px)',
            }}>
              <p style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '26px', color: '#9a938a',
                letterSpacing: '0.05em', lineHeight: 1,
              }}>
                {time ? time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
              </p>
              <p style={{ fontSize: '10px', color: '#3a2e1a', letterSpacing: '0.1em', marginTop: '4px', fontFamily: 'Inter, sans-serif' }}>
                LOCAL TIME
              </p>
            </div>
          </div>
        </div>
      </FloatCard>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px', marginBottom: '32px',
      }}>
        {statCards.map((stat, i) => (
          <FloatCard key={stat.label} delay={100 + i * 80}>
            <div
              style={{
                background: 'rgba(16,12,8,0.7)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(139,105,20,0.15)',
                borderRadius: '18px', padding: '24px',
                position: 'relative', overflow: 'hidden',
                cursor: 'default',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                height: '100%',
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
                opacity: 0.2, borderRadius: '0 18px 0 100px',
              }} />
              <p style={{
                fontSize: '10px', color: '#5c3d1a',
                letterSpacing: '0.12em', marginBottom: '16px', fontFamily: 'Inter, sans-serif',
              }}>
                {stat.label.toUpperCase()}
              </p>
              <p style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '34px', fontWeight: '600', color: '#d4cfc9', lineHeight: 1,
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
          background: 'rgba(16,12,8,0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(139,105,20,0.15)',
          borderRadius: '20px', padding: '28px',
        }}>
          <p style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '18px', color: '#d4cfc9', marginBottom: '20px',
          }}>
            Quick actions
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
          }}>
            {quickActions.map((action) => (
              <a
                key={action.href}
                href={action.href}
                style={{
                  display: 'block', padding: '18px',
                  background: 'rgba(42,31,20,0.3)',
                  border: '1px solid rgba(139,105,20,0.12)',
                  borderRadius: '14px', textDecoration: 'none',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139,105,20,0.12)'
                  e.currentTarget.style.borderColor = 'rgba(139,105,20,0.3)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(42,31,20,0.3)'
                  e.currentTarget.style.borderColor = 'rgba(139,105,20,0.12)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <span style={{ fontSize: '20px', display: 'block', marginBottom: '10px' }}>
                  {action.emoji}
                </span>
                <p style={{
                  fontSize: '13px', fontWeight: '500', color: '#b8b2aa',
                  marginBottom: '4px', fontFamily: 'Inter, sans-serif',
                }}>
                  {action.label}
                </p>
                <p style={{ fontSize: '11px', color: '#4a3e2e', fontFamily: 'Inter, sans-serif' }}>
                  {action.desc}
                </p>
              </a>
            ))}
          </div>
        </div>
      </FloatCard>

      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </div>
  )
}