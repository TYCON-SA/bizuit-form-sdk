/**
 * DataService Types
 * Types for BIZUIT Dashboard DataService API
 */

/**
 * DataService parameter (input)
 */
export interface IDataServiceParameter {
  name: string
  value: any
  isGroupBy?: boolean
}

/**
 * Request to execute a DataService query
 */
export interface IDataServiceRequest {
  /**
   * DataService ID from BIZUIT Dashboard
   */
  id: number

  /**
   * Query parameters
   */
  parameters?: IDataServiceParameter[]

  /**
   * Force fresh query (skip cache)
   * @default false
   */
  withoutCache?: boolean

  /**
   * Execute from global scope
   * @default false
   */
  executeFromGlobal?: boolean
}

/**
 * DataService response (generic)
 */
export interface IDataServiceResponse<T = any> {
  /**
   * Query result rows
   */
  data: T[]

  /**
   * Total row count (if applicable)
   */
  totalCount?: number

  /**
   * Success flag
   */
  success: boolean

  /**
   * Error message (if failed)
   */
  errorMessage?: string

  /**
   * Error type/code (if failed)
   */
  errorType?: string
}
