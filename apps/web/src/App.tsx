import { Outlet } from 'react-router'
import AppFooter from './components/layout/AppFooter/AppFooter'
import { AppHeader } from './components/layout/AppHeader'

function App() {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  )
}

export default App
