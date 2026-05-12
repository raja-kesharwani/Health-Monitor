import { Effect, Schema } from "effect"
import { EndpointsSchema } from "./domain/EndpointSchema"
import { safeCheckEndpoint } from "./services/healthCheckService"
import { printReport } from "./cli/report"

const rawEndpoints: unknown = [
  {
    name: "GitHub API",
    url: "https://api.github.com",
    timeoutMs: 3000,
    retries: 2,
    slowThresholdMs: 1000
  },
  {
    name: "JSONPlaceholder",
    url: "https://jsonplaceholder.typicode.com/posts",
    timeoutMs: 3000,
    retries: 2,
    slowThresholdMs: 1000
  },
  {
    name: "Broken API",
    url: "https://wrong-url.example",
    timeoutMs: 3000,
    retries: 2,
    slowThresholdMs: 1000
  },
  {
    name: "Slow API",
    url: "https://httpbin.org/delay/2",
    timeoutMs: 5000,
    retries: 1,
    slowThresholdMs: 1000
  }
]

const endpoints = Schema.decodeUnknownSync(EndpointsSchema)(rawEndpoints)

const program = Effect.all(
  endpoints.map((endpoint) => safeCheckEndpoint(endpoint)),
  { concurrency: 3 }
)

Effect.runPromise(program).then((results) => {
  printReport(results)
})
