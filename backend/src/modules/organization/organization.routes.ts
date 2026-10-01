import { Router } from 'express'
import { Role } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { authenticate } from '../../middleware/auth.middleware.js'
import { allowRoles } from '../../middleware/role.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'
import { HttpError } from '../../utils/http-error.js'

const router = Router()
const admins: Role[] = [Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER]
router.use(authenticate)

router.get('/', asyncHandler(async (req, res) => {
  const companyId = req.user!.companyId
  const [departments, designations, locations] = await Promise.all([
    prisma.department.findMany({ where: { companyId }, include: { _count: { select: { employees: true } } }, orderBy: { name: 'asc' } }),
    prisma.designation.findMany({ where: { companyId }, include: { _count: { select: { employees: true } } }, orderBy: { title: 'asc' } }),
    prisma.location.findMany({ where: { companyId }, include: { _count: { select: { employees: true } } }, orderBy: { name: 'asc' } }),
  ])
  res.json({ departments, designations, locations })
}))

router.post('/departments', allowRoles(...admins), asyncHandler(async (req, res) => {
  const { name } = z.object({ name: z.string().trim().min(2).max(80) }).parse(req.body)
  const item = await prisma.department.create({ data: { name, companyId: req.user!.companyId } })
  res.status(201).json(item)
}))

router.post('/designations', allowRoles(...admins), asyncHandler(async (req, res) => {
  const { title } = z.object({ title: z.string().trim().min(2).max(80) }).parse(req.body)
  const item = await prisma.designation.create({ data: { title, companyId: req.user!.companyId } })
  res.status(201).json(item)
}))

router.post('/locations', allowRoles(...admins), asyncHandler(async (req, res) => {
  const input = z.object({ name: z.string().trim().min(2), city: z.string().trim().min(2), country: z.string().trim().min(2) }).parse(req.body)
  const item = await prisma.location.create({ data: { ...input, companyId: req.user!.companyId } })
  res.status(201).json(item)
}))

router.delete('/:resource/:id', allowRoles(Role.SUPER_ADMIN, Role.HR_ADMIN), asyncHandler(async (req, res) => {
  const resource = z.enum(['departments', 'designations', 'locations']).parse(req.params.resource)
  const id = z.uuid().parse(req.params.id)
  const companyId = req.user!.companyId
  const found = resource === 'departments'
    ? await prisma.department.findFirst({ where: { id, companyId } })
    : resource === 'designations'
      ? await prisma.designation.findFirst({ where: { id, companyId } })
      : await prisma.location.findFirst({ where: { id, companyId } })
  if (!found) throw new HttpError(404, 'Organization record not found')
  if (resource === 'departments') await prisma.department.delete({ where: { id } })
  else if (resource === 'designations') await prisma.designation.delete({ where: { id } })
  else await prisma.location.delete({ where: { id } })
  res.status(204).send()
}))

export default router
