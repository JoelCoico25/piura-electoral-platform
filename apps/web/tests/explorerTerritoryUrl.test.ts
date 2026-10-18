import { describe, expect, test } from 'bun:test'
import { resolveExplorerTerritory, withExplorerTerritory, withExplorerMapOptions } from '../src/features/explorer/explorerTerritoryUrl'
import { readExplorerUrlState } from '../src/lib/territoryUrlState'

const province = { ubigeo: '2001', nombre: 'Piura', departamento_ubigeo: '20' }
const district = { ubigeo: '200104', nombre: 'Castilla', provincia_ubigeo: '2001' }
const provinces = { status: 'success' as const, data: [province] }
const districts = { status: 'success' as const, data: [district] }
const pending = { status: 'pending' as const }
const error = { status: 'error' as const }
const requested = { province: '2001', district: '200104' }

describe('restauración territorial con catálogos', () => {
  test('sin selección no espera al catálogo', () => {
    expect(resolveExplorerTerritory({ province: null, district: null }, pending, pending).status).toBe('idle')
  })
  test('restaura objetos y nombres reales, no nombres de la URL', () => {
    const result = resolveExplorerTerritory(requested, provinces, districts)
    expect(result.status).toBe('valid')
    expect(result.province).toEqual(province)
    expect(result.district).toEqual(district)
  })
  test('provincia sola no depende del catálogo distrital', () => {
    expect(resolveExplorerTerritory({ province: '2001', district: null }, provinces, pending).status).toBe('valid')
  })
  test('provincia pendiente no habilita ninguna selección', () => {
    const result = resolveExplorerTerritory(requested, pending, pending)
    expect(result.status).toBe('pending')
    expect(result.province).toBeNull()
    expect(result.district).toBeNull()
    expect(result.selection).toEqual(requested)
  })
  test('distrito pendiente conserva provincia validada y los parámetros', () => {
    const result = resolveExplorerTerritory(requested, provinces, pending)
    expect(result.status).toBe('pending')
    expect(result.province).toEqual(province)
    expect(result.district).toBeNull()
    expect(result.selection).toEqual(requested)
  })
  test('provincia inexistente elimina ambos códigos solo tras éxito', () => {
    const result = resolveExplorerTerritory(requested, { status: 'success', data: [] }, districts)
    expect(result.status).toBe('missing')
    expect(result.selection).toEqual({ province: null, district: null })
  })
  test('distrito inexistente elimina solo distrito', () => {
    const result = resolveExplorerTerritory(requested, provinces, { status: 'success', data: [] })
    expect(result.status).toBe('missing')
    expect(result.selection).toEqual({ province: '2001', district: null })
  })
  test('rechaza distrito de otra provincia aunque el código coincida', () => {
    const result = resolveExplorerTerritory(requested, provinces, {
      status: 'success', data: [{ ...district, provincia_ubigeo: '2002' }],
    })
    expect(result.district).toBeNull()
    expect(result.status).toBe('missing')
  })
  test('no borra códigos ante error provincial o distrital', () => {
    for (const result of [resolveExplorerTerritory(requested, error, pending),
      resolveExplorerTerritory(requested, provinces, error)]) {
      expect(result.status).toBe('error')
      expect(result.selection).toEqual(requested)
    }
  })
  test('conserva objetos previamente validados ante fallo de actualización', () => {
    const result = resolveExplorerTerritory(requested,
      { ...provinces, status: 'error' }, { ...districts, status: 'error' })
    expect(result.status).toBe('valid')
    expect(result.province).toEqual(province)
    expect(result.district).toEqual(district)
  })
  test('no muestra distrito del catálogo anterior durante un cambio rápido', () => {
    const next = { province: '2002', district: '200201' }
    const result = resolveExplorerTerritory(next, {
      status: 'success', data: [province, { ...province, ubigeo: '2002', nombre: 'Ayabaca' }],
    }, { status: 'pending', data: [district] })
    expect(result.province?.ubigeo).toBe('2002')
    expect(result.district).toBeNull()
    expect(result.selection).toEqual(next)
  })
  test('deriva provincia antes de comprobar su existencia', () => {
    const selected = readExplorerUrlState(new URLSearchParams('distrito=200104'))
    expect(resolveExplorerTerritory(selected, provinces, districts).district).toEqual(district)
  })
})

