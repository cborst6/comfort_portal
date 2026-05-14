import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getModelById, getProductsByIds, getCollectionById } from '@/lib/airtable'
import { OrderTable } from '@/components/OrderTable'

export const revalidate = 300

function Spec({ label, value }: { label: string; value: string | number }) {
  if (!value) return null
  return (
    <div className="bg-gray-50 rounded-lg px-4 py-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-0.5">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  )
}

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
    <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>
      {tag}
    </span>
  )
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ modelId: string }>
}) {
  const { modelId } = await params

  const model = await getModelById(modelId)
  if (!model) notFound()

  const [products, collection] = await Promise.all([
    getProductsByIds(model.productIds),
    model.collectionId ? getCollectionById(model.collectionId) : null,
  ])

  const collectionName = collection?.name ?? ''

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/catalog" className="hover:text-[#2AB9D4] transition-colors">
          Catalog
        </Link>
        <span>/</span>
        {collection && (
          <>
            <Link
              href={`/catalog?classification=${encodeURIComponent(collection.classification)}`}
              className="hover:text-[#2AB9D4] transition-colors"
            >
              {collection.classification}
            </Link>
            <span>/</span>
            <span className="text-gray-400">{collection.name}</span>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 font-medium truncate">{model.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        {/* Left: Image */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="relative aspect-[4/3]">
            {model.imageUrl ? (
              <Image
                src={model.imageUrl}
                alt={model.name}
                fill
                className="object-contain p-8"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-200">
                <svg width="80" height="80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 9V3H3v6l9 3 9-3zM3 11v10h18V11l-9 3-9-3z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Right: Details */}
        <div>
          {collectionName && (
            <p className="text-sm text-[#2AB9D4] font-semibold uppercase tracking-wide mb-2">
              {collectionName}
            </p>
          )}

          <h1 className="text-2xl font-bold text-gray-900 mb-1">{model.name}</h1>
          <p className="text-sm text-gray-400 font-mono mb-4">SKU: {model.sku}</p>

          {/* Tags */}
          {model.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {model.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}

          {/* Description */}
          {model.description && (
            <div className="bg-[#E8F8FB] border border-[#2AB9D4]/20 rounded-xl p-4 mb-5">
              <p className="text-sm text-gray-700 leading-relaxed">{model.description}</p>
            </div>
          )}

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-3">
            {model.thicknessInches > 0 && (
              <Spec label="Profile" value={`${model.thicknessInches}"`} />
            )}
            {model.firmnessLevel && (
              <Spec label="Firmness" value={model.firmnessLevel} />
            )}
            {model.topType && <Spec label="Top Type" value={model.topType} />}
            {model.coreMaterial && (
              <Spec label="Core" value={model.coreMaterial} />
            )}
            {model.warrantyYears > 0 && (
              <Spec
                label="Warranty"
                value={`${model.warrantyYears} Year${model.warrantyYears > 1 ? 's' : ''}`}
              />
            )}
          </div>
        </div>
      </div>

      {/* Ordering Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Place an Order</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Enter quantities and add to your cart. Submit your PO when ready.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Pricing shown</p>
            <p className="text-xs text-gray-500">Mattress Only &amp; Set (Mattress + Box)</p>
          </div>
        </div>

        <OrderTable model={model} products={products} collectionName={collectionName} />
      </div>
    </div>
  )
}
