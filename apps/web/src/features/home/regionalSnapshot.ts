import type { ElectoralResult } from '../explorer/electoralData'
import { regionalParticipation } from './regionalElectoralData'
import type { RegionalParticipation, RegionalTerritorialScope } from './regionalElectoralData'

type RegionalSnapshot = {
  year: number
  results: readonly ElectoralResult[]
  participation: RegionalParticipation
  scope: RegionalTerritorialScope
}

// Instantánea histórica de Piura, elecciones presidenciales 2021 (ONPE).
// Conteos contrastados en database/import/002_load_all.sql y docs/mapeo_fuentes.md.
// Se conserva la fórmula y precisión de cuatro decimales de la API.
const results: ElectoralResult[] = [
  { vuelta: 1, electores_habiles: 1396448, votantes: 932186 },
  { vuelta: 2, electores_habiles: 1396448, votantes: 1052088 },
].map(({ vuelta, electores_habiles, votantes }) => ({
  anio: 2021,
  vuelta,
  electores_habiles,
  votantes,
  participacion_pct: Number((100 * votantes / electores_habiles).toFixed(4)),
  ausentismo_pct: Number((100 * (electores_habiles - votantes) / electores_habiles).toFixed(4)),
}))

export const regionalSnapshot: RegionalSnapshot = {
  year: 2021,
  results,
  participation: regionalParticipation(results),
  scope: { provinces: 8, districts: 65 },
}
