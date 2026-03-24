const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const { metricsMiddleware, getMetrics, startTime } = require('./middleware/metrics')
const authRoutes = require('./routes/auth')

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors())
app.use(express.json())

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
app.use(limiter)

app.use(metricsMiddleware)

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'auth-service',
    uptime: Math.floor((Date.now() - startTime) / 1000)
  })
})

app.get('/metrics', (req, res) => res.json(getMetrics()))

app.use('/', authRoutes)

if (require.main === module) {
  app.listen(PORT, () => console.log(
    JSON.stringify({ timestamp: new Date().toISOString(), level: 'info', message: `auth-service listening on :${PORT}` })
  ))
}

module.exports = app
