import { describe, expect, test } from 'bun:test'
import { regionalParticipation } from '../src/features/home/regionalElectoralData'
import type { ElectoralResult } from '../src/features/explorer/electoralData'

const firstRound: ElectoralResult = {
  anio: 2021,
  vuelta: 1,
  participacion_pct: 66.75,
  ausentismo_pct: 33.25,
  electores_habiles: 10000,
  votantes: 6675,
}

const secondRound: ElectoralResult = {
  anio: 2021,
  vuelta: 2,
  participacion_pct: 75.34,
  ausentismo_pct: 24.66,
  electores_habiles: 10000,
  votantes: 7534,
}

describe('regionalParticipation', () => {
  test('selects both 2021 rounds regardless of array order', () => {
    const result = regionalParticipation([secondRound, firstRound])
    expect(result.firstRound).toBe(66.75)
    expect(result.secondRound).toBe(75.34)
  })

  test('calculates second round minus first round with decimal tolerance', () => {
    const result = regionalParticipation([firstRound, secondRound])
    expect(result.variation).toBeCloseTo(8.59, 10)
  })

  test('ignores results from other years even when they appear first', () => {
    const result = regionalParticipation([
      { ...firstRound, anio: 2020, participacion_pct: 40 },
      { ...secondRound, anio: 2022, participacion_pct: 50 },
      secondRound,
      firstRound,
    ])
    expect(result.firstRound).toBe(66.75)
    expect(result.secondRound).toBe(75.34)
    expect(result.variation).toBeCloseTo(8.59, 10)
  })

  test('returns no data when only other years are available', () => {
    expect(regionalParticipation([
      { ...firstRound, anio: 2020 },
      { ...secondRound, anio: 2020 },
    ])).toEqual({ firstRound: null, secondRound: null, variation: null })
  })

  test('preserves the second round when the first is absent', () => {
    expect(regionalParticipation([secondRound]))
      .toEqual({ firstRound: null, secondRound: 75.34, variation: null })
  })

  test('preserves the first round when the second is absent', () => {
    expect(regionalParticipation([firstRound]))
      .toEqual({ firstRound: 66.75, secondRound: null, variation: null })
  })

  test('returns null values for an empty list', () => {
    expect(regionalParticipation([]))
      .toEqual({ firstRound: null, secondRound: null, variation: null })
  })

  test('does not treat a null first-round percentage as zero', () => {
    expect(regionalParticipation([{ ...firstRound, participacion_pct: null }, secondRound]))
      .toEqual({ firstRound: null, secondRound: 75.34, variation: null })
  })

  test('does not treat a null second-round percentage as zero', () => {
    expect(regionalParticipation([firstRound, { ...secondRound, participacion_pct: null }]))
      .toEqual({ firstRound: 66.75, secondRound: null, variation: null })
  })
})
