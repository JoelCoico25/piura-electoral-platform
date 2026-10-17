import { createNumberFormatter, decimalFormat, integerFormat } from '../../../lib/numberFormat'
import { electionsQueryOptions } from '../../../data/electionsQuery'
import { useQueries, useQuery } from '@tanstack/react-query'
import { districtsQueryOptions } from '../../../data/districtsQuery'
import { provincesQueryOptions } from '../../../data/provincesQuery'
import { regionalParticipation, regionalTerritorialScope } from '../regionalElectoralData'
import type { RegionalParticipation, RegionalTerritorialScope } from '../regionalElectoralData'

type MetricsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; data: RegionalParticipation }

const percentageFormat = decimalFormat
const variationFormat = createNumberFormatter({
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'always',
})

const RegionalElectoralMetrics = () => {
  const provincesQuery = useQuery(provincesQueryOptions)
  const provinces = provincesQuery.data
  const districtQueries = useQueries({ queries: (provinces ?? []).map(province => districtsQueryOptions(province.ubigeo)) })
  const electionsQuery = useQuery(electionsQueryOptions('20'))
  const state: MetricsState = provincesQuery.isError || electionsQuery.isError || districtQueries.some(query => query.isError) ? { status: 'error' }
    : provincesQuery.isPending || electionsQuery.isPending || districtQueries.some(query => query.isPending) ? { status: 'loading' }
      : { status: 'success', data: regionalParticipation(electionsQuery.data) }
  const scope: RegionalTerritorialScope | null = provinces && districtQueries.every(query => query.isSuccess)
    ? regionalTerritorialScope(provinces, districtQueries.map(query => query.data ?? [])) : null

  const metrics = state.status === 'success' ? [
    { label: 'Participación 1ª vuelta', value: state.data.firstRound, variation: false },
    { label: 'Participación 2ª vuelta', value: state.data.secondRound, variation: false },
    { label: 'Variación entre vueltas', value: state.data.variation, variation: true },
  ] : []

  return (
    <section
      aria-labelledby="regional-metrics-title"
      aria-busy={state.status === 'loading'}
      className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
    >
      <h2 id="regional-metrics-title" className="mb-4 text-lg font-semibold text-slate-900">
        Participación regional · Elecciones presidenciales 2021
      </h2>
      {state.status === 'loading' && <p role="status" className="text-sm text-slate-600">Cargando métricas regionales…</p>}
      {state.status === 'error' && <p role="alert" className="text-sm text-rose-700">No se pudieron cargar las métricas regionales. Inténtalo de nuevo al recargar la página.</p>}
      {state.status === 'success' && (
        <>
          {metrics.some(metric => metric.value === null) && (
            <p role="status" className="mb-4 text-sm text-slate-600">No hay datos disponibles para una o ambas vueltas de 2021.</p>
          )}
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded border border-slate-200 bg-white p-4">
              <dt className="text-xs font-medium tracking-wide text-slate-600 uppercase">Alcance territorial</dt>
              <dd className="mt-3 text-3xl font-bold tracking-tight text-teal-700 tabular-nums">
                {scope === null ? 'No disponible' : (
                  <>
                    <span className="block">{integerFormat.format(scope.provinces)} provincias</span>
                    <span className="mt-2 block text-base font-medium">
                      {scope.districts === null ? 'Distritos: No disponible' : `${integerFormat.format(scope.districts)} distritos`}
                    </span>
                  </>
                )}
              </dd>
            </div>
            {metrics.map(metric => (
              <div key={metric.label} className="rounded border border-slate-200 bg-white p-4">
                <dt className="text-xs font-medium tracking-wide text-slate-600 uppercase">{metric.label}</dt>
                <dd className="mt-3 text-3xl font-bold tracking-tight text-teal-700 tabular-nums">
                  {metric.value === null ? 'No disponible' : metric.variation
                    ? `${variationFormat.format(metric.value)} pp`
                    : `${percentageFormat.format(metric.value)} %`}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-slate-500">Agregado regional de Piura. Variación: segunda vuelta menos primera vuelta.</p>
        </>
      )}
    </section>
  )
}

export default RegionalElectoralMetrics
