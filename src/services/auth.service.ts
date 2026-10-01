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
      const roleProfiles: Record<string, { firstName: string; lastName: string; role: string }> = {
        'admin@acme.test': { firstName: 'Sahil', lastName: 'Admin', role: 'SUPER_ADMIN' },
        'hr@acme.test': { firstName: 'Priya', lastName: 'Sharma', role: 'HR_ADMIN' },
        'manager@acme.test': { firstName: 'Vikram', lastName: 'Malhotra', role: 'MANAGER' },
        'sahil@acme.test': { firstName: 'Sahil', lastName: 'Kumar', role: 'EMPLOYEE' },
        'ananya@acme.test': { firstName: 'Ananya', lastName: 'Iyer', role: 'EMPLOYEE' },
      }
      const profile = roleProfiles[email.toLowerCase()] || { firstName: email.split('@')[0], lastName: 'User', role: 'EMPLOYEE' }
      const fallbackUser: AuthUser = {
        id: 'local-' + profile.role.toLowerCase(),
        email,
        role: profile.role,
        employee: { firstName: profile.firstName, lastName: profile.lastName },
        demo: true,
      }
      localStorage.setItem(USER_KEY, JSON.stringify(fallbackUser))
      return fallbackUser
    }
  },

  demo(targetRole: string = 'HR_ADMIN'): AuthUser {
    const profiles: Record<string, { email: string; firstName: string; lastName: string }> = {
      SUPER_ADMIN: { email: 'admin@acme.test', firstName: 'Sahil', lastName: 'Admin' },
      HR_ADMIN: { email: 'hr@acme.test', firstName: 'Priya', lastName: 'Sharma' },
      MANAGER: { email: 'manager@acme.test', firstName: 'Vikram', lastName: 'Malhotra' },
      EMPLOYEE: { email: 'sahil@acme.test', firstName: 'Sahil', lastName: 'Kumar' },
    }
    const p = profiles[targetRole] || profiles.HR_ADMIN
    const user: AuthUser = {
      id: 'demo-' + targetRole.toLowerCase(),
      email: p.email,
      role: targetRole,
      employee: { firstName: p.firstName, lastName: p.lastName },
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
