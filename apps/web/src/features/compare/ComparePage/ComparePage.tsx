import { useComparisonUrl } from '../useComparisonUrl'
import DelayedApiNotice from '../../../components/DelayedApiNotice/DelayedApiNotice'
import SocioeconomicComparison from '../SocioeconomicComparison/SocioeconomicComparison'
import ElectoralComparison from '../ElectoralComparison/ElectoralComparison'
import ComparisonSelectors from '../ComparisonSelectors/ComparisonSelectors'

const ComparePage = () => {
  const { level, selections, statuses, selectLevel, selectTerritory } = useComparisonUrl()
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
        onLevelChange={selectLevel}
        onSelectionChange={selectTerritory}
      />
      <DelayedApiNotice />
      {(['a', 'b'] as const).map(side => statuses[side] === 'pending'
        ? <p key={side} role="status" className="mt-3 text-sm text-slate-600">Restaurando territorio {side.toUpperCase()}…</p>
        : statuses[side] === 'error'
          ? <p key={side} role="alert" className="mt-3 text-sm text-slate-600">No se pudo validar el territorio {side.toUpperCase()}. Se conserva en la URL para volver a intentarlo al recargar.</p>
          : null)}
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
