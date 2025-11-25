/**
 * Form utilities for converting form data to Bizuit API format
 */

import type { IParameter } from '../types'

/**
 * Bizuit Process Parameter from API
 * Structure returned by getProcessParameters endpoint
 */
export interface IBizuitProcessParameter {
  name: string
  parameterType: number // 1 = SingleValue, 2 = Xml
  parameterDirection: number // 1 = In, 2 = Out, 3 = Optional
  type: string // 'string', 'int', 'bool', etc.
  schema: string // XSD schema
  value: string | null
  isSystemParameter: boolean
  isVariable: boolean
}

/**
 * Filters process parameters to get only those that should be displayed in the START PROCESS form
 * Excludes system parameters, variables, and output-only parameters
 *
 * @param parameters - Array of process parameters from getProcessParameters
 * @returns Filtered array of parameters for START process form display
 *
 * @example
 * ```typescript
 * const allParams = await sdk.process.getProcessParameters('MyProcess', '', token)
 * const formParams = filterFormParameters(allParams)
 * // Returns only input (direction=1) and optional (direction=3) parameters
 * // that are not system parameters or variables
 * ```
 */
export function filterFormParameters(
  parameters: IBizuitProcessParameter[]
): IBizuitProcessParameter[] {
  return parameters.filter((param) => {
    // Exclude system parameters and variables
    if (param.isSystemParameter || param.isVariable) {
      return false
    }

    // Include only Input (1) and Optional (3) parameters
    // Exclude Output (2) parameters
    return param.parameterDirection === 1 || param.parameterDirection === 3
  })
}

/**
 * Filters process parameters to get only those that should be displayed in the CONTINUE PROCESS form
 * Includes Input, Optional, AND Variables (different from filterFormParameters)
 * Excludes only system parameters and output-only parameters
 *
 * @param parameters - Array of process parameters from getProcessParameters
 * @returns Filtered array of parameters for CONTINUE process form display
 *
 * @example
 * ```typescript
 * const allParams = await sdk.process.getProcessParameters('MyProcess', '', token)
 * const formParams = filterContinueParameters(allParams)
 * // Returns input (direction=1), optional (direction=3) parameters,
 * // AND variables (isVariable=true) that are not system parameters
 * ```
 */
export function filterContinueParameters(
  parameters: IBizuitProcessParameter[]
): IBizuitProcessParameter[] {
  return parameters.filter((param) => {
    // Exclude system parameters
    if (param.isSystemParameter) {
      return false
    }

    // Include Variables (this is the main difference from filterFormParameters)
    if (param.isVariable) {
      return true
    }

    // Include Input (1) and Optional (3) parameters
    // Exclude Output-only (2) parameters
    return param.parameterDirection === 1 || param.parameterDirection === 3
  })
}

/**
 * Checks if a parameter is required or optional
 *
 * @param param - Process parameter
 * @returns true if parameter is required (direction=1), false if optional (direction=3)
 */
export function isParameterRequired(param: IBizuitProcessParameter): boolean {
  return param.parameterDirection === 1
}

/**
 * Gets a human-readable label for parameter direction
 *
 * @param direction - Parameter direction number
 * @returns Human-readable label
 */
export function getParameterDirectionLabel(direction: number): string {
  switch (direction) {
    case 1:
      return 'Input'
    case 2:
      return 'Output'
    case 3:
      return 'Optional'
    default:
      return 'Unknown'
  }
}

/**
 * Gets a human-readable label for parameter type
 *
 * @param parameterType - Parameter type number
 * @returns Human-readable label
 */
export function getParameterTypeLabel(parameterType: number): string {
  switch (parameterType) {
    case 1:
      return 'SingleValue'
    case 2:
      return 'Xml'
    default:
      return 'Unknown'
  }
}