describe('opciones del mapa en URL', () => {
  test('no añade parámetros a una URL vacía', () => {
    const next = withExplorerMapOptions(new URLSearchParams())
    expect(next.toString()).toBe('')
    expect(readExplorerUrlState(next)).toMatchObject({ indicator: 'poverty', round: 1 })
  })
  test.each(['poverty', 'idh', 'income'])('conserva indicador válido %s y segunda vuelta', indicator => {
    const params = new URLSearchParams(`indicador=${indicator}&vuelta=2`)
    expect(withExplorerMapOptions(params).toString()).toBe(params.toString())
    expect(readExplorerUrlState(params)).toMatchObject({ indicator, round: 2 })
  })
  test('normaliza inválidos y duplicados usando la primera aparición', () => {
    const params = new URLSearchParams('indicador=bad&indicador=idh&vuelta=&vuelta=2')
    expect(withExplorerMapOptions(params).toString()).toBe('indicador=poverty&vuelta=1')
    expect(withExplorerMapOptions(new URLSearchParams('indicador=income&indicador=idh&vuelta=2&vuelta=1')).toString())
      .toBe('indicador=income&vuelta=2')
  })
  test('cambiar indicador conserva vuelta, territorios y parámetros ajenos sin mutación', () => {
    const params = new URLSearchParams('provincia=2001&distrito=200104&vuelta=2&x=1&x=2')
    const original = params.toString()
    const next = withExplorerMapOptions(params, { indicator: 'idh' })
    expect(next.toString()).toBe(`${original}&indicador=idh`)
    expect(params.toString()).toBe(original)
  })
  test('cambiar vuelta conserva indicador aunque el control esté oculto', () => {
    const next = withExplorerMapOptions(new URLSearchParams('indicador=income&provincia=2001'), { round: 2 })
    expect(next.toString()).toBe('indicador=income&provincia=2001&vuelta=2')
  })
  test('cambiar o limpiar territorio conserva ambas opciones', () => {
    const params = new URLSearchParams('indicador=idh&vuelta=2&provincia=2001&distrito=200104')
    expect(withExplorerTerritory(params, { province: '2002', district: null }).toString())
      .toBe('indicador=idh&vuelta=2&provincia=2002')
    expect(withExplorerTerritory(params, { province: null, district: null }).toString())
      .toBe('indicador=idh&vuelta=2')
  })
  test('error de catálogo conserva selección y opciones mientras se normalizan valores inválidos', () => {
    const params = new URLSearchParams('provincia=2001&distrito=200104&indicador=bad&vuelta=2')
    const result = resolveExplorerTerritory(readExplorerUrlState(params), provinces, error)
    const next = withExplorerMapOptions(withExplorerTerritory(params, result.selection))
    expect(result.status).toBe('error')
    expect(readExplorerUrlState(next)).toEqual({ ...requested, indicator: 'poverty', round: 2 })
  })
  test.each(['', 'provincia=2001&indicador=idh&vuelta=2', 'indicador=bad&vuelta=3',
    'distrito=200104&indicador=income&vuelta=2'])(
    'normalización completa estable y round-trip: %s', query => {
      const params = new URLSearchParams(query)
      const normalize = (value: URLSearchParams) => withExplorerMapOptions(
        withExplorerTerritory(value, readExplorerUrlState(value)),
      )
      const normalized = normalize(params)
      expect(normalize(normalized).toString()).toBe(normalized.toString())
      expect(readExplorerUrlState(new URLSearchParams(normalized.toString())))
        .toEqual(readExplorerUrlState(params))
    },
  )
})

describe('escritura exclusivamente territorial', () => {
  test('conserva otros parámetros sin activar persistencia de indicador o vuelta', () => {
    const original = new URLSearchParams('indicador=bad&vuelta=2&x=1&x=2&provincia=2002&distrito=200201')
    const next = withExplorerTerritory(original, requested)
    expect(next.toString()).toBe('indicador=bad&vuelta=2&x=1&x=2&provincia=2001&distrito=200104')
    expect(original.get('provincia')).toBe('2002')
  })
  test('cambiar provincia limpia distrito en una sola escritura', () => {
    const params = new URLSearchParams('provincia=2001&distrito=200104')
    expect(withExplorerTerritory(params, { province: '2002', district: null }).toString()).toBe('provincia=2002')
  })
  test('limpiar selección elimina ambos parámetros', () => {
    expect(withExplorerTerritory(new URLSearchParams('provincia=2001&distrito=200104'),
      { province: null, district: null }).toString()).toBe('')
  })
  test('normalización idempotente de repetidos y contradicciones', () => {
    const params = new URLSearchParams('provincia=2001&provincia=2002&distrito=200201')
    const next = withExplorerTerritory(params, readExplorerUrlState(params))
    expect(next.toString()).toBe('provincia=2001')
    expect(withExplorerTerritory(next, readExplorerUrlState(next)).toString()).toBe(next.toString())
  })
})
