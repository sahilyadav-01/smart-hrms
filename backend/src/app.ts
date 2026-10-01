import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/env.js'
import { apiRouter } from './routes/index.js'
import { errorHandler } from './middleware/error.middleware.js'

export const app = express()
app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'smart-hrms-api' }))
app.use('/api/v1', apiRouter)
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }))
app.use(errorHandler)