/**
 * Converts form data to IParameter[] format expected by Bizuit API
 *
 * @param formData - Object with form field values
 * @returns Array of IParameter objects
 *
 * @example
 * ```typescript
 * const formData = {
 *   priority: 'high',
 *   categories: ['sales', 'support'],
 *   startDate: new Date(),
 *   budget: 75,
 *   description: 'Process description',
 *   files: [file1, file2]
 * }
 *
 * const parameters = formDataToParameters(formData)
 * // Returns:
 * // [
 * //   { name: 'priority', value: 'high', type: 'SingleValue', direction: 'In' },
 * //   { name: 'categories', value: '["sales","support"]', type: 'SingleValue', direction: 'In' },
 * //   ...
 * // ]
 * ```
 */
export function formDataToParameters(formData: Record<string, any>): IParameter[] {
  const parameters: IParameter[] = []

  for (const [key, value] of Object.entries(formData)) {
    // Skip undefined, null, or empty values
    if (value === undefined || value === null || value === '') {
      continue
    }

    // Skip file objects - files are handled separately in the SDK
    if (value instanceof File || (Array.isArray(value) && value.length > 0 && value[0] instanceof File)) {
      continue
    }

    // Convert value to string based on type
    let stringValue: string
    let paramType: 'SingleValue' | 'Xml' | 'ComplexObject' = 'SingleValue'

    if (Array.isArray(value)) {
      // Array values: convert to JSON string
      stringValue = JSON.stringify(value)
    } else if (value instanceof Date) {
      // Date values: convert to ISO string
      stringValue = value.toISOString()
    } else if (typeof value === 'object') {
      // Complex objects: convert to JSON string and mark as ComplexObject
      stringValue = JSON.stringify(value)
      paramType = 'ComplexObject'
    } else if (typeof value === 'boolean') {
      // Boolean values: convert to 'true' or 'false' string
      stringValue = value.toString()
    } else {
      // Primitive values: convert to string
      stringValue = String(value)
    }

    parameters.push({
      name: key,
      value: stringValue,
      type: paramType,
      direction: 'In',
    })
  }

  return parameters
}

/**
 * Converts IParameter[] back to form data object
 * Useful for loading existing instance data into the form
 *
 * @param parameters - Array of IParameter objects
 * @returns Object with form field values
 *
 * @example
 * ```typescript
 * const parameters = [
 *   { name: 'priority', value: 'high', type: 'SingleValue', direction: 'In' },
 *   { name: 'categories', value: '["sales","support"]', type: 'SingleValue', direction: 'In' }
 * ]
 *
 * const formData = parametersToFormData(parameters)
 * // Returns: { priority: 'high', categories: ['sales', 'support'] }
 * ```
 */
export function parametersToFormData(parameters: IParameter[]): Record<string, any> {
  const formData: Record<string, any> = {}

  for (const param of parameters) {
    if (!param.value) continue

    try {
      // Try to parse as JSON first (for arrays and objects)
      const parsedValue = JSON.parse(param.value)
      formData[param.name] = parsedValue
    } catch {
      // If parsing fails, it's a simple string value
      // Try to detect if it's a date
      if (isISODate(param.value)) {
        formData[param.name] = new Date(param.value)
      } else if (param.value === 'true' || param.value === 'false') {
        // Convert string boolean to actual boolean
        formData[param.name] = param.value === 'true'
      } else if (!isNaN(Number(param.value)) && param.value.trim() !== '') {
        // Convert numeric strings to numbers
        formData[param.name] = Number(param.value)
      } else {
        // Keep as string
        formData[param.name] = param.value
      }
    }
  }

  return formData
}

/**
 * Helper function to detect if a string is an ISO date
 */
function isISODate(str: string): boolean {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/
  return isoDateRegex.test(str)
}

/**
 * Creates a parameter with explicit type and direction
 * Useful for creating specific parameters that need custom configuration
 *
 * @param name - Parameter name
 * @param value - Parameter value
 * @param type - Parameter type (default: 'SingleValue')
 * @param direction - Parameter direction (default: 'In')
 * @returns IParameter object
 *
 * @example
 * ```typescript
 * const param = createParameter('userId', '12345', 'SingleValue', 'In')
 * ```
 */
