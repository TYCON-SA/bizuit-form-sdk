/**
 * Bizuit Process Service
 * Handles process initialization, start and continue operations
 * Updated to match Bizuit API specification exactly
 */

import { BizuitHttpClient } from './http-client'
import type {
  IBizuitConfig,
  IInitializeParams,
  IProcessData,
  IStartProcessParams,
  IProcessResult,
} from '../types'
import { xmlToJson } from '../utils/xml-parser'

export class BizuitProcessService {
  private client: BizuitHttpClient
  private apiUrl: string

  constructor(config: IBizuitConfig) {
    this.client = new BizuitHttpClient(config)
    this.apiUrl = config.apiUrl
  }

  /**
   * Initialize process - Get parameters for new or existing instance
   * Uses standard Authorization header as per API specification
   */
  async initialize(params: IInitializeParams): Promise<IProcessData> {
    const queryParams = new URLSearchParams()
    queryParams.append('processName', params.processName)

    if (params.activityName) queryParams.append('activityName', params.activityName)
    if (params.version) queryParams.append('version', params.version)
    if (params.instanceId) queryParams.append('instanceId', params.instanceId)

    const headers: Record<string, string> = {}

    // Use standard Authorization header with token
    if (params.token) {
      headers['Authorization'] = params.token
    }

    if (params.sessionToken) {
      headers['BZ-SESSION-TOKEN'] = params.sessionToken
    }

    if (params.userName) {
      headers['BZ-USER-NAME'] = params.userName
    }

    if (params.formId) {
      headers['BZ-FORM'] = String(params.formId)
    }

    if (params.formDraftId) {
      headers['BZ-DRAFT-FORM'] = String(params.formDraftId)
    }

    if (params.processName) {
      headers['BZ-PROCESS-NAME'] = params.processName
    }

    if (params.instanceId) {
      headers['BZ-INSTANCEID'] = params.instanceId
    }

    if (params.childProcessName) {
      headers['BZ-CHILD-PROCESS-NAME'] = params.childProcessName
    }

    const processData = await this.client.get<IProcessData>(
      `${this.apiUrl}/Process/Initialize?${queryParams.toString()}`,
      { headers }
    )

    return processData
  }

  /**
   * Start process - Execute process or start new instance
   * Sends JSON directly as per Bizuit API specification
   *
   * Example from curl:
   * POST /api/instances
   * Authorization: Basic TOKEN
   * Content-Type: application/json
   * {
   *   "eventName": "DemoFlow",
   *   "parameters": [
   *     {
   *       "name": "pData",
   *       "value": "A",
   *       "type": "SingleValue",
   *       "direction": "In"
   *     }
   *   ]
   * }
   */
  async start(
    params: IStartProcessParams,
    files?: File[],
    token?: string
  ): Promise<IProcessResult> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Use standard Authorization header with token
    if (token) {
      headers['Authorization'] = token
    }

    // Build the payload exactly as the API expects
    const payload: any = {
      eventName: params.processName,
      parameters: params.parameters || [],
    }

    // Add optional fields only if provided
    if (params.instanceId) {
      payload.instanceId = params.instanceId
    }

    if (params.processVersion) {
      payload.eventVersion = params.processVersion
    }

    if (params.closeOnSuccess !== undefined) {
      payload.closeOnSuccess = params.closeOnSuccess
    }

    if (params.deletedDocuments && params.deletedDocuments.length > 0) {
      payload.deletedDocuments = params.deletedDocuments
    }

    // Note: File upload support would require multipart/form-data
    // For now, we're implementing JSON-only as per the curl examples
    if (files && files.length > 0) {
      console.warn('File upload in start is not yet implemented in JSON mode')
    }

    const result = await this.client.post<IProcessResult>(
      `${this.apiUrl}/instances`,
      payload,
      { headers }
    )

    // Automatically parse XML parameters to JSON
    // Note: API returns tyconParameters, but we map it to parameters
    const parametersArray = (result as any).tyconParameters || result.parameters;
    if (parametersArray && Array.isArray(parametersArray)) {
      parametersArray.forEach((param: any) => {
        // Check if parameter type is 2 or "Xml" (XML/Complex) and has a value
        if ((param.parameterType === 2 || param.parameterType === 'Xml') && param.value) {
          try {
            const parsedJson = xmlToJson(param.value)
            if (parsedJson !== null) {
              // Replace XML string with parsed JSON object
              param.value = parsedJson as any
              // Change parameterType to indicate it's now JSON
              param.parameterType = 'Json' as any
              console.log(`✅ Auto-parsed XML parameter: ${param.name}`)
            } else {
              console.warn(`⚠️ Failed to parse XML parameter: ${param.name}, keeping original XML`)
            }
          } catch (error) {
            console.warn(`⚠️ Error parsing XML parameter ${param.name}:`, error)
            // Keep original XML value on error
          }
        }
      })

      // Map tyconParameters to parameters for compatibility
      if ((result as any).tyconParameters) {
        result.parameters = parametersArray;
      }
    }

