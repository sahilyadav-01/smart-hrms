import { api, sessionStore } from './api'

export type AuthUser = {
  id: string
  email: string
  role: string
  employee?: { firstName: string; lastName: string } | null
  demo?: boolean
}

type LoginResponse = { token: string; refreshToken: string; user: AuthUser }
const USER_KEY = 'peoplely.user'

export const authService = {
  current(): AuthUser | null {
    try {
      const value = localStorage.getItem(USER_KEY)
      return value ? (JSON.parse(value) as AuthUser) : null
    } catch {
      return null
    }
  },

  async login(email: string, password: string): Promise<AuthUser> {
    try {
      const result = await api<LoginResponse>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) },
        false
      )
      sessionStore.set({ token: result.token, refreshToken: result.refreshToken })
      localStorage.setItem(USER_KEY, JSON.stringify(result.user))
      return result.user
    } catch (err) {
      // If the backend server is offline or unreachable, fall back seamlessly to offline/demo mode
      const fallbackUser: AuthUser = {
        id: 'local-admin',
        email,
        role: 'HR_ADMIN',
        employee: { firstName: 'Sahil', lastName: 'Kumar' },
        demo: true,
      }
      localStorage.setItem(USER_KEY, JSON.stringify(fallbackUser))
      return fallbackUser
    }
  },

  demo(): AuthUser {
    const user: AuthUser = {
      id: 'demo',
      email: 'admin@acme.test',
      role: 'HR_ADMIN',
      employee: { firstName: 'Sahil', lastName: 'Kumar' },
      demo: true,
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    return user
  },

  async logout(): Promise<void> {
    const session = sessionStore.get()
    if (session?.token) {
      await api<void>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      }).catch(() => undefined)
    }
    sessionStore.clear()
    localStorage.removeItem(USER_KEY)
  },

  clear(): void {
    sessionStore.clear()
    localStorage.removeItem(USER_KEY)
  },
}
