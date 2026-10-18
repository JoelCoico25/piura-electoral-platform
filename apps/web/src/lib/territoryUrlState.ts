import type { ComparisonLevel } from '../features/compare/ComparisonSelectors/ComparisonSelectors'
import type { DistrictIndicator } from '../features/explorer/districtIndicator'

export type TerritoryUrlSelection = {
  province: string | null
  district: string | null
}

export type ExplorerUrlState = TerritoryUrlSelection & {
  indicator: DistrictIndicator
  round: 1 | 2
}

export type ComparisonUrlState = {
  level: ComparisonLevel
  a: TerritoryUrlSelection
  b: TerritoryUrlSelection
}

// Validación exclusivamente sintáctica: estos códigos aún requieren comprobar
// existencia contra los catálogos. No se obtienen nombres ni se hacen peticiones.
function selection(province: string | null, district: string | null): TerritoryUrlSelection {
  const validProvince = province?.length === 4 && /^20\d{2}$/.test(province) ? province : null
  const validDistrict = district?.length === 6 && /^20\d{4}$/.test(district) ? district : null
  const resolvedProvince = validProvince ?? validDistrict?.slice(0, 4) ?? null
  return {
    province: resolvedProvince,
    district: validDistrict?.slice(0, 4) === resolvedProvince ? validDistrict : null,
  }
}

// URLSearchParams.get elige siempre la primera aparición, incluso si es vacía
// o inválida. Las opciones desconocidas usan los valores iniciales de la UI.
export function readExplorerUrlState(params: URLSearchParams): ExplorerUrlState {
  const indicator = params.get('indicador')
  return {
    ...selection(params.get('provincia'), params.get('distrito')),
    indicator: indicator === 'idh' || indicator === 'income' ? indicator : 'poverty',
    round: params.get('vuelta') === '2' ? 2 : 1,
  }
}

export function readComparisonUrlState(params: URLSearchParams): ComparisonUrlState {
  const level = params.get('nivel') === 'district' ? 'district' : 'province'
  const a = selection(params.get('provinciaA'), level === 'district' ? params.get('distritoA') : null)
  const b = selection(params.get('provinciaB'), level === 'district' ? params.get('distritoB') : null)
  if (level === 'province' && a.province !== null && a.province === b.province) b.province = null
  if (level === 'district' && a.district !== null && a.district === b.district) b.district = null
  return { level, a, b }
}

function setSelection(params: URLSearchParams, value: TerritoryUrlSelection, suffix = ''): void {
  if (value.province !== null) params.set(`provincia${suffix}`, value.province)
  if (value.district !== null) params.set(`distrito${suffix}`, value.district)
}

// Devuelven solo los parámetros propios de la página, sin '?' ni parámetros
// desconocidos. La lectura normaliza también entradas incoherentes al escribir.
export function serializeExplorerUrlState(state: ExplorerUrlState): string {
  const input = new URLSearchParams()
  setSelection(input, state)
  input.set('indicador', state.indicator)
  input.set('vuelta', String(state.round))
  const normalized = readExplorerUrlState(input)
  const params = new URLSearchParams()
  setSelection(params, normalized)
  params.set('indicador', normalized.indicator)
  params.set('vuelta', String(normalized.round))
  return params.toString()
}

export function serializeComparisonUrlState(state: ComparisonUrlState): string {
  const input = new URLSearchParams({ nivel: state.level })
  setSelection(input, state.a, 'A')
  setSelection(input, state.b, 'B')
  const normalized = readComparisonUrlState(input)
  const params = new URLSearchParams({ nivel: normalized.level })
  setSelection(params, normalized.a, 'A')
  setSelection(params, normalized.b, 'B')
  return params.toString()
}
