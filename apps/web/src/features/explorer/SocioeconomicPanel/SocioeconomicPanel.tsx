import DistrictIndicators from '../DistrictIndicators/DistrictIndicators'

const SocioeconomicPanel = ({ districtUbigeo }: { districtUbigeo: string | null }) => {
  if (!districtUbigeo || !/^20\d{4}$/.test(districtUbigeo)) {
    return <p className="mt-6 text-sm text-slate-600">Selecciona un distrito para consultar sus indicadores socioeconómicos</p>
  }
  return <DistrictIndicators key={districtUbigeo} ubigeo={districtUbigeo} />
}

export default SocioeconomicPanel
