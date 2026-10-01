import { Router } from 'express'
import { LeaveStatus, Role } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { authenticate } from '../../middleware/auth.middleware.js'
import { allowRoles } from '../../middleware/role.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'
import { HttpError } from '../../utils/http-error.js'

const router = Router()
const managers: Role[] = [Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER, Role.MANAGER]
router.use(authenticate)

const employeeForUser = async (userId: string) => {
  const employee = await prisma.employee.findUnique({ where: { userId } })
  if (!employee) throw new HttpError(404, 'No employee profile is linked to this user')
  return employee
}
const leaveDays = (start: Date, end: Date) => {
  if (end < start) throw new HttpError(422, 'End date must be on or after the start date')
  let days = 0
  for (const date = new Date(start); date <= end; date.setUTCDate(date.getUTCDate() + 1)) if (![0, 6].includes(date.getUTCDay())) days++
  if (!days) throw new HttpError(422, 'Leave must include at least one working day')
  return days
}

router.get('/types', asyncHandler(async (req, res) => {
  res.json(await prisma.leaveType.findMany({ where: { companyId: req.user!.companyId }, orderBy: { name: 'asc' } }))
}))

router.get('/balances', asyncHandler(async (req, res) => {
  const employee = await employeeForUser(req.user!.id)
  const year = z.coerce.number().int().min(2020).max(2100).default(new Date().getUTCFullYear()).parse(req.query.year)
  const balances = await prisma.leaveBalance.findMany({ where: { employeeId: employee.id, year }, include: { leaveType: true }, orderBy: { leaveType: { name: 'asc' } } })
  res.json(balances.map(item => ({ ...item, remaining: item.allocated - item.used })))
}))

router.get('/my', asyncHandler(async (req, res) => {
  const employee = await employeeForUser(req.user!.id)
  const requests = await prisma.leaveRequest.findMany({ where: { employeeId: employee.id }, include: { leaveType: true }, orderBy: { createdAt: 'desc' } })
  res.json({ data: requests, total: requests.length })
}))

router.get('/', allowRoles(...managers), asyncHandler(async (req, res) => {
  const status = req.query.status ? z.enum(LeaveStatus).parse(req.query.status) : undefined
  const requests = await prisma.leaveRequest.findMany({ where: { employee: { companyId: req.user!.companyId }, status }, include: { leaveType: true, employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true, department: true } } }, orderBy: { createdAt: 'desc' } })
  res.json({ data: requests, total: requests.length })
}))

router.post('/', asyncHandler(async (req, res) => {
  const input = z.object({ leaveTypeId: z.uuid(), startDate: z.coerce.date(), endDate: z.coerce.date(), reason: z.string().trim().min(5).max(1000) }).parse(req.body)
  const employee = await employeeForUser(req.user!.id)
  const days = leaveDays(input.startDate, input.endDate)
  const year = input.startDate.getUTCFullYear()
  if (input.endDate.getUTCFullYear() !== year) throw new HttpError(422, 'A leave request cannot span calendar years')
  const balance = await prisma.leaveBalance.findUnique({ where: { employeeId_leaveTypeId_year: { employeeId: employee.id, leaveTypeId: input.leaveTypeId, year } } })
  if (!balance || balance.allocated - balance.used < days) throw new HttpError(422, 'Insufficient leave balance')
  const overlap = await prisma.leaveRequest.findFirst({ where: { employeeId: employee.id, status: { in: [LeaveStatus.PENDING, LeaveStatus.MANAGER_APPROVED, LeaveStatus.APPROVED] }, startDate: { lte: input.endDate }, endDate: { gte: input.startDate } } })
  if (overlap) throw new HttpError(409, 'This request overlaps an existing leave request')
  const request = await prisma.leaveRequest.create({ data: { ...input, employeeId: employee.id, days } })
  res.status(201).json(request)
}))

router.post('/:id/approve', allowRoles(...managers), asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const note = z.object({ note: z.string().max(500).optional() }).parse(req.body).note
  const request = await prisma.leaveRequest.findFirst({ where: { id, employee: { companyId: req.user!.companyId } } })
  if (!request) throw new HttpError(404, 'Leave request not found')
  if (!new Set<LeaveStatus>([LeaveStatus.PENDING, LeaveStatus.MANAGER_APPROVED]).has(request.status)) throw new HttpError(409, 'This request has already been reviewed')
  const isHr = new Set<Role>([Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER]).has(req.user!.role)
  const nextStatus = isHr ? LeaveStatus.APPROVED : LeaveStatus.MANAGER_APPROVED
  const updated = await prisma.$transaction(async tx => {
    const result = await tx.leaveRequest.update({ where: { id }, data: { status: nextStatus, reviewNote: note, reviewedById: req.user!.id, reviewedAt: new Date() } })
    if (nextStatus === LeaveStatus.APPROVED) await tx.leaveBalance.update({ where: { employeeId_leaveTypeId_year: { employeeId: request.employeeId, leaveTypeId: request.leaveTypeId, year: request.startDate.getUTCFullYear() } }, data: { used: { increment: request.days } } })
    return result
  })
  res.json(updated)
}))

router.post('/:id/reject', allowRoles(...managers), asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const { note } = z.object({ note: z.string().trim().min(3).max(500) }).parse(req.body)
  const request = await prisma.leaveRequest.findFirst({ where: { id, employee: { companyId: req.user!.companyId }, status: { in: [LeaveStatus.PENDING, LeaveStatus.MANAGER_APPROVED] } } })
  if (!request) throw new HttpError(404, 'Pending leave request not found')
  res.json(await prisma.leaveRequest.update({ where: { id }, data: { status: LeaveStatus.REJECTED, reviewNote: note, reviewedById: req.user!.id, reviewedAt: new Date() } }))
}))

router.post('/:id/cancel', asyncHandler(async (req, res) => {
  const employee = await employeeForUser(req.user!.id)
  const id = z.uuid().parse(req.params.id)
  const request = await prisma.leaveRequest.findFirst({ where: { id, employeeId: employee.id } })
  if (!request) throw new HttpError(404, 'Leave request not found')
  if (request.status !== LeaveStatus.PENDING) throw new HttpError(409, 'Only pending requests can be cancelled')
  res.json(await prisma.leaveRequest.update({ where: { id }, data: { status: LeaveStatus.CANCELLED } }))
}))

export default router
