import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { env } from '../../config/env.js'
import { authenticate } from '../../middleware/auth.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'
import { HttpError } from '../../utils/http-error.js'

const router = Router()
const loginSchema = z.object({ email: z.email(), password: z.string().min(8) })

router.post('/login', asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body)
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() }, include: { employee: true } })
  if (!user || !user.isActive || !(await bcrypt.compare(input.password, user.passwordHash))) throw new HttpError(401, 'Invalid email or password')
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] }
  const token = jwt.sign({ companyId: user.companyId, role: user.role }, env.JWT_SECRET, { ...options, subject: user.id })
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, employee: user.employee } })
}))

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, email: true, role: true, employee: true } })
  if (!user) throw new HttpError(404, 'User not found')
  res.json(user)
}))

router.post('/logout', authenticate, (_req, res) => res.status(204).send())
export default router
