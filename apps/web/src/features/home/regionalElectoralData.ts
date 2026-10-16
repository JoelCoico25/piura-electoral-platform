import type { District } from '../../data/districtsQuery'
import type { Province } from '../../data/provincesQuery'

import type { ElectoralResult } from '../explorer/electoralData'

export type RegionalParticipation = {
  firstRound: number | null
  secondRound: number | null
  variation: number | null
}

export type RegionalTerritorialScope = {
  provinces: number
  districts: number | null
}

export function regionalTerritorialScope(
  provinces: readonly Province[],
  districtLists: readonly (readonly District[])[],
): RegionalTerritorialScope | null {
  if (provinces.length === 0) return null
  return {
    provinces: provinces.length,
    districts: districtLists.some(districts => districts.length === 0)
      ? null
      : new Set(districtLists.flat().map(district => district.ubigeo)).size,
  }
}

export function regionalParticipation(results: readonly ElectoralResult[]): RegionalParticipation {
  const firstRound = results.find(row => row.anio === 2021 && row.vuelta === 1)?.participacion_pct ?? null
  const secondRound = results.find(row => row.anio === 2021 && row.vuelta === 2)?.participacion_pct ?? null
  return {
    firstRound,
    secondRound,
    variation: firstRound === null || secondRound === null ? null : secondRound - firstRound,
  }
}
