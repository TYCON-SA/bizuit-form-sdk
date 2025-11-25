/**
 * Bizuit Form Service
 * High-level service for common form workflows
 *
 * Provides simplified methods that encapsulate common patterns:
 * - Starting new processes with form data + additional parameters
 * - Continuing existing processes with selective field mapping
 * - Managing locks automatically
 *
 * Use this service for common cases. For advanced control, use BizuitProcessService directly.
 */

import type { IParameter, IProcessResult } from '../types'
import {
  buildParameters,
  formDataToParameters,
  createParameter,
  loadInstanceDataForContinue,
  releaseInstanceLock,
  type IParameterMapping,
  type ILockInfo,
  type IBizuitProcessParameter,
} from '../utils/form-utils'

export class BizuitFormService {
  constructor(private sdk: any) {}

  /**
   * Prepares a form for STARTING a new process
   *
   * @returns Parameters ready to render the form
   */
  async prepareStartForm(options: {
    processName: string
    version?: string
    token: string
  }): Promise<{
    parameters: IBizuitProcessParameter[]
    formData: Record<string, any>
  }> {
    // Get process definition
    const processData = await this.sdk.process.initialize({
      processName: options.processName,
      version: options.version,
      token: options.token
    })

    // Filter parameters for start form
    const parameters = processData.parameters || []

    // Convert to formData (with default values)
    const formData: Record<string, any> = {}
    parameters.forEach((param: any) => {
      if (param.value !== null && param.value !== undefined) {
        formData[param.name] = param.value
      }
    })

    return { parameters, formData }
  }

  /**
   * Starts a new process combining:
   * - Parameters mapped from form fields
   * - Additional parameters (not associated with fields)
   *
   * @example
   * ```typescript
   * // Only form data (send all fields)
   * await formService.startProcess({
   *   processName: 'ExpenseRequest',
   *   token,
   *   formData: { empleado: 'Juan', monto: '5000' }
   * })
   *
   * // Form data with selective mapping
   * await formService.startProcess({
   *   processName: 'ExpenseRequest',
   *   token,
   *   formData,
   *   fieldMapping: {
   *     'empleado': { parameterName: 'pEmpleado' },
   *     'monto': {
   *       parameterName: 'pMonto',
   *       transform: (val) => parseFloat(val).toFixed(2)
   *     }
   *   }
   * })
   *
   * // Form data + additional parameters
   * await formService.startProcess({
   *   processName: 'ExpenseRequest',
   *   token,
   *   formData,
   *   fieldMapping,
   *   additionalParameters: formService.createParameters([
   *     { name: 'pUsuarioCreador', value: currentUser.username },
   *     { name: 'pFechaCreacion', value: new Date().toISOString() }
   *   ])
   * })
   * ```
   */
  async startProcess(options: {
    processName: string
    processVersion?: string
    formData?: Record<string, any>
    fieldMapping?: Record<string, IParameterMapping>
    additionalParameters?: IParameter[]
    files?: File[]
    token: string
  }): Promise<IProcessResult> {
    const parameters: IParameter[] = []

    // 1. Parameters from form fields (with selective mapping)
    if (options.formData && options.fieldMapping) {
      const mappedParams = buildParameters(options.fieldMapping, options.formData)
      parameters.push(...mappedParams)
    } else if (options.formData && !options.fieldMapping) {
      // No mapping: send all fields
      const allParams = formDataToParameters(options.formData)
      parameters.push(...allParams)
    }

    // 2. Additional parameters (not associated with fields)
    if (options.additionalParameters) {
      parameters.push(...options.additionalParameters)
    }

    // 3. Start the process with all parameters
    return await this.sdk.process.start({
      processName: options.processName,
      processVersion: options.processVersion,
      parameters
    }, options.files, options.token)
  }

