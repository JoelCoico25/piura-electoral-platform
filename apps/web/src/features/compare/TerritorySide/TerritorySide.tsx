import { useQuery } from '@tanstack/react-query'
import { provincesQueryOptions } from '../../../data/provincesQuery'
import { districtsQueryOptions } from '../../../data/districtsQuery'
import type { ComparisonLevel, ComparisonSelection } from '../ComparisonSelectors/ComparisonSelectors'

type Side = 'a' | 'b'

const TerritorySide = ({ side, level, selection, other, onChange }: {
  side: Side
  level: ComparisonLevel
  selection: ComparisonSelection
  other: ComparisonSelection
  onChange: (selection: ComparisonSelection) => void
}) => {
  const provinces = useQuery(provincesQueryOptions)
  const districts = useQuery(districtsQueryOptions(level === 'district' ? selection.province?.ubigeo ?? '' : ''))
  const fields = [
    { name: 'province', label: 'Provincia', query: provinces, value: selection.province?.ubigeo ?? '', enabled: true, excluded: level === 'province' ? other.province?.ubigeo : undefined },
    ...(level === 'district' ? [{ name: 'district', label: 'Distrito', query: districts, value: selection.district?.ubigeo ?? '', enabled: Boolean(selection.province), excluded: other.district?.ubigeo }] : []),
  ]

  return (
    <fieldset className="min-w-0 rounded border border-slate-200 bg-white p-4">
      <legend className="px-1 text-sm font-semibold">Territorio {side.toUpperCase()}</legend>
      <div className="grid gap-4">
        {fields.map(field => {
          const id = `compare-${side}-${field.name}`
          const loading = field.enabled && field.query.isPending
          const error = field.enabled && field.query.isError
          const items = field.query.data ?? []
          return (
            <div key={field.name}>
              <label htmlFor={id} className="mb-2 block text-sm font-medium">{field.label}</label>
              <select
                id={id}
                value={field.value}
                disabled={!field.enabled || !field.query.isSuccess || items.length === 0}
                aria-busy={loading}
                aria-describedby={`${id}-status`}
                onChange={event => {
                  const code = event.target.value
                  if (code && code === field.excluded) return
                  if (field.name === 'province') onChange({ province: provinces.data?.find(item => item.ubigeo === code) ?? null, district: null })
                  else onChange({ ...selection, district: districts.data?.find(item => item.ubigeo === code) ?? null })
                }}
                className="w-full min-w-0 rounded border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option value="">{!field.enabled ? 'Selecciona primero una provincia' : `Selecciona ${field.name === 'province' ? 'una provincia' : 'un distrito'}`}</option>
                {items.map(item => <option key={item.ubigeo} value={item.ubigeo} disabled={item.ubigeo === field.excluded}>{item.nombre}</option>)}
              </select>
              <p id={`${id}-status`} role={error ? 'alert' : 'status'} className="mt-2 text-sm text-slate-600">
                {loading && 'Cargando opciones…'}
                {error && 'No se pudieron cargar las opciones. Recarga la página para intentarlo de nuevo.'}
                {field.enabled && field.query.isSuccess && items.length === 0 && 'No hay territorios disponibles.'}
              </p>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}

export default TerritorySide
