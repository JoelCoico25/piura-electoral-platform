import { decimalFormat } from '../../../lib/numberFormat'
import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { provinceGeometryQueryOptions, districtGeometryQueryOptions } from '../../../data/geometryQueries'
import { GeoJSON, MapContainer, Tooltip } from 'react-leaflet'
import { participationColor } from '../participationScale'
import { districtIndicators, indicatorValue, indicatorYear, indicatorColor, formatIndicator } from '../districtIndicator'
import type { DistrictIndicator } from '../districtIndicator'
import { socioeconomicsQueryOptions } from '../../../data/socioeconomicsQuery'
import type { SocioeconomicData } from '../socioeconomicData'
import 'leaflet/dist/leaflet.css'
import type { ProvinceGeometry } from '../provinceGeometry'
import type { Territory } from '../territorialData'
import MapBounds from '../MapBounds/MapBounds'

type MapState = { status: 'loading' } | { status: 'error' } | { status: 'success'; data: ProvinceGeometry; boundsData: ProvinceGeometry }
const povertyFormat = decimalFormat
const povertyPercentage = (value: number | null) => value === null ? 'No disponible' : `${povertyFormat.format(value)} %`

export type MapProps = {
  selectedProvinceId: string
  selectedDistrictId: string
  onProvinceChange: (province: Territory) => void
  onDistrictChange: (district: Territory) => void
}

