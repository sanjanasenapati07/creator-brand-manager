'use client'

import { useState, useEffect } from 'react'
import { getDeals } from '@/actions/deals'
import { getInvoices } from '@/actions/invoices'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

type Deal = {
  id: string
  title: string
  value: number
  stage: string
  created_at: string
  brands?: { name: string }
}

type Invoice = {
  id: string
  amount: number
  status: string
  created_at: string
}

function useCountUp(target: number, delay = 0) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (target === 0) return
      let start = 0
      const step = target / (1200 / 16)
      const timer = setInterval(() => {
        start += step
        if (start >= target) {
          setCount(target)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)
      return () => clearInterval(timer)
    }, delay)
    return () => clearTimeout(timeout)
  }, [target, delay])
  return count
}

function FloatingCard({
  label,
  value,
  prefix = '',
  suffix = '',
  delay = 0,
  icon,
  borderColor,
  glowColor,
}: {
  label: string
  value: number
  prefix?: string
  suffix?: string
  delay?: number
  icon: string
  borderColor: string
  glowColor: string
}) {
  const [visible, setVisible] = useState(false)
  const count = useCountUp(value, delay + 200)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : 'translateY(32px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
        background: 'rgba(16,12,8,0.8)',
        backdropFilter: 'blur(16px)',
        border: '1px solid ' + borderColor,
        borderRadius: '20px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 32px ' + glowColor
        e.currentTarget.style.transform = 'translateY(-3px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = visible ? 'translateY(0)' : 'translateY(32px)'
      }}
    >
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '120px', height: '120px',
        background: 'radial-gradient(circle, ' + glowColor + ' 0%, transparent 70%)',
        opacity: 0.4,
        borderRadius: '0 20px 0 120px',
      }} />
      <p style={{ fontSize: '22px', marginBottom: '12px' }}>{icon}</p>
      <p style={{
        fontSize: '11px', color: '#5c3d1a',
        letterSpacing: '0.12em', marginBottom: '10px',
        fontFamily: 'Inter, sans-serif',
      }}>
        {label.toUpperCase()}
      </p>
      <p style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: '32px', fontWeight: '600',
        color: '#e8d9b8', lineHeight: 1,
      }}>
        {prefix}{count.toLocaleString()}{suffix}
      </p>
    </div>
  )
}

function SlideInPanel({
  children,
  delay = 0,
  direction = 'left',
}: {
  children: React.ReactNode
  delay?: number
  direction?: 'left' | 'right' | 'up'
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  const transforms: Record<string, string> = {
    left: 'translateX(-40px)',
    right: 'translateX(40px)',
    up: 'translateY(40px)',
  }

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translate(0)' : transforms[direction],
      transition: 'opacity 0.7s ease, transform 0.7s ease',
    }}>
      {children}
    </div>
  )
}

