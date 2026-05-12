import { Schema } from "effect"

export const EndpointSchema = Schema.Struct({
  name: Schema.String,
  url: Schema.String,
  timeoutMs: Schema.Number,
  retries: Schema.Number,
  slowThresholdMs: Schema.Number
})

export const EndpointsSchema = Schema.Array(EndpointSchema)