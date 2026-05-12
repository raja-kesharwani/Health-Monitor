# PulseCheck — API Health Monitor

PulseCheck is a beginner-friendly API Health Monitor built with **TypeScript** and **Effect**.

It checks multiple APIs, measures response time, handles failures safely, retries failed requests, applies timeouts, detects slow APIs, validates endpoint configuration, and prints a clean health report in the terminal.

---

## Why I built this

I built this project to learn and demonstrate important concepts from the **Effect** library in a practical way.

Instead of only reading documentation, this project helped me learn Effect by building something real.

---

## Features

- Check multiple API endpoints
- Show API status as `UP`, `DOWN`, or `SLOW`
- Measure response time
- Handle broken APIs without crashing the app
- Add timeout for slow APIs
- Retry failed requests
- Limit concurrent API checks
- Validate endpoint data using Effect Schema
- Print a clean CLI health report
- Organized project structure

---

## Tech Stack

- TypeScript
- Effect
- Node.js
- tsx

---

## Effect concepts used

This project uses the following Effect concepts:

### `Effect.gen`

Used to write Effect code in a readable step-by-step style, similar to `async/await`.

### `Effect.tryPromise`

Used to wrap async operations like `fetch()` so failures are handled inside Effect.

### `Effect.catchAll`

Used to catch failed API checks and convert them into a `DOWN` health result instead of crashing the program.

### `Effect.timeoutFail`

Used to fail an API check if it takes longer than the configured timeout.

### `Effect.retry`

Used to retry failed API requests before marking them as `DOWN`.

### `Schedule.recurs`

Used with `Effect.retry` to control how many times a failed request should be retried.

### `Effect.all`

Used to check multiple APIs.

### Concurrency limit

Used with `Effect.all(..., { concurrency: 3 })` to avoid checking too many APIs at the same time.

### `Schema.Struct`

Used to validate endpoint configuration.

### `Schema.decodeUnknownSync`

Used to safely decode and validate unknown endpoint data before running the monitor.

---

## Project Structure

```txt
src/
  main.ts

  domain/
    Endpoint.ts
    HealthCheck.ts

  schemas/
    EndpointSchema.ts

  services/
    healthCheckService.ts

  cli/
    report.ts