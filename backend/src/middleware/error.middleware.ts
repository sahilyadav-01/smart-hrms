import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { HttpError } from '../utils/http-error.js'

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) { res.status(422).json({ message: 'Validation failed', errors: error.flatten().fieldErrors }); return }
  if (error instanceof HttpError) { res.status(error.status).json({ message: error.message, details: error.details }); return }
  console.error(error)
  res.status(500).json({ message: 'An unexpected error occurred' })
}
