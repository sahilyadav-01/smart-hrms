import { Router } from 'express'
import { GoalStatus, PerformanceCycleStatus, ReviewStatus, Role } from '../../types/enums.js'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { authenticate } from '../../middleware/auth.middleware.js'
import { allowRoles } from '../../middleware/role.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'
import { HttpError } from '../../utils/http-error.js'

const router = Router()
const hrRoles: Role[] = [Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER]
const reviewerRoles: Role[] = [...hrRoles, Role.MANAGER]
router.use(authenticate)

const employeeForUser = async (userId: string) => {
  const employee = await prisma.employee.findUnique({ where: { userId } })
  if (!employee) throw new HttpError(404, 'No employee profile is linked to this user')
  return employee
}

router.get('/cycles', asyncHandler(async (req, res) => {
  const cycles = await prisma.performanceCycle.findMany({ where: { companyId: req.user!.companyId }, include: { _count: { select: { goals: true, reviews: true } } }, orderBy: { startDate: 'desc' } })
  res.json({ data: cycles, total: cycles.length })
}))

router.post('/cycles', allowRoles(...hrRoles), asyncHandler(async (req, res) => {
  const input = z.object({ name: z.string().trim().min(3).max(100), startDate: z.coerce.date(), endDate: z.coerce.date(), status: z.enum(PerformanceCycleStatus).default(PerformanceCycleStatus.DRAFT) }).parse(req.body)
  if (input.endDate <= input.startDate) throw new HttpError(422, 'Cycle end date must be after its start date')
  res.status(201).json(await prisma.performanceCycle.create({ data: { ...input, companyId: req.user!.companyId } }))
}))

router.patch('/cycles/:id', allowRoles(...hrRoles), asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const input = z.object({ name: z.string().trim().min(3).max(100).optional(), status: z.enum(PerformanceCycleStatus).optional(), endDate: z.coerce.date().optional() }).parse(req.body)
  const cycle = await prisma.performanceCycle.findFirst({ where: { id, companyId: req.user!.companyId } })
  if (!cycle) throw new HttpError(404, 'Performance cycle not found')
  res.json(await prisma.performanceCycle.update({ where: { id }, data: input }))
}))

router.get('/goals/my', asyncHandler(async (req, res) => {
  const employee = await employeeForUser(req.user!.id)
  const goals = await prisma.performanceGoal.findMany({ where: { employeeId: employee.id }, include: { cycle: true }, orderBy: { createdAt: 'desc' } })
  res.json({ data: goals, total: goals.length })
}))

router.post('/goals', allowRoles(...reviewerRoles), asyncHandler(async (req, res) => {
  const input = z.object({ title: z.string().trim().min(3).max(160), description: z.string().max(2000).optional(), metric: z.string().max(160).optional(), target: z.string().max(160).optional(), weight: z.number().int().min(0).max(100), dueDate: z.coerce.date().optional(), employeeId: z.uuid(), cycleId: z.uuid() }).parse(req.body)
  const [employee, cycle] = await Promise.all([prisma.employee.findFirst({ where: { id: input.employeeId, companyId: req.user!.companyId } }), prisma.performanceCycle.findFirst({ where: { id: input.cycleId, companyId: req.user!.companyId } })])
  if (!employee || !cycle) throw new HttpError(404, 'Employee or performance cycle not found')
  const total = await prisma.performanceGoal.aggregate({ where: { employeeId: input.employeeId, cycleId: input.cycleId }, _sum: { weight: true } })
  if ((total._sum.weight ?? 0) + input.weight > 100) throw new HttpError(422, 'Goal weights cannot exceed 100% for a cycle')
  res.status(201).json(await prisma.performanceGoal.create({ data: input }))
}))