export function createParameter(
  name: string,
  value: any,
  type: 'SingleValue' | 'Xml' | 'ComplexObject' = 'SingleValue',
  direction: 'In' | 'Out' | 'InOut' = 'In'
): IParameter {
  return {
    name,
    value: typeof value === 'string' ? value : JSON.stringify(value),
    type,
    direction,
  }
}

/**
 * Merges multiple parameter arrays, with later arrays overriding earlier ones
 * Useful for combining default parameters with form data
 *
 * @param parameterArrays - Arrays of parameters to merge
 * @returns Merged array of parameters
 *
 * @example
 * ```typescript
 * const defaults = [{ name: 'status', value: 'pending', type: 'SingleValue', direction: 'In' }]
 * const formParams = formDataToParameters(formData)
 * const merged = mergeParameters(defaults, formParams)
 * ```
 */
export function mergeParameters(...parameterArrays: IParameter[][]): IParameter[] {
  const paramMap = new Map<string, IParameter>()

  for (const params of parameterArrays) {
    for (const param of params) {
      paramMap.set(param.name, param)
    }
  }

  return Array.from(paramMap.values())
}

/**
 * Lock information returned by loadInstanceDataForContinue
 */
export interface ILockInfo {
  /** Whether the instance is currently locked by this user */
  isLocked: boolean
  /** Session token for unlocking (only present if isLocked is true) */
  sessionToken?: string
  /** User who has the lock (only present if locked by another user) */
  lockedBy?: string
  /** Reason for lock failure (only present if lock failed) */
  lockFailReason?: string
}

/**
 * Result type for loadInstanceDataForContinue helper
 */
export interface ILoadInstanceDataResult {
  instanceData: any
  processName: string
  eventName: string
  formParameters: IBizuitProcessParameter[]
  formData: Record<string, any>
  /** Lock information (only present if autoLock was requested) */
  lockInfo?: ILockInfo
}

/**
 * Maps Bizuit API parameter structure to IBizuitProcessParameter format
 * API returns different field names and structure
 */
function mapApiParameterToInternal(apiParam: any): IParameter {
  return {
    name: apiParam.name,
    value: typeof apiParam.value === 'object' ? JSON.stringify(apiParam.value) : String(apiParam.value || ''),
    type: apiParam.parameterType === 'SingleValue' ? 'SingleValue' : apiParam.parameterType === 'Xml' ? 'Xml' : 'SingleValue',
    direction: apiParam.parameterDirection === 'In' ? 'In' : apiParam.parameterDirection === 'Out' ? 'Out' : apiParam.parameterDirection === 'Optional' ? 'InOut' : 'In',
  }
}

/**
 * Converts API parameter structure to IBizuitProcessParameter
 * for form rendering
 */
function mapApiParameterToFormParameter(apiParam: any): IBizuitProcessParameter {
  // Map parameterDirection string to number
  let direction = 1 // Default In
  if (apiParam.parameterDirection === 'Out') direction = 2
  else if (apiParam.parameterDirection === 'Optional') direction = 3
  else if (apiParam.parameterDirection === 'In') direction = 1

  // Map parameterType
  let paramType = 1 // Default SingleValue
  if (apiParam.parameterType === 'Xml') paramType = 2

  return {
    name: apiParam.name,
    parameterType: paramType,
    parameterDirection: direction,
    type: guessTypeFromValue(apiParam.value),
    schema: '',
    value: typeof apiParam.value === 'object' ? JSON.stringify(apiParam.value) : String(apiParam.value || ''),
    isSystemParameter: apiParam.name === 'InstanceId' || apiParam.name === 'LoggedUser' || apiParam.name === 'ExceptionParameter',
    isVariable: false, // API doesn't distinguish, assume false for now
  }
}

