import { createNumberFormatter } from '../../lib/numberFormat'
import { povertyIntervals } from './povertyScale'
import type { SocioeconomicData } from './socioeconomicData'

export type DistrictIndicator = 'poverty' | 'idh' | 'income'
export const districtIndicators = {
  poverty: { name: 'Pobreza estimada (punto medio del intervalo)', unit: '%', source: 'INEI', intervals: povertyIntervals },
  idh: { name: 'IDH', unit: 'Escala 0–1', source: 'PNUD', intervals: [
    { upper: 0.2, label: '0 a menos de 0,2', color: '#dbeafe' },
    { upper: 0.4, label: '0,2 a menos de 0,4', color: '#93c5fd' },
    { upper: 0.6, label: '0,4 a menos de 0,6', color: '#3b82f6' },
    { upper: 0.8, label: '0,6 a menos de 0,8', color: '#1d4ed8' },
    { upper: Infinity, label: '0,8 a 1 inclusive', color: '#1e3a8a' },
  ] },
  income: { name: 'Ingreso familiar per cápita mensual', unit: 'Soles por persona al mes', source: 'PNUD', intervals: [
    { upper: 500, label: 'Menos de S/ 500', color: '#dcfce7' },
    { upper: 1000, label: 'S/ 500 a menos de 1 000', color: '#86efac' },
    { upper: 1500, label: 'S/ 1 000 a menos de 1 500', color: '#22c55e' },
    { upper: 2000, label: 'S/ 1 500 a menos de 2 000', color: '#15803d' },
    { upper: Infinity, label: 'S/ 2 000 o más', color: '#14532d' },
  ] },
}

export function indicatorValue(data: SocioeconomicData | null, indicator: DistrictIndicator): number | null {
  if (indicator === 'poverty') return data?.pobreza?.estimada ?? null
  return indicator === 'idh' ? data?.desarrollo?.idh ?? null : data?.desarrollo?.ingreso ?? null
}

export function indicatorYear(data: SocioeconomicData | null, indicator: DistrictIndicator): number | null {
  return (indicator === 'poverty' ? data?.pobreza?.anio : data?.desarrollo?.anio) ?? null
}

export function indicatorColor(value: number | null, indicator: DistrictIndicator) {
  return value === null ? '#cbd5e1' : districtIndicators[indicator].intervals.find(interval => value < interval.upper)!.color
}

export function formatIndicator(value: number | null, indicator: DistrictIndicator) {
  if (value === null) return 'No disponible'
  const formatted = createNumberFormatter({ minimumFractionDigits: indicator === 'idh' ? 3 : 2, maximumFractionDigits: indicator === 'idh' ? 3 : 2 }).format(value)
  return indicator === 'poverty' ? `${formatted} %` : indicator === 'income' ? `S/ ${formatted} por persona al mes` : formatted
}
