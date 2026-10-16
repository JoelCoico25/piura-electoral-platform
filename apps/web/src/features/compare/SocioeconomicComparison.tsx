import { useQuery } from '@tanstack/react-query'
import { socioeconomicsQueryOptions } from '../../data/socioeconomicsQuery'
import type { District } from '../../data/districtsQuery'
import { districtIndicators, formatIndicator, indicatorValue, indicatorYear } from '../explorer/districtIndicator'
import type { DistrictIndicator } from '../explorer/districtIndicator'
import { formatSocioeconomicDifference } from './comparisonData'

const indicators: DistrictIndicator[] = ['poverty', 'idh', 'income']

export function SocioeconomicComparison({ a, b }: { a: District; b: District }) {
  const valid = /^20\d{4}$/.test(a.ubigeo) && /^20\d{4}$/.test(b.ubigeo) && a.ubigeo !== b.ubigeo
  const queryA = useQuery({ ...socioeconomicsQueryOptions(a.ubigeo), enabled: valid })
  const queryB = useQuery({ ...socioeconomicsQueryOptions(b.ubigeo), enabled: valid })
  const columns = [{ side: 'A', territory: a, query: queryA }, { side: 'B', territory: b, query: queryB }]
  const dataA = queryA.isSuccess ? queryA.data : null
  const dataB = queryB.isSuccess ? queryB.data : null
  if (!valid) return null

  return (
    <section aria-labelledby="socioeconomic-comparison-title" className="mt-6">
      <h2 id="socioeconomic-comparison-title" className="mb-3 text-lg font-semibold">Indicadores socioeconómicos distritales</h2>
      <p className="mb-4 text-xs text-slate-600">Diferencia = territorio B − territorio A, solo entre años iguales. pp significa puntos porcentuales. Los signos son descriptivos. Los años de los indicadores pueden diferir del año electoral.</p>
      <div className="grid gap-4">
        {indicators.map(indicator => {
          const configuration = districtIndicators[indicator]
          return (
            <div key={indicator} className="rounded border border-slate-200 bg-white p-3 sm:p-4">
              <table className="w-full table-fixed text-left text-xs sm:text-sm">
                <caption className="mb-3 text-left">
                  <span className="block font-semibold">{indicator === 'poverty' ? 'Pobreza monetaria estimada (punto medio del intervalo)' : configuration.name}</span>
                  <span className="block text-xs text-slate-600">{configuration.unit} · Fuente: {configuration.source}</span>
                </caption>
                <thead>
                  <tr>
                    {columns.map(({ side, territory, query }) => (
                      <th key={side} scope="col" className="px-1 align-top font-medium">
                        <div className="min-h-20 break-words">
                          <span className="block text-slate-600">Territorio {side}</span>
                          <span className="block">{territory.nombre}</span>
                          <span className="block text-xs text-slate-500">UBIGEO {territory.ubigeo}</span>
                        </div>
                        <p role={query.isError ? 'alert' : 'status'} className="min-h-10 text-xs font-normal text-slate-600">
                          {query.isPending ? 'Cargando indicadores…' : query.isError ? 'No se pudo cargar.' : indicatorValue(query.data, indicator) === null ? 'Indicador no disponible.' : ''}
                        </p>
                      </th>
                    ))}
                    <th scope="col" className="px-1 align-top font-medium text-slate-600">B − A</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-100">
                    {columns.map(({ side, query }) => {
                      const data = query.isSuccess ? query.data : null
                      const poverty = data?.pobreza
                      return (
                        <td key={side} aria-busy={query.isPending} className="break-words px-1 py-3 align-top">
                          <div className={indicator === 'poverty' ? 'min-h-48' : 'min-h-24'}>
                            <p className="font-semibold text-teal-700 tabular-nums">{query.isPending ? 'Cargando…' : formatIndicator(indicatorValue(data, indicator), indicator)}</p>
                            <p className="mt-1 text-xs text-slate-600">Año de referencia: {query.isPending ? 'Cargando…' : indicatorYear(data, indicator) ?? 'No disponible'}</p>
                            {indicator === 'poverty' && (
                              <dl className="mt-3 text-xs text-slate-600">
                                <div><dt>Límite inferior</dt><dd>{query.isPending ? 'Cargando…' : formatIndicator(poverty?.inferior ?? null, 'poverty')}</dd></div>
                                <div className="mt-2"><dt>Límite superior</dt><dd>{query.isPending ? 'Cargando…' : formatIndicator(poverty?.superior ?? null, 'poverty')}</dd></div>
                              </dl>
                            )}
                          </div>
                        </td>
                      )
                    })}
                    <td aria-busy={queryA.isPending || queryB.isPending} className="break-words px-1 py-3 align-top font-medium text-slate-700 tabular-nums">
                      {queryA.isPending || queryB.isPending ? 'Cargando…' : formatSocioeconomicDifference(indicatorValue(dataA, indicator), indicatorValue(dataB, indicator), indicatorYear(dataA, indicator), indicatorYear(dataB, indicator), indicator)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
    </section>
  )
}
