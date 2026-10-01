import { Router } from 'express'
import { ApplicationStatus, AttendanceStatus, EmployeeStatus, LeaveStatus, PayrollStatus, Role } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { authenticate } from '../../middleware/auth.middleware.js'
import { allowRoles } from '../../middleware/role.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'

const router = Router()
const reportingRoles: Role[] = [Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER, Role.MANAGER]
router.use(authenticate, allowRoles(...reportingRoles))
const dateOnly = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))

router.get('/dashboard', asyncHandler(async (req, res) => {
  const companyId = req.user!.companyId, today = dateOnly(new Date())
  const [employees, present, onLeave, openJobs, pendingLeaves, expiringDocuments] = await Promise.all([
    prisma.employee.count({ where: { companyId, status: { in: [EmployeeStatus.ACTIVE, EmployeeStatus.CONFIRMED, EmployeeStatus.PROBATION] } } }),
    prisma.attendance.count({ where: { date: today, employee: { companyId }, status: { in: [AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.WORK_FROM_HOME] } } }),
    prisma.attendance.count({ where: { date: today, employee: { companyId }, status: AttendanceStatus.ON_LEAVE } }),
    prisma.job.count({ where: { companyId, status: 'OPEN' } }),
    prisma.leaveRequest.count({ where: { employee: { companyId }, status: { in: [LeaveStatus.PENDING, LeaveStatus.MANAGER_APPROVED] } } }),
    prisma.document.count({ where: { employee: { companyId }, expiresAt: { gte: today, lte: new Date(today.getTime() + 30 * 86_400_000) } } }),
  ])
  res.json({ employees, present, absent: Math.max(0, employees - present - onLeave), onLeave, openJobs, pendingLeaves, expiringDocuments, attendanceRate: employees ? Math.round((present / employees) * 1000) / 10 : 0 })
}))

router.get('/workforce', asyncHandler(async (req, res) => {
  const companyId = req.user!.companyId
  const [departments, statuses, types, recentJoiners] = await Promise.all([
    prisma.department.findMany({ where: { companyId }, select: { name: true, _count: { select: { employees: true } } }, orderBy: { name: 'asc' } }),
    prisma.employee.groupBy({ by: ['status'], where: { companyId }, _count: { _all: true } }),
    prisma.employee.groupBy({ by: ['employmentType'], where: { companyId }, _count: { _all: true } }),
    prisma.employee.findMany({ where: { companyId }, select: { id: true, firstName: true, lastName: true, joiningDate: true, department: { select: { name: true } } }, orderBy: { joiningDate: 'desc' }, take: 8 }),
  ])
  res.json({ departments: departments.map(item => ({ name: item.name, employees: item._count.employees })), statuses: statuses.map(item => ({ status: item.status, employees: item._count._all })), employmentTypes: types.map(item => ({ type: item.employmentType, employees: item._count._all })), recentJoiners })
}))

router.get('/attendance', asyncHandler(async (req, res) => {
  const days = z.coerce.number().int().min(7).max(90).default(30).parse(req.query.days)
  const to = new Date(), from = dateOnly(new Date(to.getTime() - (days - 1) * 86_400_000))
  const records = await prisma.attendance.findMany({ where: { date: { gte: from, lte: to }, employee: { companyId: req.user!.companyId } }, select: { date: true, status: true, checkIn: true, checkOut: true } })
  const daily = new Map<string, { present: number; absent: number; late: number; leave: number }>()
  for (const record of records) { const key = record.date.toISOString().slice(0, 10), value = daily.get(key) ?? { present: 0, absent: 0, late: 0, leave: 0 }; if ([AttendanceStatus.PRESENT, AttendanceStatus.WORK_FROM_HOME].includes(record.status as typeof AttendanceStatus.PRESENT)) value.present++; else if (record.status === AttendanceStatus.LATE) value.late++; else if (record.status === AttendanceStatus.ON_LEAVE) value.leave++; else value.absent++; daily.set(key, value) }
  res.json({ from, to, daily: [...daily].map(([date, values]) => ({ date, ...values })) })
}))

router.get('/payroll', asyncHandler(async (req, res) => {
  const year = z.coerce.number().int().min(2020).max(2100).default(new Date().getUTCFullYear()).parse(req.query.year)
  const records = await prisma.payroll.groupBy({ by: ['month'], where: { year, employee: { companyId: req.user!.companyId }, status: { in: [PayrollStatus.PROCESSED, PayrollStatus.PAID] } }, _sum: { grossSalary: true, netSalary: true, tax: true, deductions: true }, _count: { _all: true }, orderBy: { month: 'asc' } })
  res.json({ year, months: records.map(item => ({ month: item.month, employees: item._count._all, gross: Number(item._sum.grossSalary ?? 0), net: Number(item._sum.netSalary ?? 0), tax: Number(item._sum.tax ?? 0), deductions: Number(item._sum.deductions ?? 0) })) })
}))

router.get('/recruitment', asyncHandler(async (req, res) => {
  const companyId = req.user!.companyId
  const [funnel, jobs, interviews] = await Promise.all([
    prisma.application.groupBy({ by: ['status'], where: { job: { companyId } }, _count: { _all: true } }),
    prisma.job.findMany({ where: { companyId }, select: { id: true, title: true, status: true, openings: true, _count: { select: { applications: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.interview.count({ where: { application: { job: { companyId } }, status: 'SCHEDULED', scheduledAt: { gte: new Date() } } }),
  ])
  const total = funnel.reduce((sum, item) => sum + item._count._all, 0), hired = funnel.find(item => item.status === ApplicationStatus.HIRED)?._count._all ?? 0
  res.json({ funnel: funnel.map(item => ({ status: item.status, candidates: item._count._all })), jobs, upcomingInterviews: interviews, conversionRate: total ? Math.round((hired / total) * 1000) / 10 : 0 })
}))

export default router
