import { Router } from 'express'
import { AnnouncementAudience, NotificationType, Role } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { authenticate } from '../../middleware/auth.middleware.js'
import { allowRoles } from '../../middleware/role.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'
import { HttpError } from '../../utils/http-error.js'

const router = Router()
const hrRoles: Role[] = [Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER]
router.use(authenticate)

router.get('/my', asyncHandler(async (req, res) => {
  const [items, unread] = await Promise.all([
    prisma.notification.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.notification.count({ where: { userId: req.user!.id, readAt: null } }),
  ])
  res.json({ data: items, unread })
}))

router.post('/:id/read', asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const item = await prisma.notification.findFirst({ where: { id, userId: req.user!.id } })
  if (!item) throw new HttpError(404, 'Notification not found')
  res.json(await prisma.notification.update({ where: { id }, data: { readAt: item.readAt ?? new Date() } }))
}))

router.post('/read-all', asyncHandler(async (req, res) => {
  const result = await prisma.notification.updateMany({ where: { userId: req.user!.id, readAt: null }, data: { readAt: new Date() } })
  res.json({ updated: result.count })
}))

router.post('/', allowRoles(...hrRoles), asyncHandler(async (req, res) => {
  const input = z.object({ title: z.string().trim().min(3).max(140), message: z.string().trim().min(3).max(1000), type: z.enum(NotificationType).default(NotificationType.INFO), actionUrl: z.string().max(500).optional(), userId: z.uuid().optional(), sendToAll: z.boolean().default(false) }).refine(value => value.userId || value.sendToAll, 'Choose a user or send to all').parse(req.body)
  const users = await prisma.user.findMany({ where: { companyId: req.user!.companyId, isActive: true, ...(input.userId && { id: input.userId }) }, select: { id: true } })
  if (!users.length) throw new HttpError(404, 'No matching recipients found')
  await prisma.notification.createMany({ data: users.map(user => ({ userId: user.id, title: input.title, message: input.message, type: input.type, actionUrl: input.actionUrl })) })
  res.status(201).json({ recipients: users.length })
}))

router.get('/announcements', asyncHandler(async (req, res) => {
  const now = new Date()
  const audiences = req.user!.role === Role.EMPLOYEE ? [AnnouncementAudience.ALL, AnnouncementAudience.EMPLOYEES] : [AnnouncementAudience.ALL, AnnouncementAudience.MANAGERS]
  const announcements = await prisma.announcement.findMany({ where: { companyId: req.user!.companyId, audience: { in: audiences }, publishedAt: { lte: now }, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }, orderBy: { publishedAt: 'desc' } })
  res.json({ data: announcements, total: announcements.length })
}))

router.post('/announcements', allowRoles(...hrRoles), asyncHandler(async (req, res) => {
  const input = z.object({ title: z.string().trim().min(3).max(160), body: z.string().trim().min(10).max(5000), audience: z.enum(AnnouncementAudience).default(AnnouncementAudience.ALL), publishedAt: z.coerce.date().optional(), expiresAt: z.coerce.date().optional() }).parse(req.body)
  const publishedAt = input.publishedAt ?? new Date()
  if (input.expiresAt && input.expiresAt <= publishedAt) throw new HttpError(422, 'Expiry must be after publication')
  res.status(201).json(await prisma.announcement.create({ data: { ...input, publishedAt, authorId: req.user!.id, companyId: req.user!.companyId } }))
}))

router.patch('/announcements/:id', allowRoles(...hrRoles), asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const input = z.object({ title: z.string().trim().min(3).max(160).optional(), body: z.string().trim().min(10).max(5000).optional(), audience: z.enum(AnnouncementAudience).optional(), expiresAt: z.coerce.date().nullable().optional() }).parse(req.body)
  const item = await prisma.announcement.findFirst({ where: { id, companyId: req.user!.companyId } })
  if (!item) throw new HttpError(404, 'Announcement not found')
  res.json(await prisma.announcement.update({ where: { id }, data: input }))
}))

router.delete('/announcements/:id', allowRoles(...hrRoles), asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const item = await prisma.announcement.findFirst({ where: { id, companyId: req.user!.companyId } })
  if (!item) throw new HttpError(404, 'Announcement not found')
  await prisma.announcement.delete({ where: { id } }); res.status(204).send()
}))

export default router
