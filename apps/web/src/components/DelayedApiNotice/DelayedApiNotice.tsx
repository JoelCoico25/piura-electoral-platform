import { useMemo, useSyncExternalStore } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { apiLoadingSource, createDelayedLoadingStore } from '../../lib/delayedLoadingStore'

const DelayedApiNotice = () => {
  const client = useQueryClient()
  const store = useMemo(() => createDelayedLoadingStore(apiLoadingSource(client.getQueryCache())), [client])
  const visible = useSyncExternalStore(store.subscribe, store.getSnapshot, () => false)

  return (
    <div role="status" aria-live="polite" aria-atomic="true">
      {visible && (
        <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          <p className="font-medium text-slate-900">Preparando los datos…</p>
          <p className="mt-1">La primera consulta puede tardar un poco más debido al inicio del servidor. Gracias por tu paciencia</p>
        </div>
      )}
    </div>
  )
}

export default DelayedApiNotice
