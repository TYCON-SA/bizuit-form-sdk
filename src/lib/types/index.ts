/**
 * Main types export
 */

export * from './auth.types'
export * from './process.types'
export * from './process-flow.types'

// Common utility types
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

export interface IBizuitConfig {
  apiUrl: string
  timeout?: number
  defaultHeaders?: Record<string, string>
}

export interface IApiError {
  message: string
  code?: string
  details?: unknown
  statusCode?: number
}
