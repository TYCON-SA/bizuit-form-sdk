# @bizuit/form-sdk

Core SDK for Bizuit BPM form integration. Provides authentication, process management, and instance locking capabilities for building custom forms that interact with Bizuit BPM.

## Features

- ✅ **Authentication & Authorization** - Token validation, user info, permission checks
- ✅ **Process Management** - Initialize, start and continue processes, handle parameters
- ✅ **Flexible File Uploads** - Upload from multiple sources: Base64, Blob, ArrayBuffer, File (v2.4.0+)
  - 📷 Base64 strings (camera, canvas, data URLs)
  - 🎨 Blob objects (canvas.toBlob, fetch responses)
  - 📦 ArrayBuffer (binary data, WebSocket)
  - 📂 Browser File objects (traditional inputs)
- ✅ **Instance Locking** - Pessimistic locking for concurrent access control
- ✅ **DataService Queries** - Fetch lookup data, lists, and reports from BIZUIT Dashboard (v2.2.0+)
- ✅ **Task List Management** - Retrieve user tasks based on BPM permissions with flattened JSON (v2.3.0+)
- ✅ **TypeScript Support** - Full type safety with TypeScript definitions
- ✅ **React Hooks** - Easy integration with React applications
- ✅ **Server-Side Support** - Works in Next.js API routes, server components, and Node.js (v1.5.0+)
- ✅ **Simplified Configuration** - Single `apiUrl` parameter instead of separate endpoints (v2.0.0+)
- ✅ **Complex Parameters** - Handle scalar and complex (JSON/XML) parameters
- ✅ **Automatic XML Conversion** - Pass JavaScript objects for XML parameters, auto-converted to XML (v2.1.0+)
- ✅ **Error Handling** - Comprehensive error handling and logging

## Installation

```bash
npm install @tyconsa/bizuit-form-sdk
# or
yarn add @tyconsa/bizuit-form-sdk
# or
pnpm add @tyconsa/bizuit-form-sdk
```

## 🚀 Quick Start: Client-Side vs Server-Side

### Client-Side (React Components)

Use the default export for React components with hooks:

```typescript
'use client'

import { useBizuitSDK, buildParameters } from '@tyconsa/bizuit-form-sdk'
import type { IBizuitProcessParameter } from '@tyconsa/bizuit-form-sdk'

export function ContactForm() {
  const sdk = useBizuitSDK()
  const [formData, setFormData] = useState({ name: '', email: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()

    const parameters = buildParameters(
      {
        name: { parameterName: 'Nombre' },
        email: { parameterName: 'Email' }
      },
      formData
    )

    const result = await sdk.process.start({
      processName: 'ContactoInicial',
      parameters
    })

    console.log('Process started:', result.instanceId)
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### Server-Side (Next.js API Routes, Node.js)

Use the `/core` export for server-side code (API routes, server components):

```typescript
// app/api/bizuit/start-process/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { BizuitSDK } from '@tyconsa/bizuit-form-sdk/core'  // ⭐ Use /core

export async function POST(request: NextRequest) {
  const { processName, parameters } = await request.json()

  // Initialize SDK (no React dependencies)
  const sdk = new BizuitSDK({
    apiUrl: process.env.BIZUIT_API_URL!,
    
  })

  // Authenticate
  const authString = `${process.env.BIZUIT_USER}:${process.env.BIZUIT_PASSWORD}`
  const base64Auth = Buffer.from(authString).toString('base64')

  const loginResponse = await fetch(`${process.env.BIZUIT_DASHBOARD_API_URL}/Login`, {
    headers: { 'Authorization': `Basic ${base64Auth}` }
  })

  const loginData = await loginResponse.json()
  const token = `Basic ${loginData.token}`

  // Start process
  const result = await sdk.process.start(
    { processName, parameters },
    undefined,
    token
  )

  return NextResponse.json({
    success: true,
    instanceId: result.instanceId
  })
}
```

### Key Differences

| Import Path | Use When | Includes React Hooks |
|-------------|----------|---------------------|
| `@tyconsa/bizuit-form-sdk` | React components (`'use client'`) | ✅ Yes |
| `@tyconsa/bizuit-form-sdk/core` | API routes, server components, Node.js | ❌ No (server-safe) |

**Why two entry points?**

The main export includes React hooks that use `createContext`, which causes errors in Next.js 15+ API routes and server components. The `/core` export excludes React dependencies, making it safe for server-side use.

For more details, see [SERVER-SIDE-USAGE.md](./SERVER-SIDE-USAGE.md).

## Form Implementation Strategies

There are **three main approaches** to building forms with Bizuit BPM. Choose the one that best fits your needs:

### Strategy 1: Dynamic Fields from API 🔄

**Best for:** Generic forms, prototypes, unknown parameters

```typescript
// Auto-generate fields from API
const params = await sdk.process.getParameters('ProcessName', '', token)

// Render fields dynamically
{params.map(param => (
  <DynamicFormField
    key={param.name}
    parameter={param}
    value={formData[param.name]}
    onChange={(val) => setFormData({...formData, [param.name]: val})}
  />
))}

// Send ALL fields
const parameters = formDataToParameters(formData)
await sdk.process.start({ processName: 'ProcessName', parameters }, undefined, token)
```

✅ **Pros:** No code changes for new parameters, fast development
❌ **Cons:** Less control over UI, sends all fields

---

### Strategy 2: Manual Fields + Send All 📝

**Best for:** Custom UI, simple forms

```typescript
// Define form state
const [formData, setFormData] = useState({
  pEmpleado: '',
  pMonto: '',
  pCategoria: ''
})

// Create inputs manually
<input
  value={formData.pEmpleado}
  onChange={(e) => setFormData({...formData, pEmpleado: e.target.value})}
/>

// Send ALL fields
const parameters = formDataToParameters(formData)
await sdk.process.start({ processName, parameters }, undefined, token)
```

✅ **Pros:** Full UI control, custom validations
❌ **Cons:** Sends all fields even if not needed

---

### Strategy 3: Manual Fields + Selective Mapping ⭐ **RECOMMENDED**

**Best for:** Production apps, selective field sending, value transformations

```typescript
const [formData, setFormData] = useState({
  empleado: '',      // Will be sent
  monto: '',         // Will be sent
  comentarios: ''    // Won't be sent (not in mapping)
})

// Define selective mapping
const mapping = {
  'empleado': {
    parameterName: 'pEmpleado',
    transform: (val) => val.toUpperCase()
  },
  'monto': {
    parameterName: 'pMonto',
    transform: (val) => parseFloat(val).toFixed(2)
  }
  // 'comentarios' not included - won't be sent
}

// Send ONLY mapped fields with transformations
const parameters = buildParameters(mapping, formData)
await sdk.process.start({ processName, parameters }, undefined, token)
```

✅ **Pros:** Full control, selective sending, value transformations, better performance
❌ **Cons:** More initial setup

**🎯 This is the BEST PRACTICE for production applications.**

[See full examples →](https://github.com/TYCON-SA/bizuit-custom-form-sample/tree/main/example/app)

---

## Hidden/Calculated Parameters Pattern 🔒

In real-world applications, you often need to send **additional parameters** that users don't see or edit. These can be:

- **System metadata** (timestamps, user IDs, session info)
- **Calculated values** (totals, derived fields, business logic results)
- **Security tokens** (auth tokens, CSRF tokens)
- **Audit trail** (IP address, browser info)

### Pattern: Visible + Hidden Parameters

```typescript
// User fills visible fields
const [formData, setFormData] = useState({
  pEmpleado: '',
  pMonto: '',
  pCategoria: '',
})

