const startTime = Date.now()
const metrics = { total: 0, errors: 0, durations: [] }

function metricsMiddleware(req, res, next) {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    metrics.total++
    if (res.statusCode >= 400) metrics.errors++
    metrics.durations.push(duration)
    if (metrics.durations.length > 1000) metrics.durations.shift()

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: duration,
      user: req.user?.id || 'anonymous',
    }))
  })
  next()
}

function getMetrics() {
  const sorted = [...metrics.durations].sort((a, b) => a - b)
  const p95idx = Math.floor(sorted.length * 0.95)
  return {
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
    requests: {
      total: metrics.total,
      errors: metrics.errors,
      error_rate: metrics.total ? ((metrics.errors / metrics.total) * 100).toFixed(2) + '%' : '0.00%',
    },
    performance: {
      avg_response_ms: sorted.length ? Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length) : 0,
      p95_response_ms: sorted[p95idx] || 0,
    },
  }
}

module.exports = { metricsMiddleware, getMetrics, startTime }
