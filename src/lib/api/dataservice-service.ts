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
}