/**
 * Guess data type from value for form rendering
 */
function guessTypeFromValue(value: any): string {
  if (value === null || value === undefined || value === '') return 'string'
  if (typeof value === 'boolean') return 'bool'
  if (typeof value === 'number') return 'int'
  if (typeof value === 'object') return 'string' // Will be JSON

  // Try to parse as number
  if (!isNaN(Number(value)) && value.toString().trim() !== '') return 'int'

  return 'string'
}

/**
 * Options for loadInstanceDataForContinue helper
 */
export interface ILoadInstanceDataOptions {
  /** Instance ID to load */
  instanceId: string
  /** Activity name (required if autoLock is true) */
  activityName?: string
  /** Process name (required if autoLock is true) */
  processName?: string
  /** Automatically acquire lock for editing (default: false) */
  autoLock?: boolean
  /** Lock operation type (default: 1 = Edit) */
  lockOperation?: number
}

/**
 * Helper function to load all necessary data for continuing a process instance
 * This encapsulates the business logic of:
 * 1. Getting instance data with parameters
 * 2. Converting API parameters to form-friendly format
 * 3. Filtering editable parameters (excludes Output-only and system params)
 * 4. Parsing existing parameter values into form data
 * 5. Optionally acquiring a pessimistic lock for editing
 *
 * @param sdk - Bizuit SDK instance with process and lock services
 * @param options - Configuration options
 * @param token - Authentication token
 * @returns Promise with all data needed to render continue form
 *
 * @example
 * ```typescript
 * // Load without lock (read-only)
 * const result = await loadInstanceDataForContinue(sdk, {
 *   instanceId: '123-456-789'
 * }, token)
 *
 * // Load with automatic lock (for editing)
 * const result = await loadInstanceDataForContinue(sdk, {
 *   instanceId: '123-456-789',
 *   activityName: 'ReviewTask',
 *   processName: 'ApprovalProcess',
 *   autoLock: true
 * }, token)
 *
 * // Check lock status
 * if (result.lockInfo?.isLocked) {
 *   console.log('Locked with session:', result.lockInfo.sessionToken)
 * }
 * ```
 */
export async function loadInstanceDataForContinue(
  sdk: any, // TODO: Type this properly as BizuitSDK
  options: string | ILoadInstanceDataOptions, // Support old API (string) and new API (options object)
  token: string
): Promise<ILoadInstanceDataResult> {
  // Handle backward compatibility: if options is a string, treat it as instanceId
  const opts: ILoadInstanceDataOptions = typeof options === 'string'
    ? { instanceId: options, autoLock: false }
    : options

  const { instanceId, activityName, processName, autoLock = false, lockOperation = 1 } = opts

  // 1. Get instance data
  const instanceData = await sdk.process.getInstanceData(instanceId, token)

  let formParameters: IBizuitProcessParameter[] = []
  let formData: Record<string, any> = {}
  let lockInfo: ILockInfo | undefined

  // 2. Parse parameters from API response
  // API structure: results.tyconParameters.tyconParameter[]
  const apiParameters = instanceData?.results?.tyconParameters?.tyconParameter

  if (apiParameters && Array.isArray(apiParameters)) {
    // Convert API structure to IBizuitProcessParameter[]
    const allParams = apiParameters.map(mapApiParameterToFormParameter)

    // Filter for continue form (excludes Output-only and system params)
    formParameters = allParams.filter(param => {
      // Exclude system parameters
      if (param.isSystemParameter) return false

      // Exclude Output-only (direction = 2)
      if (param.parameterDirection === 2) return false

      // Include Input (1), Optional (3), and Variables
      return true
    })

    // Convert API parameter structure to IParameter[] for form data
    const parameters = apiParameters.map(mapApiParameterToInternal)
    formData = parametersToFormData(parameters)
  }

  // 3. Optionally acquire lock for editing
  if (autoLock) {
    if (!activityName || !processName) {
      throw new Error('activityName and processName are required when autoLock is true')
    }

    try {
      // Try to acquire lock
      const lockResult = await sdk.lock.lock(
        {
          instanceId,
          activityName,
          processName,
          operation: lockOperation,
        },
        token
      )

      if (lockResult.available) {
        lockInfo = {
          isLocked: true,
          sessionToken: lockResult.sessionToken,
        }
      } else {
        lockInfo = {
          isLocked: false,
          lockedBy: lockResult.user,
          lockFailReason: lockResult.reason || 'Instance is locked by another user',
        }
      }
    } catch (err: any) {
      // Lock failed - provide error info but don't throw
      // This allows the app to decide how to handle lock failures
      lockInfo = {
        isLocked: false,
        lockFailReason: err.message || 'Failed to acquire lock',
      }
    }
  }

  return {
    instanceData,
    processName: processName || '', // Use provided processName if available
    eventName: '', // Must be provided by user separately
    formParameters,
    formData,
    lockInfo,
  }
}

