import crypto from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { rateLimit } from 'express-rate-limit'
import { prisma } from '../config/database.js'

export const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 500, standardHeaders: 'draft-8', legacyHeaders: false, message: { message: 'Too many requests; try again later' } })
export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false, skipSuccessfulRequests: true, message: { message: 'Too many login attempts; try again later' } })

export function requestContext(req: Request, res: Response, next: NextFunction) {
  res.setHeader('x-request-id', req.header('x-request-id')?.slice(0, 100) || crypto.randomUUID())
  next()
}

export function auditMutations(req: Request, res: Response, next: NextFunction) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next()
  res.on('finish', () => {
    if (!req.user || res.statusCode >= 500) return
    void prisma.auditLog.create({ data: { action: `${req.method} ${req.route?.path ?? req.path}`, method: req.method, path: req.originalUrl.slice(0, 500), statusCode: res.statusCode, ipAddress: req.ip?.slice(0, 100), userAgent: req.header('user-agent')?.slice(0, 500), userId: req.user.id, companyId: req.user.companyId } }).catch(error => console.error('Audit log write failed', error))
  })
  next()
}
