'use client'

import { useState, useEffect } from 'react'
import { DealStage } from '@/types'
import { getDeals, createDeal, updateDealStage } from '@/actions/deals'
import { getBrands, createBrand } from '@/actions/brands'

const STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: 'outreach', label: 'Outreach', color: 'bg-gray-100' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-yellow-50' },
  { id: 'active', label: 'Active', color: 'bg-blue-50' },
  { id: 'invoicing', label: 'Invoicing', color: 'bg-purple-50' },
  { id: 'done', label: 'Done', color: 'bg-green-50' },
]

type Deal = {
  id: string
  title: string
  brand_id: string
  value: number
  currency: string
  stage: DealStage
  end_date: string | null
  brands?: { name: string }
}

type Brand = {
  id: string
  name: string
}

type NewDealForm = {
  title: string
  brand_id: string
  new_brand_name: string
  value: string
  stage: DealStage
  end_date: string
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<NewDealForm>({
    title: '',
    brand_id: '',
    new_brand_name: '',
    value: '',
    stage: 'outreach',
    end_date: '',
  })

  useEffect(() => {
    async function load() {
      try {
        const [dealsData, brandsData] = await Promise.all([
          getDeals(),
          getBrands(),
        ])
        setDeals(dealsData || [])
        setBrands(brandsData || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getDealsByStage = (stage: DealStage) =>
    deals.filter((d) => d.stage === stage)

  const handleDragStart = (dealId: string) => setDraggingId(dealId)

  const handleDrop = async (stage: DealStage) => {
    if (!draggingId) return
    setDeals((prev) =>
      prev.map((d) => (d.id === draggingId ? { ...d, stage } : d))
    )
    await updateDealStage(draggingId, stage)
    setDraggingId(null)
  }

  const handleAddDeal = async () => {
    if (!form.title) return
    setSaving(true)
    try {
      let brandId = form.brand_id

      // Create new brand if user typed a name instead of picking one
      if (!brandId && form.new_brand_name) {
        const newBrand = await createBrand({
          name: form.new_brand_name,
          contact_email: '',
          contact_name: '',
          website: '',
        })
        brandId = newBrand.id
        setBrands((prev) => [...prev, newBrand])
      }

      if (!brandId) return

      const newDeal = await createDeal({
        title: form.title,
        brand_id: brandId,
        value: parseFloat(form.value) || 0,
        stage: form.stage,
        end_date: form.end_date || null,
      })

      setDeals((prev) => [...prev, newDeal])
      setForm({
        title: '',
        brand_id: '',
        new_brand_name: '',
        value: '',
        stage: 'outreach',
        end_date: '',
      })
      setShowModal(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const totalValue = deals
    .filter((d) => d.stage !== 'cancelled')
    .reduce((sum, d) => sum + d.value, 0)

  const activeCount = deals.filter((d) => d.stage === 'active').length

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <p className="text-gray-400 text-sm">Loading deals...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Deal Pipeline</h2>
          <p className="text-gray-500 mt-1">
            {activeCount} active deals · ${totalValue.toLocaleString()} total pipeline value
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          + New Deal
        </button>
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageDeals = getDealsByStage(stage.id)
          const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0)

          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-64"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(stage.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {stage.label}
                  </span>
                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                    {stageDeals.length}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  ${stageValue.toLocaleString()}
                </span>
              </div>

              <div className={`min-h-96 rounded-xl p-3 space-y-3 ${stage.color} border-2 border-transparent transition-colors`}>
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => handleDragStart(deal.id)}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                  >
                    <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {deal.brands?.name || 'Unknown brand'}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-semibold text-gray-900">
                        ${deal.value.toLocaleString()}
                      </span>
                      {deal.end_date && (
                        <span className="text-xs text-gray-400">
                          Due {new Date(deal.end_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {stageDeals.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-xs text-gray-400">
                    Drop deals here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* New Deal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">New Deal</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Deal title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Summer Instagram Campaign"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Brand
                </label>
                {brands.length > 0 ? (
                  <select
                    value={form.brand_id}
                    onChange={(e) => setForm({ ...form, brand_id: e.target.value, new_brand_name: '' })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="">Select a brand or type new...</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                ) : null}
                {!form.brand_id && (
                  <input
                    type="text"
                    placeholder="Type a new brand name"
                    value={form.new_brand_name}
                    onChange={(e) => setForm({ ...form, new_brand_name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 mt-2"
                  />
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Deal value (USD)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Stage
                </label>
                <select
                  value={form.stage}
                  onChange={(e) => setForm({ ...form, stage: e.target.value as DealStage })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  End date (optional)
                </label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDeal}
                disabled={saving}
                className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Add Deal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}