# Working with XmlParameter - Mutable Objects for XML Parameters

**NEW in v2.1.0** - The SDK now provides the `XmlParameter` class for working with XML parameters as mutable JavaScript objects with direct property access.

## 🎯 Why XmlParameter?

The `XmlParameter` class provides a superior developer experience when working with complex XML structures:

### Before (Plain Objects)
```typescript
const data = {
  raiz: {
    productos: {
      producto: []
    }
  }
}

data.raiz.productos.producto.push({ codigo: 'PROD001', descripcion: 'Producto 1' })

await sdk.process.start({
  parameters: [{
    name: 'pProductos',
    value: data,
    type: 'Xml',
    direction: 'In'
  }]
}, [], token)
```

### After (XmlParameter)
```typescript
const params = await sdk.process.getParametersAsObjects({
  processName: 'MyProcess',
  token
})

// Direct property access via Proxy
params.pProductos.raiz.productos.producto[0] = { codigo: 'PROD001', descripcion: 'Producto 1' }

// Send directly (auto-detected)
await sdk.process.start({
  processName: 'MyProcess',
  parameters: [params.pProductos]
}, [], token)
```

## ✨ Key Features

1. **Auto-template from XSD** - SDK parses XSD schema and generates object structure
2. **Direct property access** - Use Proxy for transparent property modification
3. **Auto-detection** - SDK recognizes XmlParameter instances and converts to XML
4. **Type safety** - Full TypeScript support
5. **Helper methods** - reset(), clone(), toJSON()
6. **100% compatible** - Works alongside existing object and XML string approaches

## 📋 Complete Example

```typescript
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'

function DeudorForm() {
  const sdk = useBizuitSDK()
  const [token] = useToken()

  const handleSubmit = async () => {
    // 1. Get parameters as XmlParameter objects
    const params = await sdk.process.getParametersAsObjects({
      processName: 'GestionDeudor',
      token
    })

    // 2. Fill data using direct property access
    params.pDeudor.Deudor.ID = 123
    params.pDeudor.Deudor.Nombre = 'Juan Perez'
    params.pDeudor.Deudor.TipoDocumento = 'DNI'
    params.pDeudor.Deudor.NumeroDocumento = '12345678'

    // 3. Add contacts (array)
    params.pDeudor.Deudor.Contactos.Contacto[0] = {
      Tipo: 'email',
      Valor: 'juan@example.com'
    }
    params.pDeudor.Deudor.Contactos.Contacto.push({
      Tipo: 'telefono',
      Valor: '+54 11 1234-5678'
    })

    // 4. Send to process (SDK auto-converts to XML)
    const result = await sdk.process.start({
      processName: 'GestionDeudor',
      parameters: [params.pDeudor]  // Auto-detected as XmlParameter
    }, [], token)

    console.log('Process completed:', result.instanceId)
  }

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>
}
```

## 🔧 API Reference

### getParametersAsObjects()

Returns XML parameters wrapped in `XmlParameter` instances.

```typescript
const params = await sdk.process.getParametersAsObjects({
  processName: string,
  version?: string,
  token: string
})

// Returns: Record<string, XmlParameter>
// Example: { pDeudor: XmlParameter, pProductos: XmlParameter }
```

**What it does:**
1. Calls `initialize()` to get process parameters
2. Filters XML parameters (type 2)
3. Parses XSD schema if available → generates object template
4. Returns `XmlParameter` instance for each XML parameter

### XmlParameter Class

```typescript
class XmlParameter {
  // Properties
  getName(): string
  getData(): any
  getDirection(): 'In' | 'Out' | 'InOut'

  // Methods
  toParameter(): IParameter
  reset(): void
  clone(): XmlParameter
  toJSON(): string

  // Static
  static isXmlParameter(obj: any): boolean
}
```

**Methods:**

- **`getName()`** - Returns parameter name (e.g., 'pDeudor')
- **`getData()`** - Returns raw data object
- **`getDirection()`** - Returns parameter direction
- **`toParameter()`** - Converts to IParameter format for ProcessService
- **`reset()`** - Resets data to original template
- **`clone()`** - Creates independent copy
- **`toJSON()`** - Returns JSON string representation
- **`isXmlParameter(obj)`** - Type guard for auto-detection

### Direct Property Access (Proxy)

The `XmlParameter` class uses a JavaScript Proxy to provide transparent property access:

```typescript
const param = new XmlParameter('pData', { raiz: { nombre: null } })

// Read properties
console.log(param.raiz.nombre)  // null

// Write properties
param.raiz.nombre = 'Juan'

// Access internal methods
console.log(param.getName())  // 'pData'
param.reset()  // Resets to original template
```

## 🎨 Advanced Usage

### Working with Arrays

