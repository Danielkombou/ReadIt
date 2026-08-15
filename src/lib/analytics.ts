interface TrackProps {
  [key: string]: string | number | boolean
}

export interface TrackEvent {
  name: string
  props?: TrackProps
  ts: number
  sessionId: string
  clientId: string
}

const STORAGE_KEY = 'readit:events'
const CLIENT_KEY = 'readit:client-id'
const FLUSH_INTERVAL = 10000
const MAX_EVENTS = 500

function getClientId(): string {
  try {
    let id = window.localStorage.getItem(CLIENT_KEY)
    if (!id) {
      id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
      window.localStorage.setItem(CLIENT_KEY, id)
    }
    return id
  } catch {
    return 'unknown'
  }
}

const sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
  ? crypto.randomUUID()
  : `${Date.now()}`
const clientId = getClientId()
const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined

const events: TrackEvent[] = []
let flushTimer: number | null = null

function persist() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]') as TrackEvent[]
    stored.push(...events)
    events.length = 0
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored.slice(-MAX_EVENTS)))
  } catch {
    events.length = 0
  }
}

function flush() {
  if (!endpoint || events.length === 0) return
  const batch = [...events]
  events.length = 0
  const body = JSON.stringify(batch)
  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }))
  } else {
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
  }
}

function scheduleFlush() {
  if (flushTimer !== null) return
  flushTimer = window.setInterval(flush, FLUSH_INTERVAL)
}

export function track(name: string, props?: TrackProps) {
  events.push({ name, props, ts: Date.now(), sessionId, clientId })
  persist()
  if (import.meta.env.DEV) console.debug('[analytics]', name, props ?? {})
  scheduleFlush()
}

export function trackPageView() {
  track('page_view', { path: window.location.pathname })
}

export function getStoredEvents(): TrackEvent[] {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]') as TrackEvent[]
  } catch {
    return []
  }
}

export function clearStoredEvents() {
  events.length = 0
  window.localStorage.removeItem(STORAGE_KEY)
}

if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
  window.addEventListener('pagehide', flush)
}