/**
 * Release a lock acquired by loadInstanceDataForContinue
 *
 * This is a convenience helper that wraps sdk.lock.unlock().
 * Use this to release locks when canceling edits or after successful submit.
 *
 * @param sdk - Bizuit SDK instance with lock service
 * @param options - Lock release options
 * @param token - Authentication token
 * @returns Promise that resolves when lock is released
 *
 * @example
 * ```typescript
 * // After loading with lock
 * const result = await loadInstanceDataForContinue(sdk, {
 *   instanceId: '123',
 *   activityName: 'Task',
 *   processName: 'Process',
 *   autoLock: true
 * }, token)
 *
 * // ... user cancels or finishes editing ...
 *
 * // Release the lock
 * if (result.lockInfo?.sessionToken) {
 *   await releaseInstanceLock(sdk, {
 *     instanceId: '123',
 *     activityName: 'Task',
 *     sessionToken: result.lockInfo.sessionToken
 *   }, token)
 * }
 * ```
 */
export async function releaseInstanceLock(
  sdk: any,
  options: {
    instanceId: string
    activityName: string
    sessionToken: string
  },
  token: string
): Promise<void> {
  try {
    await sdk.lock.unlock(options, token)
  } catch (err: any) {
    // Silently fail - lock will expire eventually
    if (process.env.NODE_ENV === 'development') {
      console.warn('[releaseInstanceLock] Failed to release lock:', err.message)
    }
  }
}

/**
 * Processes a URL token and creates a mock login response
 * This is useful when Bizuit BPM passes a token via URL parameter
 *
 * @param token - The authentication token from URL
 * @param username - Optional username (defaults to 'bizuit-user')
 * @param displayName - Optional display name (defaults to 'Usuario Bizuit')
 * @param expirationHours - Token expiration in hours (defaults to 24)
 * @returns ILoginResponse object ready for auth context
 *
 * @example
 * ```typescript
 * import { processUrlToken } from '@bizuit/form-sdk'
 *
 * const urlToken = searchParams.get('token')
 * if (urlToken) {
 *   const loginResponse = processUrlToken(urlToken)
 *   setAuthData(loginResponse)
 * }
 * ```
 */
export function processUrlToken(
  token: string,
  username: string = 'bizuit-user',
  displayName: string = 'Usuario Bizuit',
  expirationHours: number = 24
): {
  Token: string
  User: {
    Username: string
    UserID: number
    DisplayName: string
  }
  ExpirationDate: string
} {
  return {
    Token: token,
    User: {
      Username: username,
      UserID: 0,
      DisplayName: displayName,
    },
    ExpirationDate: new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString(),
  }
}

/**
 * Parameter mapping configuration
 * Maps form fields to Bizuit parameters/variables with optional transformation
 */
