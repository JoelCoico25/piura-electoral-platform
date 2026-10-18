import type { Province } from '../../data/provincesQuery'
import type { District } from '../../data/districtsQuery'
import { readExplorerUrlState } from '../../lib/territoryUrlState'
import type { ExplorerUrlState, TerritoryUrlSelection } from '../../lib/territoryUrlState'

type Catalog<T> = { status: 'pending' | 'error' | 'success'; data?: readonly T[] }

export type TerritoryRestoration = {
  status: 'idle' | 'pending' | 'valid' | 'missing' | 'error'
  province: Province | null
  district: District | null
  selection: TerritoryUrlSelection
}

// La sintaxis se normaliza antes de resolver. Solo un catálogo exitoso puede
// acreditar inexistencia; los errores conservan los códigos y los datos conocidos.
export function resolveExplorerTerritory(
  selection: TerritoryUrlSelection,
  provinces: Catalog<Province>,
  districts: Catalog<District>,
): TerritoryRestoration {
  const province = provinces.data?.find(item => item.ubigeo === selection.province) ?? null
  const base = { province, district: null, selection }
  if (!selection.province) return { ...base, status: 'idle' }
  if (!province) return provinces.status === 'success'
    ? { ...base, status: 'missing', selection: { province: null, district: null } }
    : { ...base, status: provinces.status === 'error' ? 'error' : 'pending' }
  if (!selection.district) return { ...base, status: 'valid' }
  const district = districts.data?.find(item => item.ubigeo === selection.district &&
    item.provincia_ubigeo === province.ubigeo && item.ubigeo.slice(0, 4) === province.ubigeo) ?? null
  if (district) return { ...base, district, status: 'valid' }
  return districts.status === 'success'
    ? { ...base, status: 'missing', selection: { province: province.ubigeo, district: null } }
    : { ...base, status: districts.status === 'error' ? 'error' : 'pending' }
}

// Esta función modifica solo provincia/distrito y conserva los demás parámetros.
export function withExplorerTerritory(params: URLSearchParams, selection: TerritoryUrlSelection): URLSearchParams {
  const normalized = readExplorerUrlState(new URLSearchParams({
    provincia: selection.province ?? '', distrito: selection.district ?? '',
  }))
  const next = new URLSearchParams(params)
  next.delete('provincia')
  next.delete('distrito')
  if (normalized.province) next.set('provincia', normalized.province)
  if (normalized.district) next.set('distrito', normalized.district)
  return next
}

export type ExplorerMapOptions = Pick<ExplorerUrlState, 'indicator' | 'round'>

// Normaliza opciones presentes y cambios explícitos, sin añadir valores por
// defecto a una URL vacía ni modificar territorios o parámetros ajenos.
export function withExplorerMapOptions(
  params: URLSearchParams, options: Partial<ExplorerMapOptions> = {},
): URLSearchParams {
  const next = new URLSearchParams(params)
  if (options.indicator !== undefined) next.set('indicador', options.indicator)
  if (options.round !== undefined) next.set('vuelta', String(options.round))
  const normalized = readExplorerUrlState(next)
  if (next.has('indicador')) next.set('indicador', normalized.indicator)
  if (next.has('vuelta')) next.set('vuelta', String(normalized.round))
  return next
}
