/**
 * Error Handler Utilities
 */

import type { IApiError } from '../types'

export class BizuitError extends Error {
  code?: string
  statusCode?: number
  details?: unknown

  constructor(message: string, code?: string, statusCode?: number, details?: unknown) {
    super(message)
    this.name = 'BizuitError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }

  static fromApiError(apiError: IApiError): BizuitError {
    return new BizuitError(
      apiError.message,
      apiError.code,
      apiError.statusCode,
      apiError.details
    )
  }

  isAuthError(): boolean {
    return this.statusCode === 401 || this.code === 'UNAUTHORIZED'
  }

  isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR'
  }

  isValidationError(): boolean {
    return this.statusCode === 400 || this.code === 'VALIDATION_ERROR'
  }
}

export function handleError(error: unknown): BizuitError {
  if (error instanceof BizuitError) {
    return error
  }

  if (error instanceof Error) {
    return new BizuitError(error.message)
  }

  if (typeof error === 'object' && error !== null) {
    const apiError = error as IApiError
    if (apiError.message) {
      return BizuitError.fromApiError(apiError)
    }
  }

  return new BizuitError('An unknown error occurred')
}
