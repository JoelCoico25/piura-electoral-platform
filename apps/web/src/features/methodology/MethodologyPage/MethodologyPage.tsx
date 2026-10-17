const MethodologyPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Metodología</h1>
      <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
        Conoce el alcance y la procedencia documentada de la información electoral y socioeconómica que presenta Piura Electoral.
      </p>

      <ul aria-label="Resumen de cobertura" className="mb-6 mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
        <li className="rounded bg-slate-100 px-2 py-1">8 provincias</li>
        <li className="rounded bg-slate-100 px-2 py-1">65 distritos</li>
        <li className="rounded bg-slate-100 px-2 py-1">Elecciones 2021</li>
      </ul>

      <section aria-labelledby="methodology-scope-title" className="mt-4">
        <details className="border-b border-slate-200">
          <summary className="cursor-pointer rounded py-4 marker:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
            <h2 id="methodology-scope-title" className="inline text-base font-semibold">Alcance geográfico y temporal</h2>
            <span className="mt-1 block text-xs leading-relaxed text-slate-600">Territorios incluidos y años de referencia de cada indicador.</span>
          </summary>
          <div className="pb-4 pt-1">
            <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
              El proyecto analiza el departamento de Piura. La cobertura territorial documentada comprende 8 provincias y 65 distritos.
            </p>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
              <div className="min-w-0">
                <dt className="font-medium">Elecciones presidenciales</dt>
                <dd className="mt-2 text-slate-600">2021 · Primera y segunda vuelta.</dd>
              </div>
              <div className="min-w-0">
                <dt className="font-medium">Pobreza monetaria</dt>
                <dd className="mt-2 text-slate-600">2018 · Información distrital.</dd>
              </div>
              <div className="min-w-0">
                <dt className="font-medium">IDH e ingreso familiar per cápita mensual</dt>
                <dd className="mt-2 text-slate-600">2019 · Información distrital.</dd>
              </div>
            </dl>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600">
              La información socioeconómica se presenta únicamente a nivel distrital. Cada fuente tiene su propio año de referencia: estos datos no deben interpretarse como un único periodo de medición.
            </p>
          </div>
        </details>
      </section>

      <section aria-labelledby="methodology-sources-title" className="mt-4">
        <details className="border-b border-slate-200">
          <summary className="cursor-pointer rounded py-4 marker:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
            <h2 id="methodology-sources-title" className="inline text-base font-semibold">Fuentes de información y trazabilidad</h2>
            <span className="mt-1 block text-xs leading-relaxed text-slate-600">Instituciones, archivos de origen y referencias documentadas.</span>
          </summary>
          <div className="pb-4 pt-1">
            <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
              Las atribuciones siguientes corresponden a la documentación del proyecto. Los nombres de archivo son identificadores técnicos, no títulos oficiales de publicaciones.
            </p>
            <dl className="mt-4 divide-y divide-slate-200 text-sm">
              <div className="py-4 first:pt-0">
                <dt className="font-medium">Oficina Nacional de Procesos Electorales (ONPE)</dt>
                <dd className="mt-2 max-w-3xl space-y-2 leading-relaxed text-slate-600">
                  <p>Resultados electorales de las dos vueltas presidenciales de 2021. Archivos identificados por el patrón <code className="break-all text-xs">Resultados_*_Version_PCM*.csv</code>.</p>
                  <ul className="flex flex-wrap gap-x-5 gap-y-2">
                    {[
                      { label: 'Resultados por mesa · Primera vuelta 2021', href: 'https://www.datosabiertos.gob.pe/dataset/resultados-por-mesa-de-las-elecciones-presidenciales-2021-primera-vuelta-oficina-nacional-de' },
                      { label: 'Resultados por mesa · Segunda vuelta 2021', href: 'https://www.datosabiertos.gob.pe/dataset/resultados-por-mesa-de-las-elecciones-presidenciales-2021-segunda-vuelta-oficina-nacional-de' },
                    ].map(({ label, href }) => (
                      <li key={href}><a href={href} target="_blank" rel="noopener noreferrer" className="rounded text-teal-700 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">{label}<span className="sr-only"> (abre en otra pestaña)</span></a></li>
                    ))}
                  </ul>
                  <p className="text-xs">La auditoría contrastó 130 registros distritales, 65 por vuelta. Primera vuelta: 932,186 votantes y 1,396,448 electores hábiles; segunda: 1,052,088 y 1,396,448, respectivamente. Los conjuntos declaran Open Data Commons Attribution (ODC-By), con obligaciones de atribución a ONPE y referencia a la fuente y licencia al redistribuir datos derivados.</p>
                </dd>
              </div>
              <div className="py-4">
                <dt className="font-medium">Instituto Nacional de Estadística e Informática (INEI)</dt>
                <dd className="mt-2 max-w-3xl space-y-2 leading-relaxed text-slate-600">
                  <p>Mapa de Pobreza Provincial y Distrital 2018. Archivo local: <code className="break-all text-xs">Anexo Estadístico(1).xlsx</code>; el importador utiliza la hoja <code className="text-xs">A3.22</code>.</p>
                  <ul className="flex flex-wrap gap-x-5 gap-y-2">
                    {[
                      { label: 'INEI · Cifras de pobreza', href: 'https://www1.inei.gob.pe/cifras-de-pobreza/' },
                      { label: 'Anexo estadístico oficial (XLSX)', href: 'https://www.inei.gob.pe/media/MenuRecursivo/publicaciones_digitales/Est/Lib1718/Anexos.xlsx' },
                    ].map(({ label, href }) => (
                      <li key={href}><a href={href} target="_blank" rel="noopener noreferrer" className="rounded text-teal-700 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">{label}<span className="sr-only"> (abre en otra pestaña)</span></a></li>
                    ))}
                  </ul>
                  <p className="text-xs">Coinciden los límites de pobreza de 65 distritos. El punto medio lo calcula la plataforma; no es un dato puntual publicado directamente por INEI. No se ha acreditado autorización de redistribución.</p>
                </dd>
              </div>
              <div className="py-4">
                <dt className="font-medium">Programa de las Naciones Unidas para el Desarrollo (PNUD)</dt>
                <dd className="mt-2 max-w-3xl space-y-2 leading-relaxed text-slate-600">
                  <p>Índice de Desarrollo Humano (IDH) e ingreso familiar per cápita mensual de 2019. Archivo: <code className="break-all text-xs">IDH-2019(1).xlsx</code>, hoja <code className="text-xs">Distrital</code>.</p>
                  <ul className="flex flex-wrap gap-x-5 gap-y-2">
                    {[
                      { label: 'PNUD · El reto de la igualdad', href: 'https://www.undp.org/es/peru/publicaciones/el-reto-de-la-igualdad' },
                      { label: 'Datos IDH 2019 (XLSX)', href: 'https://www.undp.org/sites/g/files/zskgke326/files/migration/pe/IDH-2019.xlsx' },
                    ].map(({ label, href }) => (
                      <li key={href}><a href={href} target="_blank" rel="noopener noreferrer" className="rounded text-teal-700 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">{label}<span className="sr-only"> (abre en otra pestaña)</span></a></li>
                    ))}
                  </ul>
                  <p className="text-xs">Coinciden los valores de IDH e ingreso de 65 distritos. No se ha acreditado autorización de redistribución.</p>
                </dd>
              </div>
              <div className="py-4">
                <dt className="font-medium">Catálogo territorial UBIGEO</dt>
                <dd className="mt-2 max-w-3xl space-y-2 leading-relaxed text-slate-600">
                  <p>Archivo: <code className="break-all text-xs">UBIGEOS_2022_1891_distritos.csv</code>. La referencia 2022 procede del nombre del archivo.</p>
                  <p className="text-xs">Institución de procedencia, referencia original y URL no acreditadas en la documentación disponible. La autorización de redistribución también sigue pendiente.</p>
                </dd>
              </div>
              <div className="py-4 last:pb-0">
                <dt className="font-medium">Cartografía provincial y distrital · IGN</dt>
                <dd className="mt-2 max-w-3xl space-y-2 leading-relaxed text-slate-600">
                  <p>Derivadas del recurso distrital publicado por IGN bajo ODC-By, escala referencial 1:100,000. El atributo de fuente indica INEI. La publicación del recurso es del 24 de junio de 2025; no acredita la vigencia histórica de los límites.</p>
                  <ul className="flex flex-wrap gap-x-5 gap-y-2">
                    {[
                      { label: 'Conjunto IGN', href: 'https://www.datosabiertos.gob.pe/dataset/limites-departamentales' },
                      { label: 'Licencia ODC-By', href: 'https://opendatacommons.org/licenses/by/1-0/' },
                      { label: 'Distritos IGN (ZIP)', href: 'https://www.datosabiertos.gob.pe/sites/default/files/DISTRITOS_LIMITES.zip' },
                    ].map(({ label, href }) => (
                      <li key={href}><a href={href} target="_blank" rel="noopener noreferrer" className="rounded text-teal-700 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">{label}<span className="sr-only"> (abre en otra pestaña)</span></a></li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
            <p className="mt-4 max-w-3xl text-xs leading-relaxed text-slate-600">Las coincidencias numéricas verificadas respaldan los datos procesados, pero no demuestran la identidad binaria de los archivos históricos utilizados.</p>
          </div>
        </details>
      </section>

      <section aria-labelledby="methodology-electoral-title" className="mt-4">
        <details className="border-b border-slate-200">
          <summary className="cursor-pointer rounded py-4 marker:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
            <h2 id="methodology-electoral-title" className="inline text-base font-semibold">Indicadores electorales y fórmulas</h2>
            <span className="mt-1 block text-xs leading-relaxed text-slate-600">Definiciones, tasas electorales y agregación territorial.</span>
          </summary>
          <div className="pb-4 pt-1">
            <dl className="max-w-3xl space-y-4 text-sm leading-relaxed">
              <div>
                <dt className="font-medium">Electores hábiles</dt>
                <dd className="mt-1 text-slate-600">Total de personas habilitadas para votar según los registros utilizados.</dd>
              </div>
              <div>
                <dt className="font-medium">Votantes</dt>
                <dd className="mt-1 text-slate-600">Suma de <code className="text-xs">N_CVAS</code> según el procesamiento documentado.</dd>
              </div>
              <div>
                <dt className="font-medium">Participación electoral (%)</dt>
                <dd className="mt-1 text-slate-600">100 × votantes / electores hábiles.</dd>
              </div>
              <div>
                <dt className="font-medium">Ausentismo electoral (%)</dt>
                <dd className="mt-1 text-slate-600">100 × (electores hábiles − votantes) / electores hábiles.</dd>
              </div>
              <div>
                <dt className="font-medium">Ausentes (personas)</dt>
                <dd className="mt-1 text-slate-600">Electores hábiles − votantes.</dd>
              </div>
            </dl>
            <div className="mt-4 max-w-3xl space-y-2 text-sm leading-relaxed text-slate-600">
              <p>Si los electores hábiles son cero, los porcentajes se representan como no disponibles. La API entrega las tasas redondeadas a cuatro decimales.</p>
              <p>Los agregados provinciales y regionales suman primero los conteos distritales de electores hábiles y votantes y después calculan las tasas. No se promedian los porcentajes distritales.</p>
              <p className="text-xs">Estas fórmulas describen el procesamiento implementado; no implican una nueva verificación de los archivos originales.</p>
            </div>
          </div>
        </details>
      </section>

      <section aria-labelledby="methodology-socioeconomic-title" className="mt-4">
        <details className="border-b border-slate-200">
          <summary className="cursor-pointer rounded py-4 marker:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
            <h2 id="methodology-socioeconomic-title" className="inline text-base font-semibold">Indicadores socioeconómicos</h2>
            <span className="mt-1 block text-xs leading-relaxed text-slate-600">Intervalos de pobreza, IDH e ingreso distrital.</span>
          </summary>
          <div className="pb-4 pt-1">
            <dl className="max-w-3xl space-y-4 text-sm leading-relaxed">
              <div>
                <dt className="font-medium">Pobreza monetaria distrital · 2018</dt>
                <dd className="mt-1 space-y-2 text-slate-600">
                  <p>Se utilizan los límites inferior y superior del intervalo, expresados en porcentaje.</p>
                  <p>Punto medio estimado = (límite inferior + límite superior) / 2.</p>
                  <p>El punto medio no es una medición puntual independiente. No se atribuye un nivel de confianza al intervalo porque no está documentado.</p>
                </dd>
              </div>
              <div>
                <dt className="font-medium">Índice de Desarrollo Humano (IDH) distrital · 2019</dt>
                <dd className="mt-1 text-slate-600">Valor importado de la fuente, en escala de 0 a 1. La plataforma no reconstruye el índice.</dd>
              </div>
              <div>
                <dt className="font-medium">Ingreso familiar per cápita mensual · 2019</dt>
                <dd className="mt-1 text-slate-600">Valor importado de la fuente, expresado en soles por persona al mes.</dd>
              </div>
            </dl>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600">Estos indicadores están disponibles únicamente a nivel distrital.</p>
          </div>
        </details>
      </section>

      <section aria-labelledby="methodology-comparisons-title" className="mt-4">
        <details className="border-b border-slate-200">
          <summary className="cursor-pointer rounded py-4 marker:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
            <h2 id="methodology-comparisons-title" className="inline text-base font-semibold">Reglas de comparación</h2>
            <span className="mt-1 block text-xs leading-relaxed text-slate-600">Diferencias, unidades y condiciones para comparar datos.</span>
          </summary>
          <div className="pb-4 pt-1">
            <dl className="max-w-3xl space-y-4 text-sm leading-relaxed">
              <div>
                <dt className="font-medium">Entre vueltas electorales</dt>
                <dd className="mt-1 text-slate-600">Variación = segunda vuelta − primera vuelta.</dd>
              </div>
              <div>
                <dt className="font-medium">Entre territorios</dt>
                <dd className="mt-1 text-slate-600">Diferencia = territorio B − territorio A, entre dos provincias o dos distritos.</dd>
              </div>
              <div>
                <dt className="font-medium">Unidades de las diferencias</dt>
                <dd className="mt-1 text-slate-600">
                  <ul className="list-disc space-y-1 pl-5">
                    <li>Participación, ausentismo y punto medio de pobreza: puntos porcentuales (pp).</li>
                    <li>Electores hábiles y votantes: diferencias absolutas en personas.</li>
                    <li>IDH: unidades del índice.</li>
                    <li>Ingreso: soles por persona al mes.</li>
                  </ul>
                </dd>
              </div>
            </dl>
            <div className="mt-4 max-w-3xl space-y-2 text-sm leading-relaxed text-slate-600">
              <p>Los cálculos utilizan los valores numéricos recibidos antes de aplicar el formato visual. Si faltan valores, la diferencia se muestra como «No disponible»; no se inventan resultados.</p>
              <p>Si los años de un indicador socioeconómico no coinciden entre A y B, se conservan ambos valores y sus años, pero se bloquea su diferencia y se indica «Años no comparables».</p>
              <p>Un signo positivo o negativo describe la dirección de la diferencia; no implica automáticamente una valoración favorable o desfavorable.</p>
            </div>
          </div>
        </details>
      </section>

      <section aria-labelledby="methodology-territorial-title" className="mt-4">
        <details className="border-b border-slate-200">
          <summary className="cursor-pointer rounded py-4 marker:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
            <h2 id="methodology-territorial-title" className="inline text-base font-semibold">Procesamiento territorial</h2>
            <span className="mt-1 block text-xs leading-relaxed text-slate-600">Identificación de territorios y conciliación de registros.</span>
          </summary>
          <div className="max-w-3xl space-y-3 pb-4 pt-1 text-sm leading-relaxed text-slate-600">
            <p>Los UBIGEO se conservan como texto para mantener los ceros iniciales. Se utilizan códigos de departamento, provincia y distrito.</p>
            <p>Los importadores normalizan nombres territoriales para conciliar registros y contemplan dos alias explícitos para variantes de nombres.</p>
            <p>Los agregados electorales provinciales y regionales se obtienen sumando conteos distritales. No se construyen agregados socioeconómicos provinciales.</p>
          </div>
        </details>
      </section>

      <section aria-labelledby="methodology-cartography-title" className="mt-4">
        <details className="border-b border-slate-200">
          <summary className="cursor-pointer rounded py-4 marker:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
            <h2 id="methodology-cartography-title" className="inline text-base font-semibold">Cartografía</h2>
            <span className="mt-1 block text-xs leading-relaxed text-slate-600">Procedencia, formato y verificaciones pendientes de las geometrías.</span>
          </summary>
          <div className="max-w-3xl space-y-3 pb-4 pt-1 text-sm leading-relaxed text-slate-600">
            <p>Las geometrías derivan del recurso distrital IGN bajo ODC-By, consultado el 17 de octubre de 2026. El atributo de fuente indica INEI. Se conservan sus avisos de atribución.</p>
            <p>Se filtra Piura por código de departamento 20 y se convierte a GeoJSON MultiPolygon en WGS84, longitud y latitud, sin simplificación. Las ocho provincias son geometrías derivadas mediante unión de sus distritos por UBIGEO provincial.</p>
            <p>Se comprobó la validez geométrica individual con GEOS para los 65 distritos y las ocho provincias derivadas. Esto no certifica exactitud territorial ni descarta por sí solo huecos o solapamientos entre entidades.</p>
            <p>Los 8 y 65 UBIGEO coinciden exactamente con el catálogo consultado en PostgreSQL mediante la API. El ZIP original se identifica por SHA-256 en la documentación de fuentes.</p>
            <p>La coincidencia de UBIGEO no demuestra por sí sola la estabilidad histórica de los límites territoriales.</p>
          </div>
        </details>
      </section>

      <section aria-labelledby="methodology-limitations-title" className="mt-4">
        <details className="border-b border-slate-200">
          <summary className="cursor-pointer rounded py-4 marker:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
            <h2 id="methodology-limitations-title" className="inline text-base font-semibold">Tratamiento de datos y limitaciones</h2>
            <span className="mt-1 block text-xs leading-relaxed text-slate-600">Años distintos, datos ausentes y alcance de la interpretación.</span>
          </summary>
          <div className="max-w-3xl space-y-3 pb-4 pt-1 text-sm leading-relaxed text-slate-600">
            <p>Las referencias temporales son diferentes: pobreza 2018, desarrollo humano e ingresos 2019, elecciones 2021, catálogo territorial 2022 y cartografía 2023. No representan una medición simultánea.</p>
            <p>Las comparaciones son descriptivas, no causales. No permiten concluir que un indicador provoque cambios en otro.</p>
            <p>Los ingresos no están ajustados por inflación en el procesamiento revisado. El nivel de confianza de los intervalos de pobreza no está documentado. La información socioeconómica solo está disponible a nivel distrital.</p>
            <p>En la interfaz, los valores null se presentan como no disponibles. En cambio, el importador electoral convierte determinados campos vacíos de votantes y electores hábiles en cero. No todos los valores ausentes se preservan como null.</p>
            <p>Las publicaciones oficiales de ONPE, INEI y PNUD están identificadas, pero la trazabilidad histórica no está completa. ONPE y el conjunto cartográfico IGN utilizado declaran ODC-By con obligaciones de atribución. No se ha acreditado autorización de redistribución para pobreza, IDH e ingresos ni catálogo UBIGEO; no se presupone una licencia abierta para estos recursos.</p>
          </div>
        </details>
      </section>

      <section aria-labelledby="methodology-traceability-title" className="mt-4">
        <details className="border-b border-slate-200">
          <summary className="cursor-pointer rounded py-4 marker:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
            <h2 id="methodology-traceability-title" className="inline text-base font-semibold">Discrepancias documentales</h2>
            <span className="mt-1 block text-xs leading-relaxed text-slate-600">Observaciones sobre la correspondencia entre documentación y procesamiento.</span>
          </summary>
          <div className="max-w-3xl space-y-3 pb-4 pt-1 text-sm leading-relaxed text-slate-600">
            <p>La referencia documental de pobreza se corrigió de Anexo1 a A3.22, la hoja utilizada por el importador y contrastada con el anexo oficial.</p>
            <p>En el importador electoral revisado no se verificó un filtro explícito por estado de acta. Esta observación describe el código disponible, sin certificar el tratamiento previo de los archivos de origen.</p>
            <p>La descripción metodológica corresponde al procesamiento implementado y no constituye una nueva certificación de los archivos originales.</p>
          </div>
        </details>
      </section>
    </div>
  )
}

export default MethodologyPage
