import { decimalFormat } from '../../lib/numberFormat'
import { useEffect, useMemo, useState } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { provinceGeometryQueryOptions, districtGeometryQueryOptions } from '../../data/geometryQueries'
import { geoJSON } from 'leaflet'
import { GeoJSON, MapContainer, Tooltip, useMap } from 'react-leaflet'
import { electionsQueryOptions } from '../../data/electionsQuery'
import { participationColor, participationIntervals } from './participationScale'
import { districtIndicators, indicatorValue, indicatorYear, indicatorColor, formatIndicator } from './districtIndicator'
import type { DistrictIndicator } from './districtIndicator'
import { socioeconomicsQueryOptions } from '../../data/socioeconomicsQuery'
import type { SocioeconomicData } from './socioeconomicData'
import 'leaflet/dist/leaflet.css'
import type { ProvinceGeometry } from './provinceGeometry'
import type { Territory } from './territorialData'

type MapState = { status: 'loading' } | { status: 'error' } | { status: 'success'; data: ProvinceGeometry; boundsData: ProvinceGeometry }
const povertyFormat = decimalFormat
const povertyPercentage = (value: number | null) => value === null ? 'No disponible' : `${povertyFormat.format(value)} %`

type MapProps = {
  selectedProvinceId: string
  selectedDistrictId: string
  onProvinceChange: (province: Territory) => void
  onDistrictChange: (district: Territory) => void
}

export function ProvinceMap(props: MapProps) {
  const [round, setRound] = useState(1)
  const [districtIndicator, setDistrictIndicator] = useState<DistrictIndicator>('poverty')
  const provincesQuery = useQuery(provinceGeometryQueryOptions)
  const provinces = provincesQuery.data
  const electionQueries = useQueries({ queries: (provinces?.features ?? []).map(feature => electionsQueryOptions(feature.properties.ubigeo)) })
  const participationLoading = provincesQuery.isPending || electionQueries.some(query => query.isPending)
  const values = Object.fromEntries((provinces?.features ?? []).map((feature, index) => {
    const query = electionQueries[index]
    return [feature.properties.ubigeo, query?.isSuccess ? query.data.find(result => result.vuelta === round)?.participacion_pct ?? null : null]
  })) as Record<string, number | null>
  return (
    <>
      {!props.selectedProvinceId && (
        <div className="mt-6">
          <label htmlFor="map-round" className="mr-3 text-sm font-medium">Participación presidencial 2021</label>
          <select id="map-round" value={round} onChange={event => setRound(Number(event.target.value))} className="rounded border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-teal-700">
            <option value={1}>Primera vuelta</option><option value={2}>Segunda vuelta</option>
          </select>
          {participationLoading ? <p role="status" className="mt-2 text-sm">Cargando participación provincial…</p> :
            (Object.keys(values).length !== 8 || Object.values(values).some(value => value === null)) && <p role="status" className="mt-2 text-sm text-slate-600">Cobertura incompleta: las provincias sin datos se muestran en gris como No disponible.</p>}
          <div aria-label="Leyenda de participación" className="mt-3 text-xs text-slate-600">
            <p className="mb-2 font-semibold">Participación (%) · 2021 · {round}ª vuelta</p>
            <ul className="flex flex-wrap gap-3">
              {[...participationIntervals, { label: 'No disponible', color: '#cbd5e1' }].map(interval => <li key={interval.label} className="flex items-center gap-1"><span aria-hidden="true" className="inline-block size-3 border border-slate-300" style={{ backgroundColor: interval.color }} />{interval.label}</li>)}
            </ul>
          </div>
        </div>
      )}
      {props.selectedProvinceId && <div className="mt-6">
        <label htmlFor="district-indicator" className="mr-3 text-sm font-medium">Indicador distrital</label>
        <select id="district-indicator" value={districtIndicator} onChange={event => {
          const value = event.target.value
          if (value === 'poverty' || value === 'idh' || value === 'income') setDistrictIndicator(value)
        }} className="rounded border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-teal-700">
          <option value="poverty">Pobreza estimada</option><option value="idh">IDH</option><option value="income">Ingreso familiar per cápita mensual</option>
        </select>
      </div>}
      <TerritorialMap {...props} participation={values} round={round} districtIndicator={districtIndicator} />
    </>
  )
}

function MapBounds({ geometry }: { geometry: ProvinceGeometry | null }) {
  const map = useMap()
  useEffect(() => {
    if (!geometry || geometry.features.length === 0) return
    const bounds = geoJSON(geometry).getBounds()
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [24, 24], animate: false })
  }, [map, geometry])
  return null
}

function TerritorialMap({ selectedProvinceId, selectedDistrictId, onProvinceChange, onDistrictChange, participation, round, districtIndicator }: MapProps & { participation: Record<string, number | null>; round: number; districtIndicator: DistrictIndicator }) {
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
                attribution="Fuente: INEI · Límites publicados al 2023"
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
