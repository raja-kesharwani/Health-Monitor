import { Effect, Duration, Schedule } from "effect";

type Endpoint = {
    name: string;
    url: string;
    timeoutMs: number;
    retries: number;
    slowThresholdMs: number;
};

type HealthCheckResult = {
    name: string;
    url: string;
    status: "Up" | "Down" | "Slow";
    statusCode: number | null;
    responseTimeMs: number | null;
    message: string;
}

const checkEndpoint = (endpoint: Endpoint): Effect.Effect<HealthCheckResult, Error> =>
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
            statusCode: response.status,
            responseTimeMs,
            status: response.ok ? "Up" : "Down",
            message: response.ok ? "ok" : `HTTP $ {response.status}`
        }
    })



const safeCheckEndpoint = (endpoint: Endpoint): Effect.Effect<HealthCheckResult> =>
    checkEndpoint(endpoint).pipe(
        Effect.catchAll((error) =>
            Effect.succeed({
                name: endpoint.name,
                url: endpoint.url,
                status: "Slow" as const,
                statusCode: null,
                responseTimeMs: null,
                message: error.message

            })
        )
    )

const endpoints: Endpoint[] = [
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
        name: "fake API",
        url: "https://fake-url.example",
        timeoutMs: 3000,
        retries: 2,
        slowThresholdMs: 1000
    },
]
const program = Effect.all(
    endpoints.map((endpoint) => safeCheckEndpoint(endpoint)),
    { concurrency: 3 }

)

Effect.runPromise(program).then((results) => {
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
  const up = results.filter((result) => result.status === "Up").length
  const down = results.filter((result) => result.status === "Down").length
  const slow = results.filter((result) => result.status === "Slow").length

  console.log(`Total: ${total} | UP: ${up} | DOWN: ${down} | SLOW: ${slow}`)
  console.log("============================================================")
})