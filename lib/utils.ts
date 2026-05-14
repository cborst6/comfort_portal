export function generatePONumber(): string {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `CB-${yy}${mm}${dd}-${rand}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export const SIZE_ORDER = ['Twin', 'Full', 'Queen', 'King', 'Twin XL', 'Cal King']

export function sortBySizeOrder<T extends { size: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      (SIZE_ORDER.indexOf(a.size) === -1 ? 99 : SIZE_ORDER.indexOf(a.size)) -
      (SIZE_ORDER.indexOf(b.size) === -1 ? 99 : SIZE_ORDER.indexOf(b.size))
  )
}
