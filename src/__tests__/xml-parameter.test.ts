/**
 * Unit tests for XmlParameter class
 */

import { describe, it, expect } from 'vitest'
import { XmlParameter, isXmlParameter } from '../lib/models/xml-parameter'

describe('XmlParameter', () => {
  describe('Constructor and basic properties', () => {
    it('should create an XmlParameter with empty template', () => {
      const param = new XmlParameter('pTest', {}, 'In')

      expect(param.getName()).toBe('pTest')
      expect(param.getDirection()).toBe('In')
      expect(param.getData()).toEqual({})
    })

    it('should create an XmlParameter with nested template', () => {
      const template = {
        raiz: {
          nombre: null,
          edad: null
        }
      }

      const param = new XmlParameter('pPersona', template, 'In')

      expect(param.getName()).toBe('pPersona')
      expect(param.getData()).toEqual(template)
    })

    it('should default direction to "In"', () => {
      const param = new XmlParameter('pTest', {})

      expect(param.getDirection()).toBe('In')
    })
  })

  describe('Proxy property access', () => {
    it('should allow reading top-level properties via Proxy', () => {
      const template = {
        raiz: {
          nombre: 'Juan',
          edad: 30
        }
      }

      const param = new XmlParameter('pPersona', template) as any

      expect(param.raiz).toEqual({ nombre: 'Juan', edad: 30 })
      expect(param.raiz.nombre).toBe('Juan')
      expect(param.raiz.edad).toBe(30)
    })

    it('should allow setting top-level properties via Proxy', () => {
      const template = {
        raiz: {
          nombre: null,
          edad: null
        }
      }

      const param = new XmlParameter('pPersona', template) as any

      param.raiz.nombre = 'Pedro'
      param.raiz.edad = 25

      expect(param.raiz.nombre).toBe('Pedro')
      expect(param.raiz.edad).toBe(25)
    })

    it('should allow setting array elements via Proxy', () => {
      const template = {
        raiz: {
          productos: {
            producto: []
          }
        }
      }

      const param = new XmlParameter('pProductos', template) as any

      param.raiz.productos.producto[0] = { codigo: 'PROD001', descripcion: 'Producto 1' }
      param.raiz.productos.producto[1] = { codigo: 'PROD002', descripcion: 'Producto 2' }

      expect(param.raiz.productos.producto).toHaveLength(2)
      expect(param.raiz.productos.producto[0].codigo).toBe('PROD001')
      expect(param.raiz.productos.producto[1].codigo).toBe('PROD002')
    })
  })

  describe('toParameter()', () => {
    it('should convert to IParameter format', () => {
      const template = {
        raiz: {
          nombre: 'Juan',
          edad: 30
        }
      }

      const param = new XmlParameter('pPersona', template, 'In')
      const iParam = param.toParameter()

      expect(iParam).toEqual({
        name: 'pPersona',
        value: template,
        type: 'Xml',
        direction: 'In'
      })
    })

    it('should reflect data modifications in toParameter()', () => {
      const template = {
        raiz: {
          nombre: null
        }
      }

      const param = new XmlParameter('pPersona', template, 'In') as any

      param.raiz.nombre = 'Pedro'

      const iParam = param.toParameter()

      expect(iParam.value.raiz.nombre).toBe('Pedro')
    })
  })

  describe('reset()', () => {
    it('should reset data to original template', () => {
      const template = {
        raiz: {
          nombre: 'Juan',
          edad: 30
        }
      }

      const param = new XmlParameter('pPersona', template, 'In') as any

      // Modify data
      param.raiz.nombre = 'Pedro'
      param.raiz.edad = 25

      expect(param.raiz.nombre).toBe('Pedro')
      expect(param.raiz.edad).toBe(25)

      // Reset
      param.reset()

      expect(param.raiz.nombre).toBe('Juan')
      expect(param.raiz.edad).toBe(30)
    })
  })

  describe('clone()', () => {
    it('should create an independent copy', () => {
      const template = {
        raiz: {
          nombre: 'Juan'
        }
      }

      const param1 = new XmlParameter('pPersona', template, 'In') as any
      const param2 = param1.clone() as any

      // Modify clone
      param2.raiz.nombre = 'Pedro'

      // Original should be unchanged
      expect(param1.raiz.nombre).toBe('Juan')
      expect(param2.raiz.nombre).toBe('Pedro')
    })

    it('should preserve name and direction', () => {
      const param1 = new XmlParameter('pPersona', {}, 'InOut')
      const param2 = param1.clone()

      expect(param2.getName()).toBe('pPersona')
      expect(param2.getDirection()).toBe('InOut')
    })
  })

  describe('toJSON()', () => {
    it('should return JSON string of data', () => {
      const template = {
        raiz: {
          nombre: 'Juan',
          edad: 30
        }
      }

      const param = new XmlParameter('pPersona', template, 'In')
      const json = param.toJSON()

      expect(json).toBe(JSON.stringify(template, null, 2))
    })
  })

  describe('isXmlParameter() static method', () => {
    it('should identify XmlParameter instances', () => {
      const param = new XmlParameter('pTest', {}, 'In')

      expect(XmlParameter.isXmlParameter(param)).toBe(true)
    })

    it('should return false for non-XmlParameter objects', () => {
      const obj = { name: 'pTest', value: {}, type: 'Xml' }

      expect(XmlParameter.isXmlParameter(obj)).toBe(false)
    })

    it('should return false for null and undefined', () => {
      expect(XmlParameter.isXmlParameter(null)).toBe(false)
      expect(XmlParameter.isXmlParameter(undefined)).toBe(false)
    })

    it('should return false for primitives', () => {
      expect(XmlParameter.isXmlParameter('string')).toBe(false)
      expect(XmlParameter.isXmlParameter(123)).toBe(false)
      expect(XmlParameter.isXmlParameter(true)).toBe(false)
    })
  })

  describe('isXmlParameter() type guard', () => {
    it('should identify XmlParameter instances', () => {
      const param = new XmlParameter('pTest', {}, 'In')

      expect(isXmlParameter(param)).toBe(true)
    })

    it('should return false for non-XmlParameter objects', () => {
      const obj = { name: 'pTest', value: {}, type: 'Xml' }

      expect(isXmlParameter(obj)).toBe(false)
    })
  })

  describe('Complex scenarios', () => {
    it('should handle deeply nested structures', () => {
      const template = {
        raiz: {
          deudor: {
            datosPersonales: {
              id: null,
              nombre: null,
              apellido: null
            },
            contactos: {
              contacto: [
                {
                  tipo: 'email',
                  valor: null
                }
              ]
            }
          }
        }
      }

      const param = new XmlParameter('pDeudor', template, 'In') as any

      param.raiz.deudor.datosPersonales.id = '123'
      param.raiz.deudor.datosPersonales.nombre = 'Juan'
      param.raiz.deudor.datosPersonales.apellido = 'Perez'
      param.raiz.deudor.contactos.contacto[0].valor = 'juan@example.com'

      expect(param.raiz.deudor.datosPersonales.id).toBe('123')
      expect(param.raiz.deudor.datosPersonales.nombre).toBe('Juan')
      expect(param.raiz.deudor.contactos.contacto[0].valor).toBe('juan@example.com')
    })

    it('should handle adding new array elements', () => {
      const template = {
        raiz: {
          productos: {
            producto: []
          }
        }
      }

      const param = new XmlParameter('pProductos', template, 'In') as any

      // Add multiple products
      param.raiz.productos.producto.push({ codigo: 'PROD001', descripcion: 'Producto 1' })
      param.raiz.productos.producto.push({ codigo: 'PROD002', descripcion: 'Producto 2' })
      param.raiz.productos.producto.push({ codigo: 'PROD003', descripcion: 'Producto 3' })

      expect(param.raiz.productos.producto).toHaveLength(3)
      expect(param.raiz.productos.producto[2].codigo).toBe('PROD003')
    })
  })
})
