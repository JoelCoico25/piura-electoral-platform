import { describe, expect, test } from 'bun:test'
import {
  formatElectoralDifference,
  formatSocioeconomicDifference,
} from '../src/features/compare/comparisonData'

describe('formatElectoralDifference', () => {
  test.each([
    [66.75, 75.34, '+8.59 pp'],
    [75.34, 66.75, '\u22128.59 pp'],
  ] as const)('formats B minus A for %s and %s', (a, b, expected) => {
    expect(formatElectoralDifference(a, b, true)).toBe(expected)
  })

  test('shows equality without a sign or invented decimals', () => {
    expect(formatElectoralDifference(70, 70, true)).toBe('0 pp')
  })

  test.each([
    [1000, 2250, '+1,250 personas'],
    [2250, 1000, '\u22121,250 personas'],
    [1000, 1000, '0 personas'],
  ] as const)('formats counts for %s and %s', (a, b, expected) => {
    expect(formatElectoralDifference(a, b, false)).toBe(expected)
  })

  test.each([
    [null, 70],
    [70, null],
    [null, null],
  ] as const)('preserves missing values for %s and %s', (a, b) => {
    expect(formatElectoralDifference(a, b, true)).toBe('No disponible')
    expect(formatElectoralDifference(a, b, false)).toBe('No disponible')
  })

  test.each([
    [0, 0.00001, '+<0.0001 pp'],
    [0.00001, 0, '\u2212<0.0001 pp'],
  ] as const)('does not display tiny differences as zero for %s and %s', (a, b, expected) => {
    expect(formatElectoralDifference(a, b, true)).toBe(expected)
  })

  test('subtracts original values before rounding the displayed difference', () => {
    expect(formatElectoralDifference(10.004, 10.006, true)).toBe('+0.002 pp')
  })
})

describe('formatSocioeconomicDifference', () => {
  test('expresses the poverty midpoint difference in percentage points', () => {
    expect(formatSocioeconomicDifference(20.125, 25.25, 2018, 2018, 'poverty'))
      .toBe('+5.125 pp')
  })

  test.each(['poverty', 'idh', 'income'] as const)('blocks incompatible years for %s', indicator => {
    expect(formatSocioeconomicDifference(0.5, 0.6, 2018, 2019, indicator))
      .toBe('A\u00f1os no comparables')
  })

  test.each([
    [null, 2019],
    [2019, null],
  ] as const)('requires both reference years: %s and %s', (yearA, yearB) => {
    expect(formatSocioeconomicDifference(0.5, 0.6, yearA, yearB, 'idh'))
      .toBe('No disponible')
  })

  test.each([
    [null, 0.6],
    [0.5, null],
  ] as const)('preserves unavailable indicators for %s and %s', (a, b) => {
    expect(formatSocioeconomicDifference(a, b, 2019, 2019, 'idh'))
      .toBe('No disponible')
  })

  test('keeps six-decimal precision for IDH differences', () => {
    expect(formatSocioeconomicDifference(0.5, 0.62345678, 2019, 2019, 'idh'))
      .toBe('+0.123457 unidades del \u00edndice')
  })

  test.each([
    [1000, 2028.92, '+1,028.92 S/ por persona al mes'],
    [2028.92, 1000, '\u22121,028.92 S/ por persona al mes'],
  ] as const)('formats income with its sign and units for %s and %s', (a, b, expected) => {
    expect(formatSocioeconomicDifference(a, b, 2019, 2019, 'income')).toBe(expected)
  })

  test.each([
    ['poverty', '0 pp'],
    ['idh', '0 unidades del \u00edndice'],
    ['income', '0 S/ por persona al mes'],
  ] as const)('retains the unit for equal %s values', (indicator, expected) => {
    expect(formatSocioeconomicDifference(0.5, 0.5, 2019, 2019, indicator)).toBe(expected)
  })

  test('does not round a tiny negative income difference to negative zero', () => {
    expect(formatSocioeconomicDifference(1000.001, 1000, 2019, 2019, 'income'))
      .toBe('\u2212<0.01 S/ por persona al mes')
  })
})
