export type SocioeconomicData = {
  pobreza: { anio: number; inferior: number | null; superior: number | null; estimada: number | null } | null
  desarrollo: { anio: number; idh: number | null; ingreso: number | null } | null
}

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('Respuesta inválida')
  return value as Record<string, unknown>
}

function numeric(value: unknown, maximum = Infinity): number | null {
  if (value === null) return null
  if (typeof value !== 'number' && (typeof value !== 'string' || !/^\d+(\.\d+)?$/.test(value))) throw new Error('Indicador inválido')
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0 || number > maximum) throw new Error('Indicador fuera de rango')
  return number
}

function year(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) throw new Error('Año inválido')
  return value
}

export async function fetchSocioeconomicData(ubigeo: string, signal: AbortSignal): Promise<SocioeconomicData> {
  if (!/^20\d{4}$/.test(ubigeo)) throw new Error('Distrito inválido')
  const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')
  const response = await fetch(`${baseUrl}/api/v1/territorios/${ubigeo}/socioeconomia`, { signal })
  if (!response.ok) throw new Error('No se pudieron cargar los indicadores')
  const data = record(await response.json())
  if (data.ubigeo !== ubigeo || data.nivel !== 'distrito' || typeof data.disponible !== 'boolean') throw new Error('Territorio inválido')
  const poverty = data.pobreza === null ? null : record(data.pobreza)
  const development = data.desarrollo === null ? null : record(data.desarrollo)
  if (data.disponible !== (poverty !== null || development !== null)) throw new Error('Disponibilidad inválida')
  const pobreza = poverty ? {
    anio: year(poverty.anio),
    inferior: numeric(poverty.pobreza_inferior_pct, 100),
    superior: numeric(poverty.pobreza_superior_pct, 100),
    estimada: numeric(poverty.pobreza_estimada_pct, 100),
  } : null
  if (pobreza && pobreza.inferior !== null && pobreza.superior !== null && pobreza.inferior > pobreza.superior) throw new Error('Intervalo inválido')
  return {
    pobreza,
    desarrollo: development ? { anio: year(development.anio), idh: numeric(development.idh, 1), ingreso: numeric(development.ingreso_familiar_per_capita_mensual) } : null,
  }
}
