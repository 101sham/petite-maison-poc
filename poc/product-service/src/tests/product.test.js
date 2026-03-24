const request = require('supertest')
const app = require('../app')

// Mock DB
jest.mock('../db/db', () => ({
  pool: {
    query: jest.fn(),
  },
  initDB: jest.fn(),
}))

// Mock authenticate middleware
jest.mock('../middleware/authenticate', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'user-test-123', email: 'test@test.com', name: 'Test User', roles: [] }
    next()
  },
}))

const { pool } = require('../db/db')

beforeEach(() => {
  jest.clearAllMocks()
})

describe('product-service', () => {
  describe('GET /health', () => {
    it('returns 200 with status ok', async () => {
      const res = await request(app).get('/health')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
    })
  })

  describe('GET /metrics', () => {
    it('returns metrics object', async () => {
      const res = await request(app).get('/metrics')
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('requests')
      expect(res.body).toHaveProperty('performance')
    })
  })

  describe('GET /products', () => {
    it('returns list of products', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1, title: 'Test', price: 10.99, category: 'films' }] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })

      const res = await request(app).get('/products')
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('products')
      expect(res.body.products).toHaveLength(1)
    })

    it('filters products by valid category', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })

      const res = await request(app).get('/products?category=films')
      expect(res.status).toBe(200)
    })

    it('returns 400 for invalid category', async () => {
      const res = await request(app).get('/products?category=invalid')
      expect(res.status).toBe(400)
    })
  })

  describe('GET /products/:id', () => {
    it('returns 404 when product not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] })
      const res = await request(app).get('/products/9999')
      expect(res.status).toBe(404)
    })

    it('returns product when found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Test', price: 10.99 }] })
      const res = await request(app).get('/products/1')
      expect(res.status).toBe(200)
      expect(res.body.id).toBe(1)
    })

    it('returns 400 for invalid id', async () => {
      const res = await request(app).get('/products/abc')
      expect(res.status).toBe(400)
    })
  })

  describe('GET /cart', () => {
    it('returns cart items for authenticated user', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] })
      const res = await request(app).get('/cart')
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('items')
      expect(res.body.total).toBe(0)
    })
  })

  describe('POST /cart', () => {
    it('adds product to cart', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1, stock: 5 }] })
        .mockResolvedValueOnce({ rows: [{ id: 10, product_id: 1, quantity: 1 }] })

      const res = await request(app)
        .post('/cart')
        .send({ product_id: 1, quantity: 1 })
      expect(res.status).toBe(201)
      expect(res.body.message).toBe('Ajouté au panier')
    })

    it('returns 400 for invalid product_id', async () => {
      const res = await request(app).post('/cart').send({ product_id: 'abc' })
      expect(res.status).toBe(400)
    })

    it('returns 404 when product not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] })
      const res = await request(app).post('/cart').send({ product_id: 9999 })
      expect(res.status).toBe(404)
    })

    it('returns 400 when product out of stock', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, stock: 0 }] })
      const res = await request(app).post('/cart').send({ product_id: 1 })
      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Produit épuisé')
    })
  })

  describe('DELETE /cart/:id', () => {
    it('removes item from cart', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 1 })
      const res = await request(app).delete('/cart/1')
      expect(res.status).toBe(200)
    })

    it('returns 404 when item not in cart', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 })
      const res = await request(app).delete('/cart/9999')
      expect(res.status).toBe(404)
    })
  })
})
