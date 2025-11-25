/**
 * Unit tests for XmlParameter helper methods (Phase 2)
 */

import { describe, it, expect } from 'vitest'
import { XmlParameter } from '../lib/models/xml-parameter'

describe('XmlParameter - Helper Methods (Phase 2)', () => {
  describe('merge()', () => {
    it('should merge object data deeply', () => {
      const param = new XmlParameter('pData', {
        raiz: {
          nombre: null,
          edad: null,
          contactos: {
            email: null
          }
        }
      })

      param.merge({
        raiz: {
          nombre: 'Juan',
          contactos: {
            email: 'juan@example.com'
          }
        }
      })

      const data = param.getData()
      expect(data.raiz.nombre).toBe('Juan')
      expect(data.raiz.edad).toBe(null) // Preserved
      expect(data.raiz.contactos.email).toBe('juan@example.com')
    })

    it('should merge XmlParameter into XmlParameter', () => {
      const param1 = new XmlParameter('pData', { raiz: { nombre: null, edad: null } })
      const param2 = new XmlParameter('pData2', { raiz: { nombre: 'Pedro' } })

      param1.merge(param2)

      expect(param1.getData().raiz.nombre).toBe('Pedro')
      expect(param1.getData().raiz.edad).toBe(null)
    })

    it('should support shallow merge', () => {
      const param = new XmlParameter('pData', {
        raiz: {
          nombre: 'Juan',
          edad: 30
        }
      })

      param.merge({
        raiz: {
          nombre: 'Pedro'
        }
      }, false) // Shallow merge

      const data = param.getData()
      expect(data.raiz.nombre).toBe('Pedro')
      expect(data.raiz.edad).toBeUndefined() // Lost in shallow merge
    })
  })

  describe('validate()', () => {
    it('should return empty array when all fields filled', () => {
      const param = new XmlParameter('pData', {
        raiz: {
          nombre: 'Juan',
          edad: 30
        }
      })

      const missing = param.validate()
      expect(missing).toEqual([])
    })

    it('should return missing field paths', () => {
      const param = new XmlParameter('pData', {
        raiz: {
          nombre: null,
          edad: 30,
          contactos: {
            email: null
          }
        }
      })

      const missing = param.validate()
      expect(missing).toContain('raiz.nombre')
      expect(missing).toContain('raiz.contactos.email')
      expect(missing).not.toContain('raiz.edad')
    })

    it('should detect empty arrays', () => {
      const param = new XmlParameter('pData', {
        raiz: {
          productos: {
            producto: []
          }
        }
      })

      const missing = param.validate()
      expect(missing).toContain('raiz.productos.producto')
    })

    it('should not flag filled arrays as missing', () => {
      const param = new XmlParameter('pData', {
        raiz: {
          productos: {
            producto: [
              { codigo: 'PROD001', descripcion: 'Producto 1' }
            ]
          }
        }
      })

      const missing = param.validate()
      expect(missing).not.toContain('raiz.productos.producto')
    })
  })

  describe('fillFrom()', () => {
    it('should fill without mapping', () => {
      const param = new XmlParameter('pData', {})

      param.fillFrom({
        raiz: {
          nombre: 'Juan',
          edad: 30
        }
      })

      const data = param.getData()
      expect(data.raiz.nombre).toBe('Juan')
      expect(data.raiz.edad).toBe(30)
    })

    it('should fill with mapping', () => {
      const param = new XmlParameter('pDeudor', {
        Deudor: {
          ID: null,
          Nombre: null,
          Contactos: {
            Contacto: []
          }
        }
      })

      param.fillFrom(
        {
          id: 123,
          nombre: 'Juan Perez',
          email: 'juan@example.com'
        },
        {
          id: 'Deudor.ID',
          nombre: 'Deudor.Nombre',
          email: 'Deudor.Contactos.Contacto[0].Valor'
        }
      )

      const data = param.getData()
      expect(data.Deudor.ID).toBe(123)
      expect(data.Deudor.Nombre).toBe('Juan Perez')
      expect(data.Deudor.Contactos.Contacto[0].Valor).toBe('juan@example.com')
    })

    it('should handle array index notation in mapping', () => {
      const param = new XmlParameter('pProductos', {
        raiz: {
          productos: {
            producto: []
          }
        }
      })

      param.fillFrom(
        {
          codigo1: 'PROD001',
          desc1: 'Producto 1',
          codigo2: 'PROD002',
          desc2: 'Producto 2'
        },
        {
          codigo1: 'raiz.productos.producto[0].codigo',
          desc1: 'raiz.productos.producto[0].descripcion',
          codigo2: 'raiz.productos.producto[1].codigo',
          desc2: 'raiz.productos.producto[1].descripcion'
        }
      )

      const data = param.getData()
      expect(data.raiz.productos.producto[0].codigo).toBe('PROD001')
      expect(data.raiz.productos.producto[0].descripcion).toBe('Producto 1')
      expect(data.raiz.productos.producto[1].codigo).toBe('PROD002')
      expect(data.raiz.productos.producto[1].descripcion).toBe('Producto 2')
    })
  })

  describe('getByPath() / setByPath()', () => {
    it('should get value by path', () => {
      const param = new XmlParameter('pData', {
        raiz: {
          productos: {
            producto: [
              { codigo: 'PROD001', descripcion: 'Producto 1' }
            ]
          }
        }
      })

      expect(param.getByPath('raiz.productos.producto[0].codigo')).toBe('PROD001')
      expect(param.getByPath('raiz.productos.producto[0].descripcion')).toBe('Producto 1')
    })

    it('should return undefined for non-existent path', () => {
      const param = new XmlParameter('pData', { raiz: { nombre: 'Juan' } })

      expect(param.getByPath('raiz.edad')).toBeUndefined()
      expect(param.getByPath('raiz.contactos.email')).toBeUndefined()
    })

    it('should set value by path', () => {
      const param = new XmlParameter('pData', {})

      param.setByPath('raiz.nombre', 'Juan')
      param.setByPath('raiz.edad', 30)
      param.setByPath('raiz.productos.producto[0].codigo', 'PROD001')

      const data = param.getData()
      expect(data.raiz.nombre).toBe('Juan')
      expect(data.raiz.edad).toBe(30)
      expect(data.raiz.productos.producto[0].codigo).toBe('PROD001')
    })

    it('should create intermediate objects when setting by path', () => {
      const param = new XmlParameter('pData', {})

      param.setByPath('a.b.c.d', 'value')

      const data = param.getData()
      expect(data.a.b.c.d).toBe('value')
    })

    it('should create arrays when path has array notation', () => {
      const param = new XmlParameter('pData', {})

      param.setByPath('raiz.items[0]', 'item1')
      param.setByPath('raiz.items[1]', 'item2')

      const data = param.getData()
      expect(Array.isArray(data.raiz.items)).toBe(true)
      expect(data.raiz.items[0]).toBe('item1')
      expect(data.raiz.items[1]).toBe('item2')
    })
  })

  describe('Complex scenarios', () => {
    it('should combine multiple helper methods', () => {
      const param = new XmlParameter('pDeudor', {
        Deudor: {
          ID: null,
          Nombre: null,
          TipoDocumento: null,
          Contactos: {
            Contacto: []
          }
        }
      })

      // Fill from form data
      param.fillFrom(
        {
          id: 123,
          nombre: 'Juan Perez',
          tipoDoc: 'DNI',
          email: 'juan@example.com',
          telefono: '+54 11 1234-5678'
        },
        {
          id: 'Deudor.ID',
          nombre: 'Deudor.Nombre',
          tipoDoc: 'Deudor.TipoDocumento',
          email: 'Deudor.Contactos.Contacto[0].Valor',
          telefono: 'Deudor.Contactos.Contacto[1].Valor'
        }
      )

      // Set contact types using setByPath
      param.setByPath('Deudor.Contactos.Contacto[0].Tipo', 'email')
      param.setByPath('Deudor.Contactos.Contacto[1].Tipo', 'telefono')

      // Validate
      const missing = param.validate()
      expect(missing).toEqual([])

      // Verify data
      const data = param.getData()
      expect(data.Deudor.ID).toBe(123)
      expect(data.Deudor.Nombre).toBe('Juan Perez')
      expect(data.Deudor.Contactos.Contacto).toHaveLength(2)
      expect(data.Deudor.Contactos.Contacto[0]).toEqual({
        Tipo: 'email',
        Valor: 'juan@example.com'
      })
    })

    it('should support workflow: fill → validate → merge → validate', () => {
      const param = new XmlParameter('pData', {
        raiz: {
          nombre: null,
          edad: null,
          ciudad: null
        }
      })

      // Initial fill
      param.fillFrom({ nombre: 'Juan', edad: 30 }, {
        nombre: 'raiz.nombre',
        edad: 'raiz.edad'
      })

      // Validate (missing ciudad)
      let missing = param.validate()
      expect(missing).toContain('raiz.ciudad')

      // Merge additional data
      param.merge({ raiz: { ciudad: 'Buenos Aires' } })

      // Validate again (all filled)
      missing = param.validate()
      expect(missing).toEqual([])
    })
  })
})