```typescript
const params = await sdk.process.getParametersAsObjects({
  processName: 'ProcessWithArrays',
  token
})

// XSD schema generated array template: producto: [{ codigo: null, descripcion: null }]

// Add items
params.pProductos.raiz.productos.producto[0] = { codigo: 'PROD001', descripcion: 'Producto 1' }
params.pProductos.raiz.productos.producto.push({ codigo: 'PROD002', descripcion: 'Producto 2' })
params.pProductos.raiz.productos.producto.push({ codigo: 'PROD003', descripcion: 'Producto 3' })

// Array methods work normally
const total = params.pProductos.raiz.productos.producto.length  // 3
```

### Resetting Changes

```typescript
const params = await sdk.process.getParametersAsObjects({ processName: 'MyProcess', token })

// Make changes
params.pDeudor.Deudor.Nombre = 'Juan'
params.pDeudor.Deudor.Contactos.Contacto[0] = { Tipo: 'email', Valor: 'juan@example.com' }

// Reset to original template
params.pDeudor.reset()

console.log(params.pDeudor.Deudor.Nombre)  // null (original value)
console.log(params.pDeudor.Deudor.Contactos.Contacto)  // [] (empty array)
```

### Cloning Parameters

```typescript
const params = await sdk.process.getParametersAsObjects({ processName: 'MyProcess', token })

params.pDeudor.Deudor.Nombre = 'Juan'

// Create independent copy
const copy = params.pDeudor.clone()
copy.Deudor.Nombre = 'Pedro'

console.log(params.pDeudor.Deudor.Nombre)  // 'Juan' (unchanged)
console.log(copy.Deudor.Nombre)  // 'Pedro'
```

### Manual Creation (Advanced)

If you don't have XSD schema or want to create templates manually:

```typescript
import { XmlParameter } from '@tyconsa/bizuit-form-sdk'

// Define template manually
const template = {
  Deudor: {
    ID: null,
    Nombre: null,
    Contactos: {
      Contacto: []
    }
  }
}

const param = new XmlParameter('pDeudor', template, 'In')

// Use normally
param.Deudor.Nombre = 'Juan'
param.Deudor.Contactos.Contacto.push({ Tipo: 'email', Valor: 'juan@example.com' })

// Convert to IParameter
const iParam = param.toParameter()
```

## 🔄 Integration with Process Service

The SDK automatically detects `XmlParameter` instances in `start()` and `continue()`:

```typescript
// 1. Get parameters as objects
const params = await sdk.process.getParametersAsObjects({ processName: 'MyProcess', token })

// 2. Fill data
params.pSampleXml.raiz.nodo1 = 'value1'

// 3. SDK auto-detects XmlParameter and converts to XML
await sdk.process.start({
  processName: 'MyProcess',
  parameters: [params.pSampleXml]  // ← XmlParameter instance
}, [], token)

// Behind the scenes:
// 1. ProcessService checks: XmlParameter.isXmlParameter(param)
// 2. Calls: param.toParameter() → IParameter
// 3. Calls: jsonToXml(iParam.value) → XML string
// 4. Sends XML to Bizuit API
```

## 📊 Comparison: Three Approaches

The SDK supports three approaches for XML parameters:

| Feature | XML String | Plain Object | XmlParameter |
|---------|-----------|--------------|--------------|
| Type Safety | ❌ | ✅ | ✅ |
| IntelliSense | ❌ | ✅ | ✅ |
| XSD Auto-template | ❌ | ❌ | ✅ |
| Direct Property Access | ❌ | ✅ | ✅ |
| Helper Methods | ❌ | ❌ | ✅ (reset, clone, toJSON) |
| Manual Setup | Complex | Easy | None (auto-generated) |
| Best For | Legacy code | Simple cases | Complex schemas |

### When to Use Each

**XML String (Legacy)**
```typescript
// Use when: Migrating old code, have pre-built XML
await sdk.process.start({
  parameters: [{
    name: 'pData',
    value: '<raiz><nombre>Juan</nombre></raiz>',
    type: 'Xml'
  }]
}, [], token)
```

**Plain Object**
```typescript
// Use when: Simple schema, one-time usage
await sdk.process.start({
  parameters: [{
    name: 'pData',
    value: { raiz: { nombre: 'Juan' } },
    type: 'Xml'
  }]
}, [], token)
```

**XmlParameter (Recommended)**
```typescript
// Use when: Complex schema, multiple modifications, XSD available
const params = await sdk.process.getParametersAsObjects({ processName: 'MyProcess', token })
params.pData.raiz.nombre = 'Juan'
await sdk.process.start({
  parameters: [params.pData]
}, [], token)
```

## 🐛 Troubleshooting

### "No template generated from XSD"

**Problem:** XSD schema is not available or failed to parse

**Solution:**
```typescript
// Check if XSD is available
const processData = await sdk.process.initialize({ processName: 'MyProcess', token })
console.log(processData.parameters[0].schema)  // Should have XSD string

// If no XSD, create template manually
const template = { /* your structure */ }
const param = new XmlParameter('pData', template, 'In')
```

### "Property not accessible via Proxy"

**Problem:** Trying to access internal properties