router.patch('/goals/:id', asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const input = z.object({ progress: z.number().int().min(0).max(100), status: z.enum(GoalStatus).optional() }).parse(req.body)
  const employee = await employeeForUser(req.user!.id)
  const goal = await prisma.performanceGoal.findFirst({ where: { id, employee: { companyId: req.user!.companyId }, ...(reviewerRoles.includes(req.user!.role) ? {} : { employeeId: employee.id }) } })
  if (!goal) throw new HttpError(404, 'Goal not found')
  const status = input.progress === 100 ? GoalStatus.COMPLETED : input.progress > 0 ? GoalStatus.IN_PROGRESS : input.status
  res.json(await prisma.performanceGoal.update({ where: { id }, data: { ...input, status } }))
}))

router.get('/reviews', asyncHandler(async (req, res) => {
  const employee = await employeeForUser(req.user!.id)
  const isReviewer = reviewerRoles.includes(req.user!.role)
  const reviews = await prisma.performanceReview.findMany({ where: { cycle: { companyId: req.user!.companyId }, ...(isReviewer ? {} : { employeeId: employee.id }) }, include: { cycle: true, employee: { select: { id: true, firstName: true, lastName: true, designation: true } } }, orderBy: { updatedAt: 'desc' } })
  res.json({ data: reviews, total: reviews.length })
}))

router.post('/reviews', allowRoles(...hrRoles), asyncHandler(async (req, res) => {
  const input = z.object({ employeeId: z.uuid(), cycleId: z.uuid() }).parse(req.body)
  const [employee, cycle] = await Promise.all([prisma.employee.findFirst({ where: { id: input.employeeId, companyId: req.user!.companyId } }), prisma.performanceCycle.findFirst({ where: { id: input.cycleId, companyId: req.user!.companyId } })])
  if (!employee || !cycle) throw new HttpError(404, 'Employee or performance cycle not found')
  res.status(201).json(await prisma.performanceReview.create({ data: { ...input, managerId: employee.managerId } }))
}))

router.post('/reviews/:id/self-review', asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id), employee = await employeeForUser(req.user!.id)
  const input = z.object({ rating: z.number().int().min(1).max(5), comments: z.string().trim().min(20).max(5000) }).parse(req.body)
  const review = await prisma.performanceReview.findFirst({ where: { id, employeeId: employee.id, status: ReviewStatus.PENDING_SELF_REVIEW } })
  if (!review) throw new HttpError(404, 'Self-review is not available')
  res.json(await prisma.performanceReview.update({ where: { id }, data: { selfRating: input.rating, selfComments: input.comments, status: ReviewStatus.PENDING_MANAGER_REVIEW } }))
}))

router.post('/reviews/:id/manager-review', allowRoles(...reviewerRoles), asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const input = z.object({ rating: z.number().int().min(1).max(5), comments: z.string().trim().min(20).max(5000) }).parse(req.body)
  const review = await prisma.performanceReview.findFirst({ where: { id, cycle: { companyId: req.user!.companyId }, status: ReviewStatus.PENDING_MANAGER_REVIEW } })
  if (!review) throw new HttpError(404, 'Manager review is not available')
  res.json(await prisma.performanceReview.update({ where: { id }, data: { managerId: (await employeeForUser(req.user!.id)).id, managerRating: input.rating, managerComments: input.comments, status: ReviewStatus.PENDING_HR_REVIEW } }))
}))

router.post('/reviews/:id/finalize', allowRoles(...hrRoles), asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const input = z.object({ rating: z.number().int().min(1).max(5), comments: z.string().max(5000).optional() }).parse(req.body)
  const review = await prisma.performanceReview.findFirst({ where: { id, cycle: { companyId: req.user!.companyId }, status: ReviewStatus.PENDING_HR_REVIEW } })
  if (!review) throw new HttpError(404, 'HR review is not available')
  res.json(await prisma.performanceReview.update({ where: { id }, data: { finalRating: input.rating, hrComments: input.comments, status: ReviewStatus.FINALIZED } }))
}))

export default router
