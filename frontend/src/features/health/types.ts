export interface HealthCheck {
  ok: boolean
  detail: string
}

export interface HealthResponse {
  status: 'ok' | 'degraded'
  service: string
  checks: {
    database: HealthCheck
    redis: HealthCheck
  }
}
