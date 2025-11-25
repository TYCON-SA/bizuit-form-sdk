# @bizuit/form-sdk

Core SDK for Bizuit BPM form integration. Provides authentication, process management, and instance locking capabilities for building custom forms that interact with Bizuit BPM.

## Features

- ✅ **Authentication & Authorization** - Token validation, user info, permission checks
- ✅ **Process Management** - Initialize, start and continue processes, handle parameters
- ✅ **Instance Locking** - Pessimistic locking for concurrent access control
- ✅ **TypeScript Support** - Full type safety with TypeScript definitions
- ✅ **React Hooks** - Easy integration with React applications
- ✅ **Server-Side Support** - Works in Next.js API routes, server components, and Node.js (v1.5.0+)
- ✅ **Simplified Configuration** - Single `apiUrl` parameter instead of separate endpoints (v2.0.0+)
- ✅ **Complex Parameters** - Handle scalar and complex (JSON/XML) parameters
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

[See full examples →](https://github.com/bizuit/form-template/tree/main/example/app)

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

[See live example →](https://github.com/bizuit/form-template/tree/main/example/app/example-2-manual-all)

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

All types are exported and available:

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

## License

MIT

## Support

For issues and questions, please visit [Bizuit Support](https://bizuit.com/support)
