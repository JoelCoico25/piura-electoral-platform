import { indicatorColor, indicatorValue } from './districtIndicator'
import type { DistrictIndicator } from './districtIndicator'
import type { SocioeconomicData } from './socioeconomicData'

type DistrictQuery = {
  status: 'pending' | 'error' | 'success'
  data?: SocioeconomicData
}

export const pendingDistrictColor = '#e2e8f0'

export function districtIndicatorState(query: DistrictQuery | undefined, indicator: DistrictIndicator) {
  if (query?.status === 'error') return 'error'
  if (query?.status !== 'success') return 'loading'
  return indicatorValue(query.data ?? null, indicator) === null ? 'missing' : 'available'
}

// Las escalas fijas no cambian. Se espera al conjunto antes de aplicar rellenos
// temáticos; la geometría y las interacciones no dependen de esta espera.
export function districtFillColor(
  query: DistrictQuery | undefined, indicator: DistrictIndicator, waitingForOthers: boolean,
) {
  const state = districtIndicatorState(query, indicator)
  if (state === 'missing' || state === 'error') return '#cbd5e1'
  if (state === 'loading' || waitingForOthers) return pendingDistrictColor
  return indicatorColor(indicatorValue(query?.data ?? null, indicator), indicator)
}
