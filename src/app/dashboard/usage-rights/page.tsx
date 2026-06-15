'use client'

import { useState, useEffect } from 'react'
import { getUsageRights, createUsageRight } from '@/actions/usage-rights'
import { getDeals } from '@/actions/deals'

type UsageRight = {
  id: string
  platform: string
  rights_type: string
  expiry_date: string | null
  notes: string | null
  created_at: string
  deals: {
    title: string
    brands: { name: string } | null
  } | null
}

type Deal = {
  id: string
  title: string
  brands?: { name: string }
}

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook', 'Pinterest', 'Blog', 'Other']
const RIGHTS_TYPES = ['Repost', 'Repurpose', 'Paid Ads', 'Print', 'Whitelist', 'Exclusivity', 'Other']

function getDaysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null
  const today = new Date()
  const expiry = new Date(expiryDate)
  const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

function ExpiryBadge({ expiryDate }: { expiryDate: string | null }) {
  if (!expiryDate) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
        No expiry
      </span>
    )
  }

  const days = getDaysUntilExpiry(expiryDate)

  if (days === null) return null

  if (days < 0) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
        Expired {Math.abs(days)}d ago
      </span>
    )
  }

  if (days <= 7) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium animate-pulse">
        Expires in {days}d
      </span>
    )
  }

  if (days <= 30) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
        Expires in {days}d
      </span>
    )
  }

  return (
    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
      Expires in {days}d
    </span>
  )
}

export default function UsageRightsPage() {
  const [rights, setRights] = useState<UsageRight[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dealId, setDealId] = useState('')
  const [platform, setPlatform] = useState('Instagram')
  const [rightsType, setRightsType] = useState('Repost')
  const [expiryDate, setExpiryDate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [r, d] = await Promise.all([getUsageRights(), getDeals()])
        setRights(r || [])
        setDeals(d || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleCreate = async () => {
    if (!dealId || !platform) return
    setSaving(true)
    try {
      const newRight = await createUsageRight({
        deal_id: dealId,
        platform,
        rights_type: rightsType,
        expiry_date: expiryDate || null,
        notes,
      })
      setRights((prev) => [newRight, ...prev])
      setShowModal(false)
      setDealId('')
      setPlatform('Instagram')
      setRightsType('Repost')
      setExpiryDate('')
      setNotes('')
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const expiringSoon = rights.filter((r) => {
    const days = getDaysUntilExpiry(r.expiry_date)
    return days !== null && days >= 0 && days <= 30
  })

  const expired = rights.filter((r) => {
    const days = getDaysUntilExpiry(r.expiry_date)
    return days !== null && days < 0
  })

  const active = rights.filter((r) => {
    const days = getDaysUntilExpiry(r.expiry_date)
    return days === null || days > 30
  })

  if (loading) return <div className="p-8 text-gray-400">Loading usage rights...</div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Usage Rights</h2>
          <p className="text-gray-500 mt-1">
            Track when brands can use your content
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          + Add Rights
        </button>
      </div>

      {/* Alert banner if anything expiring soon */}
      {expiringSoon.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-amber-500 text-lg">⚠</span>
          <div>
            <p className="text-sm font-medium text-amber-800">
              {expiringSoon.length} usage right{expiringSoon.length > 1 ? 's' : ''} expiring within 30 days
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Review these and renegotiate if needed
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-xs text-green-600 font-medium">Active</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{active.length}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-xs text-amber-600 font-medium">Expiring Soon</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{expiringSoon.length}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-xs text-red-600 font-medium">Expired</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{expired.length}</p>
        </div>
      </div>

      {/* Empty state */}
      {rights.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-600 font-medium">No usage rights tracked yet</p>
          <p className="text-gray-400 text-sm mt-1 max-w-sm">
            When a brand gets rights to reuse your content, add it here so you always know when it expires
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700"
          >
            + Add Rights
          </button>
        </div>
      )}

      {/* Rights list */}
      <div className="space-y-3">
        {rights.map((right) => {
          const days = getDaysUntilExpiry(right.expiry_date)
          const isExpired = days !== null && days < 0
          return (
            <div
              key={right.id}
              className={'bg-white rounded-xl border p-5 flex items-center justify-between transition-all ' +
                (isExpired ? 'border-red-100 opacity-60' : 'border-gray-200 hover:shadow-md')}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600">
                  {right.platform.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{right.platform}</p>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {right.rights_type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {right.deals?.brands?.name || 'Unknown'} &mdash; {right.deals?.title || 'Unknown deal'}
                  </p>
                  {right.notes && (
                    <p className="text-xs text-gray-400 mt-1">{right.notes}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {right.expiry_date && (
                  <p className="text-xs text-gray-400">
                    {new Date(right.expiry_date).toLocaleDateString()}
                  </p>
                )}
                <ExpiryBadge expiryDate={right.expiry_date} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add Usage Rights</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                x
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Deal *</label>
                <select
                  value={dealId}
                  onChange={(e) => setDealId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Select a deal...</option>
                  {deals.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} {d.brands ? '- ' + d.brands.name : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Platform *</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Rights type *</label>
                <select
                  value={rightsType}
                  onChange={(e) => setRightsType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  {RIGHTS_TYPES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Expiry date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Notes</label>
                <textarea
                  placeholder="e.g. Can repost on their feed only, not stories"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !dealId}
                className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Add Rights'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}