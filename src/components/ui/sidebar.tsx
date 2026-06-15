'use client'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Overview', emoji: '✦' },
  { href: '/dashboard/deals', label: 'Deal Pipeline', emoji: '⬡' },
  { href: '/dashboard/brands', label: 'Brands', emoji: '◈' },
  { href: '/dashboard/invoices', label: 'Invoices', emoji: '◎' },
  { href: '/dashboard/analytics', label: 'Analytics', emoji: '◬' },
  { href: '/dashboard/usage-rights', label: 'Usage Rights', emoji: '◷' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [hovered, setHovered] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTimeout(() => setMounted(true), 100)
  }, [])

  return (
    <aside style={{
      width: '240px',
      flexShrink: 0,
      background: 'rgba(10,20,22,0.95)',
      backdropFilter: 'blur(24px)',
      borderRight: '1px solid rgba(41,66,70,0.3)',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh',
      zIndex: 10,
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateX(0)' : 'translateX(-20px)',
      transition: 'opacity 0.6s ease, transform 0.6s ease',
    }}>

      {/* Animated top glow */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #294246, #655150, #294246, transparent)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 3s linear infinite',
      }} />

      {/* Logo */}
      <div style={{
        padding: '32px 20px 24px',
        borderBottom: '1px solid rgba(41,66,70,0.15)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '4px',
        }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #294246, #0D2225)',
            border: '1px solid rgba(41,66,70,0.6)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            flexShrink: 0,
            boxShadow: '0 0 20px rgba(41,66,70,0.4)',
          }}>
            📖
          </div>
          <div>
            <span style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '14px',
              fontWeight: '600',
              color: '#d4cfc9',
              display: 'block',
              letterSpacing: '0.02em',
            }}>
              Brand Manager
            </span>
            <span style={{
              fontSize: '9px',
              color: '#452F29',
              letterSpacing: '0.14em',
              display: 'block',
              marginTop: '1px',
            }}>
              CREATOR STUDIO
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1,
        padding: '20px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
      }}>
        {navItems.map((item, i) => {
          const isActive = pathname === item.href
          const isHov = hovered === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHovered(item.href)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: isActive ? '500' : '400',
                color: isActive ? '#e8e4de' : isHov ? '#b8b2aa' : '#7a736a',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(41,66,70,0.4), rgba(69,47,41,0.2))'
                  : isHov ? 'rgba(41,66,70,0.12)' : 'transparent',
                border: isActive
                  ? '1px solid rgba(41,66,70,0.35)'
                  : '1px solid transparent',
                transition: 'all 0.25s ease',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
                transitionDelay: (0.1 + i * 0.06) + 's',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Hover shimmer */}
              {isHov && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(41,66,70,0.08), transparent)',
                  animation: 'shimmer 1.5s linear infinite',
                  backgroundSize: '200% 100%',
                }} />
              )}

              <span style={{
                fontSize: '13px',
                opacity: isActive ? 1 : isHov ? 0.8 : 0.4,
                transition: 'opacity 0.2s ease',
              }}>
                {item.emoji}
              </span>
              {item.label}
              {isActive && (
                <div style={{
                  marginLeft: 'auto',
                  width: '5px', height: '5px',
                  borderRadius: '50%',
                  background: '#655150',
                  boxShadow: '0 0 10px rgba(101,81,80,0.9), 0 0 20px rgba(101,81,80,0.4)',
                  animation: 'breathe 2s ease-in-out infinite',
                }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{
        padding: '16px 20px 24px',
        borderTop: '1px solid rgba(41,66,70,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <UserButton />
        <span style={{ fontSize: '12px', color: '#4a4340' }}>Your account</span>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes breathe {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </aside>
  )
}