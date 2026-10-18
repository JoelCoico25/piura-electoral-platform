import { describe, expect, test } from 'bun:test'
import { districtFillColor, districtIndicatorState, pendingDistrictColor } from '../src/features/explorer/districtMapState'
import { indicatorColor, indicatorValue } from '../src/features/explorer/districtIndicator'
import type { SocioeconomicData } from '../src/features/explorer/socioeconomicData'

const data: SocioeconomicData = {
  pobreza: { anio: 2018, inferior: 10, superior: 30, estimada: 20 },
  desarrollo: { anio: 2019, idh: 0.6, ingreso: 1200 },
}
const success = { status: 'success' as const, data }
const pending = { status: 'pending' as const }
const error = { status: 'error' as const }
const absent = { status: 'success' as const, data: { pobreza: null, desarrollo: null } }

describe('estados de indicadores distritales', () => {
  test('consulta pendiente o todavía no creada significa cargando, no ausencia', () => {
    expect(districtIndicatorState(pending, 'poverty')).toBe('loading')
    expect(districtIndicatorState(undefined, 'poverty')).toBe('loading')
    expect(districtFillColor(pending, 'poverty', true)).toBe(pendingDistrictColor)
    expect(pendingDistrictColor).not.toBe('#cbd5e1')
  })
  test('error es distinto de ausencia confirmada', () => {
    expect(districtIndicatorState(error, 'poverty')).toBe('error')
    expect(districtIndicatorState(absent, 'poverty')).toBe('missing')
    expect(districtFillColor(error, 'poverty', false)).toBe('#cbd5e1')
    expect(districtFillColor(absent, 'poverty', false)).toBe('#cbd5e1')
  })
  test.each(['poverty', 'idh', 'income'] as const)('conserva escala y color final para %s', indicator => {
    expect(districtIndicatorState(success, indicator)).toBe('available')
    expect(districtFillColor(success, indicator, false)).toBe(indicatorColor(indicatorValue(data, indicator), indicator))
  })
  test('no aplica colores temáticos parciales mientras falte cualquier consulta', () => {
    expect(districtFillColor(success, 'poverty', true)).toBe(pendingDistrictColor)
    expect(districtFillColor(success, 'idh', true)).toBe(pendingDistrictColor)
    expect(districtFillColor(absent, 'poverty', true)).toBe('#cbd5e1')
    expect(districtFillColor(error, 'poverty', true)).toBe('#cbd5e1')
  })
  test('un fallo parcial no impide colorear los demás una vez resuelto el conjunto', () => {
    const colors = [success, error, absent].map(query => districtFillColor(query, 'income', false))
    expect(colors).toEqual([indicatorColor(1200, 'income'), '#cbd5e1', '#cbd5e1'])
  })
  test('null en un indicador no oculta otros indicadores disponibles', () => {
    const partial = { ...success, data: { ...data, desarrollo: { anio: 2019, idh: null, ingreso: 1200 } } }
    expect(districtIndicatorState(partial, 'idh')).toBe('missing')
    expect(districtIndicatorState(partial, 'income')).toBe('available')
    expect(districtIndicatorState(partial, 'poverty')).toBe('available')
  })
  test('cero confirmado sigue siendo un valor disponible', () => {
    const zero = { ...success, data: { ...data, pobreza: { anio: 2018, inferior: 0, superior: 0, estimada: 0 } } }
    expect(districtIndicatorState(zero, 'poverty')).toBe('available')
    expect(districtFillColor(zero, 'poverty', false)).toBe(indicatorColor(0, 'poverty'))
  })
  test('fallo de consulta no utiliza datos anteriores como éxito', () => {
    expect(districtIndicatorState({ ...success, status: 'error' }, 'poverty')).toBe('error')
  })
})
