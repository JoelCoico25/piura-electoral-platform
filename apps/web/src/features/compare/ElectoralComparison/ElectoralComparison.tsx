import { decimalFormat, integerFormat } from '../../../lib/numberFormat'
import { useId } from 'react'
import { formatElectoralDifference } from '../comparisonData'
import { useQuery } from '@tanstack/react-query'
import { electionsQueryOptions } from '../../../data/electionsQuery'
import type { Province } from '../../../data/provincesQuery'
import type { District } from '../../../data/districtsQuery'
import type { ElectoralResult } from '../../explorer/electoralData'

type Territory = Province | District
const percentage = decimalFormat
const count = integerFormat
const metrics = [
  { field: 'participacion_pct', label: 'Participación (%)' },
  { field: 'ausentismo_pct', label: 'Ausentismo (%)' },
  { field: 'electores_habiles', label: 'Electores hábiles (personas)' },
  { field: 'votantes', label: 'Votantes (personas)' },
] as const

const ElectoralComparison = ({ a, b }: { a: Territory; b: Territory }) => {
  const tableId = useId()
  const valid = /^20(\d{2}|\d{4})$/.test(a.ubigeo) && /^20(\d{2}|\d{4})$/.test(b.ubigeo) &&
    a.ubigeo.length === b.ubigeo.length && a.ubigeo !== b.ubigeo
  const queryA = useQuery({ ...electionsQueryOptions(a.ubigeo), enabled: valid })
  const queryB = useQuery({ ...electionsQueryOptions(b.ubigeo), enabled: valid })
  const columns = [{ side: 'A', territory: a, query: queryA }, { side: 'B', territory: b, query: queryB }]
  if (!valid) return null

  return (
    <section aria-labelledby="electoral-comparison-title" className="mt-6">
      <h2 id="electoral-comparison-title" className="mb-4 text-lg font-semibold">Resultados electorales 2021</h2>
      <p className="mb-4 text-xs text-slate-600">Diferencia = territorio B − territorio A. pp significa puntos porcentuales; los signos no indican una valoración positiva o negativa.</p>
      <div className="grid gap-4">
        {[1, 2].map(round => (
          <div key={round} className="rounded border border-slate-200 bg-white p-3 sm:p-4">
            <table className="block w-full table-fixed text-left text-xs sm:table sm:text-sm">
              <caption className="mb-3 text-left font-semibold">{round}ª vuelta presidencial · 2021</caption>
              <thead className="block sm:table-header-group">
                <tr className="grid grid-cols-3 sm:table-row">
                  <th id={`${tableId}-${round}-indicator`} scope="col" className="sr-only sm:not-sr-only sm:w-[28%] sm:table-cell pr-2 align-top font-medium text-slate-600">Indicador</th>
                  {columns.map(({ side, territory, query }) => (
                    <th key={side} id={`${tableId}-${round}-${side}`} scope="col" className="min-w-0 px-1 align-top font-medium">
                      <div className="min-h-20 break-words">
                        <span className="block text-slate-600">Territorio {side}</span>
                        <span className="block">{territory.nombre}</span>
                        <span className="block text-xs text-slate-500">UBIGEO {territory.ubigeo}</span>
                      </div>
                      <p role={query.isError ? 'alert' : 'status'} className="min-h-10 text-xs font-normal text-slate-600">
                        {query.isPending ? 'Cargando resultados…' : query.isError ? 'No se pudo cargar.' : !query.data.some(row => row.vuelta === round) ? 'Vuelta no disponible.' : ''}
                      </p>
                    </th>
                  ))}
                  <th id={`${tableId}-${round}-difference`} scope="col" className="min-w-0 px-1 align-top font-medium text-slate-600">B − A</th>
                </tr>
              </thead>
              <tbody className="block sm:table-row-group">
                {metrics.map(({ field, label }) => {
                  const resultA = queryA.isSuccess ? queryA.data.find(row => row.vuelta === round) : undefined
                  const resultB = queryB.isSuccess ? queryB.data.find(row => row.vuelta === round) : undefined
                  return (
                  <tr key={field} className="grid grid-cols-3 border-t border-slate-100 sm:table-row">
                    <th id={`${tableId}-${round}-${field}`} headers={`${tableId}-${round}-indicator`} scope="row" className="col-span-3 py-2 pr-2 font-normal text-slate-600 sm:h-14">{label}</th>
                    {columns.map(({ side, query }) => {
                      const result: ElectoralResult | undefined = query.isSuccess ? query.data.find(row => row.vuelta === round) : undefined
                      const value = result?.[field] ?? null
                      return (
                        <td key={side} headers={`${tableId}-${round}-${field} ${tableId}-${round}-${side}`} aria-busy={query.isPending} className="min-h-14 min-w-0 break-words px-1 py-2 font-semibold text-teal-700 tabular-nums">
                          {query.isPending ? 'Cargando…' : value === null ? 'No disponible' : field.endsWith('_pct') ? `${percentage.format(value)} %` : count.format(value)}
                        </td>
                      )
                    })}
                    <td headers={`${tableId}-${round}-${field} ${tableId}-${round}-difference`} aria-busy={queryA.isPending || queryB.isPending} className="min-h-14 min-w-0 break-words px-1 py-2 font-medium text-slate-700 tabular-nums">
                      {queryA.isPending || queryB.isPending ? 'Cargando…' : formatElectoralDifference(resultA?.[field] ?? null, resultB?.[field] ?? null, field.endsWith('_pct'))}
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ElectoralComparison
