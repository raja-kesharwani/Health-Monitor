import { Duration, Effect, Schedule } from "effect"
import type { Endpoint } from "../domain/Endpoints"
import type { HealthCheckResult } from "../domain/HealthCheck"

export const checkEndpoint = (
  endpoint: Endpoint
): Effect.Effect<HealthCheckResult, Error> =>
  Effect.gen(function* () {
    const startTime = Date.now()

    const response = yield* Effect.tryPromise({
      try: () => fetch(endpoint.url),
      catch: (error) => new Error(`Request failed: ${String(error)}`)
    }).pipe(
      Effect.timeoutFail({
        duration: Duration.millis(endpoint.timeoutMs),
        onTimeout: () => new Error(`Timeout after ${endpoint.timeoutMs}ms`)
      }),
      Effect.retry(Schedule.recurs(endpoint.retries))
    )

    const endTime = Date.now()
    const responseTimeMs = endTime - startTime

    const status = !response.ok
      ? "DOWN"
      : responseTimeMs > endpoint.slowThresholdMs
        ? "SLOW"
        : "UP"

    const message = !response.ok
      ? `HTTP ${response.status}`
      : status === "SLOW"
        ? `Slow response over ${endpoint.slowThresholdMs}ms`
        : "OK"

    return {
      name: endpoint.name,
      url: endpoint.url,
      status,
      statusCode: response.status,
      responseTimeMs,
      message
    }
  })

export const safeCheckEndpoint = (
  endpoint: Endpoint
): Effect.Effect<HealthCheckResult> =>
  checkEndpoint(endpoint).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        name: endpoint.name,
        url: endpoint.url,
        status: "DOWN" as const,
        statusCode: null,
        responseTimeMs: null,
        message: error.message
      })
    )
  )
