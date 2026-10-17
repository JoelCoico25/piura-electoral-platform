import { useState } from 'react'
import SocioeconomicComparison from '../SocioeconomicComparison/SocioeconomicComparison'
import ElectoralComparison from '../ElectoralComparison/ElectoralComparison'
import ComparisonSelectors from '../ComparisonSelectors/ComparisonSelectors'
import type { ComparisonLevel, ComparisonSelection } from '../ComparisonSelectors/ComparisonSelectors'

const emptySelection: ComparisonSelection = { province: null, district: null }

const ComparePage = () => {
  const [level, setLevel] = useState<ComparisonLevel>('province')
  const [selections, setSelections] = useState({ a: emptySelection, b: emptySelection })
  const a = level === 'province' ? selections.a.province : selections.a.district
  const b = level === 'province' ? selections.b.province : selections.b.district
  const ready = a && b && a.ubigeo !== b.ubigeo

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Comparar territorios</h1>
      <p className="mb-6 text-sm text-slate-600">Selecciona dos provincias o dos distritos de Piura. Los distritos pueden pertenecer a provincias diferentes.</p>
      <ComparisonSelectors
        level={level}
        selections={selections}
        onLevelChange={next => {
          setLevel(next)
          setSelections({ a: emptySelection, b: emptySelection })
        }}
        onSelectionChange={(side, selection) => {
          setSelections(current => {
            const other = current[side === 'a' ? 'b' : 'a']
            const selectedCode = level === 'province' ? selection.province?.ubigeo : selection.district?.ubigeo
            const otherCode = level === 'province' ? other.province?.ubigeo : other.district?.ubigeo
            return selectedCode && selectedCode === otherCode ? current : { ...current, [side]: selection }
          })
        }}
      />
      {ready ? <ElectoralComparison a={a} b={b} /> : (
        <p role="status" className="mt-6 text-sm text-slate-600">Selecciona dos territorios distintos del mismo nivel para preparar la comparación.</p>
      )}
      {level === 'district' && ready && selections.a.district && selections.b.district && (
        <SocioeconomicComparison a={selections.a.district} b={selections.b.district} />
      )}
    </div>
  )
}

export default ComparePage
