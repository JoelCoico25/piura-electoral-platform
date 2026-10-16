import { useQuery } from '@tanstack/react-query'
import { provincesQueryOptions } from '../../data/provincesQuery'
import { districtsQueryOptions } from '../../data/districtsQuery'
import type { Territory } from './territorialData'

type CatalogState = {
  status: 'idle' | 'loading' | 'success' | 'error'
  items: Territory[]
}

type SelectorProps = {
  province: Territory | null
  district: Territory | null
  onProvinceChange: (province: Territory | null) => void
  onDistrictChange: (district: Territory | null) => void
}

export function TerritorySelectors(props: SelectorProps) {
  return <TerritorySelectorFields key={props.province?.ubigeo ?? 'none'} {...props} />
}

function TerritorySelectorFields({ province, district, onProvinceChange, onDistrictChange }: SelectorProps) {
  const provincesQuery = useQuery(provincesQueryOptions)
  const provinces: CatalogState = {
    status: provincesQuery.isPending ? 'loading' : provincesQuery.isError ? 'error' : 'success',
    items: provincesQuery.data ?? [],
  }
  const provinceId = province?.ubigeo ?? ''
  const districtId = district?.ubigeo ?? ''

  const districtsQuery = useQuery(districtsQueryOptions(provinceId))
  const districts: CatalogState = {
    status: !provinceId ? 'idle' : districtsQuery.isPending ? 'loading' : districtsQuery.isError ? 'error' : 'success',
    items: districtsQuery.data ?? [],
  }

  const fields = [
    { id: 'province', label: 'Provincia', value: provinceId, catalog: provinces,
      placeholder: 'Selecciona una provincia' },
    { id: 'district', label: 'Distrito', value: districtId, catalog: districts,
      placeholder: provinceId ? 'Selecciona un distrito' : 'Selecciona primero una provincia' },
  ]

  return (
    <section aria-label="Selección territorial" className="grid gap-4 rounded border border-slate-200 bg-white p-4 sm:grid-cols-2">
      {fields.map(field => (
        <div key={field.id}>
          <label htmlFor={field.id} className="mb-2 block text-sm font-medium text-slate-900">{field.label}</label>
          <select
            id={field.id}
            value={field.value}
            onChange={event => {
              const value = event.target.value
              if (field.id === 'province') onProvinceChange(provinces.items.find(item => item.ubigeo === value) ?? null)
              else {
                const district = districts.items.find(item => item.ubigeo === value)
                onDistrictChange(district ?? null)
              }
            }}
            disabled={field.catalog.status !== 'success' || field.catalog.items.length === 0}
            aria-describedby={`${field.id}-status`}
            aria-busy={field.catalog.status === 'loading'}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">{field.placeholder}</option>
            {field.catalog.items.map(item => <option key={item.ubigeo} value={item.ubigeo}>{item.nombre}</option>)}
          </select>
          <p id={`${field.id}-status`} role={field.catalog.status === 'error' ? 'alert' : 'status'} className="mt-2 text-sm text-slate-600">
            {field.catalog.status === 'loading' && 'Cargando opciones…'}
            {field.catalog.status === 'error' && 'No se pudieron cargar las opciones. Vuelve a seleccionar la provincia o recarga la página.'}
            {field.catalog.status === 'success' && field.catalog.items.length === 0 && 'No hay territorios disponibles.'}
          </p>
        </div>
      ))}
    </section>
  )
}
