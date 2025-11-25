/**
 * XML to JSON Converter
 * Automatically converts XML strings to JavaScript objects
 * Used by process-service to parse XML parameters
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
