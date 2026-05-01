const eurFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  useGrouping: 'always',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrencyEUR(value: number | string | null | undefined): string {
  const numeric = Number(value)
  if (Number.isNaN(numeric) || !Number.isFinite(numeric)) {
    return eurFormatter.format(0)
  }
  return eurFormatter.format(numeric)
}
