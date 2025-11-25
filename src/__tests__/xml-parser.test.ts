/**
 * XML Parser Tests
 * Tests for bidirectional XML <-> JSON conversion
 */

import { describe, it, expect } from 'vitest'
import { xmlToJson, jsonToXml } from '../lib/utils/xml-parser'

describe('xmlToJson', () => {
  describe('Basic XML parsing', () => {
    it('should parse simple XML with single root element', () => {
      const xml = '<Root><Name>John</Name></Root>'
      const result = xmlToJson(xml)

      expect(result).toEqual({
        root: {
          name: 'John'
        }
      })
    })

    it('should parse nested XML elements', () => {
      const xml = `
        <Deudor>
          <DatosPersonales>
            <ID>75</ID>
            <Nombre>John Doe</Nombre>
          </DatosPersonales>
        </Deudor>
      `
      const result = xmlToJson(xml)

      expect(result).toEqual({
        deudor: {
          datosPersonales: {
            id: '75',
            nombre: 'John Doe'
          }
        }
      })
    })

    it('should convert tag names to camelCase', () => {
      const xml = '<MyRootElement><FirstName>John</FirstName><LastName>Doe</LastName></MyRootElement>'
      const result = xmlToJson(xml)

      expect(result).toEqual({
        myRootElement: {
          firstName: 'John',
          lastName: 'Doe'
        }
      })
    })
  })

  describe('Array handling', () => {
    it('should convert multiple children with same tag name to array', () => {
      const xml = `
        <Contactos>
          <Contacto><ID>1</ID></Contacto>
          <Contacto><ID>2</ID></Contacto>
          <Contacto><ID>3</ID></Contacto>
        </Contactos>
      `
      const result = xmlToJson(xml)

      expect(result).toEqual({
        contactos: {
          contacto: [
            { id: '1' },
            { id: '2' },
            { id: '3' }
          ]
        }
      })
    })

    it('should handle nested arrays correctly', () => {
      const xml = `
        <Deudor>
          <Contactos>
            <Contacto><ID>1</ID><Tipo>Email</Tipo></Contacto>
            <Contacto><ID>2</ID><Tipo>Telefono</Tipo></Contacto>
          </Contactos>
        </Deudor>
      `
      const result = xmlToJson(xml)

      expect(result).toEqual({
        deudor: {
          contactos: {
            contacto: [
              { id: '1', tipo: 'Email' },
              { id: '2', tipo: 'Telefono' }
            ]
          }
        }
      })
    })
  })

  describe('Complex XML structures', () => {
    it('should parse complex nested structure with arrays', () => {
      const xml = `
        <Deudor>
          <DatosPersonales>
            <ID>75</ID>
            <Nombre>John Doe</Nombre>
          </DatosPersonales>
          <Contactos>
            <Contacto><ID>1</ID></Contacto>
            <Contacto><ID>2</ID></Contacto>
          </Contactos>
          <Direccion>
            <Calle>Main St</Calle>
            <Ciudad>NY</Ciudad>
          </Direccion>
        </Deudor>
      `
      const result = xmlToJson(xml)

      expect(result).toEqual({
        deudor: {
          datosPersonales: {
            id: '75',
            nombre: 'John Doe'
          },
          contactos: {
            contacto: [
              { id: '1' },
              { id: '2' }
            ]
          },
          direccion: {
            calle: 'Main St',
            ciudad: 'NY'
          }
        }
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle empty text content', () => {
      const xml = '<Root><Empty></Empty></Root>'
      const result = xmlToJson(xml)

      expect(result).toEqual({
        root: {
          empty: ''
        }
      })
    })

    it('should handle whitespace in text content', () => {
      const xml = '<Root><Name>  John Doe  </Name></Root>'
      const result = xmlToJson(xml)

      expect(result).toEqual({
        root: {
          name: 'John Doe'
        }
      })
    })

    it('should return null for invalid XML', () => {
      const xml = '<Invalid><Unclosed>'
      const result = xmlToJson(xml)

      expect(result).toBeNull()
    })

    it('should return null for empty string', () => {
      const xml = ''
      const result = xmlToJson(xml)

      expect(result).toBeNull()
    })

    it('should handle XML with special characters', () => {
      const xml = '<Root><Text>&lt;Hello&gt; &amp; &quot;World&quot;</Text></Root>'
      const result = xmlToJson(xml)

      expect(result).toEqual({
        root: {
          text: '<Hello> & "World"'
        }
      })
    })
  })

  describe('Real-world example', () => {
    it('should parse Recubiz Gestion XML structure', () => {
      const xml = `
        <Datosgestion>
          <DatosPersonales>
            <IDPersonal>12345</IDPersonal>
            <Nombre>Juan Perez</Nombre>
            <TipoDocumento>DNI</TipoDocumento>
            <NumeroDocumento>12345678</NumeroDocumento>
          </DatosPersonales>
          <Detalles>
            <Detalle>
              <IDDeuda>1</IDDeuda>
              <Monto>1000</Monto>
              <Estado>Pendiente</Estado>
            </Detalle>
            <Detalle>
              <IDDeuda>2</IDDeuda>
              <Monto>2000</Monto>
              <Estado>Pagado</Estado>
            </Detalle>
          </Detalles>
        </Datosgestion>
      `
      const result = xmlToJson(xml)

      expect(result).toEqual({
        datosgestion: {
          datosPersonales: {
            idPersonal: '12345',
            nombre: 'Juan Perez',
            tipoDocumento: 'DNI',
            numeroDocumento: '12345678'
          },
          detalles: {
            detalle: [
              {
                idDeuda: '1',
                monto: '1000',
                estado: 'Pendiente'
              },
              {
                idDeuda: '2',
                monto: '2000',
                estado: 'Pagado'
              }
            ]
          }
        }
      })
    })
  })
})

describe('jsonToXml', () => {
  describe('Basic JSON to XML conversion', () => {
    it('should convert simple object to XML', () => {
      const obj = {
        raiz: {
          nombre: 'Test'
        }
      }
      const result = jsonToXml(obj)

      expect(result).toBe('<raiz>\n  <nombre>Test</nombre>\n</raiz>')
    })

    it('should convert nested object to XML', () => {
      const obj = {
        raiz: {
          nombre: 'Test',
          complejo1: {
            dato1: 'Value1',
            dato2: 'Value2'
          }
        }
      }
      const result = jsonToXml(obj)

      const expected = `<raiz>
  <nombre>Test</nombre>
  <complejo1>
    <dato1>Value1</dato1>
    <dato2>Value2</dato2>
  </complejo1>
</raiz>`

      expect(result).toBe(expected)
    })
  })

  describe('Array handling', () => {
    it('should convert arrays to repeated XML elements', () => {
      const obj = {
        raiz: {
          productos: {
            producto: [
              { codigo: 'PROD001', descripcion: 'Producto 1' },
              { codigo: 'PROD002', descripcion: 'Producto 2' }
            ]
          }
        }
      }
      const result = jsonToXml(obj)

      const expected = `<raiz>
  <productos>
    <producto>
      <codigo>PROD001</codigo>
      <descripcion>Producto 1</descripcion>
    </producto>
    <producto>
      <codigo>PROD002</codigo>
      <descripcion>Producto 2</descripcion>
    </producto>
  </productos>
</raiz>`

      expect(result).toBe(expected)
    })
  })

  describe('Special characters', () => {
    it('should escape special XML characters', () => {
      const obj = {
        raiz: {
          texto: 'Contains <special> & "characters" \'here\''
        }
      }
      const result = jsonToXml(obj)

      expect(result).toContain('&lt;special&gt;')
      expect(result).toContain('&amp;')
      expect(result).toContain('&quot;characters&quot;')
      expect(result).toContain('&apos;here&apos;')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty objects', () => {
      const obj = {
        raiz: {}
      }
      const result = jsonToXml(obj)

      expect(result).toBe('<raiz></raiz>')
    })

    it('should handle null values', () => {
      const obj = {
        raiz: {
          valor: null
        }
      }
      const result = jsonToXml(obj)

      expect(result).toBe('<raiz>\n  <valor></valor>\n</raiz>')
    })

    it('should handle primitive values', () => {
      const obj = {
        raiz: {
          numero: 123,
          booleano: true,
          texto: 'abc'
        }
      }
      const result = jsonToXml(obj)

      const expected = `<raiz>
  <numero>123</numero>
  <booleano>true</booleano>
  <texto>abc</texto>
</raiz>`

      expect(result).toBe(expected)
    })
  })
})

describe('Bidirectional conversion', () => {
  it('should convert JSON to XML and back to JSON', () => {
    const original = {
      raiz: {
        nombre: 'Test',
        productos: {
          producto: [
            { codigo: 'PROD001', descripcion: 'Producto 1' },
            { codigo: 'PROD002', descripcion: 'Producto 2' }
          ]
        }
      }
    }

    const xml = jsonToXml(original)
    const backToJson = xmlToJson(xml)

    expect(backToJson).toEqual(original)
  })

  it('should preserve complex nested structures', () => {
    const original = {
      deudor: {
        datosPersonales: {
          id: '75',
          nombre: 'John Doe'
        },
        contactos: {
          contacto: [
            { tipo: 'email', valor: 'john@example.com' },
            { tipo: 'phone', valor: '123456789' }
          ]
        }
      }
    }

    const xml = jsonToXml(original)
    const backToJson = xmlToJson(xml)

    expect(backToJson).toEqual(original)
  })
})