    return result
  }

  /**
   * Get process parameters schema
   * Useful for dynamic form generation
   *
   * Example:
   * GET /api/eventmanager/workflowDefinition/parameters/{processName}?version={version}
   * Authorization: Basic TOKEN
   *
   * Returns array of parameters with:
   * - parameterType: 1 (SingleValue) or 2 (Xml)
   * - parameterDirection: 1 (In), 2 (Out), 3 (Optional)
   * - name, type, schema, isSystemParameter, isVariable
   */
  async getParameters(
    processName: string,
    version?: string,
    token?: string
  ): Promise<any[]> {
    const headers: Record<string, string> = {}

    if (token) {
      headers['Authorization'] = token
    }

    const queryParams = new URLSearchParams()
    // Always add version parameter, even if empty (API requires it)
    queryParams.append('version', version || '')

    const url = `${this.apiUrl}/eventmanager/workflowDefinition/parameters/${processName}?${queryParams.toString()}`

    const parameters = await this.client.get<any[]>(url, { headers })

    return parameters
  }

  /**
   * Get instance data
   * Uses standard Authorization header
   *
   * Example from curl:
   * GET /api/instances?instanceId=8d2d0e04-ea83-48f2-953d-ff858581e3df
   * Authorization: Basic TOKEN
   */
  async getInstanceData(
    instanceId: string,
    token?: string
  ): Promise<IProcessData> {
    const headers: Record<string, string> = {}

    if (token) {
      headers['Authorization'] = token
    }

    const data = await this.client.get<IProcessData>(
      `${this.apiUrl}/instances?instanceId=${instanceId}`,
      { headers }
    )

    return data
  }

  /**
   * Acquire pessimistic lock on instance
   * Prevents concurrent editing
   */
  async acquireLock(params: {
    instanceId: string
    token: string
  }): Promise<{ sessionToken: string; processData: IProcessData }> {
    const headers: Record<string, string> = {
      'Authorization': params.token,
    }

    const result = await this.client.post<{ sessionToken: string; processData: IProcessData }>(
      `${this.apiUrl}/ProcessInstance/AcquireLock`,
      { instanceId: params.instanceId },
      { headers }
    )

    return result
  }

  /**
   * Release pessimistic lock on instance
   */
  async releaseLock(params: {
    instanceId: string
    sessionToken: string
  }): Promise<void> {
    const headers: Record<string, string> = {
      'BZ-SESSION-TOKEN': params.sessionToken,
    }

    await this.client.post<void>(
      `${this.apiUrl}/ProcessInstance/ReleaseLock`,
      { instanceId: params.instanceId },
      { headers }
    )
  }

  /**
   * Continue instance with updated parameters
   * Uses PUT method instead of POST
   *
   * Example from curl:
   * PUT /api/instances
   * Authorization: Basic TOKEN
   * Content-Type: application/json
   * {
   *   "eventName": "DemoFlow",
   *   "parameters": [...],
   *   "instanceId": "e3137f94-0ab5-4ae7-b256-10806fe92958"
   * }
   */
  async continue(
    params: IStartProcessParams,
    files?: File[],
    token?: string
  ): Promise<IProcessResult> {
    if (!params.instanceId) {
      throw new Error('instanceId is required for continue')
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = token
    }

    const payload: any = {
      eventName: params.processName,
      parameters: params.parameters || [],
      instanceId: params.instanceId,
    }

    if (params.processVersion) {
      payload.eventVersion = params.processVersion
    }

    if (params.closeOnSuccess !== undefined) {
      payload.closeOnSuccess = params.closeOnSuccess
    }

    if (params.deletedDocuments && params.deletedDocuments.length > 0) {
      payload.deletedDocuments = params.deletedDocuments
    }

    if (files && files.length > 0) {
      console.warn('File upload in continue is not yet implemented in JSON mode')
    }

    const result = await this.client.put<IProcessResult>(
      `${this.apiUrl}/instances`,
      payload,
      { headers }
    )

    // Automatically parse XML parameters to JSON
    // Note: API returns tyconParameters, but we map it to parameters
    const parametersArray = (result as any).tyconParameters || result.parameters;
    if (parametersArray && Array.isArray(parametersArray)) {
      parametersArray.forEach((param: any) => {
        // Check if parameter type is 2 or "Xml" (XML/Complex) and has a value
        if ((param.parameterType === 2 || param.parameterType === 'Xml') && param.value) {
          try {
            const parsedJson = xmlToJson(param.value)
            if (parsedJson !== null) {
              // Replace XML string with parsed JSON object
              param.value = parsedJson as any
              // Change parameterType to indicate it's now JSON
              param.parameterType = 'Json' as any
              console.log(`✅ Auto-parsed XML parameter: ${param.name}`)
            } else {
              console.warn(`⚠️ Failed to parse XML parameter: ${param.name}, keeping original XML`)
            }
          } catch (error) {
            console.warn(`⚠️ Error parsing XML parameter ${param.name}:`, error)
            // Keep original XML value on error
          }
        }
      })

      // Map tyconParameters to parameters for compatibility
      if ((result as any).tyconParameters) {
        result.parameters = parametersArray;
      }
    }

    return result
  }

  /**
   * Get Bizuit configuration settings for an organization
   * @param organizationId - Organization identifier
   * @param token - Authentication token
   * @returns Configuration settings object
   */
  async getConfigurationSettings(
    organizationId: string,
    token?: string
  ): Promise<Record<string, any>> {
    const headers: Record<string, string> = {}

    if (token) {
      headers['Authorization'] = token
    }

    const result = await this.client.get<Record<string, any>>(
      `${this.apiUrl}/bpmn/configuration-settings?organizationId=${organizationId}`,
      { headers }
    )

    return result
  }
}
