import { describe, expect, test } from 'bun:test'
import {
  readComparisonUrlState, readExplorerUrlState,
  serializeComparisonUrlState, serializeExplorerUrlState,
} from '../src/lib/territoryUrlState'

const explorer = (query: string) => readExplorerUrlState(new URLSearchParams(query))
const compare = (query: string) => readComparisonUrlState(new URLSearchParams(query))
const empty = { province: null, district: null }

describe('parámetros de Explorar', () => {
  test('URL vacía conserva los valores iniciales actuales', () => {
    expect(explorer('')).toEqual({ ...empty, indicator: 'poverty', round: 1 })
  })
  test('lee todos los parámetros válidos sin convertir UBIGEO a número', () => {
    expect(explorer('provincia=2001&distrito=200104&indicador=idh&vuelta=2')).toEqual({
      province: '2001', district: '200104', indicator: 'idh', round: 2,
    })
  })
  test.each(['provincia=1501&distrito=150101', 'provincia=20&distrito=2001',
    'provincia=20010&distrito=2001040', 'provincia=abcd&distrito=20010x',
    'provincia=+2001&distrito=+200104', 'provincia=2001%0A&distrito=200104%0A'])(
    'descarta formato o prefijo inválido: %s', query => {
    expect(explorer(query)).toEqual({ ...empty, indicator: 'poverty', round: 1 })
  })
  test('opciones inválidas usan los valores predeterminados', () => {
    expect(explorer('indicador=unknown&vuelta=02')).toEqual({ ...empty, indicator: 'poverty', round: 1 })
  })
  test('acepta income y poverty y conserva vuelta 1', () => {
    expect(explorer('indicador=income&vuelta=1').indicator).toBe('income')
    expect(explorer('indicador=poverty&vuelta=1').round).toBe(1)
  })
  test('usa el primer parámetro repetido, aunque sea vacío o inválido', () => {
    expect(explorer('provincia=2001&provincia=2002&indicador=bad&indicador=idh&vuelta=&vuelta=2'))
      .toEqual({ province: '2001', district: null, indicator: 'poverty', round: 1 })
    expect(explorer('distrito=&distrito=200104').district).toBeNull()
  })
  test('conserva provincia sin distrito', () => {
    expect(explorer('provincia=2001').province).toBe('2001')
    expect(explorer('provincia=2001').district).toBeNull()
  })
  test('deriva provincia desde distrito, también si la provincia es inválida', () => {
    expect(explorer('distrito=200104').province).toBe('2001')
    expect(explorer('provincia=bad&distrito=200104').district).toBe('200104')
  })
  test('conserva provincia válida y descarta distrito contradictorio', () => {
    expect(explorer('provincia=2002&distrito=200104')).toEqual({
      province: '2002', district: null, indicator: 'poverty', round: 1,
    })
  })
  test('no confunde formato válido con existencia territorial', () => {
    expect(explorer('distrito=209999').province).toBe('2099')
    expect(explorer('distrito=209999').district).toBe('209999')
  })
  test.each(['', 'provincia=2001', 'distrito=200104&indicador=income&vuelta=2',
    'provincia=2002&distrito=200104&indicador=bad', 'provincia=bad&provincia=2001'])(
    'round-trip estable y sin mutar parámetros: %s', query => {
    const params = new URLSearchParams(query)
    const before = params.toString()
    const state = readExplorerUrlState(params)
    const serialized = serializeExplorerUrlState(state)
    expect(explorer(serialized)).toEqual(state)
    expect(serializeExplorerUrlState(explorer(serialized))).toBe(serialized)
    expect(params.toString()).toBe(before)
  })
  test('serializa en orden fijo y elimina parámetros desconocidos', () => {
    expect(serializeExplorerUrlState(explorer('x=1&vuelta=2&indicador=idh&distrito=200104')))
      .toBe('provincia=2001&distrito=200104&indicador=idh&vuelta=2')
  })
  test('normaliza estado incoherente al escribir sin modificar el original', () => {
    const state = { province: '2002', district: '200104', indicator: 'income' as const, round: 2 as const }
    expect(serializeExplorerUrlState(state)).toBe('provincia=2002&indicador=income&vuelta=2')
    expect(state.district).toBe('200104')
  })
})

