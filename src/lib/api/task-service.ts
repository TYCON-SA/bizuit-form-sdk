/**
 * BizuitTaskService
 *
 * Service for managing user task lists based on Bizuit BPM permissions.
 * Provides methods to:
 * - Get all processes available to user
 * - Get specific process details
 * - Search for task instances with pagination
 */

import { BizuitHttpClient } from './http-client'
import type { IBizuitConfig } from '../types'
import type {
  IProcessMetadata,
  ITasksSearchRequest,
  ITasksSearchResponse,
} from '../types/tasks.types'

export class BizuitTaskService {
  private client: BizuitHttpClient
  private apiUrl: string

  constructor(config: IBizuitConfig) {
    this.client = new BizuitHttpClient(config)
    this.apiUrl = config.apiUrl
  }

  /**
   * Get all processes available to the authenticated user
   *
   * @param token - Authorization token (Basic or Bearer)
   * @returns Array of process metadata with activities
   *
   * @example
   * ```typescript
   * const sdk = new BizuitSDK({ apiUrl: 'https://api.example.com' })
   * const processes = await sdk.tasks.getProcesses(authToken)
   *
   * processes.forEach(process => {
   *   console.log(process.workflowDisplayName)
   *   console.log('Start points:', process.activities.filter(a => a.isStartPoint))
   *   console.log('Activities:', process.activities.filter(a => !a.isStartPoint))
   * })
   * ```
   */
  async getProcesses(token: string): Promise<IProcessMetadata[]> {
    const headers: Record<string, string> = {
      Authorization: token,
    }

    const result = await this.client.get<IProcessMetadata[]>(
      `${this.apiUrl}/Processes?isMobile=false`,
      { headers }
    )

    return result
  }

  /**
   * Get detailed information for a specific process
   *
   * @param processName - Process name (eventName)
   * @param token - Authorization token (Basic or Bearer)
   * @returns Single process metadata with detailed activity information
   *
   * @example
   * ```typescript
   * const sdk = new BizuitSDK({ apiUrl: 'https://api.example.com' })
   * const processDetails = await sdk.tasks.getProcessDetails('TestWix', authToken)
   *
   * console.log('Process:', processDetails.workflowDisplayName)
   * console.log('Activities:', processDetails.activities.length)
   *
   * const startPoint = processDetails.activities.find(a => a.isStartPoint)
   * if (startPoint) {
   *   console.log('Start point:', startPoint.displayName)
   *   console.log('Form ID:', startPoint.formId)
   * }
   * ```
   */
  async getProcessDetails(
    processName: string,
    token: string
  ): Promise<IProcessMetadata | null> {
    const headers: Record<string, string> = {
      Authorization: token,
    }

    const result = await this.client.get<IProcessMetadata[]>(
      `${this.apiUrl}/Processes?eventName=${encodeURIComponent(processName)}&isMobile=false`,
      { headers }
    )

    // API returns array with single item when querying by eventName
    return result && result.length > 0 ? result[0] : null
  }

  /**
   * Search for task instances with optional pagination
   *
   * @param request - Search parameters including process, activity, and pagination
   * @param token - Authorization token (Basic or Bearer)
   * @returns Search response with events, instances, and total count
   *
   * @example
   * ```typescript
   * const sdk = new BizuitSDK({ apiUrl: 'https://api.example.com' })
   *
   * // Basic search
   * const result = await sdk.tasks.searchTasks({
   *   ProcessName: 'TestWix',
   *   ActivityName: 'userInteractionActivity1'
   * }, authToken)
   *
   * console.log('Total instances:', result.instancesTotalCount[0]?.count)
   * console.log('Instances:', result.instances.length)
   *
   * // Search with pagination
   * const pagedResult = await sdk.tasks.searchTasks({
   *   ProcessName: 'TestWix',
   *   ActivityName: 'userInteractionActivity1',
   *   pageNumber: 1,
   *   pageSize: 20,
   *   DateFrom: '2025-01-01',
   *   DateTo: '2025-12-31',
   *   LockedState: -1  // -1 = all, 0 = unlocked, 1 = locked
   * }, authToken)
   *
   * // Access instance details
   * pagedResult.instances.forEach(instance => {
   *   console.log('Instance ID:', instance.instanceId)
   *   console.log('Status:', instance.locked ? 'Locked' : 'Available')
   *   console.log('Locked by:', instance.lockedBy)
   *
   *   // Access dynamic columns with user-friendly names (automatically flattened by SDK)
   *   console.log('Cliente:', instance['CLIENTE'])
   *   console.log('Descripción:', instance['Descripción'])
   *   console.log('Versión:', instance['Versión'])
   *   console.log('Usuario:', instance['Último ejecutado por'])
   *   console.log('Fecha:', instance['Fecha Ejecución'])
   *   console.log('Tiempo:', instance['Tiempo Transcurrido'])
   * })
   * ```
   */
  async searchTasks(
    request: ITasksSearchRequest,
    token: string
  ): Promise<ITasksSearchResponse> {
    const headers: Record<string, string> = {
      Authorization: token,
    }

    // Add pagination headers if provided
    if (request.pageNumber !== undefined) {
      headers['bz-page'] = String(request.pageNumber)
    }
    if (request.pageSize !== undefined) {
      headers['bz-page-size'] = String(request.pageSize)
    }

    // Build request body (exclude pagination params)
    const { pageNumber, pageSize, ...bodyParams } = request

    // Set defaults for required fields if not provided
    const requestBody = {
      DateFrom: '1900-01-01',
      DateTo: '2100-01-01',
      LockedState: -1,
      SerializedFilters: '',
      IncludeWarnings: true,
      ChildProcessName: '',
      IsMobile: false,
      Parameters: [],
      ...bodyParams,
    }

    const result = await this.client.post<ITasksSearchResponse>(
      `${this.apiUrl}/Instances/Search`,
      requestBody,
      { headers }
    )

    // Transform instances to flatten columnDefinitionValues
    return this.transformSearchResponse(result)
  }

