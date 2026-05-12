export type HealthStatus = "UP" | "DOWN" | "SLOW"

export type HealthCheckResult = {
  name: string
  url: string
  status: HealthStatus
  statusCode: number | null
  responseTimeMs: number | null
  message: string
}