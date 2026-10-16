import { queryOptions } from '@tanstack/react-query'
import { fetchSocioeconomicData } from '../features/explorer/socioeconomicData'

export function socioeconomicsQueryOptions(ubigeo: string) {
  return queryOptions({
    queryKey: ['territories', 'socioeconomics', ubigeo],
    queryFn: ({ signal }) => fetchSocioeconomicData(ubigeo, signal),
    enabled: /^20\d{4}$/.test(ubigeo),
  })
}
