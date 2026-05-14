'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trash2, ShoppingCart, ChevronLeft, Loader2 } from 'lucide-react'
import { useCart } from '@/components/CartProvider'
import { formatCurrency, generatePONumber } from '@/lib/utils'
import type { OrderForm } from '@/lib/types'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalCost, isHydrated } =
    useCart()

  const [form, setForm] = useState<OrderForm>({
    poNumber: '',
    clientName: '',
    companyName: '',
    clientEmail: '',
    clientPhone: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Generate PO number on mount
  useEffect(() => {
    setForm((prev) => ({ ...prev, poNumber: generatePONumber() }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.clientName || !form.companyName || !form.clientEmail) {
      setError('Please fill in your name, company, and email.')
      return
    }
    if (items.length === 0) {
      setError('Your cart is empty.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form, items, totalCost }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit order')
      }

      setSubmitted(true)
      clearCart()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isHydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">
        <Loader2 className="animate-spin mx-auto mb-3" size={24} />
        <p>Loading cart...</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Submitted!</h2>
        <p className="text-gray-500 mb-2">
          Your order has been received. You&apos;ll hear from us shortly.
        </p>
        <p className="text-sm text-gray-400 mb-8">PO #{form.poNumber}</p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 bg-[#2AB9D4] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1E9DB5] transition-colors"
        >
          Back to Catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/catalog"
          className="text-gray-500 hover:text-[#2AB9D4] transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {items.length} line item{items.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart size={48} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-500 mb-2">Cart is empty</h2>
          <p className="text-gray-400 text-sm mb-6">
            Browse the catalog and add items to get started.
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 bg-[#2AB9D4] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1E9DB5] transition-colors"
          >
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Cart table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0">
                {/* Header */}
                <div className="col-span-4 grid grid-cols-[1fr_auto_auto_auto] bg-gray-50 border-b border-gray-200 px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <span>Product</span>
                  <span className="text-right pr-6">Unit Price</span>
                  <span className="text-center w-24">Qty</span>
                  <span className="text-right w-24">Total</span>
                </div>

                {/* Items */}
                {items.map((item) => (
                  <div
                    key={item.cartId}
                    className="col-span-4 grid grid-cols-[1fr_auto_auto_auto] items-center px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Product info */}
                    <div className="min-w-0 pr-4">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {item.modelName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{item.collectionName}</span>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                          {item.size}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8F8FB] text-[#2AB9D4] font-medium">
                          {item.type === 'mattress' ? 'Mattress Only' : 'Set'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">
                        SKU: {item.sku}
                      </p>
                    </div>

                    {/* Unit price */}
                    <div className="text-right pr-6 text-sm font-medium text-gray-700">
                      {formatCurrency(item.unitPrice)}
                    </div>

                    {/* Qty control */}
                    <div className="flex items-center gap-1 w-24 justify-center">
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                        className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.cartId, parseInt(e.target.value) || 1)
                        }
                        className="w-10 text-center text-sm font-semibold border border-gray-200 rounded-md py-0.5 focus:outline-none focus:ring-1 focus:ring-[#2AB9D4]"
                      />
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Line total + remove */}
                    <div className="w-24 flex items-center justify-end gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.cartId)}
                        className="text-gray-300 hover:text-red-400 transition-colors ml-1"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: PO Form + Summary */}
          <div className="space-y-5">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm mb-4">
                {items.map((item) => (
                  <div key={item.cartId} className="flex justify-between text-gray-600">
                    <span className="truncate pr-2">
                      {item.size} {item.type === 'mattress' ? 'Mattress' : 'Set'} ×{item.quantity}
                    </span>
                    <span className="font-medium whitespace-nowrap">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className="text-[#2AB9D4] text-lg">{formatCurrency(totalCost)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                * This is a PO order. Payment terms apply per your account.
              </p>
            </div>

            {/* PO Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Order Details</h3>

              <div className="space-y-4">
                {/* PO Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    PO Number
                  </label>
                  <input
                    type="text"
                    value={form.poNumber}
                    onChange={(e) => setForm({ ...form, poNumber: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2AB9D4] focus:border-transparent"
                    placeholder="Auto-generated"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Auto-generated. Use your own if preferred.
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AB9D4] focus:border-transparent"
                    placeholder="Jane Smith"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Company <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AB9D4] focus:border-transparent"
                    placeholder="Acme Furniture Co."
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.clientEmail}
                    onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AB9D4] focus:border-transparent"
                    placeholder="jane@company.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={form.clientPhone}
                    onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AB9D4] focus:border-transparent"
                    placeholder="(555) 000-0000"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Notes / Special Instructions
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AB9D4] focus:border-transparent resize-none"
                    placeholder="Delivery instructions, special requests..."
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 w-full flex items-center justify-center gap-2 bg-[#2AB9D4] text-white font-semibold py-3 rounded-xl hover:bg-[#1E9DB5] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Order'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
