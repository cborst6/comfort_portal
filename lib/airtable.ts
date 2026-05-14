import type { Collection, ProductModel, Product } from './types'

const BASE_ID = process.env.AIRTABLE_BASE_ID || 'appknMHaYAoq1VKkC'
const API_KEY = process.env.AIRTABLE_API_KEY

type AirtableRecord = {
  id: string
  fields: Record<string, unknown>
}

async function fetchRecords(
  table: string,
  params: Record<string, string> = {}
): Promise<AirtableRecord[]> {
  if (!API_KEY) {
    console.error('AIRTABLE_API_KEY is not configured')
    return []
  }

  const records: AirtableRecord[] = []
  let offset: string | undefined

  do {
    const url = new URL(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`
    )
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    if (offset) url.searchParams.set('offset', offset)

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${API_KEY}` },
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      console.error(`Airtable error ${res.status} for table: ${table}`)
      break
    }

    const data = await res.json()
    records.push(...(data.records || []))
    offset = data.offset
  } while (offset)

  return records
}

function parseTags(value: unknown): string[] {
  if (!value) return []
  const str = Array.isArray(value) ? value.join(',') : String(value)
  return str
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

function str(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? '')
  return String(value ?? '')
}

export async function getCollections(): Promise<Collection[]> {
  const records = await fetchRecords('Collections', {
    filterByFormula: '{Is Active}',
  })

  return records.map((r) => ({
    id: r.id,
    name: str(r.fields['Collection Name']),
    classification: str(r.fields['Classification']),
    tags: parseTags(r.fields['Collection Tags']),
    description: str(r.fields['Collection Description']),
  }))
}

export async function getProductModels(): Promise<ProductModel[]> {
  const records = await fetchRecords('Product Models', {
    filterByFormula: 'NOT({Discontinued})',
  })

  return records.map((r) => {
    const collectionField = r.fields['Collection']
    const collectionId = Array.isArray(collectionField)
      ? String(collectionField[0] ?? '')
      : ''

    return {
      id: r.id,
      name: str(r.fields['Model Name']),
      imageUrl: str(r.fields['Image URL']),
      sku: str(r.fields['Model SKU']),
      collectionId,
      collectionName: '', // filled in by caller after join
      classification: str(r.fields['Classification (from Collection)']),
      tags: parseTags(r.fields['Collection Tags (from Collection)']),
      firmnessLevel: str(r.fields['Firmness Level']),
      description: str(r.fields['Model Description']),
      topType: str(r.fields['Top Type']),
      coreMaterial: str(r.fields['Core Material']),
      thicknessInches: Number(r.fields['Thickness (inches)'] ?? 0),
      warrantyYears: Number(r.fields['Warranty Years'] ?? 0),
      productIds: Array.isArray(r.fields['Products'])
        ? (r.fields['Products'] as string[])
        : [],
    }
  })
}

export async function getModelById(id: string): Promise<ProductModel | null> {
  if (!API_KEY) return null

  const res = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent('Product Models')}/${id}`,
    {
      headers: { Authorization: `Bearer ${API_KEY}` },
      next: { revalidate: 300 },
    }
  )

  if (!res.ok) return null

  const r: AirtableRecord = await res.json()
  const collectionField = r.fields['Collection']
  const collectionId = Array.isArray(collectionField)
    ? String(collectionField[0] ?? '')
    : ''

  return {
    id: r.id,
    name: str(r.fields['Model Name']),
    imageUrl: str(r.fields['Image URL']),
    sku: str(r.fields['Model SKU']),
    collectionId,
    collectionName: '',
    classification: str(r.fields['Classification (from Collection)']),
    tags: parseTags(r.fields['Collection Tags (from Collection)']),
    firmnessLevel: str(r.fields['Firmness Level']),
    description: str(r.fields['Model Description']),
    topType: str(r.fields['Top Type']),
    coreMaterial: str(r.fields['Core Material']),
    thicknessInches: Number(r.fields['Thickness (inches)'] ?? 0),
    warrantyYears: Number(r.fields['Warranty Years'] ?? 0),
    productIds: Array.isArray(r.fields['Products'])
      ? (r.fields['Products'] as string[])
      : [],
  }
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return []

  const formula =
    ids.length === 1
      ? `RECORD_ID()='${ids[0]}'`
      : `OR(${ids.map((id) => `RECORD_ID()='${id}'`).join(',')})`

  const records = await fetchRecords('Products', {
    filterByFormula: formula,
  })

  return records
    .map((r) => ({
      id: r.id,
      size: str(r.fields['Size']),
      itemCost: Number(r.fields['Item Cost'] ?? 0),
      setCost: Number(r.fields['Set Cost'] ?? 0),
      boxCost: Number(r.fields['Box Cost'] ?? 0),
      status: str(r.fields['Product Status']),
    }))
    .filter((p) => p.status === 'Active')
}

export async function getCollectionById(id: string): Promise<Collection | null> {
  if (!API_KEY) return null

  const res = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent('Collections')}/${id}`,
    {
      headers: { Authorization: `Bearer ${API_KEY}` },
      next: { revalidate: 300 },
    }
  )

  if (!res.ok) return null

  const r: AirtableRecord = await res.json()
  return {
    id: r.id,
    name: str(r.fields['Collection Name']),
    classification: str(r.fields['Classification']),
    tags: parseTags(r.fields['Collection Tags']),
    description: str(r.fields['Collection Description']),
  }
}
