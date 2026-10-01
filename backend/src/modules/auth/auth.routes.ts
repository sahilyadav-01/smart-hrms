import { Router } from 'express'
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { env } from '../../config/env.js'
import { authenticate } from '../../middleware/auth.middleware.js'
import { authLimiter } from '../../middleware/security.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'
import { HttpError } from '../../utils/http-error.js'

const router = Router()
const loginSchema = z.object({ email: z.email(), password: z.string().min(8) })
const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex')
const accessToken = (user: { id: string; companyId: string; role: string }) => {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] }
  return jwt.sign({ companyId: user.companyId, role: user.role }, env.JWT_SECRET, { ...options, subject: user.id })
}
const newRefreshToken = () => crypto.randomBytes(48).toString('base64url')

router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body)
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() }, include: { employee: true } })
  if (!user || !user.isActive || !(await bcrypt.compare(input.password, user.passwordHash))) throw new HttpError(401, 'Invalid email or password')
  const refreshToken = newRefreshToken()
  await prisma.refreshToken.create({ data: { tokenHash: hashToken(refreshToken), userId: user.id, expiresAt: new Date(Date.now() + 30 * 86_400_000) } })
  res.json({ token: accessToken(user), refreshToken, user: { id: user.id, email: user.email, role: user.role, employee: user.employee } })
}))

router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = z.object({ refreshToken: z.string().min(40) }).parse(req.body)
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(refreshToken) }, include: { user: true } })
  if (!stored || stored.revokedAt || stored.expiresAt <= new Date() || !stored.user.isActive) throw new HttpError(401, 'Invalid or expired refresh token')
  const replacement = newRefreshToken()
  await prisma.$transaction([
    prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } }),
    prisma.refreshToken.create({ data: { tokenHash: hashToken(replacement), userId: stored.userId, expiresAt: new Date(Date.now() + 30 * 86_400_000) } }),
  ])
  res.json({ token: accessToken(stored.user), refreshToken: replacement })
}))

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, email: true, role: true, employee: true } })
  if (!user) throw new HttpError(404, 'User not found')
  res.json(user)
}))

router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  const parsed = z.object({ refreshToken: z.string().min(40).optional(), allDevices: z.boolean().default(false) }).parse(req.body ?? {})
  if (parsed.allDevices) await prisma.refreshToken.updateMany({ where: { userId: req.user!.id, revokedAt: null }, data: { revokedAt: new Date() } })
  else if (parsed.refreshToken) await prisma.refreshToken.updateMany({ where: { userId: req.user!.id, tokenHash: hashToken(parsed.refreshToken), revokedAt: null }, data: { revokedAt: new Date() } })
  res.status(204).send()
}))
export default router
