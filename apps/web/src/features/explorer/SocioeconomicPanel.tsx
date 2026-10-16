import { decimalFormat, idhFormat } from '../../lib/numberFormat'
import { useQuery } from '@tanstack/react-query'
import { socioeconomicsQueryOptions } from '../../data/socioeconomicsQuery'
import type { SocioeconomicData } from './socioeconomicData'

type State = { status: 'loading' } | { status: 'error' } | { status: 'success'; data: SocioeconomicData }
const decimal = decimalFormat
const index = idhFormat
const percentage = (value: number | null) => value === null ? 'No disponible' : `${decimal.format(value)} %`

export function SocioeconomicPanel({ districtUbigeo }: { districtUbigeo: string | null }) {
  if (!districtUbigeo || !/^20\d{4}$/.test(districtUbigeo)) {
    return <p className="mt-6 text-sm text-slate-600">Selecciona un distrito para consultar sus indicadores socioeconómicos</p>
  }
  return <DistrictIndicators key={districtUbigeo} ubigeo={districtUbigeo} />
}

function DistrictIndicators({ ubigeo }: { ubigeo: string }) {
  const query = useQuery(socioeconomicsQueryOptions(ubigeo))
  const state: State = query.isPending ? { status: 'loading' } : query.isError
    ? { status: 'error' } : { status: 'success', data: query.data }
  const poverty = state.status === 'success' ? state.data.pobreza : null
  const development = state.status === 'success' ? state.data.desarrollo : null

  return (
    <section aria-labelledby="socioeconomic-title" aria-busy={state.status === 'loading'} className="mt-6">
      <h2 id="socioeconomic-title" className="mb-4 text-lg font-semibold">Indicadores socioeconómicos · Distrito {ubigeo}</h2>
      {state.status === 'loading' && <p role="status">Cargando indicadores socioeconómicos…</p>}
      {state.status === 'error' && <p role="alert" className="text-sm text-rose-700">No se pudieron cargar los indicadores. Vuelve a seleccionar el distrito.</p>}
      {state.status === 'success' && (
        <>
          {!poverty && !development && <p role="status" className="mb-3 text-sm text-slate-600">No hay indicadores socioeconómicos disponibles para este distrito.</p>}
          <div className="grid gap-4 sm:grid-cols-3">
            <article className="rounded border border-slate-200 bg-white p-4">
              <h3 className="font-semibold">Pobreza estimada</h3>
              <p className="mt-2 text-lg font-semibold text-teal-700 tabular-nums">{percentage(poverty?.estimada ?? null)}</p>
              <p className="mt-1 text-xs text-slate-600">Fuente: INEI · Año de referencia: {poverty?.anio ?? 'No disponible'}</p>
              <p className="mt-1 text-sm text-slate-600">Punto medio del intervalo de pobreza.</p>
              <dl className="mt-3 text-sm">
                <div><dt>Límite inferior</dt><dd className="tabular-nums">{percentage(poverty?.inferior ?? null)}</dd></div>
                <div className="mt-2"><dt>Límite superior</dt><dd className="tabular-nums">{percentage(poverty?.superior ?? null)}</dd></div>
              </dl>
            </article>
            <article className="rounded border border-slate-200 bg-white p-4">
              <h3 className="font-semibold">Índice de Desarrollo Humano (IDH)</h3>
              <p className="mt-2 text-lg font-semibold text-teal-700 tabular-nums">{development?.idh == null ? 'No disponible' : index.format(development.idh)}</p>
              <p className="mt-1 text-xs text-slate-600">Fuente: PNUD · Año de referencia: {development?.anio ?? 'No disponible'}</p>
              <p className="mt-1 text-sm text-slate-600">Escala 0–1.</p>
            </article>
            <article className="rounded border border-slate-200 bg-white p-4">
              <h3 className="font-semibold">Ingreso familiar per cápita mensual</h3>
              <p className="mt-2 text-lg font-semibold text-teal-700 tabular-nums">{development?.ingreso == null ? 'No disponible' : `S/ ${decimal.format(development.ingreso)}`}</p>
              <p className="mt-1 text-xs text-slate-600">Fuente: PNUD · Año de referencia: {development?.anio ?? 'No disponible'}</p>
              <p className="mt-1 text-sm text-slate-600">Soles por persona al mes.</p>
            </article>
          </div>
          <p className="mt-3 text-xs text-slate-600">Cada indicador corresponde al año indicado por su fuente; puede diferir del año electoral 2021.</p>
        </>
      )}
    </section>
  )
}
