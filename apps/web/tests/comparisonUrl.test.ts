import { describe, expect, test } from 'bun:test'
import { resolveComparisonSide, withComparisonUrlState } from '../src/features/compare/comparisonUrl'
import { readComparisonUrlState } from '../src/lib/territoryUrlState'

const province = { ubigeo: '2001', nombre: 'Piura', departamento_ubigeo: '20' }
const district = { ubigeo: '200104', nombre: 'Castilla', provincia_ubigeo: '2001' }
const provinces = { status: 'success' as const, data: [province] }
const districts = { status: 'success' as const, data: [district] }
const pending = { status: 'pending' as const }
const error = { status: 'error' as const }
const requested = { province: '2001', district: '200104' }
const empty = { province: null, district: null }

describe('validación de cada lado de Comparar', () => {
  test('selección vacía no depende de catálogos', () => {
    expect(resolveComparisonSide(empty, 'district', pending, pending).status).toBe('idle')
  })
  test('provincia válida no espera un catálogo distrital', () => {
    const result = resolveComparisonSide({ province: '2001', district: null }, 'province', provinces, pending)
    expect(result.status).toBe('valid')
    expect(result.value).toEqual({ province, district: null })
  })
  test('restaura nombres y objetos desde los catálogos', () => {
    const result = resolveComparisonSide(requested, 'district', provinces, districts)
    expect(result.status).toBe('valid')
    expect(result.value).toEqual({ province, district })
  })
  test('provincia sin distrito es una selección parcial válida', () => {
    expect(resolveComparisonSide({ province: '2001', district: null }, 'district', provinces, error).status).toBe('valid')
  })
  test('catálogos pendientes conservan códigos sin exponer territorios no verificados', () => {
    const result = resolveComparisonSide(requested, 'district', pending, pending)
    expect(result.status).toBe('pending')
    expect(result.value).toEqual({ province: null, district: null })
    expect(result.selection).toEqual(requested)
  })
  test('esperar distritos conserva únicamente la provincia verificada', () => {
    const result = resolveComparisonSide(requested, 'district', provinces, pending)
    expect(result.status).toBe('pending')
    expect(result.value).toEqual({ province, district: null })
    expect(result.selection).toEqual(requested)
  })
  test('provincia inexistente limpia ambos códigos tras éxito', () => {
    const result = resolveComparisonSide(requested, 'district', { status: 'success', data: [] }, districts)
    expect(result.status).toBe('missing')
    expect(result.selection).toEqual(empty)
  })
  test('distrito inexistente limpia solo el distrito', () => {
    const result = resolveComparisonSide(requested, 'district', provinces, { status: 'success', data: [] })
    expect(result.status).toBe('missing')
    expect(result.selection).toEqual({ province: '2001', district: null })
  })
  test('comprueba pertenencia aunque el catálogo incluya un código coincidente', () => {
    const result = resolveComparisonSide(requested, 'district', provinces, {
      status: 'success', data: [{ ...district, provincia_ubigeo: '2006' }],
    })
    expect(result.value.district).toBeNull()
    expect(result.status).toBe('missing')
  })
  test('errores temporales conservan códigos pendientes', () => {
    for (const result of [resolveComparisonSide(requested, 'district', error, pending),
      resolveComparisonSide(requested, 'district', provinces, error)]) {
      expect(result.status).toBe('error')
      expect(result.selection).toEqual(requested)
    }
  })
  test('fallo al actualizar no elimina objetos ya conocidos', () => {
    expect(resolveComparisonSide(requested, 'district', { ...provinces, status: 'error' },
      { ...districts, status: 'error' }).value).toEqual({ province, district })
  })
  test('un catálogo del territorio anterior no restaura un distrito obsoleto', () => {
    const result = resolveComparisonSide({ province: '2006', district: '200602' }, 'district', {
      status: 'success', data: [{ ...province, ubigeo: '2006' }],
    }, { status: 'pending', data: [district] })
    expect(result.value.district).toBeNull()
    expect(result.status).toBe('pending')
  })
})

describe('escritura de Comparar', () => {
  test('mantiene parámetros ajenos y no muta la entrada', () => {
    const params = new URLSearchParams('x=1&x=2&nivel=district&distritoA=200104')
    const next = withComparisonUrlState(params, readComparisonUrlState(params))
    expect(next.toString()).toBe('x=1&x=2&nivel=district&provinciaA=2001&distritoA=200104')
    expect(params.has('provinciaA')).toBe(false)
  })
  test.each(['', 'provinciaA=2001', 'provinciaB=2001',
    'nivel=district&provinciaA=2001&provinciaB=2006',
    'nivel=district&distritoA=200104&distritoB=200602',
    'nivel=district&distritoA=200104&distritoB=200104',
    'nivel=bad&provinciaA=2001&provinciaB=2001',
    'nivel=district&provinciaA=2002&distritoA=200104'])(
    'normalización y round-trip estables: %s', query => {
      const params = new URLSearchParams(query)
      const state = readComparisonUrlState(params)
      const next = withComparisonUrlState(params, state)
      expect(readComparisonUrlState(next)).toEqual(state)
      expect(withComparisonUrlState(next, state).toString()).toBe(next.toString())
    },
  )
  test('normalizar un lado inexistente conserva los códigos pendientes del otro', () => {
    const params = new URLSearchParams('nivel=district&distritoA=200104&distritoB=200602')
    const state = readComparisonUrlState(params)
    const a = resolveComparisonSide(state.a, state.level, { status: 'success', data: [] }, districts)
    expect(readComparisonUrlState(withComparisonUrlState(params, { ...state, a: a.selection })))
      .toEqual({ ...state, a: empty })
  })
})
