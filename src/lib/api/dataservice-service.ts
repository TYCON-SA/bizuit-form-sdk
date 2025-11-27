/**
 * Bizuit DataService Service
 * Executes queries via BIZUIT Dashboard DataService API
 */

import { BizuitHttpClient } from './http-client'
import type {
  IBizuitConfig,
  IDataServiceRequest,
  IDataServiceResponse,
  IDataServiceParameter,
  IDataServiceMetadata,
  IDataServiceExecuteByNameRequest,
  IPageMetadata,
  IDataServiceExecuteByPageAndNameRequest,
} from '../types'

export class BizuitDataServiceService {
  private client: BizuitHttpClient
  private apiUrl: string

  constructor(config: IBizuitConfig) {
    this.client = new BizuitHttpClient(config)
    this.apiUrl = config.apiUrl
  }

  /**
   * Execute a DataService query
   *
   * @example
   * ```typescript
   * // Get list of rejection types
   * const result = await sdk.dataService.execute<RejectionType>({
   *   id: 42,
   *   parameters: [
   *     { name: 'status', value: 'active' }
   *   ]
   * }, token)
   *
   * console.log(result.data) // Array of RejectionType[]
   * ```
   */
  async execute<T = any>(
    request: IDataServiceRequest,
    token: string
  ): Promise<IDataServiceResponse<T>> {
    const { id, parameters = [], withoutCache = false, executeFromGlobal = false } = request

    // Build query params
    const queryParams = new URLSearchParams({
      withoutCache: String(withoutCache),
      executeFromGlobal: String(executeFromGlobal),
    })

    // Build request body
    const body = {
      id,
      parameters: parameters.map(p => ({
        name: p.name,
        value: p.value,
        isGroupBy: p.isGroupBy ?? false,
      })),
    }

    try {
      const response = await this.client.post<IDataServiceResponse<T>>(
        `${this.apiUrl}/Dashboard/DataService/Execute?${queryParams.toString()}`,
        body,
        {
          headers: {
            'bz-auth-token': `Basic ${token}`,
          },
        }
      )

      return {
        ...response,
        success: true,
      }
    } catch (error: any) {
      return {
        data: [],
        success: false,
        errorMessage: error.message,
        errorType: error.code,
      }
    }
  }

  /**
   * Helper to create DataService parameters
   *
   * @example
   * ```typescript
   * const params = sdk.dataService.createParameters([
   *   { name: 'customerId', value: 'ALFKI' },
   *   { name: 'year', value: 2024 }
   * ])
   * ```
   */
  createParameters(params: Array<{ name: string; value: any; isGroupBy?: boolean }>): IDataServiceParameter[] {
    return params.map(p => ({
      name: p.name,
      value: p.value,
      isGroupBy: p.isGroupBy ?? false,
    }))
  }

  /**
   * Execute multiple DataService queries in parallel
   *
   * @example
   * ```typescript
   * const [rejectionTypes, statusList] = await sdk.dataService.executeMany([
   *   { id: 42, parameters: [] },
   *   { id: 43, parameters: [] }
   * ], token)
   * ```
   */
  async executeMany<T = any>(
    requests: IDataServiceRequest[],
    token: string
  ): Promise<IDataServiceResponse<T>[]> {
    const promises = requests.map(request => this.execute<T>(request, token))
    return Promise.all(promises)
  }

  /**
   * Get all DataServices for a specific tab module (page)
   *
   * @example
   * ```typescript
   * const dataServices = await sdk.dataService.getByTabModuleId(1018, token)
   * console.log(dataServices) // Array of IDataServiceMetadata
   *
   * // Find by name
   * const rejectionDS = dataServices.find(ds => ds.name === 'Motivos de Rechazo')
   * if (rejectionDS) {
   *   const result = await sdk.dataService.execute({ id: rejectionDS.id }, token)
   * }
   * ```
   */
  async getByTabModuleId(
    tabModuleId: number,
    token: string
  ): Promise<IDataServiceMetadata[]> {
    try {
      const response = await this.client.get<IDataServiceMetadata[]>(
        `${this.apiUrl}/Dashboard/DataService/GetByTabModuleId?tabModuleId=${tabModuleId}`,
        {
          headers: {
            'Authorization': `Basic ${token}`,
          },
        }
      )

      return response || []
    } catch (error: any) {
      console.error('Error fetching DataServices by tabModuleId:', error)
      return []
    }
  }