// Calculate hidden parameters on submit
const handleSubmit = async (e) => {
  e.preventDefault()

  // Visible parameters (from form)
  const visibleParams = formDataToParameters(formData)

  // Hidden/calculated parameters (not in form)
  const hiddenParams = [
    { name: 'submittedBy', value: currentUser.id, direction: 'In', type: 'SingleValue' },
    { name: 'submittedAt', value: new Date().toISOString(), direction: 'In', type: 'SingleValue' },
    { name: 'montoConIVA', value: (parseFloat(formData.pMonto) * 1.21).toFixed(2), direction: 'In', type: 'SingleValue' },
    { name: 'esMontoAlto', value: parseFloat(formData.pMonto) > 10000, direction: 'In', type: 'SingleValue' },
    { name: 'clientIP', value: await getClientIP(), direction: 'In', type: 'SingleValue' },
  ]

  // Combine visible + hidden
  const allParameters = [...visibleParams, ...hiddenParams]

  // Send to Bizuit
  await sdk.process.start({ processName: 'SolicitudGasto', parameters: allParameters }, undefined, token)

  console.log(`Total: ${allParameters.length} parameters`)
  console.log(`- Visible: ${visibleParams.length}`)
  console.log(`- Hidden: ${hiddenParams.length}`)
}
```

### With Selective Mapping (Recommended)

Combine selective mapping with hidden parameters for maximum control:

```typescript
// Define visible field mapping
const mapping = {
  'empleado': { parameterName: 'pEmpleado', transform: (v) => v.toUpperCase() },
  'monto': { parameterName: 'pMonto', transform: (v) => parseFloat(v).toFixed(2) },
  'categoria': { parameterName: 'pCategoria' },
}

const handleSubmit = async () => {
  // Build visible parameters (selective)
  const visibleParams = buildParameters(mapping, formData)

  // Add hidden/calculated parameters
  const hiddenParams = [
    { name: 'vSubmittedBy', value: user.id, direction: 'In', type: 'SingleValue', isVariable: true },
    { name: 'vTimestamp', value: Date.now(), direction: 'In', type: 'SingleValue', isVariable: true },
    { name: 'pMontoTotal', value: calculateTotal(formData.monto), direction: 'In', type: 'SingleValue' },
  ]

  // Send both
  await sdk.process.start({
    eventName: 'Proceso',
    parameters: [...visibleParams, ...hiddenParams]
  }, undefined, token)
}
```

### Using Variables vs Parameters

Bizuit BPM distinguishes between **Parameters** and **Variables**:

```typescript
// Parameter (starts with 'p')
{
  name: 'pEmpleado',
  value: 'John Doe',
  direction: 'In',
  type: 'SingleValue',
  isSystemParameter: false
}

// Variable (starts with 'v')
{
  name: 'vUserId',
  value: '12345',
  direction: 'In',
  type: 'SingleValue',
  isSystemParameter: true  // Variables are system parameters
}
```

**When to use Variables:**
- Audit trail data (user IDs, timestamps)
- Internal system state
- Security/auth tokens
- Process metadata

**When to use Parameters:**
- Business data from user input
- Calculated business values
- Data that flows through process activities

### Complete Example with Modal Preview

Show users what will be sent (visible + hidden):

```typescript
const [showModal, setShowModal] = useState(false)
const [paramsToSend, setParamsToSend] = useState({ visible: [], hidden: [], all: [] })

const handleSubmit = async (e) => {
  e.preventDefault()

  // Build visible parameters
  const visibleParams = buildParameters(mapping, formData)

  // Build hidden parameters
  const hiddenParams = [
    { name: 'submittedBy', value: user.email },
    { name: 'submittedAt', value: new Date().toISOString() },
    { name: 'montoConIVA', value: (parseFloat(formData.pMonto) * 1.21).toFixed(2) },
  ]

  // Combine
  const allParams = [...visibleParams, ...hiddenParams]

  // Show modal with preview
  setParamsToSend({
    visible: visibleParams,
    hidden: hiddenParams,
    all: allParams
  })
  setShowModal(true)
}

const confirmSubmit = async () => {
  try {
    const result = await sdk.process.start({
      eventName: 'SolicitudGasto',
      parameters: paramsToSend.all
    }, undefined, token)

    alert(`Process started! Instance ID: ${result.instanceId}`)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    setShowModal(false)
  }
}

return (
  <>
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit">Submit</button>
    </form>

    {/* Modal showing visible + hidden parameters */}
    {showModal && (
      <div className="modal">
        <h3>Parameters to be sent to Bizuit</h3>

        <div>
          <h4>👁️ Visible Parameters ({paramsToSend.visible.length}):</h4>
          {paramsToSend.visible.map(p => (
            <div key={p.name}>{p.name}: {JSON.stringify(p.value)}</div>
          ))}
        </div>

        <div>
          <h4>🔒 Hidden/Calculated Parameters ({paramsToSend.hidden.length}):</h4>
          {paramsToSend.hidden.map(p => (
            <div key={p.name}>{p.name}: {JSON.stringify(p.value)}</div>
          ))}
        </div>

        <p>Total: {paramsToSend.all.length} parameters</p>

        <button onClick={confirmSubmit}>Confirm & Send</button>
        <button onClick={() => setShowModal(false)}>Cancel</button>
      </div>
    )}
  </>
)
```

[See live example →](https://github.com/TYCON-SA/bizuit-custom-form-sample/tree/main/example/app/example-2-manual-all)

---

## Working with XML Parameters ✨ NEW in v2.1.0

The SDK now automatically converts JavaScript objects to XML for parameters with `type: 'Xml'`. This makes working with complex XML structures much easier and less error-prone.

### BEFORE (Manual XML Construction) ❌

```typescript
const xmlData = `<raiz>
  <productos>
    <producto>
      <codigo>PROD001</codigo>
      <descripcion>Producto 1</descripcion>
    </producto>
  </productos>
</raiz>`

await sdk.process.start({
  processName: 'MyProcess',
  parameters: [{
    name: 'xmlParam',
    value: xmlData,  // XML string
    type: 'Xml',
    direction: 'In'
  }]
}, [], token)
```

### AFTER (Object-Based) ✅

```typescript
const productosData = {
  raiz: {
    productos: {
      producto: [
        { codigo: 'PROD001', descripcion: 'Producto 1' },
        { codigo: 'PROD002', descripcion: 'Producto 2' }
      ]
    }
  }
}

await sdk.process.start({
  processName: 'MyProcess',
  parameters: [{
    name: 'xmlParam',
    value: productosData,  // JavaScript object!
    type: 'Xml',
    direction: 'In'
  }]
}, [], token)
// SDK automatically converts to XML! ✨
```

### Benefits

1. **Type Safety** - Work with typed objects instead of strings
2. **IntelliSense** - Get autocomplete in your IDE
3. **Less Errors** - No XML syntax mistakes
4. **Easier Testing** - Test with objects, not XML strings
5. **Symmetrical** - Input and output both use objects
6. **Backward Compatible** - XML strings still work

### Real-World Example

```typescript
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'

function DeudorForm({ formData }) {
  const sdk = useBizuitSDK()
  const [token] = useToken()

  const handleSubmit = async () => {
    // Build XML parameter from form data
    const deudorData = {
      deudor: {
        datosPersonales: {
          id: formData.id,
          nombre: formData.nombre,
          tipoDocumento: formData.tipoDoc,
          numeroDocumento: formData.nroDoc
        },
        contactos: {
          contacto: formData.contactos.map(c => ({
            tipo: c.tipo,
            valor: c.valor
          }))
        }
      }
    }

    // Invoke process with object
    const result = await sdk.process.start({
      processName: 'GestionDeudor',
      parameters: [
        {
          name: 'pDeudor',
          value: deudorData,  // Object, not XML!
          type: 'Xml',
          direction: 'In'
        }
      ]
    }, [], token)

    // Process output parameters (already converted to objects)
    const outputData = result.parameters.find(p => p.name === 'pResultado')
    if (outputData && outputData.parameterType === 'Json') {
      console.log(outputData.value.resultado.mensaje)  // Access as object
    }
  }

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>
}
```

### NEW in v2.1.0: XmlParameter - Work with XML as Mutable Objects

Instead of building XML strings manually, use the `XmlParameter` class for a superior developer experience:

```typescript
import { XmlParameter, parseXsdToTemplate } from '@tyconsa/bizuit-form-sdk'

