export type ElectoralResult = {
  anio: number
  vuelta: number
  participacion_pct: number | null
  ausentismo_pct: number | null
  electores_habiles: number
  votantes: number
}

function isPercentage(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100)
}

function isResult(value: unknown): value is ElectoralResult {
  return typeof value === 'object' && value !== null &&
    'anio' in value && Number.isInteger(value.anio) &&
    'vuelta' in value && (value.vuelta === 1 || value.vuelta === 2) &&
    'participacion_pct' in value && isPercentage(value.participacion_pct) &&
    'ausentismo_pct' in value && isPercentage(value.ausentismo_pct) &&
    'electores_habiles' in value && typeof value.electores_habiles === 'number' &&
    Number.isSafeInteger(value.electores_habiles) && value.electores_habiles >= 0 &&
    'votantes' in value && typeof value.votantes === 'number' &&
    Number.isSafeInteger(value.votantes) && value.votantes >= 0 && value.votantes <= value.electores_habiles
}

export async function fetchTerritoryElections(ubigeo: string, signal: AbortSignal): Promise<ElectoralResult[]> {
  if (!/^20(\d{2})?(\d{2})?$/.test(ubigeo)) throw new Error('Territorio fuera de Piura')
  const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')
  const response = await fetch(`${baseUrl}/api/v1/territorios/${ubigeo}/elecciones`, { signal })
  if (!response.ok) throw new Error('No se pudieron cargar los resultados')
  const data: unknown = await response.json()
  if (typeof data !== 'object' || data === null ||
    !('ubigeo' in data) || data.ubigeo !== ubigeo ||
    !('nivel' in data) || data.nivel !== (ubigeo.length === 2 ? 'departamento' : ubigeo.length === 4 ? 'provincia' : 'distrito') ||
    !('resultados' in data) || !Array.isArray(data.resultados) || !data.resultados.every(isResult)) {
    throw new Error('Respuesta electoral inválida')
  }
  const results: ElectoralResult[] = data.resultados
  return results.filter(row => row.anio === 2021)
}
