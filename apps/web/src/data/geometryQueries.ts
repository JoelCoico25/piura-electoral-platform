import { queryOptions } from '@tanstack/react-query'
import { fetchProvinceGeometry, fetchDistrictGeometry } from '../features/explorer/provinceGeometry'

const geometryCacheTimes = {
  staleTime: 24 * 60 * 60 * 1000,
  gcTime: 48 * 60 * 60 * 1000,
}

export const provinceGeometryQueryOptions = queryOptions({
  queryKey: ['geometry', 'piura', 'provinces'],
  queryFn: ({ signal }) => fetchProvinceGeometry(signal),
  ...geometryCacheTimes,
})

export const districtGeometryQueryOptions = queryOptions({
  queryKey: ['geometry', 'piura', 'districts'],
  queryFn: ({ signal }) => fetchDistrictGeometry(signal),
  ...geometryCacheTimes,
})