// Method 1: Using getParametersAsObjects() (recommended if Initialize endpoint available)
const params = await sdk.process.getParametersAsObjects({
  processName: 'MyProcess',
  token
})

// Direct property access via Proxy
params.pProductos.raiz.productos.producto[0] = {
  codigo: 'PROD001',
  descripcion: 'Producto 1'
}

// Method 2: Manual creation from getParameters() (if Initialize not available)
const paramDefs = await sdk.process.getParameters('MyProcess', '', token)
const xmlParamDef = paramDefs.find(p => p.name === 'pProductos')

// Parse XSD to generate template
const template = parseXsdToTemplate(xmlParamDef.schema)
const xmlParam = new XmlParameter('pProductos', template, 'In')

// Fill data using helper methods
xmlParam.fillFrom(formData, {
  codigo: 'raiz.productos.producto[0].codigo',
  descripcion: 'raiz.productos.producto[0].descripcion'
})

// Validate before sending
const missing = xmlParam.validate()
if (missing.length > 0) {
  console.error('Missing fields:', missing)
  return
}

// Send (SDK auto-detects XmlParameter and converts to XML)
await sdk.process.start({
  processName: 'MyProcess',
  parameters: [xmlParam]  // ← Auto-converted to XML
}, [], token)
```

**XmlParameter Features:**
- ✅ Auto-template generation from XSD schema
- ✅ Direct property access via JavaScript Proxy
- ✅ Helper methods: `merge()`, `validate()`, `fillFrom()`, `getByPath()`, `setByPath()`
- ✅ Auto-detection and XML conversion
- ✅ Full TypeScript support

**For complete documentation:**
- [XmlParameter Guide](./XMLPARAMETER_GUIDE.md) - Complete technical guide
- [XmlParameter Examples](./EXAMPLES_XMLPARAMETER.md) - 6 real-world examples

---

## Quick Start

### 1. Setup SDK Provider (React)

```tsx
import { BizuitSDKProvider } from '@bizuit/form-sdk'

function App() {
  return (
    <BizuitSDKProvider
      config={{
        apiUrl: 'https://your-server.com/api'
        
        timeout: 120000,
      }}
    >
      <YourApp />
    </BizuitSDKProvider>
  )
}
```

### 2. Use Authentication

```tsx
import { useAuth } from '@bizuit/form-sdk'

function LoginComponent() {
  const { validateToken, user, isAuthenticated, error } = useAuth()

  const handleLogin = async (token: string) => {
    const success = await validateToken(token)
    if (success) {
      console.log('User:', user)
    }
  }

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.displayName}!</p>
      ) : (
        <button onClick={() => handleLogin('your-token')}>Login</button>
      )}
    </div>
  )
}
```

### 3. Start a Process

```tsx
import { useBizuitSDK } from '@bizuit/form-sdk'

function StartProcessForm() {
  const sdk = useBizuitSDK()

  const handleSubmit = async (formData: Record<string, any>) => {
    // 1. Initialize process to get parameters
    const processData = await sdk.process.initialize({
      processName: 'MyProcess',
      token: 'your-auth-token',
      userName: 'john.doe',
    })

    // 2. Merge form data with parameters
    const parameters = processData.parameters.map((param) => ({
      ...param,
      value: formData[param.name] || param.value,
    }))

    // 3. Execute RaiseEvent
    const result = await sdk.process.start({
      eventName: 'MyProcess',
      parameters,
    })

    console.log('Process started:', result.instanceId)
  }

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>
}
```

### 4. Continue a Process (with Locking)

```tsx
import { useBizuitSDK } from '@bizuit/form-sdk'

function ContinueProcessForm({ instanceId }: { instanceId: string }) {
  const sdk = useBizuitSDK()

  const handleSubmit = async (formData: Record<string, any>) => {
    const token = 'your-auth-token'

    // Use withLock for automatic lock/unlock
    await sdk.instanceLock.withLock(
      {
        instanceId,
        activityName: 'MyActivity',
        operation: 2, // Continue operation
        processName: 'MyProcess',
      },
      token,
      async (sessionToken) => {
        // 1. Get instance data
        const instanceData = await sdk.process.getInstanceData(
          instanceId,
          sessionToken
        )

        // 2. Update parameters
        const parameters = instanceData.parameters.map((param) => ({
          ...param,
          value: formData[param.name] || param.value,
        }))

        // 3. Execute RaiseEvent
        const result = await sdk.process.start(
          {
            eventName: 'MyProcess',
            instanceId,
            parameters,
          },
          undefined, // no files
          sessionToken
        )

        console.log('Process continued:', result)
      }
    )
  }

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>
}
```

## API Reference

### BizuitSDK

Main SDK class providing access to all services.

```typescript
const sdk = new BizuitSDK({
  apiUrl: string
  
  timeout?: number
  defaultHeaders?: Record<string, string>
})

// Access services
sdk.auth          // BizuitAuthService
sdk.process       // BizuitProcessService
sdk.instanceLock  // BizuitInstanceLockService
sdk.dataService   // BizuitDataServiceService
```

### BizuitAuthService

```typescript
// Validate token
const user = await sdk.auth.validateToken(token)

// Check form authentication
const response = await sdk.auth.checkFormAuth({
  formId: 123,
  processName: 'MyProcess',
})

// Get user info
const userInfo = await sdk.auth.getUserInfo(token, userName)

// Check permissions
const hasAccess = await sdk.auth.checkPermissions(token, userName, [
  'Admin',
  'User',
])
```

### BizuitProcessService

```typescript
// Initialize process
const processData = await sdk.process.initialize({
  processName: 'MyProcess',
  version: '1.0.0',
  token: 'auth-token',
  userName: 'john.doe',
})

// Start process
const result = await sdk.process.start({
  processName: 'MyProcess',
  parameters: [
    { name: 'param1', value: 'value1', type: 'SingleValue', direction: 'In' },
  ],
}, undefined, token)

// With files
const result = await sdk.process.start(
  {
    processName: 'MyProcess',
    parameters: [...],
  },
  [file1, file2], // File objects
  token
)

// Get configuration settings
const config = await sdk.process.getConfigurationSettings(
  'ACME', // organizationId
  token
)
```

### BizuitInstanceLockService

```typescript
// Check lock status
const status = await sdk.instanceLock.checkLockStatus(
  instanceId,
  activityName,
  token
)

// Lock instance
const lockResult = await sdk.instanceLock.lock(
  {
    instanceId,
    activityName,
    operation: 2,
    processName: 'MyProcess',
  },
  token
)

// Unlock instance
await sdk.instanceLock.unlock(
  {
    instanceId,
    activityName,
    sessionToken,
  },
  token
)

// Auto lock/unlock
await sdk.instanceLock.withLock(lockRequest, token, async (sessionToken) => {
  // Your logic here
  // Instance will be unlocked automatically even if error occurs
})
```

### BizuitDataServiceService

Execute queries via BIZUIT Dashboard DataService API - perfect for lookup data, lists, and reports.

```typescript
// Execute single query
const result = await sdk.dataService.execute<RejectionType>({
  id: 1, // DataService ID from BIZUIT Dashboard
  parameters: [
    { name: 'typename', value: 'Motivos de Rechazo' }
  ]
}, token)

if (result.success) {
  console.log('Rejection types:', result.data)
}

// Execute multiple queries in parallel
const [suppliers, statuses] = await sdk.dataService.executeMany([
  { id: 101, parameters: [] }, // Suppliers
  { id: 102, parameters: [] }  // Statuses
], token)

// Create parameters helper
const params = sdk.dataService.createParameters([
  { name: 'customerId', value: 'ALFKI' },
  { name: 'year', value: 2024 }
])

