/**
 * Bizuit HTTP Client
 * Axios-based client with interceptors for Bizuit API headers
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import type { IBizuitConfig, IApiError, IBizuitAuthHeaders } from '../types'

export class BizuitHttpClient {
  private axiosInstance: AxiosInstance
  private config: IBizuitConfig

  constructor(config: IBizuitConfig) {
    this.config = config
    this.axiosInstance = axios.create({
      timeout: config.timeout || 120000, // 2 minutes default
      headers: {
        'Content-Type': 'application/json',
        ...config.defaultHeaders,
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Log requests in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[Bizuit API Request]', {
            method: config.method?.toUpperCase(),
            url: config.url,
            headers: this.sanitizeHeaders(config.headers),
          })
        }
        return config
      },
      (error) => {
        return Promise.reject(this.handleError(error))
      }
    )

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Bizuit API Response]', {
            status: response.status,
            url: response.config.url,
          })
        }
        return response
      },
      (error) => {
        return Promise.reject(this.handleError(error))
      }
    )
  }

  private sanitizeHeaders(headers: any): Record<string, string> {
    const sanitized: Record<string, string> = {}
    for (const key in headers) {
      // Hide sensitive tokens in logs
      if (key.toLowerCase().includes('token') || key.toLowerCase().includes('auth')) {
        sanitized[key] = '***REDACTED***'
      } else {
        sanitized[key] = headers[key]
      }
    }
    return sanitized
  }

  private handleError(error: AxiosError): IApiError {
    const apiError: IApiError = {
      message: 'An unexpected error occurred',
      statusCode: error.response?.status,
    }

    if (error.response) {
      // Server responded with error status
      const data = error.response.data as any
      apiError.message = data?.message || data?.errorMessage || error.message
      apiError.code = data?.errorType || data?.code
      apiError.details = data
    } else if (error.request) {
      // Request made but no response
      apiError.message = 'No response from server'
      apiError.code = 'NETWORK_ERROR'
    } else {
      // Error in request setup
      apiError.message = error.message
      apiError.code = 'REQUEST_ERROR'
    }

    return apiError
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config)
    return response.data
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config)
    return response.data
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config)
    return response.data
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config)
    return response.data
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config)
    return response.data
  }

  /**
   * Add Bizuit-specific headers to request
   */
  withBizuitHeaders(headers: IBizuitAuthHeaders): BizuitHttpClient {
    const cleanHeaders: Record<string, string> = {}

    Object.entries(headers).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleanHeaders[key] = String(value)
      }
    })

    this.axiosInstance.defaults.headers.common = {
      ...this.axiosInstance.defaults.headers.common,
      ...cleanHeaders,
    }

    return this
  }

  /**
   * Clear all Bizuit headers
   */
  clearBizuitHeaders(): BizuitHttpClient {
    const bizuitHeaderPrefixes = ['BZ-']
    const headers = this.axiosInstance.defaults.headers.common

    Object.keys(headers).forEach((key) => {
      if (bizuitHeaderPrefixes.some((prefix) => key.startsWith(prefix))) {
        delete headers[key]
      }
    })

    return this
  }

  /**
   * Get raw axios instance for advanced usage
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance
  }
}
