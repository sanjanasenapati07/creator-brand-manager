'use client'

import { useState, useEffect } from 'react'
import { getBrands, createBrand } from '@/actions/brands'

type Brand = {
  id: string
  name: string
  contact_email: string | null
  contact_name: string | null
  website: string | null
  notes: string | null
  created_at: string
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    getBrands().then((data) => {
      setBrands(data || [])
      setLoading(false)
    })
  }, [])

  const handleAdd = async () => {
    if (!name) return
    setSaving(true)
    try {
      const newBrand = await createBrand({
        name,
        contact_name: contactName,
        contact_email: contactEmail,
        website,
        notes,
      })
      setBrands((prev) => [newBrand, ...prev])
      setName('')
      setContactName('')
      setContactEmail('')
      setWebsite('')
      setNotes('')
      setShowModal(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Brands</h2>
          <p className="text-gray-500 mt-1">{brands.length} brands in your network</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          + Add Brand
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <h3 className="text-sm font-semibold text-gray-900">{brand.name}</h3>
            {brand.contact_name && (
              <p className="text-xs text-gray-500 mt-1">{brand.contact_name}</p>
            )}
            {brand.contact_email && (
              <p className="text-xs text-gray-500 mt-1">{brand.contact_email}</p>
            )}
            {brand.website && (
              <p className="text-xs text-gray-400 mt-1">{brand.website}</p>
            )}
            {brand.notes && (
              <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">{brand.notes}</p>
            )}
            <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
              Added {new Date(brand.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add Brand</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                x
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Brand name *</label>
                <input
                  type="text"
                  placeholder="e.g. Penguin Random House"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Contact person</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Johnson"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Contact email</label>
                <input
                  type="email"
                  placeholder="e.g. sarah@penguinbooks.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Website</label>
                <input
                  type="url"
                  placeholder="e.g. https://penguinbooks.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Notes</label>
                <textarea
                  placeholder="Payment terms, preferences..."
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
                onClick={handleAdd}
                disabled={saving || !name}
                className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Add Brand'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}