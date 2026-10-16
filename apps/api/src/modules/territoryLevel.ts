export function territoryLevel(id: string): 'departamento' | 'provincia' | 'distrito' {
  if (id.length === 2) return 'departamento';
  if (id.length === 4) return 'provincia';
  return 'distrito';
}
