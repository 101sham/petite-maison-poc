const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const { metricsMiddleware, getMetrics, startTime } = require('./middleware/metrics')
const productRoutes = require('./routes/products')
const cartRoutes = require('./routes/cart')
const { initDB } = require('./db/db')

const app = express()
const PORT = process.env.PORT || 3002

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }))
app.use(metricsMiddleware)

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'product-service', uptime: Math.floor((Date.now() - startTime) / 1000) }))
app.get('/metrics', (req, res) => res.json(getMetrics()))

app.use('/products', productRoutes)
app.use('/cart', cartRoutes)

if (require.main === module) {
  initDB()
    .then(() => app.listen(PORT, () =>
      console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: 'info', message: `product-service listening on :${PORT}` }))
    ))
    .catch(err => { console.error(err); process.exit(1) })
}

module.exports = app
