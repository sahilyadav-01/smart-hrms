import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import type { Role } from '@prisma/client'
import { env } from '../config/env.js'
import { HttpError } from '../utils/http-error.js'

type Payload = { sub: string; companyId: string; role: Role }

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return next(new HttpError(401, 'Authentication required'))
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as Payload
    req.user = { id: payload.sub, companyId: payload.companyId, role: payload.role }
    next()
  } catch { next(new HttpError(401, 'Invalid or expired token')) }
}
