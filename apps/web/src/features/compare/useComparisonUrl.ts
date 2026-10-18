import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { provincesQueryOptions } from '../../data/provincesQuery'
import { districtsQueryOptions } from '../../data/districtsQuery'
import { readComparisonUrlState } from '../../lib/territoryUrlState'
import type { ComparisonUrlState } from '../../lib/territoryUrlState'
import { resolveComparisonSide, withComparisonUrlState } from './comparisonUrl'
import type { ComparisonLevel, ComparisonSelection } from './ComparisonSelectors/ComparisonSelectors'

export function useComparisonUrl() {
  const [params, setParams] = useSearchParams()
  const requested = readComparisonUrlState(params)
  const provinces = useQuery(provincesQueryOptions)
  const provinceA = provinces.data?.find(item => item.ubigeo === requested.a.province)
  const provinceB = provinces.data?.find(item => item.ubigeo === requested.b.province)
  const districtsA = useQuery(districtsQueryOptions(requested.level === 'district' ? provinceA?.ubigeo ?? '' : ''))
  const districtsB = useQuery(districtsQueryOptions(requested.level === 'district' ? provinceB?.ubigeo ?? '' : ''))
  const a = resolveComparisonSide(requested.a, requested.level, provinces, districtsA)
  const b = resolveComparisonSide(requested.b, requested.level, provinces, districtsB)
  const state: ComparisonUrlState = { level: requested.level, a: a.selection, b: b.selection }
  const currentSearch = params.toString()
  const normalizedSearch = withComparisonUrlState(params, state).toString()

  // Una sola dirección: URL -> catálogos -> props. Este efecto solo normaliza.
  useEffect(() => {
    if (normalizedSearch !== currentSearch) {
      setParams(new URLSearchParams(normalizedSearch), { replace: true, preventScrollReset: true })
    }
  }, [normalizedSearch, currentSearch, setParams])

  const navigate = (nextState: ComparisonUrlState) => {
    const next = withComparisonUrlState(params, nextState)
    if (next.toString() !== currentSearch) setParams(next, { preventScrollReset: true })
  }

  const selectLevel = (level: ComparisonLevel) => {
    if (level === requested.level) return
    navigate({ level, a: { province: null, district: null }, b: { province: null, district: null } })
  }

  const selectTerritory = (side: 'a' | 'b', selected: ComparisonSelection) => {
    const province = selected.province
      ? provinces.data?.find(item => item.ubigeo === selected.province?.ubigeo) : null
    if (selected.province && !province) return
    const districts = side === 'a' ? districtsA : districtsB
    const district = selected.district ? districts.data?.find(item => item.ubigeo === selected.district?.ubigeo &&
      item.provincia_ubigeo === province?.ubigeo && item.ubigeo.slice(0, 4) === province?.ubigeo) : null
    if (selected.district && !district) return
    const selection = { province: province?.ubigeo ?? null, district: district?.ubigeo ?? null }
    const other = state[side === 'a' ? 'b' : 'a']
    const code = state.level === 'province' ? selection.province : selection.district
    if (code && code === (state.level === 'province' ? other.province : other.district)) return
    // Se preservan también los códigos del otro lado aún pendientes de catálogo.
    navigate({ ...state, [side]: selection })
  }

  return { level: requested.level, selections: { a: a.value, b: b.value },
    statuses: { a: a.status, b: b.status }, selectLevel, selectTerritory }
}
