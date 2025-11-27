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

/**
 * DataService metadata (from GetByTabModuleId)
 */
export interface IDataServiceMetadata {
  /**
   * DataService ID (used for execute)
   */
  id: number

  /**
   * DataService name (human-readable)
   */
  name: string

  /**
   * Description
   */
  description?: string

  /**
   * Tab module ID
   */
  tabModuleId: number

  /**
   * Is active
   */
  isActive?: boolean

  /**
   * Additional metadata fields from API
   */
  [key: string]: any
}

/**
 * Request to execute DataService by name (instead of ID)
 */
export interface IDataServiceExecuteByNameRequest {
  /**
   * Tab module ID (page ID)
   */
  tabModuleId: number

  /**
   * DataService name to find and execute
   */
  dataServiceName: string

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
 * Page metadata from Dashboard API
 */
export interface IPageMetadata {
  /**
   * Page ID (from API: tabId)
   */
  tabId: number

  /**
   * Page name (from API: tabName)
   */
  tabName: string

  /**
   * Tab order
   */
  tabOrder?: number

  /**
   * Is visible
   */
  isVisible?: boolean

  /**
   * Page title
   */
  title?: string

  /**
   * Page URL/path
   */
  url?: string | null

  /**
   * Parent ID
   */
  parentId?: number | null

  /**
   * Icon file
   */
  iconFile?: string

  /**
   * Is disabled
   */
  disable?: boolean

  /**
   * Additional metadata fields from API
   */
  [key: string]: any
}

/**
 * Request to execute DataService by page name + DataService name
 * Most developer-friendly option - no numeric IDs needed!
 */
export interface IDataServiceExecuteByPageAndNameRequest {
  /**
   * Page name (e.g., 'Facturas', 'Clientes', 'Productos')
   */
  pageName: string

  /**
   * DataService name to find and execute
   */
  dataServiceName: string

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
