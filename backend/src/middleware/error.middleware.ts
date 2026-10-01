import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { HttpError } from '../utils/http-error.js'
import multer from 'multer'

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) { res.status(422).json({ message: 'Validation failed', errors: error.flatten().fieldErrors }); return }
  if (error instanceof multer.MulterError) { res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 422).json({ message: error.message }); return }
  if (error instanceof HttpError) { res.status(error.status).json({ message: error.message, details: error.details }); return }
  console.error(error)
  res.status(500).json({ message: 'An unexpected error occurred' })
}