  /**
   * Execute a DataService by name (instead of ID)
   * Automatically finds the DataService ID from the tab module and executes it
   *
   * @example
   * ```typescript
   * // Developer only needs to know:
   * // 1. Tab module ID (page ID) - stable across environments
   * // 2. DataService name - descriptive, human-readable
   *
   * const result = await sdk.dataService.executeByName<RejectionType>({
   *   tabModuleId: 1018,
   *   dataServiceName: 'Motivos de Rechazo',
   *   parameters: [
   *     { name: 'status', value: 'active' }
   *   ]
   * }, token)
   *
   * if (result.success) {
   *   console.log(result.data) // RejectionType[]
   * }
   * ```
   */
  async executeByName<T = any>(
    request: IDataServiceExecuteByNameRequest,
    token: string
  ): Promise<IDataServiceResponse<T>> {
    const { tabModuleId, dataServiceName, parameters = [], withoutCache = false, executeFromGlobal = false } = request

    try {
      // 1. Get all DataServices for this tab module
      const dataServices = await this.getByTabModuleId(tabModuleId, token)

      // 2. Find the DataService by name
      const dataService = dataServices.find(ds => ds.name === dataServiceName)

      if (!dataService) {
        return {
          data: [],
          success: false,
          errorMessage: `DataService '${dataServiceName}' not found in tab module ${tabModuleId}`,
          errorType: 'DS_NOT_FOUND',
        }
      }

      // 3. Execute the DataService using its ID
      return await this.execute<T>({
        id: dataService.id,
        parameters,
        withoutCache,
        executeFromGlobal,
      }, token)

    } catch (error: any) {
      return {
        data: [],
        success: false,
        errorMessage: error.message,
        errorType: error.code,
      }
    }
  }

  /**
   * Find a DataService by name in a tab module
   * Returns the DataService metadata without executing it
   *
   * @example
   * ```typescript
   * const dataService = await sdk.dataService.findByName(1018, 'Motivos de Rechazo', token)
   *
   * if (dataService) {
   *   console.log(`Found DataService ID: ${dataService.id}`)
   *   // Can now execute it multiple times without re-fetching metadata
   *   const result = await sdk.dataService.execute({ id: dataService.id }, token)
   * }
   * ```
   */
  async findByName(
    tabModuleId: number,
    dataServiceName: string,
    token: string
  ): Promise<IDataServiceMetadata | null> {
    const dataServices = await this.getByTabModuleId(tabModuleId, token)
    return dataServices.find(ds => ds.name === dataServiceName) || null
  }

  /**
   * Get all pages from Dashboard
   *
   * @example
   * ```typescript
   * const pages = await sdk.dataService.getPages(token)
   * console.log(pages.map(p => p.name)) // ['Facturas', 'Clientes', 'Productos', ...]
   *
   * // Find page by name
   * const facturasPage = pages.find(p => p.name === 'Facturas')
   * if (facturasPage) {
   *   const dataServices = await sdk.dataService.getByTabModuleId(facturasPage.id, token)
   * }
   * ```
   */
  async getPages(token: string): Promise<IPageMetadata[]> {
    try {
      const response = await this.client.get<IPageMetadata[]>(
        `${this.apiUrl}/Pages`,
        {
          headers: {
            'bz-auth-token': `Basic ${token}`,
          },
        }
      )

      return response || []
    } catch (error: any) {
      console.error('Error fetching pages:', error)
      return []
    }
  }

  /**
   * Find a page by name
   *
   * @example
   * ```typescript
   * const page = await sdk.dataService.findPageByName('Facturas', token)
   *
   * if (page) {
   *   console.log(`Page ID: ${page.id}`)
   *   // Can now get DataServices for this page
   *   const dataServices = await sdk.dataService.getByTabModuleId(page.id, token)
   * }
   * ```
   */
  async findPageByName(
    pageName: string,
    token: string
  ): Promise<IPageMetadata | null> {
    const pages = await this.getPages(token)
    return pages.find(p => p.name === pageName) || null
  }

  /**
   * Execute DataService by page name + DataService name
   * BEST DEVELOPER EXPERIENCE - No numeric IDs needed at all!
   *
   * @example
   * ```typescript
   * // Developer only needs two descriptive names:
   * // 1. Page name (e.g., 'Facturas')
   * // 2. DataService name (e.g., 'Motivos de Rechazo')
   *
   * const result = await sdk.dataService.executeByPageAndName<RejectionType>({
   *   pageName: 'Facturas',
   *   dataServiceName: 'Motivos de Rechazo',
   *   parameters: [
   *     { name: 'status', value: 'active' }
   *   ]
   * }, token)
   *
   * if (result.success) {
   *   console.log(result.data) // RejectionType[]
   * }
   * ```
   */
  async executeByPageAndName<T = any>(
    request: IDataServiceExecuteByPageAndNameRequest,
    token: string
  ): Promise<IDataServiceResponse<T>> {
    const { pageName, dataServiceName, parameters = [], withoutCache = false, executeFromGlobal = false } = request

    try {
      // 1. Find page by name
      const page = await this.findPageByName(pageName, token)

      if (!page) {
        return {
          data: [],
          success: false,
          errorMessage: `Page '${pageName}' not found`,
          errorType: 'PAGE_NOT_FOUND',
        }
      }

      // 2. Execute DataService by name using the page ID
      return await this.executeByName<T>({
        tabModuleId: page.id,
        dataServiceName,
        parameters,
        withoutCache,
        executeFromGlobal,
      }, token)

    } catch (error: any) {
      return {
        data: [],
        success: false,
        errorMessage: error.message,
        errorType: error.code,
      }
    }
  }
}