export default function AnalyticsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'monthly' | 'brands'>('monthly')

  useEffect(() => {
    async function load() {
      try {
        const [d, i] = await Promise.all([getDeals(), getInvoices()])
        setDeals(d || [])
        setInvoices(i || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const monthlyData = () => {
    const months: Record<string, number> = {}
    deals.forEach((deal) => {
      const date = new Date(deal.created_at)
      const key = date.toLocaleString('default', { month: 'short', year: '2-digit' })
      months[key] = (months[key] || 0) + (deal.value || 0)
    })
    const labels = Object.keys(months).slice(-6)
    const values = labels.map((l) => months[l])
    return { labels, values }
  }

  const brandData = () => {
    const brands: Record<string, number> = {}
    deals.forEach((deal) => {
      const name = deal.brands?.name || 'Unknown'
      brands[name] = (brands[name] || 0) + 1
    })
    return { labels: Object.keys(brands), values: Object.values(brands) }
  }

  const monthly = monthlyData()
  const brand = brandData()

  const totalPipeline = deals.reduce((s, d) => s + (d.value || 0), 0)
  const totalEarned = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const activeDeals = deals.filter((d) => d.stage === 'active').length
  const conversionRate = deals.length > 0
    ? Math.round((deals.filter((d) => d.stage === 'done').length / deals.length) * 100)
    : 0

  const CHART_COLORS = [
    'rgba(139,105,20,0.85)',
    'rgba(92,61,26,0.85)',
    'rgba(101,81,80,0.85)',
    'rgba(41,66,70,0.85)',
    'rgba(69,47,41,0.85)',
    'rgba(74,60,49,0.85)',
  ]

  const barData = {
    labels: monthly.labels,
    datasets: [{
      label: 'Deal Value',
      data: monthly.values,
      backgroundColor: CHART_COLORS,
      borderRadius: 10,
      borderSkipped: false,
      hoverBackgroundColor: 'rgba(201,168,76,0.9)',
    }],
  }

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(16,12,8,0.95)',
        titleColor: '#e8d9b8',
        bodyColor: '#9a938a',
        padding: 14,
        cornerRadius: 10,
        borderColor: 'rgba(139,105,20,0.3)',
        borderWidth: 1,
        callbacks: { label: (ctx: any) => ' $' + ctx.parsed.y.toLocaleString() },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#5c3d1a', font: { size: 12 } },
        border: { color: 'rgba(139,105,20,0.1)' },
      },
      y: {
        grid: { color: 'rgba(139,105,20,0.06)' },
        ticks: { color: '#5c3d1a', font: { size: 12 }, callback: (v: any) => '$' + v.toLocaleString() },
        border: { color: 'rgba(139,105,20,0.1)' },
      },
    },
    animation: { duration: 1200, easing: 'easeInOutQuart' as const },
  }

  const doughnutData = {
    labels: brand.labels,
    datasets: [{
      data: brand.values,
      backgroundColor: CHART_COLORS.slice(0, brand.labels.length),
      borderWidth: 0,
      hoverOffset: 12,
    }],
  }

  const doughnutOptions = {
    responsive: true,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#6a5848',
          padding: 16,
          font: { size: 12 },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(16,12,8,0.95)',
        titleColor: '#e8d9b8',
        bodyColor: '#9a938a',
        padding: 14,
        cornerRadius: 10,
        borderColor: 'rgba(139,105,20,0.3)',
        borderWidth: 1,
      },
    },
    animation: { duration: 1200, easing: 'easeInOutQuart' as const },
  }

  const stages = ['outreach', 'negotiation', 'active', 'invoicing', 'done']
  const stageStyles: Record<string, string> = {
    outreach: 'rgba(101,81,80,0.7)',
    negotiation: 'rgba(139,105,20,0.7)',
    active: 'rgba(41,66,70,0.8)',
    invoicing: 'rgba(92,61,26,0.8)',
    done: 'rgba(69,100,60,0.8)',
  }

  if (loading) {
    return (
      <div style={{ padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px',
            border: '2px solid rgba(139,105,20,0.2)',
            borderTopColor: '#8b6914',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#5c3d1a', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
            Crunching your numbers...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px', minHeight: '100vh' }}>

      {/* Header */}
      <SlideInPanel delay={0} direction="up">
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '28px', color: '#e8d9b8', marginBottom: '6px',
          }}>
            Analytics
          </h2>
          <p style={{ color: '#6a5848', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
            Your brand deal performance at a glance
          </p>
        </div>
      </SlideInPanel>

      {/* Floating stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px', marginBottom: '24px',
      }}>
        <FloatingCard
          label="Total Pipeline"
          value={totalPipeline}
          prefix="$"
          icon="📖"
          borderColor="rgba(139,105,20,0.25)"
          glowColor="rgba(139,105,20,0.3)"
          delay={0}
        />
        <FloatingCard
          label="Total Earned"
          value={totalEarned}
          prefix="$"
          icon="✦"
          borderColor="rgba(92,61,26,0.35)"
          glowColor="rgba(92,61,26,0.4)"
          delay={100}
        />
        <FloatingCard
          label="Active Deals"
          value={activeDeals}
          icon="◈"
          borderColor="rgba(101,81,80,0.3)"
          glowColor="rgba(101,81,80,0.35)"
          delay={200}
        />
        <FloatingCard
          label="Conversion Rate"
          value={conversionRate}
          suffix="%"
          icon="◬"
          borderColor="rgba(41,66,70,0.35)"
          glowColor="rgba(41,66,70,0.4)"
          delay={300}
        />
      </div>

      {/* Chart panel */}
      <SlideInPanel delay={400} direction="left">
        <div style={{
          background: 'rgba(16,12,8,0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(139,105,20,0.15)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h3 style={{
                fontSize: '15px', fontFamily: 'Playfair Display, serif',
                color: '#e8d9b8', marginBottom: '4px',
              }}>
                {activeTab === 'monthly' ? 'Deal value by month' : 'Deals by brand'}
              </h3>
              <p style={{ fontSize: '11px', color: '#5c3d1a', fontFamily: 'Inter, sans-serif' }}>
                {activeTab === 'monthly' ? 'Last 6 months pipeline value' : 'Which publishers work with you most'}
              </p>
            </div>

            {/* Tab switcher */}
            <div style={{
              display: 'flex',
              background: 'rgba(42,31,20,0.4)',
              borderRadius: '10px',
              padding: '3px', gap: '2px',
              border: '1px solid rgba(139,105,20,0.15)',
            }}>
              {(['monthly', 'brands'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: activeTab === tab ? '500' : '400',
                    color: activeTab === tab ? '#e8d9b8' : '#5c3d1a',
                    background: activeTab === tab ? 'rgba(139,105,20,0.2)' : 'transparent',
                    border: activeTab === tab ? '1px solid rgba(139,105,20,0.3)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    letterSpacing: '0.04em',
                  }}
                >
                  {tab === 'monthly' ? 'Monthly' : 'By Brand'}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'monthly' ? (
            monthly.labels.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#4a3e2e', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
                Add some deals to see your monthly chart
              </div>
            ) : (
              <Bar data={barData} options={barOptions} />
            )
          ) : (
            brand.labels.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#4a3e2e', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
                Add some deals to see brand breakdown
              </div>
            ) : (
              <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            )
          )}
        </div>
      </SlideInPanel>

      {/* Pipeline breakdown */}
      <SlideInPanel delay={600} direction="right">
        <div style={{
          background: 'rgba(16,12,8,0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(139,105,20,0.15)',
          borderRadius: '20px',
          padding: '24px',
        }}>
          <h3 style={{
            fontSize: '15px', fontFamily: 'Playfair Display, serif',
            color: '#e8d9b8', marginBottom: '4px',
          }}>
            Pipeline breakdown
          </h3>
          <p style={{ fontSize: '11px', color: '#5c3d1a', marginBottom: '24px', fontFamily: 'Inter, sans-serif' }}>
            Deals at each stage
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {stages.map((stage, i) => {
              const count = deals.filter((d) => d.stage === stage).length
              const pct = deals.length > 0 ? (count / deals.length) * 100 : 0
              return (
                <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{
                    fontSize: '11px', color: '#6a5848',
                    width: '80px', textTransform: 'capitalize',
                    fontFamily: 'Inter, sans-serif', letterSpacing: '0.04em',
                  }}>
                    {stage}
                  </span>
                  <div style={{
                    flex: 1, background: 'rgba(42,31,20,0.4)',
                    borderRadius: '6px', height: '8px', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '8px',
                      borderRadius: '6px',
                      background: stageStyles[stage],
                      width: pct + '%',
                      transition: 'width 1s ease ' + (0.7 + i * 0.1) + 's',
                      boxShadow: '0 0 8px ' + stageStyles[stage],
                    }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', width: '60px', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '12px', color: '#9a938a', fontFamily: 'Inter, sans-serif' }}>
                      {count}
                    </span>
                    <span style={{ fontSize: '12px', color: '#4a3e2e', fontFamily: 'Inter, sans-serif' }}>
                      {Math.round(pct)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </SlideInPanel>
    </div>
  )
}