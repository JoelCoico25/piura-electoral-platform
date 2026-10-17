import { Link } from 'react-router'

const socialLinks = [
  { name: 'Instagram', href: 'https://www.instagram.com/joel.lertua/', path: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M17.5 6.5h.01' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/joel-lertua-coico-125ab2218/', path: 'M4 9v11 M4 4v.01 M10 20V9 M10 14a5 5 0 0 1 10 0v6' },
  { name: 'GitHub', href: 'https://github.com/JoelCoico25', path: 'M9 19c-4 1-4-2-6-2 M15 22v-4a3.5 3.5 0 0 0-1-3c3-.4 6-1.5 6-6a5 5 0 0 0-1.5-3.5A4.5 4.5 0 0 0 18.4 2S17 1.6 14.5 3a13 13 0 0 0-5 0C7 1.6 5.6 2 5.6 2a4.5 4.5 0 0 0-.1 3.5A5 5 0 0 0 4 9c0 4.5 3 5.6 6 6a3.5 3.5 0 0 0-1 3v4' },
]

const AppFooter = () => {
  return (
    <footer className="border-t border-slate-200 bg-white text-sm text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p className="text-xs">
            <span className="mr-2 text-sm font-semibold text-slate-900">Piura Electoral</span>
            Datos electorales y socioeconómicos de Piura.
          </p>
          <div className="flex flex-wrap items-center gap-x-4">
            <nav aria-label="Navegación del pie de página">
              <ul className="flex items-center gap-4">
                <li><Link to="/" className="inline-flex min-h-11 items-center rounded hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">Inicio</Link></li>
                <li><Link to="/explorar" className="inline-flex min-h-11 items-center rounded hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">Explorar</Link></li>
              </ul>
            </nav>
            <ul aria-label="Redes sociales de Joel Lertua" className="flex items-center">
              {socialLinks.map(({ name, href, path }) => (
                <li key={name}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${name} de Joel Lertua (abre en otra pestaña)`} className="inline-flex size-11 items-center justify-center rounded hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true" focusable="false"><path d={path} /></svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs leading-relaxed text-slate-500">
          <p>© {new Date().getFullYear()} Piura Electoral</p>
          <p>Desarrollado por Joel Lertua</p>
          <p>Fuentes: <abbr title="Oficina Nacional de Procesos Electorales">ONPE</abbr> · <abbr title="Instituto Nacional de Estadística e Informática">INEI</abbr> · <abbr title="Programa de las Naciones Unidas para el Desarrollo">PNUD</abbr>.</p>
          <p>Proyecto independiente, sin afiliación oficial a organismos electorales.</p>
        </div>
      </div>
    </footer>
  )
}

export default AppFooter
