import { Router } from 'express'
import { AttendanceStatus, Role } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { authenticate } from '../../middleware/auth.middleware.js'
import { allowRoles } from '../../middleware/role.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'
import { HttpError } from '../../utils/http-error.js'

const router = Router()
router.use(authenticate)
const managers: Role[] = [Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER, Role.MANAGER]
const dayStart = (value = new Date()) => new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()))

const employeeForUser = async (userId: string) => {
  const employee = await prisma.employee.findUnique({ where: { userId } })
  if (!employee) throw new HttpError(404, 'No employee profile is linked to this user')
  return employee
}

router.post('/check-in', asyncHandler(async (req, res) => {
  const employee = await employeeForUser(req.user!.id)
  const date = dayStart()
  const existing = await prisma.attendance.findUnique({ where: { employeeId_date: { employeeId: employee.id, date } } })
  if (existing?.checkIn) throw new HttpError(409, 'You have already checked in today')
  const now = new Date()
  const lateAfter = new Date(date); lateAfter.setUTCHours(9, 30)
  const attendance = await prisma.attendance.upsert({
    where: { employeeId_date: { employeeId: employee.id, date } },
    update: { checkIn: now, status: now > lateAfter ? AttendanceStatus.LATE : AttendanceStatus.PRESENT },
    create: { employeeId: employee.id, date, checkIn: now, status: now > lateAfter ? AttendanceStatus.LATE : AttendanceStatus.PRESENT },
  })
  res.status(201).json(attendance)
}))

router.post('/check-out', asyncHandler(async (req, res) => {
  const employee = await employeeForUser(req.user!.id)
  const date = dayStart()
  const existing = await prisma.attendance.findUnique({ where: { employeeId_date: { employeeId: employee.id, date } } })
  if (!existing?.checkIn) throw new HttpError(409, 'Check in before checking out')
  if (existing.checkOut) throw new HttpError(409, 'You have already checked out today')
  const attendance = await prisma.attendance.update({ where: { id: existing.id }, data: { checkOut: new Date() } })
  res.json(attendance)
}))

router.get('/my', asyncHandler(async (req, res) => {
  const employee = await employeeForUser(req.user!.id)
  const month = z.coerce.number().int().min(1).max(12).default(new Date().getUTCMonth() + 1).parse(req.query.month)
  const year = z.coerce.number().int().min(2020).max(2100).default(new Date().getUTCFullYear()).parse(req.query.year)
  const from = new Date(Date.UTC(year, month - 1, 1)); const to = new Date(Date.UTC(year, month, 1))
  const records = await prisma.attendance.findMany({ where: { employeeId: employee.id, date: { gte: from, lt: to } }, orderBy: { date: 'desc' } })
  res.json({ data: records, total: records.length })
}))

router.get('/', allowRoles(...managers), asyncHandler(async (req, res) => {
  const date = req.query.date ? dayStart(z.coerce.date().parse(req.query.date)) : dayStart()
  const records = await prisma.attendance.findMany({ where: { date, employee: { companyId: req.user!.companyId } }, include: { employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true } } }, orderBy: { checkIn: 'asc' } })
  res.json({ date, data: records, total: records.length })
}))

router.patch('/:id', allowRoles(...managers), asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const input = z.object({ status: z.enum(AttendanceStatus).optional(), checkIn: z.coerce.date().optional(), checkOut: z.coerce.date().optional(), breakMinutes: z.number().int().min(0).max(720).optional(), notes: z.string().max(500).optional() }).parse(req.body)
  const existing = await prisma.attendance.findFirst({ where: { id, employee: { companyId: req.user!.companyId } } })
  if (!existing) throw new HttpError(404, 'Attendance record not found')
  res.json(await prisma.attendance.update({ where: { id }, data: input }))
}))

export default router
