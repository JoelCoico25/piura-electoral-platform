import { NavLink } from 'react-router'
import { preloadExplorerPage } from '../../../app/explorerModule'

const AppHeader = () => {
  return (
    <header className="border-b border-slate-200 bg-white text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 pt-3 text-left sm:px-6 xl:min-h-16 xl:px-8 xl:pt-0">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded bg-teal-50 text-teal-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold leading-tight tracking-tight">
              Piura Electoral
            </p>
            <p className="mt-0.5 text-xs leading-tight text-slate-600">
              Observatorio electoral y socioeconómico
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
          Elecciones 2021
        </span>
        <nav
          aria-label="Navegación principal"
          className="order-last w-full xl:order-none xl:w-auto"
        >
          <ul className="flex min-h-11 flex-wrap items-stretch gap-x-4 text-sm xl:min-h-16">
            {[
              { label: 'Inicio', to: '/' },
              { label: 'Explorar', to: '/explorar' },
              { label: 'Comparar', to: '/comparar' },
              { label: 'Metodología', to: '/metodologia' },
            ].map(({ label, to }) => (
              <li key={to} className="flex">
                <NavLink
                  to={to}
                  end={to === '/'}
                  onPointerEnter={to === '/explorar' ? preloadExplorerPage : undefined}
                  onFocus={to === '/explorar' ? preloadExplorerPage : undefined}
                  onPointerDown={to === '/explorar' ? preloadExplorerPage : undefined}
                  className={({ isActive }) =>
                    `flex items-center border-b-2 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                      isActive
                        ? 'border-teal-700 font-semibold text-teal-700'
                        : 'border-transparent text-slate-500'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded bg-slate-100 px-2 py-1 font-medium text-slate-600">
            8 Provincias · 65 Distritos
          </span>
          <span className="text-slate-500">ONPE / INEI</span>
          <button
            type="button"
            disabled
            title="Descarga pendiente de disponibilidad del archivo CSV"
            className="inline-flex items-center gap-1 rounded px-2 py-1.5 font-medium text-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M12 3v12m-4-4 4 4 4-4M5 16v4h14v-4" />
            </svg>
            Descargar CSV
          </button>
        </div>
      </div>
    </header>
  )
}

export default AppHeader
