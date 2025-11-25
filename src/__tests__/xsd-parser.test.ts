/**
 * Unit tests for XSD Parser
 */

import { describe, it, expect } from 'vitest'
import { parseXsdToTemplate } from '../lib/utils/xsd-parser'

describe('parseXsdToTemplate', () => {
  describe('Basic element parsing', () => {
    it('should parse simple element with string type', () => {
      const xsd = `
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
          <xs:element name="nombre" type="xs:string"/>
        </xs:schema>
      `

      const result = parseXsdToTemplate(xsd)

      expect(result).toEqual({ nombre: null })
    })

    it('should parse simple element with integer type', () => {
      const xsd = `
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
          <xs:element name="edad" type="xs:integer"/>
        </xs:schema>
      `

      const result = parseXsdToTemplate(xsd)

      expect(result).toEqual({ edad: null })
    })
  })

  describe('Complex type parsing', () => {
    it('should parse complexType with sequence', () => {
      const xsd = `
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
          <xs:element name="persona">
            <xs:complexType>
              <xs:sequence>
                <xs:element name="nombre" type="xs:string"/>
                <xs:element name="edad" type="xs:integer"/>
              </xs:sequence>
            </xs:complexType>
          </xs:element>
        </xs:schema>
      `

      const result = parseXsdToTemplate(xsd)

      expect(result).toEqual({
        persona: {
          nombre: null,
          edad: null
        }
      })
    })

    it('should parse nested complexTypes', () => {
      const xsd = `
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
          <xs:element name="deudor">
            <xs:complexType>
              <xs:sequence>
                <xs:element name="datosPersonales">
                  <xs:complexType>
                    <xs:sequence>
                      <xs:element name="id" type="xs:integer"/>
                      <xs:element name="nombre" type="xs:string"/>
                    </xs:sequence>
                  </xs:complexType>
                </xs:element>
              </xs:sequence>
            </xs:complexType>
          </xs:element>
        </xs:schema>
      `

      const result = parseXsdToTemplate(xsd)

      expect(result).toEqual({
        deudor: {
          datosPersonales: {
            id: null,
            nombre: null
          }
        }
      })
    })
  })

  describe('Array handling (maxOccurs)', () => {
    it('should create array for maxOccurs="unbounded"', () => {
      const xsd = `
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
          <xs:element name="productos">
            <xs:complexType>
              <xs:sequence>
                <xs:element name="producto" maxOccurs="unbounded">
                  <xs:complexType>
                    <xs:sequence>
                      <xs:element name="codigo" type="xs:string"/>
                      <xs:element name="descripcion" type="xs:string"/>
                    </xs:sequence>
                  </xs:complexType>
                </xs:element>
              </xs:sequence>
            </xs:complexType>
          </xs:element>
        </xs:schema>
      `

      const result = parseXsdToTemplate(xsd)

      expect(result).toEqual({
        productos: {
          producto: [
            {
              codigo: null,
              descripcion: null
            }
          ]
        }
      })
    })

    it('should create array for maxOccurs > 1', () => {
      const xsd = `
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
          <xs:element name="lista">
            <xs:complexType>
              <xs:sequence>
                <xs:element name="item" type="xs:string" maxOccurs="5"/>
              </xs:sequence>
            </xs:complexType>
          </xs:element>
        </xs:schema>
      `

      const result = parseXsdToTemplate(xsd)

      expect(result).toEqual({
        lista: {
          item: [null]
        }
      })
    })
  })

  describe('Edge cases', () => {
    it('should return empty object for invalid XSD', () => {
      const xsd = 'not valid xml'

      const result = parseXsdToTemplate(xsd)

      expect(result).toEqual({})
    })

    it('should return empty object for empty string', () => {
      const result = parseXsdToTemplate('')

      expect(result).toEqual({})
    })

    it('should return empty object for non-string input', () => {
      const result = parseXsdToTemplate(null as any)

      expect(result).toEqual({})
    })

    it('should return empty object for XSD without root element', () => {
      const xsd = `
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
          <!-- No elements -->
        </xs:schema>
      `

      const result = parseXsdToTemplate(xsd)

      expect(result).toEqual({})
    })
  })

  describe('Built-in types', () => {
    it('should handle all built-in string types', () => {
      const xsd = `
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
          <xs:element name="data">
            <xs:complexType>
              <xs:sequence>
                <xs:element name="stringField" type="xs:string"/>
                <xs:element name="intField" type="xs:int"/>
                <xs:element name="longField" type="xs:long"/>
                <xs:element name="decimalField" type="xs:decimal"/>
                <xs:element name="booleanField" type="xs:boolean"/>
                <xs:element name="dateField" type="xs:date"/>
                <xs:element name="timeField" type="xs:time"/>
                <xs:element name="dateTimeField" type="xs:dateTime"/>
              </xs:sequence>
            </xs:complexType>
          </xs:element>
        </xs:schema>
      `

      const result = parseXsdToTemplate(xsd)

      expect(result).toEqual({
        data: {
          stringField: null,
          intField: null,
          longField: null,
          decimalField: null,
          booleanField: null,
          dateField: null,
          timeField: null,
          dateTimeField: null
        }
      })
    })

    it('should handle types without xs: prefix', () => {
      const xsd = `
        <schema xmlns="http://www.w3.org/2001/XMLSchema">
          <element name="persona">
            <complexType>
              <sequence>
                <element name="nombre" type="string"/>
                <element name="edad" type="integer"/>
              </sequence>
            </complexType>
          </element>
        </schema>
      `

      const result = parseXsdToTemplate(xsd)

      expect(result).toEqual({
        persona: {
          nombre: null,
          edad: null
        }
      })
    })
  })

  describe('Real-world examples', () => {
    it('should parse Deudor schema', () => {
      const xsd = `
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
          <xs:element name="Deudor">
            <xs:complexType>
              <xs:sequence>
                <xs:element name="ID" type="xs:integer"/>
                <xs:element name="Nombre" type="xs:string"/>
                <xs:element name="TipoDocumento" type="xs:string"/>
                <xs:element name="NumeroDocumento" type="xs:string"/>
                <xs:element name="Contactos">
                  <xs:complexType>
                    <xs:sequence>
                      <xs:element name="Contacto" maxOccurs="unbounded">
                        <xs:complexType>
                          <xs:sequence>
                            <xs:element name="Tipo" type="xs:string"/>
                            <xs:element name="Valor" type="xs:string"/>
                          </xs:sequence>
                        </xs:complexType>
                      </xs:element>
                    </xs:sequence>
                  </xs:complexType>
                </xs:element>
              </xs:sequence>
            </xs:complexType>
          </xs:element>
        </xs:schema>
      `

      const result = parseXsdToTemplate(xsd)

      expect(result).toEqual({
        Deudor: {
          ID: null,
          Nombre: null,
          TipoDocumento: null,
          NumeroDocumento: null,
          Contactos: {
            Contacto: [
              {
                Tipo: null,
                Valor: null
              }
            ]
          }
        }
      })
    })

    it('should parse Productos schema', () => {
      const xsd = `
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
          <xs:element name="raiz">
            <xs:complexType>
              <xs:sequence>
                <xs:element name="productos">
                  <xs:complexType>
                    <xs:sequence>
                      <xs:element name="producto" maxOccurs="unbounded">
                        <xs:complexType>
                          <xs:sequence>
                            <xs:element name="codigo" type="xs:string"/>
                            <xs:element name="descripcion" type="xs:string"/>
                          </xs:sequence>
                        </xs:complexType>
                      </xs:element>
                    </xs:sequence>
                  </xs:complexType>
                </xs:element>
              </xs:sequence>
            </xs:complexType>
          </xs:element>
        </xs:schema>
      `

      const result = parseXsdToTemplate(xsd)

      expect(result).toEqual({
        raiz: {
          productos: {
            producto: [
              {
                codigo: null,
                descripcion: null
              }
            ]
          }
        }
      })
    })
  })
})
