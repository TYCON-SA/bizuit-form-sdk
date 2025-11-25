/**
 * XmlParameter - Wrapper class for XML parameters with Proxy-based property access
 *
 * Allows developers to work with XML parameters as mutable JavaScript objects:
 *
 * @example
 * ```typescript
 * const params = await sdk.process.getParametersAsObjects('MyProcess', '', token)
 *
 * // Direct property modification (thanks to Proxy)
 * params.pSampleXml.nodo1 = 'a'
 * params.pSampleXml.productos[0].codigo = 'ABC'
 *
 * // Send directly to process
 * await sdk.process.start({
 *   processName: 'MyProcess',
 *   parameters: [params.pSampleXml]  // SDK auto-detects XmlParameter
 * }, [], token)
 * ```
 */

import type { IParameter } from '../types'

export class XmlParameter {
  /**
   * Symbol used to identify XmlParameter instances
   * Used by ProcessService for auto-detection
   */
  static readonly TYPE_SYMBOL = Symbol('BizuitXmlParameter')

  private _name: string
  private _data: any
  private _type: 'Xml' = 'Xml'
  private _direction: 'In' | 'Out' | 'InOut'
  private _originalTemplate: any

  /**
   * Creates a new XmlParameter instance
   *
   * @param name - Parameter name (e.g., 'pSampleXml')
   * @param template - Object template representing the XML structure
   * @param direction - Parameter direction (default: 'In')
   *
   * @example
   * ```typescript
   * const param = new XmlParameter('pDeudor', {
   *   deudor: {
   *     datosPersonales: {
   *       id: null,
   *       nombre: null
   *     },
   *     contactos: {
   *       contacto: []
   *     }
   *   }
   * }, 'In')
   *
   * // Direct property access via Proxy
   * param.deudor.datosPersonales.nombre = 'Juan Perez'
   * ```
   */
  constructor(name: string, template: any, direction: 'In' | 'Out' | 'InOut' = 'In') {
    this._name = name
    this._data = this._deepClone(template)
    this._direction = direction
    this._originalTemplate = this._deepClone(template)

    // Mark instance as XmlParameter for auto-detection
    ;(this as any)[XmlParameter.TYPE_SYMBOL] = true

    // Return Proxy for transparent property access
    return new Proxy(this, {
      get(target, prop) {
        // If accessing internal properties, return them
        if (prop in target) {
          return target[prop as keyof typeof target]
        }

        // Otherwise, access data properties
        if (prop in target._data) {
          return target._data[prop]
        }

        return undefined
      },
      set(target, prop, value) {
        // Allow setting private properties (for internal methods like reset())
        if (typeof prop === 'string' && prop.startsWith('_')) {
          ;(target as any)[prop] = value
          return true
        }

        // Don't allow setting other internal properties
        if (prop in target) {
          return false
        }

        // Set data properties
        if (typeof prop === 'string') {
          target._data[prop] = value
          return true
        }
        return false
      },
      has(target, prop) {
        return prop in target || prop in target._data
      },
      ownKeys(target) {
        return [...Reflect.ownKeys(target), ...Object.keys(target._data)]
      },
      getOwnPropertyDescriptor(target, prop) {
        if (prop in target._data) {
          return {
            enumerable: true,
            configurable: true,
            value: target._data[prop]
          }
        }
        return Reflect.getOwnPropertyDescriptor(target, prop)
      }
    })
  }

  /**
   * Converts XmlParameter to IParameter format for ProcessService
   *
   * @returns IParameter object ready to send to Bizuit API
   */
  toParameter(): IParameter {
    return {
      name: this._name,
      value: this._data,
      type: this._type,
      direction: this._direction
    }
  }

  /**
   * Gets the parameter name
   */
  getName(): string {
    return this._name
  }

  /**
   * Gets the raw data object
   */
  getData(): any {
    return this._data
  }

  /**
   * Gets the parameter direction
   */
  getDirection(): 'In' | 'Out' | 'InOut' {
    return this._direction
  }

  /**
   * Resets the parameter data to the original template
   */
  reset(): void {
    this._data = this._deepClone(this._originalTemplate)
  }

  /**
   * Creates a deep clone of the XmlParameter
   *
   * @returns New XmlParameter instance with cloned data
   */
  clone(): XmlParameter {
    return new XmlParameter(this._name, this._deepClone(this._data), this._direction)
  }

  /**
   * Converts the parameter data to JSON string
   */
  toJSON(): string {
    return JSON.stringify(this._data, null, 2)
  }

