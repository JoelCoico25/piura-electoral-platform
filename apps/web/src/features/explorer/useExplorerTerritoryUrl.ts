import { useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { provincesQueryOptions } from '../../data/provincesQuery'
import { districtsQueryOptions } from '../../data/districtsQuery'
import { readExplorerUrlState } from '../../lib/territoryUrlState'
import { resolveExplorerTerritory, withExplorerTerritory, withExplorerMapOptions } from './explorerTerritoryUrl'
import type { ExplorerMapOptions } from './explorerTerritoryUrl'
import type { Territory } from './territorialData'
import type { TerritoryUrlSelection } from '../../lib/territoryUrlState'

export function useExplorerTerritoryUrl() {
  const [params, setParams] = useSearchParams()
  const requested = readExplorerUrlState(params)
  const provinces = useQuery(provincesQueryOptions)
  const knownProvince = provinces.data?.find(item => item.ubigeo === requested.province)
  // Nunca consultar el catálogo distrital a partir de un código solo sintáctico.
  const districts = useQuery(districtsQueryOptions(knownProvince?.ubigeo ?? ''))
  const restoration = resolveExplorerTerritory(requested, provinces, districts)
  const currentSearch = params.toString()
  const normalizedSearch = withExplorerMapOptions(withExplorerTerritory(params, restoration.selection)).toString()

  // Único efecto de normalización; no hay copia de la selección en useState.
  useEffect(() => {
    if (normalizedSearch !== currentSearch) {
      setParams(new URLSearchParams(normalizedSearch), { replace: true, preventScrollReset: true })
    }
  }, [currentSearch, normalizedSearch, setParams])

  const navigateSelection = useCallback((selection: TerritoryUrlSelection) => {
    const next = withExplorerTerritory(params, selection)
    if (next.toString() !== currentSearch) setParams(next, { preventScrollReset: true })
  }, [params, currentSearch, setParams])

  const selectProvince = useCallback((selected: Territory | null) => {
    if (selected && !provinces.data?.some(item => item.ubigeo === selected.ubigeo)) return
    navigateSelection({ province: selected?.ubigeo ?? null, district: null })
  }, [provinces.data, navigateSelection])

  const selectDistrict = useCallback((selected: Territory | null) => {
    if (selected && !districts.data?.some(item => item.ubigeo === selected.ubigeo &&
      item.provincia_ubigeo === knownProvince?.ubigeo)) return
    navigateSelection({ province: knownProvince?.ubigeo ?? null, district: selected?.ubigeo ?? null })
  }, [districts.data, knownProvince?.ubigeo, navigateSelection])

  const selectMapOptions = useCallback((options: Partial<ExplorerMapOptions>) => {
    const next = withExplorerMapOptions(withExplorerTerritory(params, restoration.selection), options)
    if (next.toString() !== currentSearch) setParams(next, { preventScrollReset: true })
  }, [params, restoration.selection, currentSearch, setParams])

  return { ...restoration, selectProvince, selectDistrict,
    indicator: requested.indicator, round: requested.round, selectMapOptions }
}
