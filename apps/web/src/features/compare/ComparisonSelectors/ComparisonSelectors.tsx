import TerritorySide from '../TerritorySide/TerritorySide'
import type { Province } from '../../../data/provincesQuery'
import type { District } from '../../../data/districtsQuery'

export type ComparisonLevel = 'province' | 'district'
export type ComparisonSelection = { province: Province | null; district: District | null }
type Side = 'a' | 'b'
type Props = {
  level: ComparisonLevel
  selections: Record<Side, ComparisonSelection>
  onLevelChange: (level: ComparisonLevel) => void
  onSelectionChange: (side: Side, selection: ComparisonSelection) => void
}

const ComparisonSelectors = ({ level, selections, onLevelChange, onSelectionChange }: Props) => {
  return (
    <section aria-label="Selección de territorios para comparar">
      <fieldset className="mb-6">
        <legend className="mb-2 text-sm font-medium">Nivel territorial común</legend>
        <div className="flex flex-wrap gap-5 text-sm">
          {([{ value: 'province', label: 'Provincias' }, { value: 'district', label: 'Distritos' }] as const).map(option => (
            <label key={option.value} className="inline-flex items-center gap-2">
              <input type="radio" name="comparison-level" value={option.value} checked={level === option.value} onChange={() => onLevelChange(option.value)} className="accent-teal-700" />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        {(['a', 'b'] as const).map(side => (
          <TerritorySide key={side} side={side} level={level} selection={selections[side]} other={selections[side === 'a' ? 'b' : 'a']} onChange={selection => onSelectionChange(side, selection)} />
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-600">El territorio elegido en un lado no puede seleccionarse en el otro.</p>
    </section>
  )
}

export default ComparisonSelectors
