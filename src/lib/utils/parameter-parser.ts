/**
 * Parameter Parser Utilities
 * Handles complex parameter structures (JSON, XML, nested objects)
 */

import type { IParameter } from '../types'

export class ParameterParser {
  /**
   * Parse complex parameter value from JSON string
   */
  static parseComplexValue(parameter: IParameter): any {
    if (!parameter.valueJson) {
      return parameter.value
    }

    try {
      return JSON.parse(parameter.valueJson)
    } catch (error) {
      console.warn('[ParameterParser] Failed to parse valueJson:', error)
      return parameter.value
    }
  }

  /**
   * Serialize complex value to parameter format
   */
  static serializeComplexValue(value: any, type: 'SingleValue' | 'Xml' | 'ComplexObject'): { value: string; valueJson?: string } {
    if (type === 'SingleValue') {
      return {
        value: String(value ?? ''),
      }
    }

    if (typeof value === 'object') {
      const jsonString = JSON.stringify(value)
      return {
        value: jsonString,
        valueJson: jsonString,
      }
    }

    return {
      value: String(value ?? ''),
      valueJson: String(value ?? ''),
    }
  }

  /**
   * Get value from nested path (e.g., "customer.address.street")
   */
  static getNestedValue(obj: any, path: string): any {
    if (!path) return obj

    const parts = path.split(/[./]/)
    let current = obj

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined
      }
      current = current[part]
    }

    return current
  }

  /**
   * Set value at nested path
   */
  static setNestedValue(obj: any, path: string, value: any): any {
    if (!path) return value

    const parts = path.split(/[./]/)
    const last = parts.pop()!
    let current = obj

    for (const part of parts) {
      if (!current[part]) {
        current[part] = {}
      }
      current = current[part]
    }

    current[last] = value
    return obj
  }

  /**
   * Flatten parameters for form data
   */
  static flattenParameters(parameters: IParameter[]): Record<string, any> {
    const flattened: Record<string, any> = {}

    parameters.forEach((param) => {
      if (param.type === 'SingleValue') {
        flattened[param.name] = param.value
      } else {
        flattened[param.name] = this.parseComplexValue(param)
      }
    })

    return flattened
  }

  /**
   * Unflatten form data back to parameters
   */
  static unflattenToParameters(
    data: Record<string, any>,
    originalParameters: IParameter[]
  ): IParameter[] {
    return originalParameters.map((param) => {
      const value = data[param.name]

      if (value === undefined) {
        return param
      }

      const serialized = this.serializeComplexValue(value, param.type)

      return {
        ...param,
        ...serialized,
      }
    })
  }

  /**
   * Merge parameters with form values
   */
  static mergeWithFormData(
    parameters: IParameter[],
    formData: Record<string, any>
  ): IParameter[] {
    return parameters.map((param) => {
      if (formData.hasOwnProperty(param.name)) {
        const serialized = this.serializeComplexValue(formData[param.name], param.type)
        return {
          ...param,
          ...serialized,
          hasBinding: true,
        }
      }
      return param
    })
  }

  /**
   * Filter parameters by direction
   */
  static filterByDirection(
    parameters: IParameter[],
    direction: 'In' | 'Out' | 'InOut'
  ): IParameter[] {
    return parameters.filter((p) => p.direction === direction || p.direction === 'InOut')
  }

  /**
   * Get input parameters only
   */
  static getInputParameters(parameters: IParameter[]): IParameter[] {
    return this.filterByDirection(parameters, 'In')
  }

  /**
   * Get output parameters only
   */
  static getOutputParameters(parameters: IParameter[]): IParameter[] {
    return this.filterByDirection(parameters, 'Out')
  }

  /**
   * Validate required parameters
   */
  static validateRequired(
    parameters: IParameter[],
    formData: Record<string, any>
  ): { valid: boolean; missing: string[] } {
    const inputParams = this.getInputParameters(parameters)
    const missing: string[] = []

    inputParams.forEach((param) => {
      if (!param.isSystemParameter) {
        const value = formData[param.name]
        if (value === undefined || value === null || value === '') {
          missing.push(param.name)
        }
      }
    })

    return {
      valid: missing.length === 0,
      missing,
    }
  }
}
