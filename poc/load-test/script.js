import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

const errorRate = new Rate('error_rate')

export const options = {
  vus: 100,
  duration: '60s',
  thresholds: {
    http_req_duration: ['p(95)<300'],
    error_rate: ['rate<0.05'],
  },
}

export default function () {
  const healthRes = http.get('https://localhost:8443/api/health', {
    insecureSkipTLSVerify: true,
  })
  check(healthRes, {
    'GET /health — status 200': (r) => r.status === 200,
  })
  errorRate.add(healthRes.status >= 400)

  const metricsRes = http.get('https://localhost:8443/api/metrics', {
    insecureSkipTLSVerify: true,
  })
  check(metricsRes, {
    'GET /metrics — status 200': (r) => r.status === 200,
  })
  errorRate.add(metricsRes.status >= 400)

  sleep(0.5)
}