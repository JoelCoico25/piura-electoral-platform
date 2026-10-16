import { queryOptions } from '@tanstack/react-query'

export type Province = { ubigeo: string; departamento_ubigeo: string; nombre: string }

function isProvince(value: unknown): value is Province {
  return typeof value === 'object' && value !== null &&
    'ubigeo' in value && typeof value.ubigeo === 'string' && /^\d{4}$/.test(value.ubigeo) &&
    'departamento_ubigeo' in value && typeof value.departamento_ubigeo === 'string' && /^\d{2}$/.test(value.departamento_ubigeo) &&
    value.ubigeo.startsWith(value.departamento_ubigeo) &&
    'nombre' in value && typeof value.nombre === 'string'
}

async function fetchPiuraProvinces(signal: AbortSignal): Promise<Province[]> {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')
  const response = await fetch(`${baseUrl}/api/v1/provincias`, { signal })
  if (!response.ok) throw new Error('No se pudieron obtener las provincias')
  const data: unknown = await response.json()
  if (!Array.isArray(data) || !data.every(isProvince)) throw new Error('Respuesta de provincias inválida')
  const provinces: Province[] = data
  return [...new Map(provinces.filter(province => province.departamento_ubigeo === '20')
    .map(province => [province.ubigeo, province])).values()]
}

export const provincesQueryOptions = queryOptions({
  queryKey: ['territories', 'provinces', '20'],
  queryFn: ({ signal }) => fetchPiuraProvinces(signal),
})
