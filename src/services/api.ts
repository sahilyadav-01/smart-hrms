const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

type Session = { token: string; refreshToken: string }
const SESSION_KEY = 'peoplely.session'

export const sessionStore = {
  get(): Session | null { try { const value = localStorage.getItem(SESSION_KEY); return value ? JSON.parse(value) as Session : null } catch { return null } },
  set(value: Session) { localStorage.setItem(SESSION_KEY, JSON.stringify(value)) },
  clear() { localStorage.removeItem(SESSION_KEY) },
}

let refreshPromise: Promise<string> | null = null
async function refreshAccessToken() {
  const session = sessionStore.get()
  if (!session?.refreshToken) throw new Error('Your session has expired')
  if (!refreshPromise) refreshPromise = fetch(`${API_URL}/auth/refresh`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ refreshToken: session.refreshToken }) })
    .then(async response => { if (!response.ok) throw new Error('Your session has expired'); const next = await response.json() as Session; sessionStore.set(next); return next.token })
    .finally(() => { refreshPromise = null })
  return refreshPromise
}

export async function api<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const session = sessionStore.get()
  const headers = new Headers(options.headers)
  if (!(options.body instanceof FormData)) headers.set('content-type', 'application/json')
  if (session?.token) headers.set('authorization', `Bearer ${session.token}`)
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers })
  } catch {
    throw new Error('Unable to connect to backend server. Make sure the API is running or click "Explore the demo workspace".')
  }
  if (response.status === 401 && retry && session?.refreshToken) {
    try {
      const token = await refreshAccessToken()
      headers.set('authorization', `Bearer ${token}`)
      response = await fetch(`${API_URL}${path}`, { ...options, headers })
    } catch {
      sessionStore.clear()
      window.dispatchEvent(new Event('session-expired'))
      throw new Error('Your session has expired')
    }
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string }
    throw new Error(body.message || `Request failed (${response.status})`)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
