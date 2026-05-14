'use client'

import { useState } from 'react'
import { ShoppingCart, CheckCircle } from 'lucide-react'
import type { Product, ProductModel } from '@/lib/types'
import { useCart } from './CartProvider'
import { formatCurrency, sortBySizeOrder } from '@/lib/utils'

type Quantities = Record<string, { mattress: number; set: number }>

export function OrderTable({
  model,
  products,
  collectionName,
}: {
  model: ProductModel
  products: Product[]
  collectionName: string
}) {
  const { addItem } = useCart()
  const [quantities, setQuantities] = useState<Quantities>({})
  const [addedRows, setAddedRows] = useState<Record<string, boolean>>({})

  const sorted = sortBySizeOrder(products)

  const getQty = (productId: string, type: 'mattress' | 'set') =>
    quantities[productId]?.[type] ?? 0

  const setQty = (productId: string, type: 'mattress' | 'set', val: string) => {
    const num = Math.max(0, parseInt(val) || 0)
    setQuantities((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [type]: num },
    }))
  }

  const handleAdd = (product: Product) => {
    const mQty = getQty(product.id, 'mattress')
    const sQty = getQty(product.id, 'set')

    if (mQty === 0 && sQty === 0) return

    if (mQty > 0) {
      addItem({
        cartId: `${product.id}-mattress-${Date.now()}`,
        productId: product.id,
        modelId: model.id,
        modelName: model.name,
        collectionName,
        sku: model.sku,
        size: product.size,
        type: 'mattress',
        unitPrice: product.itemCost,
        quantity: mQty,
      })
    }

    if (sQty > 0) {
      addItem({
        cartId: `${product.id}-set-${Date.now() + 1}`,
        productId: product.id,
        modelId: model.id,
        modelName: model.name,
        collectionName,
        sku: model.sku,
        size: product.size,
        type: 'set',
        unitPrice: product.setCost,
        quantity: sQty,
      })
    }

    // Flash "Added" state for this row
    setAddedRows((prev) => ({ ...prev, [product.id]: true }))
    setTimeout(
      () => setAddedRows((prev) => ({ ...prev, [product.id]: false })),
      2000
    )

    // Reset quantities for this row
    setQuantities((prev) => ({
      ...prev,
      [product.id]: { mattress: 0, set: 0 },
    }))
  }

  if (!sorted.length) {
    return (
      <p className="text-gray-500 italic">No products available for this model.</p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 font-semibold text-gray-700 w-24">
              Size
            </th>
            <th className="text-right px-4 py-3 font-semibold text-gray-700">
              Mattress Only
            </th>
            <th className="text-center px-4 py-3 font-semibold text-gray-700 w-24">
              Qty
            </th>
            <th className="text-right px-4 py-3 font-semibold text-gray-700">
              Set Price
            </th>
            <th className="text-center px-4 py-3 font-semibold text-gray-700 w-24">
              Qty
            </th>
            <th className="w-32 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((product, idx) => {
            const isAdded = addedRows[product.id]
            const hasQty =
              getQty(product.id, 'mattress') > 0 ||
              getQty(product.id, 'set') > 0

            return (
              <tr
                key={product.id}
                className={`border-b border-gray-100 last:border-0 transition-colors ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                } hover:bg-[#E8F8FB]/40`}
              >
                {/* Size */}
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    {product.size}
                  </span>
                </td>

                {/* Mattress price */}
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {formatCurrency(product.itemCost)}
                </td>

                {/* Mattress qty */}
                <td className="px-4 py-3 text-center">
                  <input
                    type="number"
                    min={0}
                    value={getQty(product.id, 'mattress') || ''}
                    placeholder="0"
                    onChange={(e) => setQty(product.id, 'mattress', e.target.value)}
                    className="w-16 text-center border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AB9D4] focus:border-transparent"
                  />
                </td>

                {/* Set price */}
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {formatCurrency(product.setCost)}
                </td>

                {/* Set qty */}
                <td className="px-4 py-3 text-center">
                  <input
                    type="number"
                    min={0}
                    value={getQty(product.id, 'set') || ''}
                    placeholder="0"
                    onChange={(e) => setQty(product.id, 'set', e.target.value)}
                    className="w-16 text-center border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AB9D4] focus:border-transparent"
                  />
                </td>

                {/* Add button */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleAdd(product)}
                    disabled={!hasQty && !isAdded}
                    className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isAdded
                        ? 'bg-green-500 text-white'
                        : hasQty
                        ? 'bg-[#2AB9D4] text-white hover:bg-[#1E9DB5]'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <CheckCircle size={12} />
                        Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={12} />
                        Add
                      </>
                    )}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
