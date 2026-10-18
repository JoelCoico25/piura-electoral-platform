import { createNumberFormatter, decimalFormat, integerFormat } from '../../../lib/numberFormat'
import { regionalSnapshot } from '../regionalSnapshot'

const percentageFormat = decimalFormat
const variationFormat = createNumberFormatter({
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'always',
})

const RegionalElectoralMetrics = () => {
  const { participation, scope } = regionalSnapshot

  const metrics = [
    { label: 'Participación 1ª vuelta', value: participation.firstRound, variation: false },
    { label: 'Participación 2ª vuelta', value: participation.secondRound, variation: false },
    { label: 'Variación entre vueltas', value: participation.variation, variation: true },
  ]

  return (
    <section
      aria-labelledby="regional-metrics-title"
      className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
    >
      <h2 id="regional-metrics-title" className="mb-4 text-lg font-semibold text-slate-900">
        Participación regional · Elecciones presidenciales 2021
      </h2>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded border border-slate-200 bg-white p-4">
          <dt className="text-xs font-medium tracking-wide text-slate-600 uppercase">Alcance territorial</dt>
          <dd className="mt-3 text-3xl font-bold tracking-tight text-teal-700 tabular-nums">
            <>
                <span className="block">{integerFormat.format(scope.provinces)} provincias</span>
                <span className="mt-2 block text-base font-medium">
                  {scope.districts === null ? 'Distritos: No disponible' : `${integerFormat.format(scope.districts)} distritos`}
                </span>
            </>
          </dd>
        </div>
        {metrics.map(metric => (
          <div key={metric.label} className="rounded border border-slate-200 bg-white p-4">
            <dt className="text-xs font-medium tracking-wide text-slate-600 uppercase">{metric.label}</dt>
            <dd className="mt-3 text-3xl font-bold tracking-tight text-teal-700 tabular-nums">
              {metric.value === null ? 'No disponible' : metric.variation
                ? `${variationFormat.format(metric.value)} pp`
                : `${percentageFormat.format(metric.value)} %`}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-slate-500">Agregado regional de Piura. Variación: segunda vuelta menos primera vuelta.</p>
    </section>
  )
}

export default RegionalElectoralMetrics
