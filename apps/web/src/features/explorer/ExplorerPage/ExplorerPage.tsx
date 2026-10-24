import { useExplorerTerritoryUrl } from '../useExplorerTerritoryUrl'
import DelayedApiNotice from '../../../components/DelayedApiNotice/DelayedApiNotice'
import ElectoralResultsPanel from '../ElectoralResultsPanel/ElectoralResultsPanel'
import SocioeconomicPanel from '../SocioeconomicPanel/SocioeconomicPanel'
import ProvinceMap from '../ProvinceMap/ProvinceMap'
import TerritorySelectors from '../TerritorySelectors/TerritorySelectors'

const ExplorerPage = () => {
  const { province, district, status, selectProvince, selectDistrict, indicator, round, selectMapOptions } = useExplorerTerritoryUrl()
  const territory = district ?? province
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Explorador territorial</h1>
      <TerritorySelectors province={province} district={district} onProvinceChange={selectProvince} onDistrictChange={selectDistrict} />
      <DelayedApiNotice />
      {status === 'pending' && <p role="status" className="mt-4 text-sm text-slate-600">Restaurando selección territorial…</p>}
      {status === 'error' && <p role="alert" className="mt-4 text-sm text-slate-600">No se pudo validar la selección territorial. Se conserva en la URL para volver a intentarlo al recargar.</p>}
      {status === 'missing' && <p role="status" className="mt-4 text-sm text-slate-600">El territorio solicitado no existe en el catálogo.</p>}
      {territory ? (
        <ElectoralResultsPanel territory={territory} />
      ) : (
        <p className="mt-4 text-sm text-slate-600">Selecciona una provincia o distrito para consultar sus resultados electorales.</p>
      )}
      <SocioeconomicPanel districtUbigeo={district?.ubigeo ?? null} />
      <ProvinceMap selectedProvinceId={province?.ubigeo ?? ''} selectedDistrictId={district?.ubigeo ?? ''} onProvinceChange={selectProvince} onDistrictChange={selectDistrict} districtIndicator={indicator} round={round} onIndicatorChange={indicator => selectMapOptions({ indicator })} onRoundChange={round => selectMapOptions({ round })} />
    </div>
  )
}

export default ExplorerPage
