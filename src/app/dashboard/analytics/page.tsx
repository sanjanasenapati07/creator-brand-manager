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
  gradient,
  icon,
}: {
  label: string
  value: number
  prefix?: string
  suffix?: string
  delay?: number
  gradient: string
  icon: string
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
      }}
      className={'relative overflow-hidden rounded-2xl p-6 text-white shadow-lg ' + gradient}
    >
      {/* Floating circle decoration */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 bg-white"
        style={{ filter: 'blur(2px)' }}
      />
      <div
        className="absolute -bottom-4 -right-2 w-14 h-14 rounded-full opacity-10 bg-white"
      />
      <p className="text-2xl mb-3">{icon}</p>
      <p className="text-sm font-medium opacity-80 mb-1">{label}</p>
      <p className="text-3xl font-bold">
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
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate(0)' : transforms[direction],
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
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
  '#5C0A1D', // Burgundy
  '#1A0F14', // Black
  '#6D0F1B', // Wine
  '#8B0000', // Blood Red
  '#3A0A12', // Dark Burgundy
  '#4A0404', // Deep Red
]

  const barData = {
    labels: monthly.labels,
    datasets: [{
      label: 'Deal Value',
      data: monthly.values,
      backgroundColor: CHART_COLORS,
      borderRadius: 10,
      borderSkipped: false,
      hoverBackgroundColor: 'rgba(181, 137, 72, 1)',
    }],
  }

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#f9fafb',
        bodyColor: '#d1d5db',
        padding: 14,
        cornerRadius: 10,
        callbacks: { label: (ctx: any) => ' $' + ctx.parsed.y.toLocaleString() },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 12 } } },
      y: {
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { color: '#9ca3af', font: { size: 12 }, callback: (v: any) => '$' + v.toLocaleString() },
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
        labels: { color: '#6b7280', padding: 16, font: { size: 12 }, usePointStyle: true },
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#f9fafb',
        bodyColor: '#d1d5db',
        padding: 14,
        cornerRadius: 10,
      },
    },
    animation: { duration: 1200, easing: 'easeInOutQuart' as const },
  }

  const stages = ['outreach', 'negotiation', 'active', 'invoicing', 'done']
  const stageColors: Record<string, string> = {
  outreach: 'pipeline-bar-outreach',
  negotiation: 'pipeline-bar-negotiation',
  active: 'pipeline-bar-active',
  invoicing: 'pipeline-bar-invoicing',
  done: 'pipeline-bar-done',
}

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Crunching your numbers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      {/* Header */}
      <SlideInPanel delay={0} direction="up">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Analytics</h2>
          <p className="text-gray-500 mt-1">Your brand deal performance at a glance</p>
        </div>
      </SlideInPanel>

      {/* Floating stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <FloatingCard
  label="Total Pipeline"
  value={totalPipeline}
  prefix="$"
  gradient="bg-gradient-to-br from-[#5C0A1D] to-[#2B0710]"
  icon="💼"
/>

<FloatingCard
  label="Total Earned"
  value={totalEarned}
  prefix="$"
  gradient="bg-gradient-to-br from-[#6D0F1B] to-[#300710]"
  icon="💰"
/>

<FloatingCard
  label="Active Deals"
  value={activeDeals}
  gradient="bg-gradient-to-br from-[#8B0000] to-[#3D0000]"
  icon="🔥"
/>

<FloatingCard
  label="Conversion Rate"
  value={conversionRate}
  suffix="%"
  gradient="bg-gradient-to-br from-[#4A0404] to-[#1A0F14]"
  icon="📈"
/>
      </div>

      {/* Chart panel with sliding tab switch */}
      <SlideInPanel delay={400} direction="left">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          {/* Tab switcher */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {activeTab === 'monthly' ? 'Deal value by month' : 'Deals by brand'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {activeTab === 'monthly' ? 'Last 6 months pipeline value' : 'Which publishers work with you most'}
              </p>
            </div>
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setActiveTab('monthly')}
                className={'px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ' +
                  (activeTab === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700')}
              >
                Monthly
              </button>
              <button
                onClick={() => setActiveTab('brands')}
                className={'px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ' +
                  (activeTab === 'brands'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700')}
              >
                By Brand
              </button>
            </div>
          </div>

          {/* Chart area with slide transition */}
          <div
            style={{
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            {activeTab === 'monthly' ? (
              monthly.labels.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                  Add some deals to see your monthly chart
                </div>
              ) : (
                <Bar data={barData} options={barOptions} />
              )
            ) : (
              brand.labels.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                  Add some deals to see brand breakdown
                </div>
              ) : (
                <div className="max-w-xs mx-auto">
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
              )
            )}
          </div>
        </div>
      </SlideInPanel>

      {/* Pipeline stage bars - slide in from right */}
      <SlideInPanel delay={600} direction="right">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Pipeline breakdown</h3>
          <p className="text-xs text-gray-400 mb-6">Deals at each stage</p>
          <div className="space-y-4">
            {stages.map((stage, i) => {
              const count = deals.filter((d) => d.stage === stage).length
              const pct = deals.length > 0 ? (count / deals.length) * 100 : 0
              return (
                <div key={stage} className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 w-24 capitalize">{stage}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      style={{
  height: '12px',
  borderRadius: '6px',
  width: pct + '%',
  transition: 'width 1s ease ' + (0.7 + i * 0.1) + 's',
  backgroundColor: {
    outreach: '#655150',
    negotiation: '#c9a84c',
    active: '#c9a84c',
    invoicing: '#8b6914',
    done: '#4a7a4a',
  }[stage] || '#655150',
}}
                    />
                  </div>
                  <div className="flex items-center gap-2 w-16 justify-end">
                    <span className="text-xs font-medium text-gray-700">{count}</span>
                    <span className="text-xs text-gray-400">{Math.round(pct)}%</span>
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