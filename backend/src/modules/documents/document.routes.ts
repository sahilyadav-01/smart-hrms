import fs from 'node:fs/promises'
import path from 'node:path'
import { Router } from 'express'
import { DocumentStatus, Role } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { authenticate } from '../../middleware/auth.middleware.js'
import { allowRoles } from '../../middleware/role.middleware.js'
import { documentUpload, uploadDirectory } from '../../middleware/upload.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'
import { HttpError } from '../../utils/http-error.js'

const router = Router()
const hrRoles: Role[] = [Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER]
router.use(authenticate)
const employeeForUser = async (userId: string) => {
  const employee = await prisma.employee.findUnique({ where: { userId } })
  if (!employee) throw new HttpError(404, 'No employee profile is linked to this user')
  return employee
}

router.get('/categories', asyncHandler(async (req, res) => res.json(await prisma.documentCategory.findMany({ where: { companyId: req.user!.companyId }, orderBy: { name: 'asc' } }))))
router.post('/categories', allowRoles(...hrRoles), asyncHandler(async (req, res) => {
  const input = z.object({ name: z.string().trim().min(2).max(100), description: z.string().max(500).optional(), required: z.boolean().default(false) }).parse(req.body)
  res.status(201).json(await prisma.documentCategory.create({ data: { ...input, companyId: req.user!.companyId } }))
}))
router.get('/my', asyncHandler(async (req, res) => {
  const employee = await employeeForUser(req.user!.id)
  const documents = await prisma.document.findMany({ where: { employeeId: employee.id }, include: { category: true }, orderBy: { createdAt: 'desc' } })
  res.json({ data: documents, total: documents.length })
}))
router.get('/', allowRoles(...hrRoles), asyncHandler(async (req, res) => {
  const status = req.query.status ? z.enum(DocumentStatus).parse(req.query.status) : undefined
  const documents = await prisma.document.findMany({ where: { status, employee: { companyId: req.user!.companyId } }, include: { category: true, employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' } })
  res.json({ data: documents, total: documents.length })
}))
router.post('/', documentUpload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(422, 'A document file is required')
  try {
    const input = z.object({ name: z.string().trim().min(2).max(160), categoryId: z.uuid(), expiresAt: z.coerce.date().optional() }).parse(req.body)
    const employee = await employeeForUser(req.user!.id)
    const category = await prisma.documentCategory.findFirst({ where: { id: input.categoryId, companyId: req.user!.companyId } })
    if (!category) throw new HttpError(404, 'Document category not found')
    res.status(201).json(await prisma.document.create({ data: { ...input, employeeId: employee.id, originalName: path.basename(req.file.originalname), storageKey: req.file.filename, mimeType: req.file.mimetype, sizeBytes: req.file.size } }))
  } catch (error) { await fs.unlink(req.file.path).catch(() => undefined); throw error }
}))
router.get('/:id/download', asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id), employee = await employeeForUser(req.user!.id), isHr = hrRoles.includes(req.user!.role)
  const document = await prisma.document.findFirst({ where: { id, employee: { companyId: req.user!.companyId }, ...(!isHr && { employeeId: employee.id }) } })
  if (!document) throw new HttpError(404, 'Document not found')
  res.download(path.join(uploadDirectory, document.storageKey), document.originalName)
}))
router.post('/:id/review', allowRoles(...hrRoles), asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const input = z.discriminatedUnion('status', [z.object({ status: z.literal(DocumentStatus.VERIFIED) }), z.object({ status: z.literal(DocumentStatus.REJECTED), note: z.string().trim().min(3).max(500) })]).parse(req.body)
  const document = await prisma.document.findFirst({ where: { id, employee: { companyId: req.user!.companyId } } })
  if (!document) throw new HttpError(404, 'Document not found')
  res.json(await prisma.document.update({ where: { id }, data: { status: input.status, verifiedById: req.user!.id, verifiedAt: new Date(), rejectionNote: 'note' in input ? input.note : null } }))
}))
router.delete('/:id', asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id), employee = await employeeForUser(req.user!.id), isHr = hrRoles.includes(req.user!.role)
  const document = await prisma.document.findFirst({ where: { id, employee: { companyId: req.user!.companyId }, ...(!isHr && { employeeId: employee.id, status: DocumentStatus.PENDING }) } })
  if (!document) throw new HttpError(404, 'Document not found or cannot be deleted')
  await prisma.document.delete({ where: { id } }); await fs.unlink(path.join(uploadDirectory, document.storageKey)).catch(() => undefined)
  res.status(204).send()
}))
export default router
