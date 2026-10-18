import { describe, expect, test } from 'bun:test'
import { regionalSnapshot } from '../src/features/home/regionalSnapshot'
import { decimalFormat } from '../src/lib/numberFormat'

describe('instantánea regional histórica', () => {
  test('conserva los conteos contrastados de ambas vueltas de 2021', () => {
    expect(regionalSnapshot.year).toBe(2021)
    expect(regionalSnapshot.results.map(({ anio, vuelta, electores_habiles, votantes }) =>
      ({ anio, vuelta, electores_habiles, votantes }))).toEqual([
      { anio: 2021, vuelta: 1, electores_habiles: 1396448, votantes: 932186 },
      { anio: 2021, vuelta: 2, electores_habiles: 1396448, votantes: 1052088 },
    ])
  })

  test('mantiene las tasas y la variación con la precisión de la API', () => {
    expect(regionalSnapshot.participation.firstRound).toBe(66.7541)
    expect(regionalSnapshot.participation.secondRound).toBe(75.3403)
    expect(regionalSnapshot.participation.variation).toBeCloseTo(8.5862, 10)
    expect(decimalFormat.format(regionalSnapshot.participation.firstRound!)).toBe('66.75')
    expect(decimalFormat.format(regionalSnapshot.participation.secondRound!)).toBe('75.34')
    expect(decimalFormat.format(regionalSnapshot.participation.variation!)).toBe('8.59')
  })

  test('conserva la cobertura documentada de Piura', () => {
    expect(regionalSnapshot.scope).toEqual({ provinces: 8, districts: 65 })
  })
})
