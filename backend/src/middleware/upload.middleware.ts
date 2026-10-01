import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import multer from 'multer'
import { HttpError } from '../utils/http-error.js'

export const uploadDirectory = path.resolve(process.cwd(), 'uploads')
fs.mkdirSync(uploadDirectory, { recursive: true })
const allowedTypes = new Set(['application/pdf', 'image/jpeg', 'image/png'])

export const documentUpload = multer({
  storage: multer.diskStorage({ destination: uploadDirectory, filename: (_req, file, done) => done(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`) }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, done) => allowedTypes.has(file.mimetype) ? done(null, true) : done(new HttpError(415, 'Only PDF, JPEG, and PNG files are allowed')),
})