export interface IParameterMapping {
  /** Name of the Bizuit parameter or variable */
  parameterName: string
  /** Whether this is a variable (true) or parameter (false). Default: false */
  isVariable?: boolean
  /** Optional function to transform the form value before sending */
  transform?: (value: any) => any
  /** Parameter type. Default: 'SingleValue' */
  type?: 'SingleValue' | 'Xml' | 'ComplexObject'
  /** Parameter direction. Default: 'In' */
  direction?: 'In' | 'Out' | 'InOut'
}

/**
 * Builds parameters array by selectively mapping form fields to Bizuit parameters/variables
 *
 * This function gives you complete control over which form fields are sent as parameters,
 * allowing you to:
 * - Map form field names to different parameter names
 * - Specify which fields are variables vs parameters
 * - Transform values before sending
 * - Send only specific fields instead of all form data
 *
 * @param mapping - Object mapping form field names to parameter configuration
 * @param formData - Form data object
 * @returns Array of IParameter objects ready for Bizuit API
 *
 * @example
 * ```typescript
 * // Map form fields to parameters and variables
 * const parameters = buildParameters({
 *   // Simple mapping: form field 'empleado' → parameter 'pEmpleado'
 *   'empleado': {
 *     parameterName: 'pEmpleado'
 *   },
 *
 *   // Map to different name with transformation
 *   'monto': {
 *     parameterName: 'pMonto',
 *     transform: (val) => parseFloat(val).toFixed(2)
 *   },
 *
 *   // Map to a variable (for continue process)
 *   'aprobado': {
 *     parameterName: 'vAprobado',
 *     isVariable: true
 *   },
 *
 *   // Complex object with custom type
 *   'detalles': {
 *     parameterName: 'pDetalles',
 *     type: 'ComplexObject'
 *   }
 * }, formData)
 *
 * // Only fields in mapping are included, all others are ignored
 * ```
 *
 * @example
 * ```typescript
 * // Continue process with selective fields
 * const parameters = buildParameters({
 *   // Only send these 2 fields, ignore all others
 *   'comentarios': { parameterName: 'pComentarios' },
 *   'estadoAprobacion': {
 *     parameterName: 'vEstado',
 *     isVariable: true
 *   }
 * }, formData)
 *
 * await sdk.process.raiseEvent({
 *   eventName: 'AprobacionVacaciones',
 *   instanceId: 'existing-instance-id',
 *   parameters
 * }, [], token)
 * ```
 */
export function buildParameters(
  mapping: Record<string, IParameterMapping>,
  formData: Record<string, any>
): IParameter[] {
  const parameters: IParameter[] = []

  // Iterate over the mapping (not formData) to ensure we only include mapped fields
  for (const [formFieldName, config] of Object.entries(mapping)) {
    // Get value from form data
    let value = formData[formFieldName]

    // Skip if value doesn't exist in form data
    if (value === undefined) {
      continue
    }

    // Skip null or empty values (unless explicitly transformed)
    if ((value === null || value === '') && !config.transform) {
      continue
    }

    // Apply transformation if provided
    if (config.transform) {
      value = config.transform(value)
    }

    // Convert value to string based on type
    let stringValue: string
    let paramType: 'SingleValue' | 'Xml' | 'ComplexObject' = config.type || 'SingleValue'

    if (value instanceof File || (Array.isArray(value) && value.length > 0 && value[0] instanceof File)) {
      // Skip file objects - files are handled separately
      continue
    } else if (Array.isArray(value)) {
      stringValue = JSON.stringify(value)
    } else if (value instanceof Date) {
      stringValue = value.toISOString()
    } else if (typeof value === 'object' && value !== null) {
      stringValue = JSON.stringify(value)
      if (!config.type) {
        paramType = 'ComplexObject'
      }
    } else if (typeof value === 'boolean') {
      stringValue = value.toString()
    } else {
      stringValue = String(value)
    }

    // Create parameter
    parameters.push({
      name: config.parameterName,
      value: stringValue,
      type: paramType,
      direction: config.direction || 'In',
    })
  }

  return parameters
}
