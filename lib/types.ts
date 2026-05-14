export type Collection = {
  id: string
  name: string
  classification: string
  tags: string[]
  description: string
}

export type ProductModel = {
  id: string
  name: string
  imageUrl: string
  sku: string
  collectionId: string
  collectionName: string
  classification: string
  tags: string[]
  firmnessLevel: string
  description: string
  topType: string
  coreMaterial: string
  thicknessInches: number
  warrantyYears: number
  productIds: string[]
}

export type Product = {
  id: string
  size: string
  itemCost: number
  setCost: number
  boxCost: number
  status: string
}

export type CartItem = {
  cartId: string
  productId: string
  modelId: string
  modelName: string
  collectionName: string
  sku: string
  size: string
  type: 'mattress' | 'set'
  unitPrice: number
  quantity: number
}

export type OrderForm = {
  poNumber: string
  clientName: string
  companyName: string
  clientEmail: string
  clientPhone: string
  notes: string
}
