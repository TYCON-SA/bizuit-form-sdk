/**
 * XML to JSON Converter (bidirectional)
 * Automatically converts between XML strings and JavaScript objects
 * Used by process-service to parse/serialize XML parameters
 */

/**
 * Converts a tag name to camelCase
 * Example: "DatosPersonales" -> "datosPersonales"
 * Example: "ID" -> "id"
 * Example: "IDPersonal" -> "idPersonal"
 */
function toCamelCase(str: string): string {
  if (!str) return str

  // If the entire string is uppercase (like "ID"), convert to lowercase
  if (str === str.toUpperCase()) {
    return str.toLowerCase()
  }

  // If string starts with multiple uppercase letters (like "IDPersonal"),
  // convert them to lowercase except the last one which starts the next word
  // IDPersonal -> idPersonal
  // IOError -> ioError
  const match = str.match(/^([A-Z]+)([A-Z][a-z].*)$/)
  if (match) {
    return match[1].toLowerCase() + match[2]
  }

  // Default case: just lowercase the first character
  return str.charAt(0).toLowerCase() + str.slice(1)
}

/**
 * Recursively converts an XML node to a JavaScript object
 * Handles:
 * - Text content
 * - Nested elements
 * - Multiple children with same tag name (converted to arrays)
 * - Converts tag names to camelCase
 */
function xmlNodeToJson(node: Element): any {
  const obj: any = {}

  // Get all child elements (excluding text nodes, comments, etc.)
  const children = Array.from(node.children)

  // If no children, return text content
  if (children.length === 0) {
    const textContent = node.textContent?.trim() || ''
    return textContent
  }

  // Group children by tag name
  const childrenByTag = new Map<string, Element[]>()

  children.forEach(child => {
    const tagName = toCamelCase(child.tagName)
    if (!childrenByTag.has(tagName)) {
      childrenByTag.set(tagName, [])
    }
    childrenByTag.get(tagName)!.push(child)
  })

  // Convert each group to JSON
  childrenByTag.forEach((elements, tagName) => {
    if (elements.length === 1) {
      // Single child - convert to object
      obj[tagName] = xmlNodeToJson(elements[0])
    } else {
      // Multiple children with same name - convert to array
      obj[tagName] = elements.map(el => xmlNodeToJson(el))
    }
  })

  return obj
}

/**
 * Converts an XML string to a JavaScript object
 *
 * @param xmlString - The XML string to parse
 * @returns JavaScript object representation of the XML, or null on error
 *
 * @example
 * ```typescript
 * const xml = `
 *   <Deudor>
 *     <DatosPersonales>
 *       <ID>75</ID>
 *       <Nombre>John Doe</Nombre>
 *     </DatosPersonales>
 *     <Contactos>
 *       <Contacto><ID>1</ID></Contacto>
 *       <Contacto><ID>2</ID></Contacto>
 *     </Contactos>
 *   </Deudor>
 * `
 *
 * const result = xmlToJson(xml)
 * // {
 * //   deudor: {
 * //     datosPersonales: {
 * //       id: "75",
 * //       nombre: "John Doe"
 * //     },
 * //     contactos: {
 * //       contacto: [
 * //         { id: "1" },
 * //         { id: "2" }
 * //       ]
 * //     }
 * //   }
 * // }
 * ```
 */
export function xmlToJson(xmlString: string): any | null {
  try {
    // Parse XML string
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml')

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror')
    if (parserError) {
      console.error('XML parsing error:', parserError.textContent)
      return null
    }

    // Get root element
    const rootElement = xmlDoc.documentElement
    if (!rootElement) {
      console.error('No root element found in XML')
      return null
    }

    // Convert root element to JSON
    const rootTagName = toCamelCase(rootElement.tagName)
    const result = {
      [rootTagName]: xmlNodeToJson(rootElement)
    }

    return result
  } catch (error) {
    console.error('Error converting XML to JSON:', error)
    return null
  }
}

/**
 * Converts a JavaScript object to an XML string
 * This is the inverse operation of xmlToJson()
 *
 * @param obj - The JavaScript object to convert
 * @param options - Conversion options
 * @returns XML string representation of the object
 *
 * @example
 * ```typescript
 * const obj = {
 *   raiz: {
 *     nombre: "Test",
 *     productos: {
 *       producto: [
 *         { codigo: "PROD001", descripcion: "Producto 1" },
 *         { codigo: "PROD002", descripcion: "Producto 2" }
 *       ]
 *     }
 *   }
 * }
 *
 * const xml = jsonToXml(obj)
 * // <raiz>
 * //   <nombre>Test</nombre>
 * //   <productos>
 * //     <producto>
 * //       <codigo>PROD001</codigo>
 * //       <descripcion>Producto 1</descripcion>
 * //     </producto>
 * //     <producto>
 * //       <codigo>PROD002</codigo>
 * //       <descripcion>Producto 2</descripcion>
 * //     </producto>
 * //   </productos>
 * // </raiz>
 * ```
 */
export function jsonToXml(
  obj: any,
  options: { indent?: number; currentIndent?: number } = {}
): string {
  const { indent = 2, currentIndent = 0 } = options

  try {
    // Handle null/undefined
    if (obj === null || obj === undefined) {
      return ''
    }

    // Handle primitive values
    if (typeof obj !== 'object') {
      return String(obj)
    }

    // Get the root key
    const keys = Object.keys(obj)
    if (keys.length === 0) {
      return ''
    }

    const rootKey = keys[0]
    const rootValue = obj[rootKey]

    // Build XML recursively
    return buildXmlNode(rootKey, rootValue, indent, currentIndent)
  } catch (error) {
    console.error('Error converting JSON to XML:', error)
    return ''
  }
}

/**
 * Recursively builds an XML node from a JavaScript value
 */
function buildXmlNode(
  tagName: string,
  value: any,
  indent: number,
  currentIndent: number
): string {
  const indentStr = ' '.repeat(currentIndent)
  const childIndentStr = ' '.repeat(currentIndent + indent)

  // Handle null/undefined
  if (value === null || value === undefined) {
    return `${indentStr}<${tagName}></${tagName}>`
  }

  // Handle primitive values (string, number, boolean)
  if (typeof value !== 'object') {
    return `${indentStr}<${tagName}>${escapeXml(String(value))}</${tagName}>`
  }

  // Handle arrays
  if (Array.isArray(value)) {
    // For arrays, each item gets the same tag name
    return value
      .map(item => buildXmlNode(tagName, item, indent, currentIndent))
      .join('\n')
  }

  // Handle objects
  const childKeys = Object.keys(value)

  if (childKeys.length === 0) {
    return `${indentStr}<${tagName}></${tagName}>`
  }

  const childNodes = childKeys
    .map(key => {
      const childValue = value[key]
      return buildXmlNode(key, childValue, indent, currentIndent + indent)
    })
    .join('\n')

  return `${indentStr}<${tagName}>\n${childNodes}\n${indentStr}</${tagName}>`
}

/**
 * Escapes special XML characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
