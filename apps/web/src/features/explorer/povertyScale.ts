export const povertyIntervals = [
  { upper: 20, label: 'Menos de 20 %', color: '#fef3c7' },
  { upper: 40, label: '20 % a menos de 40 %', color: '#fcd34d' },
  { upper: 60, label: '40 % a menos de 60 %', color: '#f59e0b' },
  { upper: 80, label: '60 % a menos de 80 %', color: '#b45309' },
  { upper: Infinity, label: '80 % a 100 % inclusive', color: '#78350f' },
]

export function povertyColor(value: number | null) {
  return value === null ? '#cbd5e1' : povertyIntervals.find(interval => value < interval.upper)!.color
}