**Solution:**
```typescript
// ❌ Don't access internal properties directly
console.log(param._data)

// ✅ Use getter methods
console.log(param.getData())
console.log(param.getName())
```

### "Changes not reflected in toParameter()"

**Problem:** Modifying cloned object affects original

**Solution:**
```typescript
// The Proxy ensures changes are isolated
const param1 = await sdk.process.getParametersAsObjects({ processName: 'MyProcess', token }).pData
const param2 = param1.clone()  // ← Use clone() for independent copy

param2.raiz.nombre = 'Pedro'
console.log(param1.raiz.nombre)  // Original unchanged
```

## 📚 Further Reading

- [XmlParameter Examples](./EXAMPLES_XMLPARAMETER.md) - 6 real-world usage examples
- [SDK Documentation](./README.md) - Full SDK reference

## 🎨 Advanced Features (Phase 2)

### merge() - Merge Data

Combine data from multiple sources:

```typescript
const param = new XmlParameter('pData', {
  raiz: { nombre: null, edad: null, ciudad: null }
})

param.merge({ raiz: { nombre: 'Juan', edad: 30 } })
// Result: { raiz: { nombre: 'Juan', edad: 30, ciudad: null } }

// Shallow merge
param.merge({ raiz: { ciudad: 'Buenos Aires' } }, false)
```

### validate() - Check Required Fields

Validate that all fields are filled:

```typescript
const param = new XmlParameter('pData', {
  raiz: { nombre: null, edad: 30 }
})

param.raiz.nombre = 'Juan'
const missing = param.validate()
// Returns: [] (all filled)

param.raiz.nombre = null
const missing2 = param.validate()
// Returns: ['raiz.nombre']
```

### fillFrom() - Map Form Data

Map form data to parameter structure:

```typescript
const param = new XmlParameter('pDeudor', {
  Deudor: { ID: null, Nombre: null, Contactos: { Contacto: [] } }
})

param.fillFrom(
  { id: 123, nombre: 'Juan', email: 'juan@example.com' },
  {
    id: 'Deudor.ID',
    nombre: 'Deudor.Nombre',
    email: 'Deudor.Contactos.Contacto[0].Valor'
  }
)
```

### getByPath() / setByPath() - Access by Path

Work with deep nested structures using dot notation:

```typescript
const param = new XmlParameter('pProductos', {})

// Set using path
param.setByPath('raiz.productos.producto[0].codigo', 'PROD001')
param.setByPath('raiz.productos.producto[0].descripcion', 'Producto 1')

// Get using path
const codigo = param.getByPath('raiz.productos.producto[0].codigo')
// Returns: 'PROD001'
```

### Real-World Form Example with Validation

```typescript
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'
import { useState } from 'react'

function DeudorForm({ formData, onSubmit }) {
  const sdk = useBizuitSDK()
  const [token] = useToken()
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Get parameters as XmlParameter objects
    const params = await sdk.process.getParametersAsObjects({
      processName: 'GestionDeudor',
      token
    })

    // Fill from form data with mapping
    params.pDeudor.fillFrom(formData, {
      id: 'Deudor.ID',
      nombre: 'Deudor.Nombre',
      tipoDoc: 'Deudor.TipoDocumento',
      nroDoc: 'Deudor.NumeroDocumento',
      email: 'Deudor.Contactos.Contacto[0].Valor',
      telefono: 'Deudor.Contactos.Contacto[1].Valor'
    })

    // Set contact types
    params.pDeudor.setByPath('Deudor.Contactos.Contacto[0].Tipo', 'email')
    params.pDeudor.setByPath('Deudor.Contactos.Contacto[1].Tipo', 'telefono')

    // Validate before sending
    const missing = params.pDeudor.validate()
    if (missing.length > 0) {
      setErrors(missing)
      alert(`Faltan campos: ${missing.join(', ')}`)
      return
    }

    // Send to process
    const result = await sdk.process.start({
      processName: 'GestionDeudor',
      parameters: [params.pDeudor]
    }, [], token)

    onSubmit(result)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      {errors.length > 0 && (
        <div className="errors">
          <h3>Campos requeridos:</h3>
          <ul>
            {errors.map(field => <li key={field}>{field}</li>)}
          </ul>
        </div>
      )}
      <button type="submit">Enviar</button>
    </form>
  )
}
```

## 💡 Tips & Best Practices

1. **Always use getParametersAsObjects() when XSD is available** - Gets auto-generated templates
2. **Use reset() during form validation** - Clear form data easily
3. **Use clone() for multi-step forms** - Save state at each step
4. **Use validate() before sending** - Ensure all required fields are filled
5. **Use fillFrom() for complex mappings** - Map form fields to XML structure
6. **Use setByPath() for arrays** - Easier than manual array manipulation
7. **Leverage TypeScript** - Full type safety with proper interfaces
8. **Check console logs** - SDK logs conversion steps for debugging

---

**Version:** 2.1.0+ (Phase 2)
**Status:** Stable
**Backward Compatible:** Yes (100%)
