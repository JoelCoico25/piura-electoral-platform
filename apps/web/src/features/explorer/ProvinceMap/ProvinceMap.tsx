import { useState } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { provinceGeometryQueryOptions } from '../../../data/geometryQueries'
import { electionsQueryOptions } from '../../../data/electionsQuery'
import { participationIntervals } from '../participationScale'
import type { DistrictIndicator } from '../districtIndicator'
import TerritorialMap from '../TerritorialMap/TerritorialMap'
import type { MapProps } from '../TerritorialMap/TerritorialMap'

const ProvinceMap = (props: MapProps) => {
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

export default ProvinceMap