  /**
   * Prepares a form for CONTINUING an existing instance
   *
   * @returns Instance data ready to render and edit
   */
  async prepareContinueForm(options: {
    instanceId: string
    processName: string
    activityName?: string
    autoLock?: boolean
    token: string
  }): Promise<{
    parameters: IBizuitProcessParameter[]
    formData: Record<string, any>
    lockInfo?: ILockInfo
    instanceData: any
  }> {
    // Use existing helper (already does everything)
    const result = await loadInstanceDataForContinue(
      this.sdk,
      {
        instanceId: options.instanceId,
        processName: options.processName,
        activityName: options.activityName,
        autoLock: options.autoLock
      },
      options.token
    )

    return {
      parameters: result.formParameters,
      formData: result.formData,
      lockInfo: result.lockInfo,
      instanceData: result.instanceData
    }
  }

  /**
   * Continues an existing process combining:
   * - Parameters mapped from form fields
   * - Additional parameters (not associated with fields)
   *
   * @example
   * ```typescript
   * // Form data + context parameters
   * await formService.continueProcess({
   *   instanceId: '123-456',
   *   processName: 'ExpenseRequest',
   *   token,
   *   formData,
   *   fieldMapping: {
   *     'aprobado': {
   *       parameterName: 'vAprobado',
   *       isVariable: true
   *     },
   *     'comentarios': { parameterName: 'pComentarios' }
   *   },
   *   additionalParameters: formService.createParameters([
   *     { name: 'vAprobador', value: currentUser.username },
   *     { name: 'vFechaAprobacion', value: new Date().toISOString() }
   *   ])
   * })
   * ```
   */
  async continueProcess(options: {
    instanceId: string
    processName: string
    formData?: Record<string, any>
    fieldMapping?: Record<string, IParameterMapping>
    additionalParameters?: IParameter[]
    files?: File[]
    token: string
  }): Promise<IProcessResult> {
    const parameters: IParameter[] = []

    // 1. Parameters from form fields
    if (options.formData && options.fieldMapping) {
      const mappedParams = buildParameters(options.fieldMapping, options.formData)
      parameters.push(...mappedParams)
    } else if (options.formData && !options.fieldMapping) {
      const allParams = formDataToParameters(options.formData)
      parameters.push(...allParams)
    }

    // 2. Additional parameters
    if (options.additionalParameters) {
      parameters.push(...options.additionalParameters)
    }

    // 3. Continue the process
    return await this.sdk.process.continue({
      processName: options.processName,
      instanceId: options.instanceId,
      parameters
    }, options.files, options.token)
  }

  /**
   * Releases a lock acquired during prepareContinueForm
   */
  async releaseLock(options: {
    instanceId: string
    activityName: string
    sessionToken: string
    token: string
  }): Promise<void> {
    return await releaseInstanceLock(
      this.sdk,
      {
        instanceId: options.instanceId,
        activityName: options.activityName,
        sessionToken: options.sessionToken
      },
      options.token
    )
  }

  /**
   * Helper to create a single parameter easily
   */
  createParameter(
    name: string,
    value: any,
    options?: {
      type?: 'SingleValue' | 'Xml' | 'ComplexObject'
      direction?: 'In' | 'Out' | 'InOut'
    }
  ): IParameter {
    return createParameter(
      name,
      value,
      options?.type || 'SingleValue',
      options?.direction || 'In'
    )
  }

  /**
   * Helper to create multiple parameters easily
   *
   * @example
   * ```typescript
   * const params = formService.createParameters([
   *   { name: 'pUsuario', value: currentUser.username },
   *   { name: 'pFecha', value: new Date().toISOString() },
   *   { name: 'pConfig', value: { theme: 'dark' }, type: 'ComplexObject' }
   * ])
   * ```
   */
  createParameters(params: Array<{
    name: string
    value: any
    type?: 'SingleValue' | 'Xml' | 'ComplexObject'
    direction?: 'In' | 'Out' | 'InOut'
  }>): IParameter[] {
    return params.map(p => this.createParameter(p.name, p.value, {
      type: p.type,
      direction: p.direction
    }))
  }
}
