import { queryOptions } from '@tanstack/react-query'

export type District = { ubigeo: string; provincia_ubigeo: string; nombre: string }

function isDistrict(value: unknown): value is District {
  return typeof value === 'object' && value !== null &&
    'ubigeo' in value && typeof value.ubigeo === 'string' && /^20\d{4}$/.test(value.ubigeo) &&
    'provincia_ubigeo' in value && typeof value.provincia_ubigeo === 'string' && /^20\d{2}$/.test(value.provincia_ubigeo) &&
    value.ubigeo.slice(0, 4) === value.provincia_ubigeo &&
    'nombre' in value && typeof value.nombre === 'string'
}

async function fetchDistricts(provinceUbigeo: string, signal: AbortSignal): Promise<District[]> {
  if (!/^20\d{2}$/.test(provinceUbigeo)) throw new Error('Provincia fuera de Piura')
  const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')
  const response = await fetch(`${baseUrl}/api/v1/provincias/${provinceUbigeo}/distritos`, { signal })
  if (!response.ok) throw new Error('No se pudieron obtener los distritos')
  const data: unknown = await response.json()
  if (!Array.isArray(data) || !data.every(isDistrict)) throw new Error('Respuesta de distritos inválida')
  const districts: District[] = data
  if (districts.some(district => district.provincia_ubigeo !== provinceUbigeo)) throw new Error('Distrito de otra provincia')
  return [...new Map(districts.map(district => [district.ubigeo, district])).values()]
}

export function districtsQueryOptions(provinceUbigeo: string) {
  return queryOptions({
    queryKey: ['territories', 'districts', provinceUbigeo],
    queryFn: ({ signal }) => fetchDistricts(provinceUbigeo, signal),
    enabled: /^20\d{2}$/.test(provinceUbigeo),
  })
}
