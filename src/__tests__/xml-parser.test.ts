/**
 * XML Parser Tests
 * Tests for automatic XML to JSON conversion
 */

import { describe, it, expect } from 'vitest'
import { xmlToJson } from '../lib/utils/xml-parser'

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
