import { MethodologyPage } from '../features/methodology/MethodologyPage'
import { ComparePage } from '../features/compare/ComparePage'
import { lazy, Suspense } from 'react'
import { loadExplorerPage } from './explorerModule'
import { createBrowserRouter } from 'react-router'
import App from './App/App'
import HomePage from '../features/home/HomePage/HomePage'
import { NotFoundPage } from './PlaceholderPages'

const lazyPages = {
  Explorer: lazy(loadExplorerPage),
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'explorar',
        element: (
          <Suspense fallback={<p role="status" className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-600 sm:px-6 lg:px-8">Cargando explorador territorial…</p>}>
            <lazyPages.Explorer />
          </Suspense>
        ),
      },
      { path: 'comparar', element: <ComparePage /> },
      { path: 'metodologia', element: <MethodologyPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