describe('parámetros de Comparar', () => {
  test('URL vacía y nivel desconocido usan provincia', () => {
    expect(compare('')).toEqual({ level: 'province', a: empty, b: empty })
    expect(compare('nivel=region&distritoA=200104')).toEqual({ level: 'province', a: empty, b: empty })
  })
  test('acepta provincias distintas y selecciones parciales', () => {
    expect(compare('provinciaA=2001&provinciaB=2002')).toEqual({
      level: 'province', a: { province: '2001', district: null }, b: { province: '2002', district: null },
    })
    expect(compare('provinciaB=2002').a).toEqual(empty)
  })
  test('acepta distritos de distintas provincias y deriva los padres', () => {
    expect(compare('nivel=district&distritoA=200104&distritoB=200602')).toEqual({
      level: 'district', a: { province: '2001', district: '200104' }, b: { province: '2006', district: '200602' },
    })
  })
  test('normaliza contradicciones y formatos inválidos independientemente', () => {
    expect(compare('nivel=district&provinciaA=2002&distritoA=200104&provinciaB=1501&distritoB=bad'))
      .toEqual({ level: 'district', a: { province: '2002', district: null }, b: empty })
  })
  test('preserva selecciones parciales independientes', () => {
    expect(compare('nivel=district&provinciaA=2001&distritoB=200602')).toEqual({
      level: 'district', a: { province: '2001', district: null }, b: { province: '2006', district: '200602' },
    })
  })
  test('duplicado provincial conserva A y limpia B', () => {
    expect(compare('provinciaA=2001&provinciaB=2001').b).toEqual(empty)
  })
  test('duplicado distrital limpia solo el distrito de B', () => {
    expect(compare('nivel=district&distritoA=200104&distritoB=200104').b)
      .toEqual({ province: '2001', district: null })
  })
  test('serializa duplicados sin mutar el estado recibido', () => {
    const state = { level: 'district' as const,
      a: { province: '2001', district: '200104' }, b: { province: '2001', district: '200104' } }
    expect(serializeComparisonUrlState(state))
      .toBe('nivel=district&provinciaA=2001&distritoA=200104&provinciaB=2001')
    expect(state.b.district).toBe('200104')
  })
  test('permite provincias iguales con distritos diferentes o pendientes', () => {
    expect(compare('nivel=district&distritoA=200104&distritoB=200101').b.district).toBe('200101')
    expect(compare('nivel=district&provinciaA=2001&provinciaB=2001').b.province).toBe('2001')
  })
  test('parámetros repetidos siempre eligen la primera aparición', () => {
    expect(compare('nivel=province&nivel=district&provinciaA=2001&provinciaA=2002&provinciaB=&provinciaB=2006'))
      .toEqual({ level: 'province', a: { province: '2001', district: null }, b: empty })
    expect(compare('nivel=district&distritoA=200104&distritoA=200602').a.district).toBe('200104')
  })
  test('nivel provincia ignora distritos incluso al serializar estado no normalizado', () => {
    const state = { level: 'province' as const, a: { province: '2001', district: '200104' }, b: empty }
    expect(serializeComparisonUrlState(state)).toBe('nivel=province&provinciaA=2001')
    expect(state.a.district).toBe('200104')
    expect(compare('distritoA=200104').a).toEqual(empty)
  })
  test.each(['', 'provinciaB=2002', 'provinciaA=2001&provinciaB=2001',
    'nivel=district&distritoA=200104&distritoB=200602',
    'nivel=district&distritoA=200104&distritoB=200104',
    'nivel=district&provinciaA=2002&distritoA=200104&provinciaB=2006'])(
    'round-trip estable: %s', query => {
    const state = compare(query)
    const serialized = serializeComparisonUrlState(state)
    expect(compare(serialized)).toEqual(state)
    expect(serializeComparisonUrlState(compare(serialized))).toBe(serialized)
  })
})
