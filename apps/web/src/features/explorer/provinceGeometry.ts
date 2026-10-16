import type { FeatureCollection, MultiPolygon } from 'geojson'

export type ProvinceGeometry = FeatureCollection<MultiPolygon, { ubigeo: string; nombre: string }>
export type DistrictGeometry = FeatureCollection<MultiPolygon, { ubigeo: string; nombre: string; provincia_ubigeo: string }>

async function fetchGeometry(signal: AbortSignal, districts: boolean): Promise<ProvinceGeometry> {
  const response = await fetch(`${import.meta.env.BASE_URL}geo/piura-${districts ? 'distritos' : 'provincias'}.geojson`, { signal })
  if (!response.ok) throw new Error('No se pudo cargar la cartografía')
  const data: unknown = await response.json()
  if (typeof data !== 'object' || data === null || !('type' in data) || data.type !== 'FeatureCollection' ||
    !('features' in data) || !Array.isArray(data.features)) throw new Error('GeoJSON inválido')
  const codes = new Set<string>()
  for (const feature of data.features as unknown[]) {
    if (typeof feature !== 'object' || feature === null ||
      !('type' in feature) || feature.type !== 'Feature' || !('properties' in feature) ||
      typeof feature.properties !== 'object' || feature.properties === null ||
      !('ubigeo' in feature.properties) || typeof feature.properties.ubigeo !== 'string' ||
      !(districts ? /^20\d{4}$/ : /^20\d{2}$/).test(feature.properties.ubigeo) || codes.has(feature.properties.ubigeo) ||
      !('nombre' in feature.properties) || typeof feature.properties.nombre !== 'string' ||
      !('geometry' in feature) || typeof feature.geometry !== 'object' || feature.geometry === null ||
      !('type' in feature.geometry) || feature.geometry.type !== 'MultiPolygon' ||
      !('coordinates' in feature.geometry) || !Array.isArray(feature.geometry.coordinates)) throw new Error('Provincia inválida')
    if (districts && (!('provincia_ubigeo' in feature.properties) ||
      feature.properties.provincia_ubigeo !== feature.properties.ubigeo.slice(0, 4))) throw new Error('Pertenencia distrital inválida')
    for (const polygon of feature.geometry.coordinates as unknown[]) {
      if (!Array.isArray(polygon) || polygon.length === 0) throw new Error('Polígono vacío')
      for (const ring of polygon as unknown[]) {
        if (!Array.isArray(ring) || ring.length < 4 || !ring.every((point: unknown) =>
          Array.isArray(point) && point.length === 2 && point.every((value: unknown) => typeof value === 'number' && Number.isFinite(value)) &&
          point[0] >= -180 && point[0] <= 180 && point[1] >= -90 && point[1] <= 90)) throw new Error('Coordenadas inválidas')
        if (JSON.stringify(ring[0]) !== JSON.stringify(ring.at(-1))) throw new Error('Anillo abierto')
      }
    }
    if (feature.geometry.coordinates.length === 0) throw new Error('Geometría vacía')
    codes.add(feature.properties.ubigeo)
  }
  if (codes.size !== 0 && codes.size !== (districts ? 65 : 8)) throw new Error('Catálogo territorial incompleto')
  return data as ProvinceGeometry
}

export function fetchProvinceGeometry(signal: AbortSignal) {
  return fetchGeometry(signal, false)
}

export async function fetchDistrictGeometry(signal: AbortSignal): Promise<DistrictGeometry> {
  return await fetchGeometry(signal, true) as DistrictGeometry
}
