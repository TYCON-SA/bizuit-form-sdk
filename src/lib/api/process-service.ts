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
  IBizuitFile,
} from '../types'
import { xmlToJson, jsonToXml } from '../utils/xml-parser'
import { parseXsdToTemplate } from '../utils/xsd-parser'
import { XmlParameter } from '../models/xml-parameter'

export class BizuitProcessService {
  private client: BizuitHttpClient
  private apiUrl: string

  constructor(config: IBizuitConfig) {
    this.client = new BizuitHttpClient(config)
    this.apiUrl = config.apiUrl
  }

  /**
   * Initialize process - Get parameters for new or existing instance
   * Uses the Dashboard API endpoint: /eventmanager/workflowDefinition/parameters/{processName}
   *
   * This method fetches the process parameter schema and transforms it to IProcessData format.
   * For existing instances, use getInstanceData() to get parameter values.
   */
  async initialize(params: IInitializeParams): Promise<IProcessData> {
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

    // Use the correct Dashboard API endpoint for getting process parameters
    const url = `${this.apiUrl}/eventmanager/workflowDefinition/parameters/${encodeURIComponent(params.processName)}?version=${encodeURIComponent(params.version || '')}`

    const response = await this.client.get<any>(url, { headers })

    // Handle different API response formats:
    // - Direct array: [{ name, parameterType, ... }]
    // - Object with parameters property: { parameters: [...] }
    // - Object with other structure: extract array from known properties
    let rawParameters: any[] = []

    if (Array.isArray(response)) {
      rawParameters = response
    } else if (response && typeof response === 'object') {
      // Try common property names that might contain the parameters array
      if (Array.isArray(response.parameters)) {
        rawParameters = response.parameters
      } else if (Array.isArray(response.Parameters)) {
        rawParameters = response.Parameters
      } else if (Array.isArray(response.data)) {
        rawParameters = response.data
      } else {
        console.warn('[BizuitSDK] Unexpected response format from parameters endpoint:', response)
      }
    }

    // Transform to IProcessData format expected by the SDK
    const processData: IProcessData = {
      processName: params.processName,
      version: params.version || '',
      instanceId: params.instanceId,
      parameters: rawParameters.map(p => ({
        name: p.name,
        value: null, // Start forms have empty values
        type: this.mapParameterType(p.parameterType),
        direction: this.mapParameterDirection(p.parameterDirection),
        schema: p.schema,
        isVariable: p.isVariable,
        isSystemParameter: p.isSystemParameter,
        parameterType: p.parameterType
      }))
    }

    return processData
  }

  /**
   * Map numeric parameter type to string
   */
  private mapParameterType(type: number): 'SingleValue' | 'Xml' {
    return type === 2 ? 'Xml' : 'SingleValue'
  }

  /**
   * Map numeric parameter direction to string
   */
  private mapParameterDirection(direction: number): 'In' | 'Out' | 'InOut' {
    switch (direction) {
      case 2: return 'Out'
      case 3: return 'InOut'
      default: return 'In'
    }
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
    files?: File[] | IBizuitFile[],
    token?: string
  ): Promise<IProcessResult> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Use standard Authorization header with token
    if (token) {
      headers['Authorization'] = token
    }

    // Process parameters: handle XmlParameter instances and object-to-XML conversion
    const processedParameters = (params.parameters || []).map(param => {
      // Check if parameter is an XmlParameter instance
      if (XmlParameter.isXmlParameter(param)) {
        // Convert XmlParameter to IParameter and then to XML
        const iParam = (param as XmlParameter).toParameter()
        const xmlString = jsonToXml(iParam.value)
        console.log(`✅ Auto-converted XmlParameter "${iParam.name}" to XML`)
        return {
          ...iParam,
          value: xmlString
        }
      }

      // Existing behavior: convert plain objects to XML
      if (param.type === 'Xml' && typeof param.value === 'object' && param.value !== null) {
        // Auto-convert JavaScript object to XML string
        const xmlString = jsonToXml(param.value)
        console.log(`✅ Auto-converted parameter "${param.name}" from object to XML`)
        return {
          ...param,
          value: xmlString
        }
      }
      return param
    })

