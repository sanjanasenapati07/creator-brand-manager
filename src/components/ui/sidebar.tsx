'use client'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Overview', emoji: '✦' },
  { href: '/dashboard/deals', label: 'Deals', emoji: '⬡' },
  { href: '/dashboard/brands', label: 'Brands', emoji: '◈' },
  { href: '/dashboard/invoices', label: 'Invoices', emoji: '◎' },
  { href: '/dashboard/analytics', label: 'Analytics', emoji: '◬' },
  { href: '/dashboard/usage-rights', label: 'Rights', emoji: '◷' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [hovered, setHovered] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => { clearTimeout(t); window.removeEventListener('resize', check) }
  }, [])

  // Mobile bottom nav
  if (isMobile) {
    return (
      <>
        {/* Mobile top bar */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: '56px', zIndex: 50,
          background: 'rgba(10,8,6,0.97)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(139,105,20,0.15)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>📖</span>
            <span style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '14px', color: '#e8d9b8', fontWeight: '600',
            }}>
              Brand Manager
            </span>
          </div>
          <UserButton />
        </div>

        {/* Mobile bottom nav */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: '64px', zIndex: 50,
          background: 'rgba(10,8,6,0.97)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(139,105,20,0.15)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 8px',
        }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '3px',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  background: isActive ? 'rgba(139,105,20,0.15)' : 'transparent',
                  transition: 'all 0.2s ease',
                  minWidth: '44px',
                }}
              >
                <span style={{
                  fontSize: '16px',
                  opacity: isActive ? 1 : 0.4,
                  color: isActive ? '#c9a84c' : '#9a938a',
                }}>
                  {item.emoji}
                </span>
                <span style={{
                  fontSize: '9px',
                  color: isActive ? '#c9a84c' : '#5a4e3e',
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '0.04em',
                  fontWeight: isActive ? '500' : '400',
                }}>
                  {item.label}
                </span>
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    width: '4px', height: '4px',
                    borderRadius: '50%',
                    background: '#c9a84c',
                    boxShadow: '0 0 6px rgba(201,168,76,0.8)',
                  }} />
                )}
              </Link>
            )
          })}
        </div>

        {/* Spacer so content doesn't hide behind top/bottom bars */}
        <div style={{ width: 0 }} />

        <style>{`
          main { padding-top: 56px !important; padding-bottom: 64px !important; }
        `}</style>
      </>
    )
  }

  // Desktop sidebar
  return (
    <aside style={{
      width: '240px', flexShrink: 0,
      background: 'rgba(10,8,6,0.98)',
      backdropFilter: 'blur(24px)',
      borderRight: '1px solid rgba(139,105,20,0.15)',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0,
      height: '100vh', zIndex: 10,
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateX(0)' : 'translateX(-24px)',
      transition: 'opacity 0.7s ease, transform 0.7s ease',
    }}>

      {/* Gold shimmer line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        backgroundImage: 'linear-gradient(90deg, transparent 0%, #8b6914 30%, #c9a84c 50%, #8b6914 70%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 4s linear infinite',
      }} />

      {/* Logo */}
      <div style={{
        padding: '32px 20px 24px',
        borderBottom: '1px solid rgba(139,105,20,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px',
            background: 'linear-gradient(145deg, #2a1f14, #0e0c0a)',
            border: '1px solid rgba(139,105,20,0.35)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', flexShrink: 0,
            boxShadow: '0 0 16px rgba(139,105,20,0.2)',
          }}>
            📖
          </div>
          <div>
            <span style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '14px', fontWeight: '600',
              color: '#e8d9b8', display: 'block',
            }}>
              Brand Manager
            </span>
            <span style={{
              fontSize: '9px', color: '#5c3d1a',
              letterSpacing: '0.16em', display: 'block', marginTop: '2px',
              fontFamily: 'Inter, sans-serif',
            }}>
              CREATOR STUDIO
            </span>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div style={{ padding: '20px 20px 8px' }}>
        <span style={{ fontSize: '9px', color: '#3a2e1a', letterSpacing: '0.16em', fontFamily: 'Inter, sans-serif' }}>
          NAVIGATION
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 12px 20px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
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
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px',
                textDecoration: 'none', fontSize: '13px',
                fontWeight: isActive ? '500' : '400',
                color: isActive ? '#f0e6d0' : isHov ? '#c9b99a' : '#6a5848',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(139,105,20,0.18), rgba(92,61,26,0.1))'
                  : isHov ? 'rgba(139,105,20,0.07)' : 'transparent',
                border: isActive ? '1px solid rgba(139,105,20,0.22)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(-12px)',
                transitionDelay: mounted ? (0.08 + i * 0.05) + 's' : '0s',
                position: 'relative', overflow: 'hidden',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {isHov && (
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'linear-gradient(90deg, transparent, rgba(139,105,20,0.04), transparent)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s linear infinite',
                  pointerEvents: 'none', zIndex: -1,
                }} />
              )}
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: '2px',
                  background: 'linear-gradient(180deg, #c9a84c, #8b6914)',
                  borderRadius: '2px',
                  boxShadow: '0 0 8px rgba(201,168,76,0.6)',
                }} />
              )}
              <span style={{
                fontSize: '12px',
                opacity: isActive ? 1 : isHov ? 0.7 : 0.35,
                color: isActive ? '#c9a84c' : 'inherit',
              }}>
                {item.emoji}
              </span>
              {item.label}
              {isActive && (
                <div style={{
                  marginLeft: 'auto', width: '5px', height: '5px',
                  borderRadius: '50%', background: '#c9a84c',
                  boxShadow: '0 0 8px rgba(201,168,76,0.8)',
                  animation: 'breathe 2.5s ease-in-out infinite',
                  flexShrink: 0,
                }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(139,105,20,0.1)' }} />
        <span style={{ fontSize: '9px', color: '#3a2e1a', letterSpacing: '0.12em' }}>ACCOUNT</span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(139,105,20,0.1)' }} />
      </div>

      {/* User */}
      <div style={{
        padding: '0 20px 28px',
        display: 'flex', alignItems: 'center', gap: '10px',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.6s ease 0.5s',
      }}>
        <UserButton />
        <span style={{ fontSize: '12px', color: '#4a3e2e', fontFamily: 'Inter, sans-serif' }}>
          Your account
        </span>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes breathe {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </aside>
  )
}