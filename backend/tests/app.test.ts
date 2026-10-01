import request from 'supertest'
import { describe, expect, it } from 'vitest'

process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/smart_hrms_test'
process.env.JWT_SECRET = 'test-secret-that-is-at-least-thirty-two-characters'
process.env.CORS_ORIGIN = 'http://localhost:5173'

const { app } = await import('../src/app.js')

describe('API shell', () => {
  it('reports service health and a request ID', async () => {
    const response = await request(app).get('/health').expect(200)
    expect(response.body).toEqual({ status: 'ok', service: 'smart-hrms-api' })
    expect(response.headers['x-request-id']).toBeTruthy()
  })

  it('returns a structured 404', async () => {
    const response = await request(app).get('/not-a-route').expect(404)
    expect(response.body.message).toBe('Route not found')
  })

  it('rejects malformed login input before querying the database', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({ email: 'invalid', password: 'short' }).expect(422)
    expect(response.body.message).toBe('Validation failed')
  })
})
