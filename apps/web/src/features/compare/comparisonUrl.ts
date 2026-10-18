import type { Province } from '../../data/provincesQuery'
import type { District } from '../../data/districtsQuery'
import type { ComparisonUrlState, TerritoryUrlSelection } from '../../lib/territoryUrlState'
import { serializeComparisonUrlState } from '../../lib/territoryUrlState'
import type { ComparisonLevel, ComparisonSelection } from './ComparisonSelectors/ComparisonSelectors'

type Catalog<T> = { status: 'pending' | 'error' | 'success'; data?: readonly T[] }

export type ComparisonSideRestoration = {
  status: 'idle' | 'pending' | 'valid' | 'missing' | 'error'
  value: ComparisonSelection
  selection: TerritoryUrlSelection
}

// Recibe códigos normalizados por readComparisonUrlState. La existencia solo
// se descarta con un catálogo exitoso; los errores no borran selecciones.
export function resolveComparisonSide(
  selection: TerritoryUrlSelection, level: ComparisonLevel,
  provinces: Catalog<Province>, districts: Catalog<District>,
): ComparisonSideRestoration {
  const province = provinces.data?.find(item => item.ubigeo === selection.province) ?? null
  const base = { value: { province, district: null }, selection }
  if (!selection.province) return { ...base, status: 'idle' }
  if (!province) return provinces.status === 'success'
    ? { ...base, status: 'missing', selection: { province: null, district: null } }
    : { ...base, status: provinces.status === 'error' ? 'error' : 'pending' }
  if (level === 'province' || !selection.district) return { ...base, status: 'valid' }
  const district = districts.data?.find(item => item.ubigeo === selection.district &&
    item.provincia_ubigeo === province.ubigeo && item.ubigeo.slice(0, 4) === province.ubigeo) ?? null
  if (district) return { value: { province, district }, selection, status: 'valid' }
  return districts.status === 'success'
    ? { ...base, status: 'missing', selection: { province: province.ubigeo, district: null } }
    : { ...base, status: districts.status === 'error' ? 'error' : 'pending' }
}

// Serialización canónica de los cinco parámetros propios sin perder los ajenos.
export function withComparisonUrlState(params: URLSearchParams, state: ComparisonUrlState): URLSearchParams {
  const next = new URLSearchParams(params)
  for (const key of ['nivel', 'provinciaA', 'distritoA', 'provinciaB', 'distritoB']) next.delete(key)
  for (const [key, value] of new URLSearchParams(serializeComparisonUrlState(state))) next.set(key, value)
  return next
}
