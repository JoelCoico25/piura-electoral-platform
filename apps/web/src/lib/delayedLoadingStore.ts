import type { QueryCache } from '@tanstack/react-query'

type Source = {
  pendingKeys: () => readonly string[]
  subscribe: (listener: () => void) => () => void
}

export function apiLoadingSource(cache: QueryCache): Source {
  return {
    subscribe: listener => cache.subscribe(listener),
    pendingKeys: () => cache.getAll()
      .filter(query => query.queryKey[0] === 'territories' && query.getObserversCount() > 0 &&
        query.state.status === 'pending' && query.state.fetchStatus === 'fetching')
      .map(query => query.queryHash),
  }
}

type Clock = {
  now: () => number
  schedule: (callback: () => void, delay: number) => () => void
}

const clock: Clock = {
  now: () => Date.now(),
  schedule: (callback, delay) => {
    const timer = setTimeout(callback, delay)
    return () => clearTimeout(timer)
  },
}

// Each active request keeps its own start time across cache notifications.
export function createDelayedLoadingStore(source: Source, timer: Clock = clock) {
  const started = new Map<string, number>()
  let visible = false
  let cancelTimer: (() => void) | undefined
  return {
    getSnapshot: () => visible,
    subscribe(listener: () => void) {
      const update = () => {
        cancelTimer?.()
        const keys = new Set(source.pendingKeys())
        for (const key of started.keys()) if (!keys.has(key)) started.delete(key)
        const now = timer.now()
        for (const key of keys) if (!started.has(key)) started.set(key, now)
        const remaining = Math.min(...[...started.values()].map(start => 3000 - (now - start)))
        const next = remaining <= 0
        if (next !== visible) {
          visible = next
          listener()
        }
        if (Number.isFinite(remaining) && remaining > 0) cancelTimer = timer.schedule(update, remaining)
      }
      const unsubscribe = source.subscribe(update)
      update()
      return () => {
        unsubscribe()
        cancelTimer?.()
        started.clear()
        visible = false
      }
    },
  }
}
