import { queryOptions } from '@tanstack/react-query'
import { fetchTerritoryElections } from '../features/explorer/electoralData'

export function electionsQueryOptions(ubigeo: string) {
  return queryOptions({
    queryKey: ['territories', 'elections', ubigeo],
    queryFn: ({ signal }) => fetchTerritoryElections(ubigeo, signal),
    enabled: /^20(\d{2})?(\d{2})?$/.test(ubigeo),
  })
}
