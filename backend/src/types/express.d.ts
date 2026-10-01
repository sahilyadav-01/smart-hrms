import type { Role } from './enums.js'

declare global {
  namespace Express {
    interface Request { user?: { id: string; companyId: string; role: Role } }
  }
}
export {}