    // Build the payload exactly as the API expects
    const payload: any = {
      eventName: params.processName,
      parameters: processedParameters,
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

    // Determine which files to use: from params or from files parameter
    const filesToUpload = params.files || files

    let result: IProcessResult

    // Use multipart/form-data when files are present
    if (filesToUpload && filesToUpload.length > 0) {
      // Dashboard API: POST /api/instances/RaiseEvent with multipart
      result = await this.client.postMultipart<IProcessResult>(
        `${this.apiUrl}/instances/RaiseEvent`,
        payload,
        filesToUpload,
        { headers: { 'BZ-AUTH-TOKEN': token } }
      )
    } else {
      // Standard JSON request (existing behavior - no changes)
      result = await this.client.post<IProcessResult>(
        `${this.apiUrl}/instances`,
        payload,
        { headers }
      )
    }

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
    files?: File[] | IBizuitFile[],
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

    // Process parameters: handle XmlParameter instances and object-to-XML conversion
    const processedParameters = (params.parameters || []).map(param => {
      // Check if parameter is an XmlParameter instance
      if (XmlParameter.isXmlParameter(param)) {
        // Convert XmlParameter to IParameter and then to XML
        const iParam = (param as XmlParameter).toParameter()
        const xmlString = jsonToXml(iParam.value)
        console.log(`✅ Auto-converted XmlParameter "${iParam.name}" to XML`)
        return {
          ...iParam,
          value: xmlString
        }
      }

      // Existing behavior: convert plain objects to XML
      if (param.type === 'Xml' && typeof param.value === 'object' && param.value !== null) {
        // Auto-convert JavaScript object to XML string
        const xmlString = jsonToXml(param.value)
        console.log(`✅ Auto-converted parameter "${param.name}" from object to XML`)
        return {
          ...param,
          value: xmlString
        }
      }
      return param
    })

    const payload: any = {
      eventName: params.processName,
      parameters: processedParameters,
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

    // Determine which files to use: from params or from files parameter
    const filesToUpload = params.files || files

    let result: IProcessResult

    // Use multipart/form-data when files are present
    if (filesToUpload && filesToUpload.length > 0) {
      // Dashboard API: POST /api/instances/RaiseEvent with multipart (continues also use POST)
      result = await this.client.postMultipart<IProcessResult>(
        `${this.apiUrl}/instances/RaiseEvent`,
        payload,
        filesToUpload,
        { headers: { 'BZ-AUTH-TOKEN': token } }
      )
    } else {
      // Standard JSON request (existing behavior - no changes)
      result = await this.client.put<IProcessResult>(
        `${this.apiUrl}/instances`,
        payload,
        { headers }
      )
    }

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
   * Get process parameters as XmlParameter objects (NEW in v2.1.0)
   *
   * Returns parameters wrapped in XmlParameter instances, allowing direct property access:
   *
   * @example
   * ```typescript
   * const params = await sdk.process.getParametersAsObjects({
   *   processName: 'MyProcess',
   *   token: authToken
   * })
   *
   * // Direct property modification via Proxy
   * params.pSampleXml.nodo1 = 'a'
   * params.pSampleXml.productos[0].codigo = 'ABC'
   *
   * // Send directly to process
   * await sdk.process.start({
   *   processName: 'MyProcess',
   *   parameters: [params.pSampleXml]  // SDK auto-converts
   * }, [], token)
   * ```
   *
   * @param params - Initialize parameters (processName, version, etc.)
   * @returns Object with parameter names as keys, XmlParameter instances as values
   */
  async getParametersAsObjects(
    params: IInitializeParams
  ): Promise<Record<string, XmlParameter>> {
    // Get process definition with parameters
    const processData = await this.initialize(params)

    const result: Record<string, XmlParameter> = {}

    // Process XML parameters only
    if (processData.parameters && Array.isArray(processData.parameters)) {
      processData.parameters.forEach((param: any) => {
        // Only process XML/Complex parameters (type 2)
        if (param.parameterType === 2 || param.parameterType === 'Xml') {
          const paramName = param.name

          // Determine direction
          let direction: 'In' | 'Out' | 'InOut' = 'In'
          if (param.parameterDirection === 2 || param.parameterDirection === 'Out') {
            direction = 'Out'
          } else if (param.parameterDirection === 3 || param.parameterDirection === 'InOut') {
            direction = 'InOut'
          }

          // Try to parse XSD schema if available
          let template: any = {}

          if (param.schema && typeof param.schema === 'string') {
            try {
              template = parseXsdToTemplate(param.schema)
              console.log(`✅ Generated template from XSD for parameter: ${paramName}`)
            } catch (error) {
              console.warn(`⚠️ Failed to parse XSD for ${paramName}, using empty template:`, error)
              template = {}
            }
          } else {
            console.log(`ℹ️ No XSD schema for parameter ${paramName}, using empty template`)
            template = {}
          }

          // Create XmlParameter instance
          const xmlParam = new XmlParameter(paramName, template, direction)
          result[paramName] = xmlParam
        }
      })
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

  /**
   * Get instance documents
   * Returns list of documents attached to an instance
   *
   * Example:
   * GET /api/instances/{instanceId}/documents
   * BZ-AUTH-TOKEN: token
   *
   * @param instanceId - Instance ID
   * @param token - Authentication token
   * @returns Array of document metadata with ID, FileName, Size, Version, etc.
   */
  async getDocuments(instanceId: string, token?: string): Promise<any[]> {
    const headers: Record<string, string> = {}

    if (token) {
      headers['BZ-AUTH-TOKEN'] = token
    }

    try {
      const response = await this.client.get<any[]>(
        `${this.apiUrl}/instances/${instanceId}/documents`,
        { headers }
      )
      return response || []
    } catch (error) {
      console.error('Error fetching instance documents:', error)
      return []
    }
  }

  /**
   * Download a document from an instance
   * Returns the document as a Blob
   *
   * Example:
   * GET /api/instances/documents/{documentId}/{version}
   * BZ-AUTH-TOKEN: token
   * Response: Binary data (Blob)
   *
   * @param documentId - Document ID
   * @param version - Document version
   * @param token - Authentication token
   * @returns Document blob
   */
  async downloadDocument(
    documentId: number,
    version: number,
    token?: string
  ): Promise<Blob> {
    const headers: Record<string, string> = {}

    if (token) {
      headers['BZ-AUTH-TOKEN'] = token
    }

    const response = await this.client.get<Blob>(
      `${this.apiUrl}/instances/documents/${documentId}/${version}`,
      {
        headers,
        responseType: 'blob'
      }
    )

    return response
  }
}
