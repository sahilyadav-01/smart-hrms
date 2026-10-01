import { Router } from 'express'
import authRoutes from '../modules/auth/auth.routes.js'
import employeeRoutes from '../modules/employees/employee.routes.js'
import organizationRoutes from '../modules/organization/organization.routes.js'
import attendanceRoutes from '../modules/attendance/attendance.routes.js'
import leaveRoutes from '../modules/leaves/leave.routes.js'
import payrollRoutes from '../modules/payroll/payroll.routes.js'
import recruitmentRoutes from '../modules/recruitment/recruitment.routes.js'
import performanceRoutes from '../modules/performance/performance.routes.js'
import documentRoutes from '../modules/documents/document.routes.js'
import notificationRoutes from '../modules/notifications/notification.routes.js'
import reportRoutes from '../modules/reports/report.routes.js'

export const apiRouter = Router()
apiRouter.use('/auth', authRoutes)
apiRouter.use('/employees', employeeRoutes)
apiRouter.use('/organization', organizationRoutes)
apiRouter.use('/attendance', attendanceRoutes)
apiRouter.use('/leaves', leaveRoutes)
apiRouter.use('/payroll', payrollRoutes)
apiRouter.use('/recruitment', recruitmentRoutes)
apiRouter.use('/performance', performanceRoutes)
apiRouter.use('/documents', documentRoutes)
apiRouter.use('/notifications', notificationRoutes)
apiRouter.use('/reports', reportRoutes)
