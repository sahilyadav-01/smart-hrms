import { Router } from 'express'
import { Role, EmployeeStatus, EmploymentType } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { authenticate } from '../../middleware/auth.middleware.js'
import { allowRoles } from '../../middleware/role.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'
import { HttpError } from '../../utils/http-error.js'

const router = Router()
router.use(authenticate)
const managers: Role[] = [Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER]
const employeeSchema = z.object({
  employeeCode: z.string().min(2).max(30), firstName: z.string().min(2), lastName: z.string().min(2),
  email: z.email(), phone: z.string().optional(), joiningDate: z.coerce.date(),
  departmentId: z.string().uuid().optional(), designationId: z.string().uuid().optional(), managerId: z.string().uuid().optional(),
  employmentType: z.enum(EmploymentType).default(EmploymentType.FULL_TIME), status: z.enum(EmployeeStatus).default(EmployeeStatus.ACTIVE),
})

router.get('/', asyncHandler(async (req, res) => {
  const query = typeof req.query.search === 'string' ? req.query.search : ''
  const employees = await prisma.employee.findMany({
    where: { companyId: req.user!.companyId, ...(query && { OR: [{ firstName: { contains: query, mode: 'insensitive' } }, { lastName: { contains: query, mode: 'insensitive' } }, { email: { contains: query, mode: 'insensitive' } }] }) },
    include: { department: true, designation: true }, orderBy: { createdAt: 'desc' },
  })
  res.json({ data: employees, total: employees.length })
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const employee = await prisma.employee.findFirst({ where: { id, companyId: req.user!.companyId }, include: { department: true, designation: true, manager: true } })
  if (!employee) throw new HttpError(404, 'Employee not found')
  res.json(employee)
}))

router.post('/', allowRoles(...managers), asyncHandler(async (req, res) => {
  const input = employeeSchema.parse(req.body)
  const employee = await prisma.employee.create({ data: { ...input, email: input.email.toLowerCase(), companyId: req.user!.companyId } })
  res.status(201).json(employee)
}))

router.patch('/:id', allowRoles(...managers), asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const existing = await prisma.employee.findFirst({ where: { id, companyId: req.user!.companyId } })
  if (!existing) throw new HttpError(404, 'Employee not found')
  const employee = await prisma.employee.update({ where: { id: existing.id }, data: employeeSchema.partial().parse(req.body) })
  res.json(employee)
}))

router.delete('/:id', allowRoles(Role.SUPER_ADMIN, Role.HR_ADMIN), asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const existing = await prisma.employee.findFirst({ where: { id, companyId: req.user!.companyId } })
  if (!existing) throw new HttpError(404, 'Employee not found')
  await prisma.employee.update({ where: { id: existing.id }, data: { status: EmployeeStatus.TERMINATED } })
  res.status(204).send()
}))
export default router
