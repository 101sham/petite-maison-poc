const request = require('supertest')
const app = require('../app')

describe('auth-service', () => {
  describe('GET /health', () => {
    it('returns 200 with status ok', async () => {
      const res = await request(app).get('/health')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
      expect(res.body.service).toBe('auth-service')
    })
  })

  describe('GET /metrics', () => {
    it('returns metrics object', async () => {
      const res = await request(app).get('/metrics')
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('requests')
      expect(res.body).toHaveProperty('performance')
      expect(res.body).toHaveProperty('uptime_seconds')
    })
  })

  describe('POST /verify', () => {
    it('returns 401 when no token provided', async () => {
      const res = await request(app).post('/verify')
      expect(res.status).toBe(401)
      expect(res.body.error).toBe('Token manquant')
    })

    it('returns 401 when token is invalid', async () => {
      const res = await request(app)
        .post('/verify')
        .set('Authorization', 'Bearer invalidtoken123')
      expect(res.status).toBe(401)
      expect(res.body.error).toBe('Token invalide')
    })

    it('returns 401 when Authorization header is malformed', async () => {
      const res = await request(app)
        .post('/verify')
        .set('Authorization', 'InvalidFormat')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /me', () => {
    it('returns 401 when no token provided', async () => {
      const res = await request(app).get('/me')
      expect(res.status).toBe(401)
    })
  })
})
