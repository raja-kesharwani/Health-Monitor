import type { HealthCheckResult } from "../domain/HealthCheck"

export const printReport = (results: HealthCheckResult[]) => {
  console.log("============================================================")
  console.log("PulseCheck API Health Report")
  console.log("============================================================")
  console.log("Name                 Status   Code   Time      Message")
  console.log("------------------------------------------------------------")

  for (const result of results) {
    const name = result.name.padEnd(20)
    const status = result.status.padEnd(8)
    const code = String(result.statusCode ?? "-").padEnd(6)
    const time = (result.responseTimeMs === null ? "-" : `${result.responseTimeMs}ms`).padEnd(9)

    console.log(`${name} ${status} ${code} ${time} ${result.message}`)
  }

  console.log("------------------------------------------------------------")

  const total = results.length
  const up = results.filter((result) => result.status === "UP").length
  const down = results.filter((result) => result.status === "DOWN").length
  const slow = results.filter((result) => result.status === "SLOW").length

  console.log(`Total: ${total} | UP: ${up} | DOWN: ${down} | SLOW: ${slow}`)
  console.log("============================================================")
}