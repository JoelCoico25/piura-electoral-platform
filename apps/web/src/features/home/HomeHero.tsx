import { Link } from 'react-router'

export function HomeHero() {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative overflow-hidden bg-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#0f766e_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.035]"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-16 lg:px-8">
        <div className="flex max-w-4xl flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded bg-teal-50 px-2.5 py-1 text-xs font-semibold tracking-wide text-teal-700 uppercase">
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-teal-700" />
              Observatorio regional de datos electorales y socioeconómicos
            </span>
            <span className="rounded bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
              Fuentes: ONPE · INEI · PNUD
            </span>
          </div>
          <h1
            id="home-hero-title"
            className="text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-[40px] md:leading-[48px]"
          >
            Explora la participación electoral en la región Piura
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-slate-600">
            Analiza la participación y el ausentismo en las dos vueltas de las
            elecciones presidenciales de 2021 en Piura y su relación con la
            pobreza, el Índice de Desarrollo Humano (IDH) y los ingresos.
          </p>
          <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:flex-wrap">
            <Link
              to="/explorar"
              className="inline-flex items-center justify-center rounded bg-teal-700 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Explorar mapa interactivo
            </Link>
            <Link
              to="/comparar"
              className="inline-flex items-center justify-center rounded bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Comparar territorios
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
