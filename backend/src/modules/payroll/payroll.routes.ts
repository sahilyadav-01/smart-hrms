import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { PayrollStatus, Role } from '../../types/enums.js'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { authenticate } from '../../middleware/auth.middleware.js'
import { allowRoles } from '../../middleware/role.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'
import { HttpError } from '../../utils/http-error.js'

const router = Router()
const payrollAdmins: Role[] = [Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER]
router.use(authenticate)
const money = z.coerce.number().min(0).max(100_000_000)

const employeeForUser = async (userId: string) => {
  const employee = await prisma.employee.findUnique({ where: { userId } })
  if (!employee) throw new HttpError(404, 'No employee profile is linked to this user')
  return employee
}

router.get('/my', asyncHandler(async (req, res) => {
  const employee = await employeeForUser(req.user!.id)
  const records = await prisma.payroll.findMany({ where: { employeeId: employee.id, status: { in: [PayrollStatus.PROCESSED, PayrollStatus.PAID] } }, orderBy: [{ year: 'desc' }, { month: 'desc' }] })
  res.json({ data: records, total: records.length })
}))

router.get('/', allowRoles(...payrollAdmins), asyncHandler(async (req, res) => {
  const month = req.query.month ? z.coerce.number().int().min(1).max(12).parse(req.query.month) : undefined
  const year = req.query.year ? z.coerce.number().int().min(2020).max(2100).parse(req.query.year) : undefined
  const records = await prisma.payroll.findMany({ where: { employee: { companyId: req.user!.companyId }, month, year }, include: { employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true, department: true } } }, orderBy: [{ year: 'desc' }, { month: 'desc' }] })
  res.json({ data: records, total: records.length })
}))

router.put('/salary-structures/:employeeId', allowRoles(...payrollAdmins), asyncHandler(async (req, res) => {
  const employeeId = z.uuid().parse(req.params.employeeId)
  const input = z.object({ basicSalary: money, hra: money.default(0), allowances: money.default(0), effectiveFrom: z.coerce.date() }).parse(req.body)
  const employee = await prisma.employee.findFirst({ where: { id: employeeId, companyId: req.user!.companyId } })
  if (!employee) throw new HttpError(404, 'Employee not found')
  res.json(await prisma.salaryStructure.upsert({ where: { employeeId }, update: input, create: { ...input, employeeId } }))
}))

router.post('/process', allowRoles(...payrollAdmins), asyncHandler(async (req, res) => {
  const input = z.object({ employeeId: z.uuid(), year: z.number().int().min(2020).max(2100), month: z.number().int().min(1).max(12), bonus: money.default(0), overtime: money.default(0), tax: money.default(0), deductions: money.default(0) }).parse(req.body)
  const employee = await prisma.employee.findFirst({ where: { id: input.employeeId, companyId: req.user!.companyId }, include: { salaryStructure: true } })
  if (!employee) throw new HttpError(404, 'Employee not found')
  if (!employee.salaryStructure) throw new HttpError(422, 'Configure the employee salary structure first')
  const basicSalary = Number(employee.salaryStructure.basicSalary), hra = Number(employee.salaryStructure.hra), allowances = Number(employee.salaryStructure.allowances)
  const grossSalary = basicSalary + hra + allowances + input.bonus + input.overtime
  const netSalary = grossSalary - input.tax - input.deductions
  if (netSalary < 0) throw new HttpError(422, 'Deductions cannot exceed gross salary')
  const values = { basicSalary, hra, allowances, bonus: input.bonus, overtime: input.overtime, tax: input.tax, deductions: input.deductions, grossSalary, netSalary, status: PayrollStatus.PROCESSED, processedById: req.user!.id }
  const payroll = await prisma.payroll.upsert({ where: { employeeId_year_month: { employeeId: input.employeeId, year: input.year, month: input.month } }, update: values, create: { ...values, employeeId: input.employeeId, year: input.year, month: input.month } })
  res.status(201).json(payroll)
}))

router.post('/:id/mark-paid', allowRoles(...payrollAdmins), asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const record = await prisma.payroll.findFirst({ where: { id, employee: { companyId: req.user!.companyId } } })
  if (!record) throw new HttpError(404, 'Payroll record not found')
  if (record.status !== PayrollStatus.PROCESSED) throw new HttpError(409, 'Only processed payroll can be marked as paid')
  res.json(await prisma.payroll.update({ where: { id }, data: { status: PayrollStatus.PAID, paidAt: new Date() } }))
}))

router.get('/:id/payslip', asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const isAdmin = payrollAdmins.includes(req.user!.role)
  const employee = isAdmin ? null : await employeeForUser(req.user!.id)
  const record = await prisma.payroll.findFirst({ where: { id, employee: { companyId: req.user!.companyId }, ...(!isAdmin && { employeeId: employee!.id }) }, include: { employee: { include: { company: true, department: true, designation: true } } } })
  if (!record || new Set<string>([PayrollStatus.DRAFT, PayrollStatus.CANCELLED]).has(record.status)) throw new HttpError(404, 'Payslip not found')
  const number = (value: Prisma.Decimal) => Number(value)
  res.json({ company: record.employee.company?.name || 'Complete Instrumentation Solutions Pvt Ltd', period: `${record.year}-${String(record.month).padStart(2, '0')}`, employee: record.employee, earnings: { basicSalary: number(record.basicSalary), hra: number(record.hra), allowances: number(record.allowances), bonus: number(record.bonus), overtime: number(record.overtime) }, deductions: { tax: number(record.tax), other: number(record.deductions) }, grossSalary: number(record.grossSalary), netSalary: number(record.netSalary), status: record.status, paidAt: record.paidAt })
}))

export default router
