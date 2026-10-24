import { expect, test } from 'bun:test'
import { QueryClient, QueryObserver } from '@tanstack/react-query'
import { apiLoadingSource, createDelayedLoadingStore } from '../src/lib/delayedLoadingStore'

function setup() {
  let now = 0
  let keys: string[] = []
  let changed = () => {}
  let notifications = 0
  const jobs = new Map<number, { at: number; callback: () => void }>()
  let id = 0
  const store = createDelayedLoadingStore({
    pendingKeys: () => keys,
    subscribe: listener => {
      changed = listener
      return () => { changed = () => {} }
    },
  }, {
    now: () => now,
    schedule: (callback, delay) => {
      const key = ++id
      jobs.set(key, { at: now + delay, callback })
      return () => { jobs.delete(key) }
    },
  })
  const stop = store.subscribe(() => { notifications++ })
  return {
    store, stop, jobs,
    notifications: () => notifications,
    pending: (...next: string[]) => { keys = next; changed() },
    advance: (milliseconds: number) => {
      now += milliseconds
      for (const [key, job] of [...jobs]) if (job.at <= now) {
        jobs.delete(key)
        job.callback()
      }
    },
  }
}

test('sin consultas o carga rápida no muestra aviso', () => {
  const s = setup()
  s.advance(4000)
  expect(s.store.getSnapshot()).toBe(false)
  s.pending('provinces')
  s.advance(2999)
  expect(s.store.getSnapshot()).toBe(false)
  s.pending()
  s.advance(4000)
  expect(s.store.getSnapshot()).toBe(false)
  expect(s.notifications()).toBe(0)
  s.stop()
})

test('carga lenta muestra un aviso y completar o fallar lo elimina', () => {
  const s = setup()
  s.pending('elections')
  s.advance(3000)
  expect(s.store.getSnapshot()).toBe(true)
  s.pending()
  expect(s.store.getSnapshot()).toBe(false)
  expect(s.jobs.size).toBe(0)
  s.stop()
})

test('notificaciones y varias consultas no reinician ni repiten anuncios', () => {
  const s = setup()
  s.pending('district-a')
  s.advance(2000)
  s.pending('district-a', 'district-b')
  s.advance(1000)
  expect(s.store.getSnapshot()).toBe(true)
  s.pending('district-a', 'district-b')
  s.advance(4000)
  expect(s.notifications()).toBe(1)
  s.stop()
})

test('otra selección no hereda el tiempo de una consulta abandonada', () => {
  const s = setup()
  s.pending('piura')
  s.advance(2500)
  s.pending('ayabaca')
  s.advance(1000)
  expect(s.store.getSnapshot()).toBe(false)
  s.advance(2000)
  expect(s.store.getSnapshot()).toBe(true)
  s.stop()
})

test('desmontar cancela temporizadores y futuras notificaciones', () => {
  const s = setup()
  s.pending('elections')
  s.stop()
  s.advance(5000)
  s.pending('another')
  expect(s.store.getSnapshot()).toBe(false)
  expect(s.jobs.size).toBe(0)
  expect(s.notifications()).toBe(0)
})

test('una consulta nueva no mantiene el aviso de otra ya resuelta', () => {
  const s = setup()
  s.pending('a')
  s.advance(3000)
  expect(s.store.getSnapshot()).toBe(true)
  s.pending('b')
  expect(s.store.getSnapshot()).toBe(false)
  s.stop()
})

test('caché real: excluye geometrías, consultas inactivas y refetch con datos', () => {
  const client = new QueryClient()
  const cache = client.getQueryCache()
  const pending = () => new Promise<never>(() => {})
  const api = new QueryObserver(client, { queryKey: ['territories', 'elections', '2001'], queryFn: pending })
  const geometry = new QueryObserver(client, { queryKey: ['geometry', 'piura'], queryFn: pending })
  const stopApi = api.subscribe(() => {})
  const stopGeometry = geometry.subscribe(() => {})
  const source = apiLoadingSource(cache)
  expect(source.pendingKeys()).toHaveLength(1)
  client.setQueryData(['territories', 'elections', '2001'], [])
  expect(source.pendingKeys()).toHaveLength(0)
  stopApi()
  stopGeometry()
  client.clear()
})

test('caché real: errores terminales dejan de contar como pendientes', async () => {
  const client = new QueryClient()
  const observer = new QueryObserver(client, {
    queryKey: ['territories', 'provinces', '20'],
    queryFn: async () => { throw new Error('Catálogo inaccesible') },
    retry: false,
  })
  const stop = observer.subscribe(() => {})
  const source = apiLoadingSource(client.getQueryCache())
  expect(source.pendingKeys()).toHaveLength(1)
  await observer.refetch()
  expect(observer.getCurrentResult().isError).toBe(true)
  expect(source.pendingKeys()).toHaveLength(0)
  stop()
  client.clear()
})
