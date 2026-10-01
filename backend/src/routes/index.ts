import { Router } from 'express'
import authRoutes from '../modules/auth/auth.routes.js'
import employeeRoutes from '../modules/employees/employee.routes.js'

export const apiRouter = Router()
apiRouter.use('/auth', authRoutes)
apiRouter.use('/employees', employeeRoutes)
