export type Endpoint = {
  name: string
  url: string
  timeoutMs: number
  retries: number
  slowThresholdMs: number
}