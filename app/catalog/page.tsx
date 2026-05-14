import Link from 'next/link'
import Image from 'next/image'
import { getCollections, getProductModels } from '@/lib/airtable'
import type { Collection, ProductModel } from '@/lib/types'

export const revalidate = 300

function TagBadge({ tag }: { tag: string }) {
  const colors: Record<string, string> = {
    'Top Seller': 'bg-amber-100 text-amber-800',
    'Cool Gel': 'bg-blue-100 text-blue-800',
    'Cool Touch Cover': 'bg-sky-100 text-sky-800',
    'BioPure® Latex': 'bg-green-100 text-green-800',
    Latex: 'bg-green-100 text-green-800',
  }
  const cls = colors[tag] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {tag}
    </span>
  )
}

function ModelCard({
  model,
  collectionName,
}: {
  model: ProductModel
  collectionName: string
}) {
  return (
    <Link
      href={`/catalog/${model.id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-[#2AB9D4] transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
        {model.imageUrl ? (
          <Image
            src={model.imageUrl}
            alt={model.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 9V3H3v6l9 3 9-3zM3 11v10h18V11l-9 3-9-3z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-[#2AB9D4] font-semibold uppercase tracking-wide mb-1">
          {collectionName}
        </p>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 group-hover:text-[#2AB9D4] transition-colors">
          {model.name}
        </h3>

        {/* Tags */}
        {model.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {model.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}

        {/* Specs */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {model.thicknessInches > 0 && (
            <span>{model.thicknessInches}&quot; profile</span>
          )}
          {model.firmnessLevel && <span>· {model.firmnessLevel}</span>}
          {model.warrantyYears > 0 && (
            <span>· {model.warrantyYears}yr warranty</span>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs font-semibold text-[#2AB9D4] group-hover:underline">
            View &amp; Order →
          </span>
        </div>
      </div>
    </Link>
  )
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ classification?: string }>
}) {
  const params = await searchParams
  const activeFilter = params.classification ?? 'all'

  const [collections, models] = await Promise.all([
    getCollections(),
    getProductModels(),
  ])

  // Build a map of collection ID → collection
  const collectionMap = new Map<string, Collection>(
    collections.map((c) => [c.id, c])
  )

  // Enrich models with collection names
  const enrichedModels: ProductModel[] = models.map((m) => ({
    ...m,
    collectionName: collectionMap.get(m.collectionId)?.name ?? '',
  }))

  // Get unique classifications for filter tabs
  const classifications = [
    'all',
    ...Array.from(new Set(collections.map((c) => c.classification).filter(Boolean))),
  ]

  // Filter models
  const filtered =
    activeFilter === 'all'
      ? enrichedModels
      : enrichedModels.filter((m) => m.classification === activeFilter)

  // Group filtered models by collection
  const byCollection = new Map<string, { collection: Collection; models: ProductModel[] }>()
  for (const model of filtered) {
    const col = collectionMap.get(model.collectionId)
    if (!col) continue
    if (!byCollection.has(col.id)) {
      byCollection.set(col.id, { collection: col, models: [] })
    }
    byCollection.get(col.id)!.models.push(model)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Browse collections and place orders below.
        </p>
      </div>

      {/* Classification Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {classifications.map((cls) => {
          const label = cls === 'all' ? 'All Products' : cls
          const isActive = cls === activeFilter
          return (
            <Link
              key={cls}
              href={cls === 'all' ? '/catalog' : `/catalog?classification=${encodeURIComponent(cls)}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#2AB9D4] text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#2AB9D4] hover:text-[#2AB9D4]'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* Collections + Models */}
      {byCollection.size === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p>No products found.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Array.from(byCollection.values()).map(({ collection, models: colModels }) => (
            <section key={collection.id}>
              {/* Collection header */}
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {collection.name}
                  </h2>
                  {collection.description && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      {collection.description}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  {collection.classification}
                </span>
              </div>

              {/* Model grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {colModels.map((model) => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    collectionName={collection.name}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