  /**
   * Transform search response to flatten column definition values
   * Converts columnDefinitionValues array into direct properties on the instance
   * using headerText as property names for user-friendly access
   * and removes the original array for a completely flat structure
   *
   * @private
   */
  private transformSearchResponse(response: ITasksSearchResponse): ITasksSearchResponse {
    // Build a map of columnName -> headerText from events metadata
    const columnHeaderMap = new Map<string, string>()

    response.events.forEach((event) => {
      event.activities.forEach((activity) => {
        activity.columnsDefinitions.forEach((colDef) => {
          columnHeaderMap.set(colDef.name, colDef.headerText)
        })
      })
    })

    return {
      ...response,
      instances: response.instances.map((instance) => {
        // Create flattened object with all dynamic columns as direct properties
        const flatInstance: any = { ...instance }

        // Add each column as a direct property using headerText as key
        instance.columnDefinitionValues.forEach((col) => {
          const headerText = columnHeaderMap.get(col.columnName) || col.columnName
          flatInstance[headerText] = col.value
        })

        // Remove redundant properties
        delete flatInstance.columnDefinitionValues
        delete flatInstance.eventName
        delete flatInstance.activityName
        delete flatInstance.instanceDescription

        return flatInstance
      }),
    }
  }

  /**
   * Get task count for a specific process and activity
   *
   * @param processName - Process name
   * @param activityName - Activity name
   * @param token - Authorization token
   * @returns Total count of instances
   *
   * @example
   * ```typescript
   * const count = await sdk.tasks.getTaskCount('TestWix', 'userInteractionActivity1', token)
   * console.log(`Total tasks: ${count}`)
   * ```
   */
  async getTaskCount(
    processName: string,
    activityName: string,
    token: string
  ): Promise<number> {
    const result = await this.searchTasks(
      {
        ProcessName: processName,
        ActivityName: activityName,
        pageSize: 1, // Minimal page size to get count only
      },
      token
    )

    const countData = result.instancesTotalCount.find(
      (item) => item.eventName === processName
    )

    return countData ? countData.count : 0
  }

  /**
   * Get all start points across all processes
   *
   * @param token - Authorization token
   * @returns Array of activities that are start points
   *
   * @example
   * ```typescript
   * const startPoints = await sdk.tasks.getStartPoints(token)
   *
   * startPoints.forEach(sp => {
   *   console.log('Process:', sp.processName)
   *   console.log('Start point:', sp.displayName)
   *   console.log('Form ID:', sp.formId)
   * })
   * ```
   */
  async getStartPoints(token: string) {
    const processes = await this.getProcesses(token)

    const startPoints = processes.flatMap((process) =>
      process.activities
        .filter((activity) => activity.isStartPoint)
        .map((activity) => ({
          processName: process.name,
          processDisplayName: process.workflowDisplayName,
          ...activity,
        }))
    )

    return startPoints
  }

  /**
   * Get all activities (non-start points) across all processes
   *
   * @param token - Authorization token
   * @returns Array of activities that are not start points
   *
   * @example
   * ```typescript
   * const activities = await sdk.tasks.getActivities(token)
   *
   * activities.forEach(activity => {
   *   console.log('Process:', activity.processName)
   *   console.log('Activity:', activity.displayName)
   * })
   * ```
   */
  async getActivities(token: string) {
    const processes = await this.getProcesses(token)

    const activities = processes.flatMap((process) =>
      process.activities
        .filter((activity) => !activity.isStartPoint)
        .map((activity) => ({
          processName: process.name,
          processDisplayName: process.workflowDisplayName,
          ...activity,
        }))
    )

    return activities
  }
}