  /**
   * Merges data from another object into this XmlParameter
   *
   * @param data - Object or XmlParameter to merge
   * @param deep - Deep merge (default: true)
   *
   * @example
   * ```typescript
   * const param = new XmlParameter('pData', { raiz: { nombre: null, edad: null } })
   * param.merge({ raiz: { nombre: 'Juan' } })
   * // Result: { raiz: { nombre: 'Juan', edad: null } }
   * ```
   */
  merge(data: any | XmlParameter, deep: boolean = true): void {
    const sourceData = XmlParameter.isXmlParameter(data) ? data.getData() : data

    if (deep) {
      this._data = this._deepMerge(this._data, sourceData)
    } else {
      this._data = { ...this._data, ...sourceData }
    }
  }

  /**
   * Validates that all required fields have values (not null/undefined)
   *
   * @param schema - Optional schema object defining required fields
   * @returns Array of missing field paths
   *
   * @example
   * ```typescript
   * const param = new XmlParameter('pData', { raiz: { nombre: null, edad: 30 } })
   * param.raiz.nombre = 'Juan'
   * const missing = param.validate()
   * // Returns: [] (all fields filled)
   *
   * param.raiz.nombre = null
   * const missing2 = param.validate()
   * // Returns: ['raiz.nombre'] (missing field)
   * ```
   */
  validate(schema?: any): string[] {
    const missingFields: string[] = []

    const checkObject = (obj: any, path: string = '') => {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key]
          const currentPath = path ? `${path}.${key}` : key

          if (value === null || value === undefined) {
            missingFields.push(currentPath)
          } else if (typeof value === 'object' && !Array.isArray(value)) {
            checkObject(value, currentPath)
          } else if (Array.isArray(value) && value.length === 0) {
            missingFields.push(currentPath)
          }
        }
      }
    }

    checkObject(this._data)
    return missingFields
  }

  /**
   * Fills the parameter with data from a source object
   * Useful for mapping form data to parameter structure
   *
   * @param source - Source data object
   * @param mapping - Optional field mapping { sourceField: targetPath }
   *
   * @example
   * ```typescript
   * const param = new XmlParameter('pDeudor', {
   *   Deudor: { ID: null, Nombre: null, Contactos: { Contacto: [] } }
   * })
   *
   * param.fillFrom(
   *   { id: 123, nombre: 'Juan', email: 'juan@example.com' },
   *   {
   *     id: 'Deudor.ID',
   *     nombre: 'Deudor.Nombre',
   *     email: 'Deudor.Contactos.Contacto[0].Valor'
   *   }
   * )
   * ```
   */
  fillFrom(source: any, mapping?: Record<string, string>): void {
    if (!mapping) {
      // Direct fill without mapping
      this._data = this._deepClone(source)
      return
    }

    // Fill with mapping
    for (const sourceKey in mapping) {
      if (Object.prototype.hasOwnProperty.call(source, sourceKey)) {
        const targetPath = mapping[sourceKey]
        const value = source[sourceKey]
        this._setByPath(targetPath, value)
      }
    }
  }

  /**
   * Gets a value by path (dot notation)
   *
   * @param path - Path in dot notation (e.g., 'raiz.productos.producto[0].codigo')
   * @returns Value at path or undefined
   */
  getByPath(path: string): any {
    return this._getByPath(this._data, path)
  }

  /**
   * Sets a value by path (dot notation)
   *
   * @param path - Path in dot notation
   * @param value - Value to set
   */
  setByPath(path: string, value: any): void {
    this._setByPath(path, value)
  }

  /**
   * Deep clone helper
   */
  private _deepClone(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this._deepClone(item))
    }

    const cloned: any = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = this._deepClone(obj[key])
      }
    }
    return cloned
  }

  /**
   * Deep merge helper
   */
  private _deepMerge(target: any, source: any): any {
    if (source === null || source === undefined) {
      return target
    }

    if (typeof source !== 'object' || Array.isArray(source)) {
      return source
    }

    const result = this._deepClone(target)

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = this._deepMerge(result[key] || {}, source[key])
        } else {
          result[key] = source[key]
        }
      }
    }

    return result
  }

  /**
   * Get value by path helper
   */
  private _getByPath(obj: any, path: string): any {
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.')
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
   * Set value by path helper
   */
  private _setByPath(path: string, value: any): void {
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.')
    let current = this._data

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      const nextPart = parts[i + 1]

      if (!(part in current)) {
        // Create object or array based on next part
        current[part] = /^\d+$/.test(nextPart) ? [] : {}
      }

      current = current[part]
    }

    const lastPart = parts[parts.length - 1]
    current[lastPart] = value
  }

  /**
   * Static helper to check if an object is an XmlParameter instance
   *
   * @param obj - Object to check
   * @returns true if obj is an XmlParameter instance
   */
  static isXmlParameter(obj: any): obj is XmlParameter {
    if (!obj || typeof obj !== 'object') {
      return false
    }
    return XmlParameter.TYPE_SYMBOL in obj
  }
}

/**
 * Type guard for XmlParameter
 */
export function isXmlParameter(obj: any): obj is XmlParameter {
  return XmlParameter.isXmlParameter(obj)
}
