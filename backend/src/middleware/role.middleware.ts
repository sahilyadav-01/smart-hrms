import type { NextFunction, Request, Response } from 'express'
import type { Role } from '../types/enums.js'
import { HttpError } from '../utils/http-error.js'

export const allowRoles = (...roles: Role[]) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new HttpError(403, 'You do not have permission to perform this action'))
  next()
}
