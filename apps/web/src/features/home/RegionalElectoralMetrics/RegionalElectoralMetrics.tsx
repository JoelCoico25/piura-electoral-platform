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
  const state: MetricsState = electionsQuery.isError ? { status: 'error' }
    : electionsQuery.isPending ? { status: 'loading' }
      : { status: 'success', data: regionalParticipation(electionsQuery.data) }
  const scopeStatus = provincesQuery.isError || districtQueries.some(query => query.isError) ? 'error'
    : provincesQuery.isPending || districtQueries.some(query => query.isPending) ? 'loading' : 'success'
  const scope: RegionalTerritorialScope | null = provinces && scopeStatus === 'success'
    ? regionalTerritorialScope(provinces, districtQueries.map(query => query.data ?? [])) : null

  const metrics = [
    { label: 'Participación 1ª vuelta', value: state.status === 'success' ? state.data.firstRound : null, variation: false },
    { label: 'Participación 2ª vuelta', value: state.status === 'success' ? state.data.secondRound : null, variation: false },
    { label: 'Variación entre vueltas', value: state.status === 'success' ? state.data.variation : null, variation: true },
  ]

  return (
    <section
      aria-labelledby="regional-metrics-title"
      className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
    >
      <h2 id="regional-metrics-title" className="mb-4 text-lg font-semibold text-slate-900">
        Participación regional · Elecciones presidenciales 2021
      </h2>
      {scopeStatus === 'loading' && <p role="status" className="text-sm text-slate-600">Cargando alcance territorial…</p>}
      {scopeStatus === 'error' && <p role="alert" className="text-sm text-rose-700">No se pudo cargar el alcance territorial. Inténtalo de nuevo al recargar la página.</p>}
      {state.status === 'loading' && <p role="status" className="text-sm text-slate-600">Cargando métricas electorales…</p>}
      {state.status === 'error' && <p role="alert" className="text-sm text-rose-700">No se pudieron cargar las métricas electorales. Inténtalo de nuevo al recargar la página.</p>}
      {state.status === 'success' && metrics.some(metric => metric.value === null) && (
        <p role="status" className="mb-4 text-sm text-slate-600">No hay datos disponibles para una o ambas vueltas de 2021.</p>
      )}
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div aria-busy={scopeStatus === 'loading'} className="rounded border border-slate-200 bg-white p-4">
          <dt className="text-xs font-medium tracking-wide text-slate-600 uppercase">Alcance territorial</dt>
          <dd className="mt-3 text-3xl font-bold tracking-tight text-teal-700 tabular-nums">
            {scopeStatus !== 'success' ? (
              <span className="text-base font-normal text-slate-600">{scopeStatus === 'loading' ? 'Cargando…' : 'Error de carga'}</span>
            ) : scope === null ? 'No disponible' : (
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
          <div key={metric.label} aria-busy={state.status === 'loading'} className="rounded border border-slate-200 bg-white p-4">
            <dt className="text-xs font-medium tracking-wide text-slate-600 uppercase">{metric.label}</dt>
            <dd className="mt-3 text-3xl font-bold tracking-tight text-teal-700 tabular-nums">
              {state.status !== 'success' ? (
                <span className="text-base font-normal text-slate-600">{state.status === 'loading' ? 'Cargando…' : 'Error de carga'}</span>
              ) : metric.value === null ? 'No disponible' : metric.variation
                ? `${variationFormat.format(metric.value)} pp`
                : `${percentageFormat.format(metric.value)} %`}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-slate-500">Agregado regional de Piura. Variación: segunda vuelta menos primera vuelta.</p>
    </section>
  )
}

export default RegionalElectoralMetrics
