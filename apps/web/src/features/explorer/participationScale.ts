export const participationIntervals = [
  { upper: 50, label: 'Menos de 50 %', color: '#ccfbf1' },
  { upper: 60, label: '50 % a menos de 60 %', color: '#5eead4' },
  { upper: 70, label: '60 % a menos de 70 %', color: '#14b8a6' },
  { upper: 80, label: '70 % a menos de 80 %', color: '#0f766e' },
  { upper: Infinity, label: '80 % a 100 % inclusive', color: '#134e4a' },
]

export function participationColor(value: number | null) {
  return value === null ? '#cbd5e1' : participationIntervals.find(interval => value < interval.upper)!.color
}
