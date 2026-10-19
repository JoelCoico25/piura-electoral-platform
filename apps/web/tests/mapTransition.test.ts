import { expect, test } from 'bun:test'
import { shouldAnimateTransition } from '../src/features/explorer/mapTransition'

test('encuadre inicial y restauración inicial no repiten entrada', () => {
  expect(shouldAnimateTransition(null, '2001', false)).toBe(false)
})
test('navegación territorial real permite transición', () => {
  expect(shouldAnimateTransition('region', '2001', false)).toBe(true)
  expect(shouldAnimateTransition('2001', '2002', false)).toBe(true)
  expect(shouldAnimateTransition('2001', 'region', false)).toBe(true)
})
test('actualización de caché o indicadores del mismo territorio no repite entrada', () => {
  expect(shouldAnimateTransition('2001', '2001', false)).toBe(false)
})
test('reducción de movimiento desactiva transiciones entre territorios', () => {
  expect(shouldAnimateTransition('region', '2001', true)).toBe(false)
  expect(shouldAnimateTransition('2001', 'region', true)).toBe(false)
})
