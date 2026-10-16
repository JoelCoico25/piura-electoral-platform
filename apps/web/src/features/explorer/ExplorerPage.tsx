import { useCallback, useState } from 'react'
import { ElectoralResultsPanel } from './ElectoralResultsPanel'
import { SocioeconomicPanel } from './SocioeconomicPanel'
import { ProvinceMap } from './ProvinceMap'
import type { Territory } from './territorialData'
import { TerritorySelectors } from './TerritorySelectors'

export function ExplorerPage() {
  const [province, setProvince] = useState<Territory | null>(null)
  const [district, setDistrict] = useState<Territory | null>(null)
  const selectProvince = useCallback((selected: Territory | null) => {
    setProvince(selected)
    setDistrict(null)
  }, [])
  const selectDistrict = useCallback((selected: Territory | null) => {
    if (selected && (!/^20\d{4}$/.test(selected.ubigeo) || selected.ubigeo.slice(0, 4) !== province?.ubigeo)) return
    setDistrict(selected)
  }, [province?.ubigeo])
  const territory = district ?? province
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Explorador territorial</h1>
      <TerritorySelectors province={province} district={district} onProvinceChange={selectProvince} onDistrictChange={selectDistrict} />
      {territory ? (
        <ElectoralResultsPanel territory={territory} />
      ) : (
        <p className="mt-4 text-sm text-slate-600">Selecciona una provincia o distrito para consultar sus resultados electorales.</p>
      )}
      <SocioeconomicPanel districtUbigeo={district?.ubigeo ?? null} />
      <ProvinceMap selectedProvinceId={province?.ubigeo ?? ''} selectedDistrictId={district?.ubigeo ?? ''} onProvinceChange={selectProvince} onDistrictChange={selectDistrict} />
    </div>
  )
}