const TerritorialMap = ({ selectedProvinceId, selectedDistrictId, onProvinceChange, onDistrictChange, participation, round, districtIndicator }: MapProps & { participation: Record<string, number | null>; round: number; districtIndicator: DistrictIndicator }) => {
  const provincesQuery = useQuery(provinceGeometryQueryOptions)
  const districtsQuery = useQuery({ ...districtGeometryQueryOptions, enabled: Boolean(selectedProvinceId) })
  const provinces = provincesQuery.data
  const districts = districtsQuery.data
  const geometry = useMemo(() => {
    if (!provinces) return null
    if (!selectedProvinceId) return { data: provinces, boundsData: provinces }
    if (!districts) return null
    const boundsData: ProvinceGeometry = { type: 'FeatureCollection', features: provinces.features.filter(feature => feature.properties.ubigeo === selectedProvinceId) }
    const data: ProvinceGeometry = { type: 'FeatureCollection', features: districts.features.filter(feature => feature.properties.provincia_ubigeo === selectedProvinceId) }
    return { data, boundsData }
  }, [provinces, districts, selectedProvinceId])
  const districtFeatures = selectedProvinceId ? geometry?.data.features ?? [] : []
  const socioeconomicQueries = useQueries({ queries: districtFeatures.map(feature => socioeconomicsQueryOptions(feature.properties.ubigeo)) })
  const indicators: Record<string, SocioeconomicData | null> = Object.fromEntries(districtFeatures.map((feature, index) => {
    const query = socioeconomicQueries[index]
    return [feature.properties.ubigeo, query?.isSuccess ? query.data : null]
  }))
  const indicatorsLoading = socioeconomicQueries.some(query => query.isPending)
  const state: MapState = provincesQuery.isError || (selectedProvinceId && districtsQuery.isError) || (geometry && selectedProvinceId && geometry.boundsData.features.length === 0)
    ? { status: 'error' }
    : !geometry || (selectedProvinceId && indicatorsLoading)
      ? { status: 'loading' }
      : { status: 'success', ...geometry }
  const configuration = districtIndicators[districtIndicator]
  const years = [...new Set(Object.values(indicators ?? {}).flatMap(data => {
    const year = indicatorYear(data, districtIndicator)
    return year === null ? [] : [year]
  }))].sort()
  const incomplete = state.status === 'success' && state.data.features.some(feature => indicatorValue(indicators?.[feature.properties.ubigeo] ?? null, districtIndicator) === null)

  return (
    <section aria-labelledby="province-map-title" aria-busy={state.status === 'loading'} className="mt-6">
      <h2 id="province-map-title" className="mb-3 text-lg font-semibold">{selectedProvinceId ? 'Mapa distrital de la provincia seleccionada' : 'Mapa provincial de Piura'}</h2>
      {state.status === 'loading' && <p role="status">Cargando cartografía {selectedProvinceId ? 'distrital' : 'provincial'}…</p>}
      {state.status === 'error' && <p role="alert" className="text-sm text-rose-700">No se pudo cargar el mapa. Cambia la provincia o recarga la página para intentarlo de nuevo.</p>}
      {state.status === 'success' && state.data.features.length === 0 && <p role="status">No hay geometrías disponibles para este territorio.</p>}
      {selectedProvinceId && state.status === 'success' && state.data.features.length > 0 && (
        <div aria-label="Leyenda del indicador distrital" className="mb-3 text-xs text-slate-600">
          <p className="mb-2 font-semibold">{configuration.name} · {configuration.unit} · Fuente: {configuration.source} · {years.length === 0 ? 'Año de referencia: No disponible' : years.length === 1 ? `Año de referencia: ${years[0]}` : `Años de referencia diferentes entre distritos: ${years.join(', ')}`}</p>
          <ul className="flex flex-wrap gap-3">
            {[...configuration.intervals, { label: 'No disponible', color: '#cbd5e1' }].map(interval => <li key={interval.label} className="flex items-center gap-1"><span aria-hidden="true" className="inline-block size-3 border border-slate-300" style={{ backgroundColor: interval.color }} />{interval.label}</li>)}
          </ul>
          {incomplete && <p role="status" className="mt-2">Cobertura distrital incompleta: los distritos sin datos válidos para el indicador se muestran en gris como No disponible.</p>}
        </div>
      )}
      <div role="region" aria-label={selectedProvinceId ? 'Mapa de distritos de la provincia seleccionada' : 'Mapa de las provincias de Piura'} className="relative isolate overflow-hidden rounded border border-slate-200">
        <MapContainer
          center={[-5, -80]}
          zoom={7}
          scrollWheelZoom={false}
          className="h-80 w-full bg-slate-100 sm:h-[440px]"
        >
          <MapBounds geometry={state.status === 'success' ? state.boundsData : null} />
          {(state.status === 'success' ? state.data.features : []).map(feature => {
            const code = feature.properties.ubigeo
            const selected = code === (selectedProvinceId ? selectedDistrictId : selectedProvinceId)
            const value = participation[code] ?? null
            const data = indicators?.[code] ?? null
            const indicator = data?.pobreza ?? null
            return (
              <GeoJSON
                key={code}
                data={feature}
                style={{ color: '#0f766e', weight: selected ? 3 : 1.5,
                  fillColor: selectedProvinceId ? indicatorColor(indicatorValue(data, districtIndicator), districtIndicator) : participationColor(value),
                  fillOpacity: 0.85 }}
                attribution='Fuente: <a href="https://www.datosabiertos.gob.pe/dataset/limites-departamentales" target="_blank" rel="noopener noreferrer">IGN (atributo fuente: INEI)</a> · <a href="https://opendatacommons.org/licenses/by/1-0/" target="_blank" rel="noopener noreferrer">ODC-By</a> · Piura: filtro y conversión; provincias por unión distrital'
                eventHandlers={{ click: () => {
                  const territory = { ubigeo: code, nombre: feature.properties.nombre }
                  if (selectedProvinceId) onDistrictChange(territory)
                  else onProvinceChange(territory)
                } }}
              >
                <Tooltip sticky>
                  {feature.properties.nombre}
                  {selectedProvinceId && <span><br />{configuration.name}: {formatIndicator(indicatorValue(data, districtIndicator), districtIndicator)}
                    {districtIndicator === 'poverty' && <><br />Límite inferior: {povertyPercentage(indicator?.inferior ?? null)}<br />Límite superior: {povertyPercentage(indicator?.superior ?? null)}</>}
                    <br />{configuration.source} · Año de referencia: {indicatorYear(data, districtIndicator) ?? 'No disponible'}</span>}
                  {!selectedProvinceId && ` · Participación ${round}ª vuelta 2021: ${value === null ? 'No disponible' : decimalFormat.format(value) + ' %'}`}
                </Tooltip>
              </GeoJSON>
            )
          })}
        </MapContainer>
      </div>
      <p className="mt-2 text-xs text-slate-600">Pasa el cursor sobre {selectedProvinceId ? 'un distrito' : 'una provincia'} para ver su nombre.</p>
    </section>
  )
}

export default TerritorialMap