// Force fresh query (skip cache)
const liveData = await sdk.dataService.execute({
  id: 100,
  parameters: [],
  withoutCache: true // Skip cache
}, token)
```

**When to use DataService:**
- ✅ Combo box data (rejection types, status lists)
- ✅ Reference tables (countries, categories)
- ✅ Read-only reports and dashboards
- ✅ Autocomplete suggestions

**When NOT to use DataService:**
- ❌ Business logic execution (use `process.raiseEvent()`)
- ❌ Data updates (use processes)
- ❌ Workflow steps (use processes)

See [Example 7: DataService Queries](./docs/examples/example7-dataservice-queries.md) for complete usage examples.

### BizuitTaskService ✨ NEW in v2.3.0

Retrieve user task lists based on Bizuit BPM permissions. Perfect for building task management UIs, dashboards, and work queues.

**Key Features:**
- ✅ Automatic JSON flattening - Clean, flat objects for easy rendering
- ✅ User-friendly property names - Access columns by display name (e.g., `task['CLIENTE']`)
- ✅ Pagination support - Handle large task lists efficiently
- ✅ Process metadata - Get all processes with activities and start points
- ✅ Task filtering - Search by process, activity, date range, locked state

```typescript
// Get all processes available to user
const processes = await sdk.tasks.getProcesses(token)

processes.forEach(process => {
  console.log('Process:', process.workflowDisplayName)
  console.log('Start points:', process.activities.filter(a => a.isStartPoint))
  console.log('Activities:', process.activities.filter(a => !a.isStartPoint))
})

// Search for task instances with pagination
const result = await sdk.tasks.searchTasks({
  ProcessName: 'TestWix',
  ActivityName: 'userInteractionActivity1',
  pageNumber: 1,
  pageSize: 20,
  DateFrom: '2025-01-01',
  DateTo: '2025-12-31',
  LockedState: -1  // -1 = all, 0 = unlocked, 1 = locked
}, token)

console.log('Total tasks:', result.instancesTotalCount[0]?.count)
console.log('Instances:', result.instances.length)

// Access instances with flattened JSON structure
result.instances.forEach(instance => {
  // Standard properties
  console.log('Instance ID:', instance.instanceId)
  console.log('Status:', instance.locked ? 'Locked' : 'Available')
  console.log('Locked by:', instance.lockedBy)

  // Dynamic columns with user-friendly names (automatically flattened)
  console.log('Cliente:', instance['CLIENTE'])
  console.log('Descripción:', instance['Descripción'])
  console.log('Versión:', instance['Versión'])
  console.log('Usuario:', instance['Último ejecutado por'])
  console.log('Fecha:', instance['Fecha Ejecución'])
  console.log('Tiempo:', instance['Tiempo Transcurrido'])
})
```

**Before/After JSON Transformation:**

```typescript
// ❌ RAW API Response (complex structure)
{
  "instanceId": "abc-123",
  "locked": false,
  "lockedBy": "",
  "eventName": "TestWix",           // Removed by SDK
  "activityName": "activity1",      // Removed by SDK
  "instanceDescription": "...",     // Removed by SDK
  "columnDefinitionValues": [       // Removed by SDK (flattened)
    { "columnName": "xCol_159307d8", "value": "ACME Corp" },
    { "columnName": "xCol_234abcd", "value": "Producto X" }
  ]
}

// ✅ SDK Returns (clean, flat structure)
{
  "instanceId": "abc-123",
  "locked": false,
  "lockedBy": "",
  "CLIENTE": "ACME Corp",           // User-friendly property name!
  "Descripción": "Producto X"       // Direct access via headerText
}
```

**All TaskService Methods:**

```typescript
// Get all processes
const processes = await sdk.tasks.getProcesses(token)

// Get specific process details
const processDetails = await sdk.tasks.getProcessDetails('TestWix', token)

// Search tasks (with pagination)
const tasks = await sdk.tasks.searchTasks({
  ProcessName: 'TestWix',
  ActivityName: 'userInteractionActivity1',
  pageNumber: 1,
  pageSize: 20
}, token)

// Get task count only
const count = await sdk.tasks.getTaskCount('TestWix', 'activity1', token)

// Get all start points across processes
const startPoints = await sdk.tasks.getStartPoints(token)

// Get all activities (non-start points)
const activities = await sdk.tasks.getActivities(token)
```

**Building a Task List UI:**

```typescript
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'
import { useState, useEffect } from 'react'

