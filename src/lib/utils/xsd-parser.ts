/**
 * XSD Schema Parser
 *
 * Parses XSD (XML Schema Definition) and generates JavaScript object templates
 * for use with XmlParameter class.
 *
 * @example
 * ```typescript
 * const xsd = `
 *   <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
 *     <xs:element name="deudor">
 *       <xs:complexType>
 *         <xs:sequence>
 *           <xs:element name="id" type="xs:integer"/>
 *           <xs:element name="nombre" type="xs:string"/>
 *         </xs:sequence>
 *       </xs:complexType>
 *     </xs:element>
 *   </xs:schema>
 * `
 *
 * const template = parseXsdToTemplate(xsd)
 * // Result: { deudor: { id: null, nombre: null } }
 * ```
 */

/**
 * Parses an XSD schema string and generates a JavaScript object template
 *
 * @param xsdString - XSD schema as string
 * @returns JavaScript object template representing the schema structure
 */
export function parseXsdToTemplate(xsdString: string): any {
  if (!xsdString || typeof xsdString !== 'string') {
    console.warn('Invalid XSD string provided')
    return {}
  }

  try {
    // Parse XML
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xsdString, 'text/xml')

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror')
    if (parserError) {
      console.error('XSD parsing error:', parserError.textContent)
      return {}
    }

    // Find root element definition
    const rootElement = xmlDoc.querySelector('schema > element, xs\\:schema > xs\\:element')
    if (!rootElement) {
      console.warn('No root element found in XSD')
      return {}
    }

    // Parse the root element
    const rootName = rootElement.getAttribute('name')
    if (!rootName) {
      console.warn('Root element has no name')
      return {}
    }

    const rootValue = parseElement(rootElement, xmlDoc)

    return { [rootName]: rootValue }
  } catch (error) {
    console.error('Error parsing XSD:', error)
    return {}
  }
}

/**
 * Parses an xs:element node
 */
function parseElement(element: Element, xmlDoc: Document): any {
  const elementType = element.getAttribute('type')
  const minOccurs = element.getAttribute('minOccurs')
  const maxOccurs = element.getAttribute('maxOccurs')

  // Check if it's an array (maxOccurs > 1 or unbounded)
  const isArray = maxOccurs === 'unbounded' || (maxOccurs && parseInt(maxOccurs, 10) > 1)

  // If element has inline complexType
  const complexType = element.querySelector(':scope > complexType, :scope > xs\\:complexType')
  if (complexType) {
    const value = parseComplexType(complexType, xmlDoc)
    return isArray ? [value] : value
  }

  // If element references a type
  if (elementType) {
    const value = parseType(elementType, xmlDoc)
    return isArray ? [value] : value
  }

  // Simple element with no type (default to null)
  return isArray ? [] : null
}

/**
 * Parses an xs:complexType node
 */
function parseComplexType(complexType: Element, xmlDoc: Document): any {
  const result: any = {}

  // Handle xs:sequence
  const sequence = complexType.querySelector(':scope > sequence, :scope > xs\\:sequence')
  if (sequence) {
    const elements = sequence.querySelectorAll(':scope > element, :scope > xs\\:element')
    elements.forEach(el => {
      const name = el.getAttribute('name')
      if (name) {
        result[name] = parseElement(el, xmlDoc)
      }
    })
    return result
  }

  // Handle xs:all
  const all = complexType.querySelector(':scope > all, :scope > xs\\:all')
  if (all) {
    const elements = all.querySelectorAll(':scope > element, :scope > xs\\:element')
    elements.forEach(el => {
      const name = el.getAttribute('name')
      if (name) {
        result[name] = parseElement(el, xmlDoc)
      }
    })
    return result
  }

  // Handle xs:choice (pick first option as default)
  const choice = complexType.querySelector(':scope > choice, :scope > xs\\:choice')
  if (choice) {
    const firstElement = choice.querySelector(':scope > element, :scope > xs\\:element')
    if (firstElement) {
      const name = firstElement.getAttribute('name')
      if (name) {
        result[name] = parseElement(firstElement, xmlDoc)
      }
    }
    return result
  }

  return result
}

/**
 * Parses a type reference (xs:string, xs:integer, custom types, etc.)
 */
function parseType(typeName: string, xmlDoc: Document): any {
  // Handle built-in XML Schema types
  const builtInTypes: Record<string, any> = {
    'xs:string': null,
    'xs:integer': null,
    'xs:int': null,
    'xs:long': null,
    'xs:short': null,
    'xs:byte': null,
    'xs:decimal': null,
    'xs:float': null,
    'xs:double': null,
    'xs:boolean': null,
    'xs:date': null,
    'xs:time': null,
    'xs:dateTime': null,
    'string': null,
    'integer': null,
    'int': null,
    'long': null,
    'short': null,
    'byte': null,
    'decimal': null,
    'float': null,
    'double': null,
    'boolean': null,
    'date': null,
    'time': null,
    'dateTime': null
  }

  // Check if it's a built-in type
  if (typeName in builtInTypes) {
    return builtInTypes[typeName]
  }

  // Look for custom type definition
  const typeDefinition = xmlDoc.querySelector(
    `complexType[name="${typeName}"], xs\\:complexType[name="${typeName}"]`
  )

  if (typeDefinition) {
    return parseComplexType(typeDefinition, xmlDoc)
  }

  // Default: return null for unknown types
  return null
}

/**
 * Simplified XSD parser for common use cases
 *
 * This is a basic implementation that handles:
 * - Simple elements with built-in types
 * - Complex types with sequences
 * - Arrays (maxOccurs > 1 or unbounded)
 * - Nested structures
 *
 * Limitations:
 * - Does not handle XML attributes
 * - Does not handle xs:restriction, xs:extension
 * - Does not handle xs:union, xs:list
 * - Does not handle recursive types
 * - Does not validate against the schema
 *
 * For advanced schema parsing, consider using a dedicated XSD parser library.
 */
