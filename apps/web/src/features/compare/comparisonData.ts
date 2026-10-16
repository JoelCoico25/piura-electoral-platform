import { createNumberFormatter, integerFormat } from '../../lib/numberFormat'
const percentageDifference = createNumberFormatter({ minimumFractionDigits: 2, maximumFractionDigits: 4 })
const peopleDifference = integerFormat

export function formatElectoralDifference(a: number | null, b: number | null, isPercentage: boolean): string {
  if (a === null || b === null) return 'No disponible'
  const difference = b - a
  const magnitude = Math.abs(difference)
  const sign = difference > 0 ? '+' : difference < 0 ? '−' : ''
  const value = difference === 0 ? '0' : isPercentage && magnitude < 0.00005
    ? `<${percentageDifference.format(0.0001)}`
    : (isPercentage ? percentageDifference : peopleDifference).format(magnitude)
  return `${sign}${value} ${isPercentage ? 'pp' : 'personas'}`
}

export function formatSocioeconomicDifference(
  a: number | null, b: number | null, yearA: number | null, yearB: number | null,
  indicator: 'poverty' | 'idh' | 'income',
): string {
  if (a === null || b === null || yearA === null || yearB === null) return 'No disponible'
  if (yearA !== yearB) return 'Años no comparables'
  const difference = b - a
  const digits = indicator === 'idh' ? 6 : indicator === 'poverty' ? 4 : 2
  const formatter = createNumberFormatter({ minimumFractionDigits: indicator === 'idh' ? 3 : 2, maximumFractionDigits: digits })
  const sign = difference > 0 ? '+' : difference < 0 ? '−' : ''
  const magnitude = Math.abs(difference)
  const value = difference === 0 ? '0' : magnitude < 0.5 * 10 ** -digits
    ? `<${formatter.format(10 ** -digits)}` : formatter.format(magnitude)
  const unit = indicator === 'poverty' ? 'pp' : indicator === 'idh' ? 'unidades del índice' : 'S/ por persona al mes'
  return `${sign}${value} ${unit}`
}
