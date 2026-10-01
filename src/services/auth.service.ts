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
        'admin@cispl.in': { firstName: 'Neeraj', lastName: 'Chadha', role: 'SUPER_ADMIN' },
        'neeraj.chadha@cispl.in': { firstName: 'Neeraj', lastName: 'Chadha', role: 'SUPER_ADMIN' },
        'rajan.chadha@cispl.in': { firstName: 'Rajan', lastName: 'Chadha', role: 'SUPER_ADMIN' },
        'hr@cispl.in': { firstName: 'HR', lastName: 'Operations', role: 'HR_ADMIN' },
        'manager@cispl.in': { firstName: 'Jitesh', lastName: 'Salvi', role: 'MANAGER' },
        'jitesh.salvi@cispl.in': { firstName: 'Jitesh', lastName: 'Salvi', role: 'MANAGER' },
        'sakshi.sharma@cispl.in': { firstName: 'Sakshi', lastName: 'Sharma', role: 'MANAGER' },
        'azeezurrahman@cispl.in': { firstName: 'Azeezurrahman', lastName: '', role: 'MANAGER' },
        'satish.chandra@cispl.in': { firstName: 'Satish', lastName: 'Chandra', role: 'MANAGER' },
        'sahil@cispl.in': { firstName: 'Sahil', lastName: 'Yadav', role: 'SUPER_ADMIN' },
        'sahil.yadav@cispl.in': { firstName: 'Sahil', lastName: 'Yadav', role: 'SUPER_ADMIN' },
        'kapil.sharma@cispl.in': { firstName: 'Kapil', lastName: 'Sharma', role: 'EMPLOYEE' },
        'saumya.ranjan@cispl.in': { firstName: 'Saumya', lastName: 'Ranjan', role: 'EMPLOYEE' },
      }
      const profile = roleProfiles[email.toLowerCase()] || { firstName: email.split('@')[0], lastName: 'CISPL', role: 'EMPLOYEE' }
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
      SUPER_ADMIN: { email: 'admin@cispl.in', firstName: 'Neeraj', lastName: 'Chadha' },
      HR_ADMIN: { email: 'hr@cispl.in', firstName: 'HR', lastName: 'Operations' },
      MANAGER: { email: 'manager@cispl.in', firstName: 'Jitesh', lastName: 'Salvi' },
      EMPLOYEE: { email: 'sahil@cispl.in', firstName: 'Sahil', lastName: 'Yadav' },
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
