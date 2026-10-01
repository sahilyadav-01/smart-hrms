import { Router } from 'express'
import { ApplicationStatus, EmploymentType, InterviewStatus, JobStatus, Role } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { authenticate } from '../../middleware/auth.middleware.js'
import { allowRoles } from '../../middleware/role.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'
import { HttpError } from '../../utils/http-error.js'

const router = Router()
const recruiters: Role[] = [Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER, Role.RECRUITER]
router.use(authenticate, allowRoles(...recruiters))

router.get('/jobs', asyncHandler(async (req, res) => {
  const jobs = await prisma.job.findMany({ where: { companyId: req.user!.companyId }, include: { department: true, _count: { select: { applications: true } } }, orderBy: { createdAt: 'desc' } })
  res.json({ data: jobs, total: jobs.length })
}))

router.post('/jobs', asyncHandler(async (req, res) => {
  const input = z.object({ title: z.string().trim().min(3).max(120), description: z.string().trim().min(20).max(10_000), employmentType: z.enum(EmploymentType), openings: z.number().int().min(1).max(100).default(1), departmentId: z.uuid().optional(), status: z.enum(JobStatus).default(JobStatus.DRAFT) }).parse(req.body)
  res.status(201).json(await prisma.job.create({ data: { ...input, companyId: req.user!.companyId } }))
}))

router.patch('/jobs/:id', asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const input = z.object({ title: z.string().trim().min(3).max(120).optional(), description: z.string().trim().min(20).max(10_000).optional(), employmentType: z.enum(EmploymentType).optional(), openings: z.number().int().min(1).max(100).optional(), departmentId: z.uuid().nullable().optional(), status: z.enum(JobStatus).optional() }).parse(req.body)
  const job = await prisma.job.findFirst({ where: { id, companyId: req.user!.companyId } })
  if (!job) throw new HttpError(404, 'Job opening not found')
  res.json(await prisma.job.update({ where: { id }, data: input }))
}))

router.get('/candidates', asyncHandler(async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search : ''
  const candidates = await prisma.candidate.findMany({ where: { companyId: req.user!.companyId, ...(search && { OR: [{ firstName: { contains: search, mode: 'insensitive' } }, { lastName: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }) }, include: { applications: { include: { job: { select: { id: true, title: true } } } } }, orderBy: { createdAt: 'desc' } })
  res.json({ data: candidates, total: candidates.length })
}))

router.post('/candidates', asyncHandler(async (req, res) => {
  const input = z.object({ firstName: z.string().trim().min(2), lastName: z.string().trim().min(2), email: z.email(), phone: z.string().max(30).optional(), resumeUrl: z.url().optional(), source: z.string().max(80).optional() }).parse(req.body)
  res.status(201).json(await prisma.candidate.create({ data: { ...input, email: input.email.toLowerCase(), companyId: req.user!.companyId } }))
}))

router.get('/applications', asyncHandler(async (req, res) => {
  const jobId = req.query.jobId ? z.uuid().parse(req.query.jobId) : undefined
  const applications = await prisma.application.findMany({ where: { jobId, job: { companyId: req.user!.companyId } }, include: { candidate: true, job: { select: { id: true, title: true } }, interviews: { orderBy: { scheduledAt: 'asc' } } }, orderBy: { updatedAt: 'desc' } })
  res.json({ data: applications, total: applications.length })
}))

router.post('/applications', asyncHandler(async (req, res) => {
  const input = z.object({ jobId: z.uuid(), candidateId: z.uuid(), notes: z.string().max(2000).optional() }).parse(req.body)
  const [job, candidate] = await Promise.all([prisma.job.findFirst({ where: { id: input.jobId, companyId: req.user!.companyId } }), prisma.candidate.findFirst({ where: { id: input.candidateId, companyId: req.user!.companyId } })])
  if (!job || !candidate) throw new HttpError(404, 'Job or candidate not found')
  res.status(201).json(await prisma.application.create({ data: input }))
}))

router.patch('/applications/:id/status', asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const input = z.object({ status: z.enum(ApplicationStatus), rating: z.number().int().min(1).max(5).optional(), notes: z.string().max(2000).optional() }).parse(req.body)
  const application = await prisma.application.findFirst({ where: { id, job: { companyId: req.user!.companyId } } })
  if (!application) throw new HttpError(404, 'Application not found')
  res.json(await prisma.application.update({ where: { id }, data: input }))
}))

router.post('/interviews', asyncHandler(async (req, res) => {
  const input = z.object({ applicationId: z.uuid(), title: z.string().trim().min(3).max(120), scheduledAt: z.coerce.date(), durationMinutes: z.number().int().min(15).max(480).default(60), meetingUrl: z.url().optional(), interviewerId: z.uuid().optional() }).parse(req.body)
  if (input.scheduledAt <= new Date()) throw new HttpError(422, 'Interview must be scheduled in the future')
  const application = await prisma.application.findFirst({ where: { id: input.applicationId, job: { companyId: req.user!.companyId } } })
  if (!application) throw new HttpError(404, 'Application not found')
  const interview = await prisma.$transaction(async tx => {
    const created = await tx.interview.create({ data: input })
    await tx.application.update({ where: { id: input.applicationId }, data: { status: ApplicationStatus.INTERVIEW } })
    return created
  })
  res.status(201).json(interview)
}))

router.patch('/interviews/:id', asyncHandler(async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const input = z.object({ status: z.enum(InterviewStatus).optional(), feedback: z.string().max(3000).optional(), scheduledAt: z.coerce.date().optional() }).parse(req.body)
  const interview = await prisma.interview.findFirst({ where: { id, application: { job: { companyId: req.user!.companyId } } } })
  if (!interview) throw new HttpError(404, 'Interview not found')
  res.json(await prisma.interview.update({ where: { id }, data: input }))
}))

export default router
