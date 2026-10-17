import { decimalFormat, integerFormat } from '../../../lib/numberFormat'
import { useQuery } from '@tanstack/react-query'
import { electionsQueryOptions } from '../../../data/electionsQuery'
import type { ElectoralResult } from '../electoralData'
import type { Territory } from '../territorialData'

type ResultsState = { status: 'loading' } | { status: 'error' } | { status: 'success'; results: ElectoralResult[] }
const percentage = decimalFormat
const count = integerFormat

const ElectoralResultsPanel = ({ territory }: { territory: Territory }) => {
  const query = useQuery(electionsQueryOptions(territory.ubigeo))
  const state: ResultsState = query.isPending ? { status: 'loading' } : query.isError
    ? { status: 'error' } : { status: 'success', results: query.data }

  return (
    <section aria-labelledby="electoral-results-title" aria-busy={state.status === 'loading'} className="mt-6">
      <h2 id="electoral-results-title" className="mb-4 min-h-14 text-lg font-semibold">
        Resultados electorales 2021 · {territory.ubigeo.length === 4 ? 'Provincia' : 'Distrito'} {territory.nombre} (UBIGEO {territory.ubigeo})
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map(round => {
          const result = state.status === 'success' ? state.results.find(row => row.vuelta === round) : undefined
          const unavailable = state.status === 'loading' ? 'Cargando…' : 'No disponible'
          const message = state.status === 'error'
            ? 'No se pudieron cargar los resultados. Vuelve a seleccionar el territorio.'
            : state.status === 'success' && !result ? 'No hay resultados disponibles para esta vuelta.' : ''
          return (
            <article key={round} className="rounded border border-slate-200 bg-white p-4">
              <h3 className="mb-3 font-semibold">{round}ª vuelta presidencial · 2021</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Participación', !result ? unavailable : result.participacion_pct === null ? 'No disponible' : `${percentage.format(result.participacion_pct)} %`],
                  ['Ausentismo', !result ? unavailable : result.ausentismo_pct === null ? 'No disponible' : `${percentage.format(result.ausentismo_pct)} %`],
                  ['Electores hábiles', result ? count.format(result.electores_habiles) : unavailable],
                  ['Votantes', result ? count.format(result.votantes) : unavailable],
                ].map(([label, value]) => (
                  <div key={label}><dt className="text-slate-600">{label}</dt><dd className="mt-1 min-h-5 font-semibold text-teal-700 tabular-nums">{value}</dd></div>
                ))}
              </dl>
              <p role={state.status === 'error' ? 'alert' : 'status'} className="mt-2 min-h-10 text-sm text-slate-600">
                {message}
                {state.status === 'loading' && <span className="sr-only">Cargando resultados electorales…</span>}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default ElectoralResultsPanel