function TaskListDemo() {
  const sdk = useBizuitSDK()
  const [processes, setProcesses] = useState([])
  const [tasks, setTasks] = useState([])
  const [columnDefinitions, setColumnDefinitions] = useState([])

  // Load processes on mount
  useEffect(() => {
    loadProcesses()
  }, [])

  const loadProcesses = async () => {
    const data = await sdk.tasks.getProcesses(token)
    setProcesses(data)
  }

  const loadTasks = async (processName, activityName) => {
    const response = await sdk.tasks.searchTasks({
      ProcessName: processName,
      ActivityName: activityName,
      pageNumber: 1,
      pageSize: 20
    }, token)

    // Extract column definitions from events metadata
    const eventActivity = response.events
      .find(e => e.eventName === processName)
      ?.activities.find(a => a.activityName === activityName)

    setColumnDefinitions(eventActivity?.columnsDefinitions || [])
    setTasks(response.instances)
  }

  return (
    <div>
      {/* Process selector */}
      <select onChange={(e) => {
        const process = processes.find(p => p.name === e.target.value)
        // ... load activities for selected process
      }}>
        {processes.map(p => (
          <option key={p.name} value={p.name}>
            {p.workflowDisplayName}
          </option>
        ))}
      </select>

      {/* Task table with dynamic columns */}
      <table>
        <thead>
          <tr>
            <th>Estado</th>
            <th>Instance ID</th>
            {columnDefinitions.map(col => (
              <th key={col.name}>{col.headerText}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.instanceId}>
              <td>{task.locked ? '🔒 Bloqueado' : '✅ Disponible'}</td>
              <td>{task.instanceId.substring(0, 8)}...</td>
              {columnDefinitions.map(col => (
                <td key={col.name}>
                  {task[col.headerText] || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**When to use TaskService:**
- ✅ User task lists and work queues
- ✅ Task management dashboards
- ✅ Process instance browsers
- ✅ Pending tasks displays
- ✅ Task assignment UIs

**When NOT to use TaskService:**
- ❌ Starting new processes (use `process.start()`)
- ❌ Executing business logic (use `process.raiseEvent()`)
- ❌ Managing instance locks (use `instanceLock` service)

---

#### TaskService API Structure

**Process Metadata Structure:**

```typescript
interface IProcessMetadata {
  name: string                      // Process internal name (e.g., "TestWix")
  workflowDisplayName: string       // User-friendly name (e.g., "Test Workflow")
  workflowName: string              // Workflow internal name
  category: string                  // Process category
  subCategory: string               // Process sub-category
  icon: string | null               // Icon identifier
  iconColor: string | null          // Icon color
  activities: IActivityMetadata[]   // All activities in process
}

interface IActivityMetadata {
  activityName: string              // Activity internal name
  displayName: string               // User-friendly name
  isStartPoint: boolean             // true if this is a process start point
  hasQuickForm: boolean             // true if activity has quick form
  formId: number                    // Form ID if WebForm connector
  formName: string | null           // Form name if WebForm connector
  connectorType: string | null      // Connector type (WebForm, WebPage, BIZUIT, etc.)
  connectorUrl: string | null       // URL template with placeholders
  instructions: string | null       // HTML instructions for activity
  width: number                     // Connector width
  height: number                    // Connector height
  version: string | null            // Process version
  childEventName: string | null     // Child event name if applicable
  isGroupingActivity: boolean       // true if grouping activity
  isEmpty: boolean                  // true if empty activity
  idBindedConnector: string | null  // Binded connector ID
  isDefault: boolean                // true if default connector
}
```

**Task Instance Structure (After SDK Transformation):**

```typescript
interface ITaskInstance {
  // Core properties
  instanceId: string                // Unique instance identifier
  locked: boolean                   // Whether instance is locked
  lockedBy: string                  // User who locked the instance
  executionDateTime: string         // Execution date/time display text
  dateToCompare: string             // ISO date string for comparison
  warningLevelId: string            // Warning level ID
  backColor: string                 // Background color for UI
  foreColor: string                 // Foreground color for UI
  documentsQuantity: number         // Number of attached documents
  version: string                   // Process version

  // Dynamic columns (flattened from columnDefinitionValues)
  // These are added dynamically based on process configuration
  [key: string]: any                // e.g., task['CLIENTE'], task['Descripción']

  // ❌ REMOVED by SDK (redundant):
  // eventName: string
  // activityName: string
  // instanceDescription: string
  // columnDefinitionValues: IColumnDefinitionValue[]
}
```

**Column Definition Structure:**

```typescript
interface IColumnDefinition {
  name: string                      // Technical column name (e.g., "xCol_159307d8")
  headerText: string                // User-friendly name (e.g., "CLIENTE")
  type: string                      // Column type
  condition: string                 // Conditions XML
  dateProperties: {
    applyFormat: boolean
    format: string
    customFormat: string
  }
}
```

**Search Request Parameters:**

```typescript
interface ITasksSearchRequest {
  // Required
  ProcessName: string               // Process to search
  ActivityName: string              // Activity to search

  // Optional filters
  DateFrom?: string                 // Format: 'YYYY-MM-DD'
  DateTo?: string                   // Format: 'YYYY-MM-DD'
  LockedState?: number              // -1 = all, 0 = unlocked, 1 = locked
  ExpirationInterval?: string       // Expiration interval filter
  ChildProcessName?: string         // Child process filter
  SerializedFilters?: string        // Serialized filters
  IncludeWarnings?: boolean         // Include warnings (default: true)
  Parameters?: any[]                // Additional parameters

  // Pagination (sent via headers)
  pageNumber?: number               // 1-based page number (header: bz-page)
  pageSize?: number                 // Page size (header: bz-page-size)

  // Internal (not sent to API)
  IsMobile?: boolean                // Mobile request flag
}
```

**Search Response Structure:**

```typescript
interface ITasksSearchResponse {
  events: ITaskEvent[]              // Events with metadata
  instances: ITaskInstance[]        // Flattened task instances
  moreThanLimit: boolean            // true if more results exist
  instancesTotalCount: IInstanceCount[]  // Total count per event
}

interface ITaskEvent {
  eventName: string                 // Event name
  activities: IEventActivity[]      // Activities with metadata
}

interface IEventActivity {
  activityName: string              // Activity name
  columnsDefinitions: IColumnDefinition[]  // Column definitions
  connectors: IConnectorMetadata[]  // Available connectors
  connectorUrl: string              // Connector URL template
  hasQuickForm: boolean             // Has quick form
  hasMultipleQuickForm: boolean     // Has multiple quick forms
  idBindedConnector: string         // Binded connector ID
  isGroupingActivity: boolean       // Is grouping activity
  // ... additional properties
}

interface IInstanceCount {
  eventName: string                 // Event name
  count: number                     // Total instance count
  instancesList: any | null         // Instances list (null in summary)
}
```

---

#### Advanced TaskService Usage

**Pattern 1: Multi-Process Task Dashboard**

```typescript
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'

function MultiProcessDashboard() {
  const sdk = useBizuitSDK()
  const [allTasks, setAllTasks] = useState([])

  const loadAllUserTasks = async (token: string) => {
    // Step 1: Get all processes
    const processes = await sdk.tasks.getProcesses(token)

    // Step 2: For each process, get all activities
    const taskPromises = processes.flatMap(process =>
      process.activities
        .filter(a => !a.isStartPoint) // Only task activities
        .map(activity =>
          sdk.tasks.searchTasks({
            ProcessName: process.name,
            ActivityName: activity.activityName,
            pageSize: 10  // Top 10 per activity
          }, token)
        )
    )

    // Step 3: Execute all searches in parallel
    const results = await Promise.all(taskPromises)

    // Step 4: Flatten all instances
    const allInstances = results.flatMap(r => r.instances)
    setAllTasks(allInstances)

    console.log(`Total tasks across all processes: ${allInstances.length}`)
  }

  return (
    <div>
      <h2>All My Tasks ({allTasks.length})</h2>
      {allTasks.map(task => (
        <div key={task.instanceId}>
          <strong>{task.instanceId}</strong>
          {task.locked && <span>🔒 Locked by {task.lockedBy}</span>}
        </div>
      ))}
    </div>
  )
}
```

**Pattern 2: Task Filtering and Sorting**

```typescript
function TaskListWithFilters() {
  const sdk = useBizuitSDK()
  const [tasks, setTasks] = useState([])
  const [filters, setFilters] = useState({
    dateFrom: '2025-01-01',
    dateTo: '2025-12-31',
    lockedState: -1,  // All
    sortBy: 'executionDateTime',
    sortOrder: 'desc'
  })

  const loadTasksWithFilters = async () => {
    const response = await sdk.tasks.searchTasks({
      ProcessName: 'TestWix',
      ActivityName: 'userInteractionActivity1',
      DateFrom: filters.dateFrom,
      DateTo: filters.dateTo,
      LockedState: filters.lockedState,
      pageNumber: 1,
      pageSize: 50
    }, token)

    // Client-side sorting
    const sorted = [...response.instances].sort((a, b) => {
      const aVal = a[filters.sortBy]
      const bVal = b[filters.sortBy]

      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    setTasks(sorted)
  }

  return (
    <div>
      <div className="filters">
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
        />
        <select
          value={filters.lockedState}
          onChange={(e) => setFilters({...filters, lockedState: Number(e.target.value)})}
        >
          <option value={-1}>All</option>
          <option value={0}>Available Only</option>
          <option value={1}>Locked Only</option>
        </select>
        <button onClick={loadTasksWithFilters}>Apply Filters</button>
      </div>

      <table>
        {/* Render tasks */}
      </table>
    </div>
  )
}
```

**Pattern 3: Infinite Scroll / Load More**

```typescript
function InfiniteTaskList() {
  const sdk = useBizuitSDK()
  const [tasks, setTasks] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 20

  const loadMoreTasks = async () => {
    const response = await sdk.tasks.searchTasks({
      ProcessName: 'TestWix',
      ActivityName: 'userInteractionActivity1',
      pageNumber: currentPage,
      pageSize: pageSize
    }, token)

    // Append new tasks
    setTasks(prev => [...prev, ...response.instances])

    // Check if more pages available
    const totalCount = response.instancesTotalCount[0]?.count || 0
    const loadedCount = currentPage * pageSize
    setHasMore(loadedCount < totalCount)

    setCurrentPage(prev => prev + 1)
  }

  return (
    <div>
      <div className="task-list">
        {tasks.map(task => (
          <div key={task.instanceId}>{/* task card */}</div>
        ))}
      </div>

      {hasMore && (
        <button onClick={loadMoreTasks}>
          Load More Tasks
        </button>
      )}
    </div>
  )
}
```

**Pattern 4: Task Count Badges**

```typescript
function ProcessNavigationWithBadges() {
  const sdk = useBizuitSDK()
  const [processes, setProcesses] = useState([])
  const [taskCounts, setTaskCounts] = useState({})

  const loadProcessesWithCounts = async (token: string) => {
    // Load processes
    const processesData = await sdk.tasks.getProcesses(token)
    setProcesses(processesData)

    // Load task counts for each activity
    const countPromises = processesData.flatMap(process =>
      process.activities.map(async activity => {
        const count = await sdk.tasks.getTaskCount(
          process.name,
          activity.activityName,
          token
        )
        return {
          key: `${process.name}-${activity.activityName}`,
          count
        }
      })
    )

    const counts = await Promise.all(countPromises)

    // Convert to map
    const countMap = {}
    counts.forEach(({ key, count }) => {
      countMap[key] = count
    })

    setTaskCounts(countMap)
  }

  return (
    <div>
      {processes.map(process => (
        <div key={process.name}>
          <h3>{process.workflowDisplayName}</h3>
          {process.activities.map(activity => {
            const key = `${process.name}-${activity.activityName}`
            const count = taskCounts[key] || 0

            return (
              <button key={activity.activityName}>
                {activity.displayName}
                {count > 0 && <span className="badge">{count}</span>}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
```

**Pattern 5: Start Point vs Activities Separation**

```typescript
function ProcessWorkspace() {
  const sdk = useBizuitSDK()
  const [startPoints, setStartPoints] = useState([])
  const [activities, setActivities] = useState([])

  const loadWorkspace = async (token: string) => {
    // Get all start points (for creating new instances)
    const allStartPoints = await sdk.tasks.getStartPoints(token)
    setStartPoints(allStartPoints)

    // Get all activities (for continuing instances)
    const allActivities = await sdk.tasks.getActivities(token)
    setActivities(allActivities)
  }

  return (
    <div className="workspace">
      {/* Left panel: Start new processes */}
      <aside className="start-points">
        <h3>Start New Process</h3>
        {startPoints.map(sp => (
          <button
            key={`${sp.processName}-${sp.activityName}`}
            onClick={() => window.open(sp.connectorUrl)}
          >
            🚀 {sp.processDisplayName} - {sp.displayName}
          </button>
        ))}
      </aside>

      {/* Main area: Pending tasks */}
      <main className="activities">
        <h3>My Pending Tasks</h3>
        {activities.map(activity => (
          <div key={`${activity.processName}-${activity.activityName}`}>
            <h4>{activity.processDisplayName} - {activity.displayName}</h4>
            {/* Load tasks for this activity */}
          </div>
        ))}
      </main>
    </div>
  )
}
```

**TypeScript Type Safety:**

```typescript
import type {
  IProcessMetadata,
  IActivityMetadata,
  ITaskInstance,
  ITasksSearchRequest,
  ITasksSearchResponse,
  IColumnDefinition,
} from '@tyconsa/bizuit-form-sdk'

// Strongly typed task list component
interface TaskListProps {
  processName: string
  activityName: string
  token: string
}

const TaskList: React.FC<TaskListProps> = ({ processName, activityName, token }) => {
  const sdk = useBizuitSDK()
  const [tasks, setTasks] = useState<ITaskInstance[]>([])
  const [columns, setColumns] = useState<IColumnDefinition[]>([])

  const loadTasks = async () => {
    const request: ITasksSearchRequest = {
      ProcessName: processName,
      ActivityName: activityName,
      pageNumber: 1,
      pageSize: 20,
      LockedState: -1,
    }

    const response: ITasksSearchResponse = await sdk.tasks.searchTasks(request, token)

    setTasks(response.instances)

    const activity = response.events
      .find(e => e.eventName === processName)
      ?.activities.find(a => a.activityName === activityName)

    if (activity) {
      setColumns(activity.columnsDefinitions)
    }
  }

  return (
    <div>
      {/* Fully typed task rendering */}
    </div>
  )
}
```

---

## Process Workflows

### Understanding `initialize()`

The `initialize()` method is used to **obtain the initial or current state of a process/instance** before presenting a form to the user. It returns:

- **Parameters**: Process fields with their default or current values
- **Variables**: Available process variables
- **Metadata**: `processName`, `version`, `instanceId` (if continuing)
- **Activities**: History of completed activities (optional)

### Workflow 1: Starting a New Process

```typescript
// Step 1: Get process definition (optional but recommended)
const processData = await sdk.process.initialize({
  processName: 'ExpenseRequest',
  version: '1.0.0',
  token: authToken,
  userName: 'user@company.com'
})

// processData contains:
// {
//   parameters: [
//     { name: 'amount', value: null, type: 'SingleValue', direction: 'In' },
//     { name: 'description', value: null, type: 'SingleValue', direction: 'In' },
//     { name: 'category', value: 'General', type: 'SingleValue', direction: 'In' } // with default value
//   ],
//   variables: [...],
//   processName: 'ExpenseRequest',
//   version: '1.0.0'
// }

// Step 2: Render form based on processData.parameters
// User fills in the form fields...

// Step 3: Start the process with submitted values
const result = await sdk.process.start({
  processName: 'ExpenseRequest',
  processVersion: '1.0.0',
  parameters: [
    { name: 'amount', value: '5000', type: 'SingleValue', direction: 'In' },
    { name: 'description', value: 'Equipment purchase', type: 'SingleValue', direction: 'In' },
    { name: 'category', value: 'Hardware', type: 'SingleValue', direction: 'In' }
  ]
}, undefined, authToken)

// result contains:
// {
//   instanceId: 'instance-uuid',
//   status: 'Waiting', // or 'Completed'
//   parameters: [...] // updated output parameters
// }

console.log(`Process started with ID: ${result.instanceId}`)
```

### Workflow 2: Continuing an Existing Instance

```typescript
// Scenario: User has a pending task (instanceId = 'abc-123')

// Step 1: Get current state of the instance
const processData = await sdk.process.initialize({
  processName: 'ExpenseRequest',
  instanceId: 'abc-123', // ⭐ Key: include instanceId
  activityName: 'ManagerApproval', // optional: specific activity
  token: authToken,
  userName: 'manager@company.com'
})

// processData contains CURRENT values of the instance:
// {
//   parameters: [
//     { name: 'amount', value: '5000', type: 'SingleValue', direction: 'In' },
//     { name: 'description', value: 'Equipment purchase', type: 'SingleValue', direction: 'In' },
//     { name: 'approved', value: null, type: 'SingleValue', direction: 'Out' }, // new field for this activity
//     { name: 'comments', value: null, type: 'SingleValue', direction: 'Out' }
//   ],
//   instanceId: 'abc-123',
//   processName: 'ExpenseRequest'
// }

// Step 2: Render form with existing values pre-populated
// User completes new fields (approved, comments)...

// Step 3: Continue the instance with updated values
const result = await sdk.process.continue({
  processName: 'ExpenseRequest',
  instanceId: 'abc-123', // ⭐ Key: instanceId to continue
  parameters: [
    // Keep existing values + add new ones
    { name: 'amount', value: '5000', type: 'SingleValue', direction: 'In' },
    { name: 'description', value: 'Equipment purchase', type: 'SingleValue', direction: 'In' },
    { name: 'approved', value: 'true', type: 'SingleValue', direction: 'Out' },
    { name: 'comments', value: 'Approved with observations', type: 'SingleValue', direction: 'Out' }
  ]
}, undefined, authToken)

// result contains:
// {
//   instanceId: 'abc-123',
//   status: 'Completed', // or 'Waiting' if more activities exist
//   parameters: [...] // updated parameters
// }
```

### Workflow 3: With Pessimistic Locking (Concurrent Editing)

```typescript
// Scenario: Prevent two users from editing the same instance simultaneously

// Step 1: Acquire lock
const lockResult = await sdk.process.acquireLock({
  instanceId: 'abc-123',
  token: authToken
})

const { sessionToken, processData } = lockResult

// Step 2: Use sessionToken to get data
const data = await sdk.process.initialize({
  processName: 'ExpenseRequest',
  instanceId: 'abc-123',
  token: authToken,
  sessionToken: sessionToken // ⭐ Identifies the locked session
})

// Step 3: User edits the form...

// Step 4: Continue with the same session
const result = await sdk.process.continue({
  processName: 'ExpenseRequest',
  instanceId: 'abc-123',
  parameters: [...]
}, undefined, authToken)

// Step 5: Release lock
await sdk.process.releaseLock({
  instanceId: 'abc-123',
  sessionToken: sessionToken
})
```

### Method Comparison

| Method | When to Use | Requires instanceId |
|--------|-------------|---------------------|
| **`initialize()`** | Get initial/current state before showing form | ❌ For new process<br>✅ For continuing |
| **`start()`** | Start new process instance | ❌ No (generates new one) |
| **`continue()`** | Continue existing instance at specific activity | ✅ Required |
| **`getParameters()`** | Get only parameter definitions (no values) | ❌ No |

### Benefits of Using `initialize()`

1. **Pre-population**: Get default or current values
2. **Validation**: Know which parameters are required
3. **Metadata**: Receive context information (version, variables)
4. **Consistency**: Ensure form shows correct instance state

### ParameterParser Utilities

```typescript
import { ParameterParser } from '@bizuit/form-sdk'

// Flatten parameters for form
const formData = ParameterParser.flattenParameters(parameters)

// Convert form data back to parameters
const updatedParams = ParameterParser.mergeWithFormData(parameters, formData)

// Get only input parameters
const inputs = ParameterParser.getInputParameters(parameters)

// Validate required fields
const validation = ParameterParser.validateRequired(parameters, formData)
if (!validation.valid) {
  console.log('Missing fields:', validation.missing)
}
```

### Selective Parameter Mapping (New in v1.0.2)

The `buildParameters()` utility allows you to selectively map form fields to specific Bizuit parameters/variables, instead of sending all form data. This is useful when you only want to send specific fields or need to transform values before sending.

```typescript
import { buildParameters, type IParameterMapping } from '@tyconsa/bizuit-form-sdk'

// Simple mapping: only send specific fields
const mapping = {
  'empleado': { parameterName: 'pEmpleado' },
  'monto': { parameterName: 'pMonto' },
  'categoria': { parameterName: 'pCategoria' },
}

const formData = {
  empleado: 'Juan Pérez',
  monto: '1500.50',
  categoria: 'Viajes',
  // These fields won't be included:
  comentarios: 'Internal notes',
  prioridad: 'Alta',
}

const parameters = buildParameters(mapping, formData)
// Result: only 3 parameters (empleado, monto, categoria)
```

**With value transformations:**

```typescript
const mapping = {
  'empleado': {
    parameterName: 'pEmpleado',
    transform: (val) => val.toUpperCase(),
  },
  'monto': {
    parameterName: 'pMonto',
    transform: (val) => parseFloat(val).toFixed(2),
  },
}

const parameters = buildParameters(mapping, formData)
// empleado will be 'JUAN PÉREZ', monto will be '1500.50'
```

**Map to variables:**

```typescript
const mapping = {
  'aprobado': {
    parameterName: 'vAprobado',
    isVariable: true,
    transform: (val) => val ? 'SI' : 'NO',
  },
}
```

**Specify parameter types and directions:**

```typescript
const mapping = {
  'xmlData': {
    parameterName: 'pXmlData',
    type: 'Xml' as const,
  },
  'config': {
    parameterName: 'pConfig',
    type: 'ComplexObject' as const,
    direction: 'InOut' as const,
  },
}
```

**IParameterMapping Interface:**

```typescript
interface IParameterMapping {
  parameterName: string               // Bizuit parameter/variable name
  isVariable?: boolean                // true for variables, false/undefined for parameters
  transform?: (value: any) => any     // Optional value transformation function
  type?: 'SingleValue' | 'Xml' | 'ComplexObject'  // Parameter type (default: SingleValue)
  direction?: 'In' | 'Out' | 'InOut'  // Parameter direction (default: In)
}
```

### formDataToParameters() - Convert All Fields

The `formDataToParameters()` utility converts **all** form fields to Bizuit parameters. Use this when you want to send everything from your form state.

```typescript
import { formDataToParameters } from '@tyconsa/bizuit-form-sdk'

const formData = {
  pEmpleado: 'Juan Pérez',
  pLegajo: '12345',
  pMonto: '1500.50',
  pCategoria: 'Viajes',
  pAprobado: true,
  pFechaSolicitud: '2025-01-15',
}

// Convert all fields to parameters
const parameters = formDataToParameters(formData)

// Result: Array of IParameter objects
[
  { name: 'pEmpleado', value: 'Juan Pérez', direction: 'In', type: 'SingleValue' },
  { name: 'pLegajo', value: '12345', direction: 'In', type: 'SingleValue' },
  { name: 'pMonto', value: '1500.50', direction: 'In', type: 'SingleValue' },
  { name: 'pCategoria', value: 'Viajes', direction: 'In', type: 'SingleValue' },
  { name: 'pAprobado', value: true, direction: 'In', type: 'SingleValue' },
  { name: 'pFechaSolicitud', value: '2025-01-15', direction: 'In', type: 'SingleValue' },
]

// Send to Bizuit
await sdk.process.start({
  eventName: 'SolicitudGasto',
  parameters
}, undefined, token)
```

**Key differences:**

| Feature | `formDataToParameters()` | `buildParameters()` |
|---------|-------------------------|---------------------|
| **Selectivity** | Sends ALL fields | Sends ONLY mapped fields |
| **Transformation** | No transformations | Supports transform functions |
| **Use Case** | Simple forms, all data needed | Complex forms, selective fields |
| **Setup** | Quick, no configuration | Requires mapping definition |

**When to use `formDataToParameters()`:**
- All form fields should be sent to Bizuit
- No value transformations needed
- Simple, straightforward forms
- Quick prototyping

**When to use `buildParameters()`:**
- Only specific fields should be sent
- Need value transformations
- Multiple form fields map to single parameter
- Production applications with complex business logic

## React Hooks

### useAuth

```typescript
const {
  user,
  isAuthenticated,
  isLoading,
  error,
  validateToken,
  checkFormAuth,
  getUserInfo,
  checkPermissions,
  logout,
} = useAuth({
  token: 'optional-token',
  userName: 'optional-username',
  autoValidate: true, // Auto-validate token on mount
})
```

### useBizuitSDK

```typescript
const sdk = useBizuitSDK()

// Access all services
sdk.auth.validateToken(...)
sdk.process.initialize(...)
sdk.instanceLock.lock(...)
```

## TypeScript Support

All types and utilities are exported and available:

```typescript
import type {
  IBizuitConfig,
  IUserInfo,
  IParameter,
  IProcessData,
  IRaiseEventParams,
  IRaiseEventResult,
  ILockStatus,
  // ... and many more
} from '@bizuit/form-sdk'

// XML/JSON conversion utilities (v2.1.0+)
import { xmlToJson, jsonToXml } from '@tyconsa/bizuit-form-sdk'

// Example: Manual conversion if needed
const obj = { raiz: { nombre: 'Test', productos: { producto: [...] } } }
const xml = jsonToXml(obj)
console.log(xml)
// <raiz>
//   <nombre>Test</nombre>
//   <productos>
//     <producto>...</producto>
//   </productos>
// </raiz>

const parsed = xmlToJson(xml)
console.log(parsed)  // Back to object
```

## Error Handling

```typescript
import { BizuitError, handleError } from '@bizuit/form-sdk'

try {
  await sdk.process.start(...)
} catch (error) {
  const bizuitError = handleError(error)

  if (bizuitError.isAuthError()) {
    // Handle authentication error
  } else if (bizuitError.isNetworkError()) {
    // Handle network error
  } else {
    console.error(bizuitError.message)
  }
}
```

## 📁 Flexible File Uploads ✨ NEW in v2.4.0

The SDK now supports **multiple file sources** for uploads, not just browser `File` objects. This makes it easy to upload files from:
- 📷 **Base64 strings** (camera captures, canvas exports, data URLs)
- 🎨 **Blob objects** (canvas.toBlob(), fetch responses)
- 📦 **ArrayBuffer** (binary data, WebSocket transfers)
- 📂 **Browser File objects** (traditional file inputs)

### Quick Example: Upload Base64 Image

```typescript
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'

function UploadSignature() {
  const sdk = useBizuitSDK()

  const handleSubmit = async (signatureBase64: string) => {
    // Create IBizuitFile from base64 string
    const signatureFile = {
      fileName: 'signature.png',
      content: signatureBase64,  // Can be data URL or pure base64
      mimeType: 'image/png',
      encoding: 'base64' as const
    }

    // Upload directly - SDK handles conversion!
    const result = await sdk.process.start(
      {
        processName: 'DocumentApproval',
        parameters: [
          { name: 'pApproved', value: 'true', type: 'SingleValue', direction: 'In' }
        ],
        files: [signatureFile]  // ← IBizuitFile instead of File!
      },
      undefined,
      token
    )

    console.log('Uploaded!', result.instanceId)
  }

  return <SignaturePad onSave={handleSubmit} />
}
```

### Supported File Sources

#### 1. Base64 Strings 📷

Perfect for camera captures, canvas exports, or server-provided data:

```typescript
// From canvas.toDataURL()
const dataUrl = canvas.toDataURL('image/jpeg')
const file: IBizuitFile = {
  fileName: 'photo.jpg',
  content: dataUrl,  // SDK strips "data:image/jpeg;base64," prefix
  mimeType: 'image/jpeg',
  encoding: 'base64'
}

// Pure base64 string
const base64 = 'iVBORw0KGgoAAAANSUhEUgAA...'
const file2: IBizuitFile = {
  fileName: 'document.pdf',
  content: base64,
  mimeType: 'application/pdf',
  encoding: 'base64'
}

await sdk.process.start({
  processName: 'UploadDocs',
  parameters: [],
  files: [file, file2]
}, undefined, token)
```

#### 2. Blob Objects 🎨

Perfect for canvas exports, fetch responses, or binary data:

```typescript
// From canvas
canvas.toBlob(async (blob) => {
  const file: IBizuitFile = {
    fileName: 'drawing.png',
    content: blob!,
    mimeType: 'image/png'
  }

  await sdk.process.start({
    processName: 'UploadDrawing',
    parameters: [],
    files: [file]
  }, undefined, token)
})

// From fetch
const response = await fetch('https://example.com/document.pdf')
const blob = await response.blob()

const file: IBizuitFile = {
  fileName: 'remote-doc.pdf',
  content: blob,
  mimeType: blob.type || 'application/pdf'
}
```

#### 3. ArrayBuffer 📦

Perfect for binary data, WebSocket transfers, or FileReader results:

```typescript
// From fetch
const response = await fetch('https://example.com/data.bin')
const arrayBuffer = await response.arrayBuffer()

const file: IBizuitFile = {
  fileName: 'data.bin',
  content: arrayBuffer,
  mimeType: 'application/octet-stream'
}

await sdk.process.start({
  processName: 'UploadBinary',
  parameters: [],
  files: [file]
}, undefined, token)
```

#### 4. Browser File Objects 📂

Traditional file input still works - fully backward compatible:

```typescript
const fileInput = document.getElementById('fileInput') as HTMLInputElement
const browserFiles = Array.from(fileInput.files || [])

// Old way still works!
await sdk.process.start(
  { processName: 'UploadDocs', parameters: [] },
  browserFiles,  // File[]
  token
)

// Or using IBizuitFile wrapper
const wrapped: IBizuitFile = {
  fileName: 'document.pdf',
  content: browserFiles[0],  // Wrap File in IBizuitFile
  mimeType: browserFiles[0].type
}
```

### Mixed File Sources

You can mix different file sources in the same upload:

```typescript
const files = [
  // Browser file
  browserFile,

  // Base64 signature
  {
    fileName: 'signature.png',
    content: signatureBase64,
    mimeType: 'image/png',
    encoding: 'base64' as const
  },

  // Canvas blob
  {
    fileName: 'drawing.png',
    content: canvasBlob,
    mimeType: 'image/png'
  }
]

await sdk.process.start({
  processName: 'SubmitForm',
  parameters: [...],
  files: files  // Mix of File and IBizuitFile!
}, undefined, token)
```

### Real-World Use Cases

**Camera Capture:**
```typescript
// Capture photo and upload as base64
const stream = await navigator.mediaDevices.getUserMedia({ video: true })
const canvas = document.createElement('canvas')
// ... capture frame to canvas
const base64Image = canvas.toDataURL('image/jpeg')

await sdk.process.start({
  processName: 'UploadPhoto',
  parameters: [],
  files: [{
    fileName: 'photo.jpg',
    content: base64Image,
    mimeType: 'image/jpeg',
    encoding: 'base64'
  }]
}, undefined, token)
```

**Download and Re-upload:**
```typescript
// Download from one instance
const blob = await sdk.process.downloadDocument(docId, version, token)

// Upload to another instance
await sdk.process.start({
  processName: 'CopyDocument',
  parameters: [],
  files: [{
    fileName: 'copied-doc.pdf',
    content: blob,
    mimeType: blob.type
  }]
}, undefined, token)
```

**Generate PDF from HTML:**
```typescript
import jsPDF from 'jspdf'

const doc = new jsPDF()
doc.text('Report Content', 10, 10)
const pdfBlob = doc.output('blob')

await sdk.process.start({
  processName: 'SubmitReport',
  parameters: [],
  files: [{
    fileName: 'report.pdf',
    content: pdfBlob,
    mimeType: 'application/pdf'
  }]
}, undefined, token)
```

### TypeScript Interface

```typescript
interface IBizuitFile {
  fileName: string                              // Name for uploaded file
  content: File | string | Blob | ArrayBuffer   // File content from any source
  mimeType?: string                             // MIME type (e.g., 'image/png')
  encoding?: 'base64' | 'binary'                // Encoding (only for strings)
}

// Usage in process params
interface IStartProcessParams {
  processName: string
  instanceId?: string
  parameters: IParameter[]
  processVersion?: string
  closeOnSuccess?: boolean
  deletedDocuments?: string[]
  files?: File[] | IBizuitFile[]  // ← Supports both!
}
```

### Continue Operations

The same flexible file support works for `continue()` operations:

```typescript
await sdk.process.continue({
  processName: 'DocumentReview',
  instanceId: 'existing-instance-id',
  parameters: [...],
  files: [
    {
      fileName: 'additional-doc.pdf',
      content: base64String,
      mimeType: 'application/pdf',
      encoding: 'base64'
    }
  ],
  deletedDocuments: ['16', '17']  // Remove old docs
}, undefined, token)
```

### Important Notes

✅ **Backward Compatible** - Existing code using `File[]` still works
✅ **Automatic Conversion** - SDK converts all sources to `File` objects before sending
✅ **Data URL Detection** - Automatically strips `data:image/png;base64,` prefixes
✅ **MIME Type Inference** - Uses sensible defaults if not provided
✅ **Error Handling** - Clear error messages for malformed base64

For complete examples and HTML test forms, see **[EXAMPLES_FILE_UPLOAD.md](./EXAMPLES_FILE_UPLOAD.md)**.

---

## 📚 Documentation

For detailed guides and advanced features:

- **[File Upload Examples](./EXAMPLES_FILE_UPLOAD.md)** - Complete guide with 9 examples showing all file upload patterns
  - Base64 string uploads (camera, canvas, data URLs)
  - Blob uploads (canvas.toBlob, fetch responses)
  - ArrayBuffer uploads (binary data, WebSocket)
  - Mixed file sources in same upload
  - Real-world use cases (camera, PDF generation, download/re-upload)

- **[XmlParameter Guide](./XMLPARAMETER_GUIDE.md)** - Complete guide for working with XML parameters using mutable objects
  - XSD auto-template generation
  - Direct property access via Proxy
  - Advanced helper methods (merge, validate, fillFrom, getByPath, setByPath)

- **[XmlParameter Examples](./EXAMPLES_XMLPARAMETER.md)** - 6 real-world examples showing common patterns:
  - Simple forms with validation
  - Complex nested structures
  - Multi-step forms
  - Array manipulation
  - Editing existing instances

## License

MIT

## Support

For issues and questions, please visit [Bizuit Support](https://bizuit.com/support)
