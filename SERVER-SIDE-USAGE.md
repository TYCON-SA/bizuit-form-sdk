# Server-Side Usage Guide

## Problem

The main export `@tyconsa/bizuit-form-sdk` includes React hooks (`useBizuitSDK`, `useAuth`) that use `createContext`. This causes errors when imported in Next.js API routes or server components:

```
TypeError: (0 , react__WEBPACK_IMPORTED_MODULE_1__.createContext) is not a function
```

## Solution

Use the `/core` entry point for server-side code:

```typescript
// ❌ DON'T use this in API routes or server components
import { BizuitSDK } from '@tyconsa/bizuit-form-sdk'

// ✅ DO use this in API routes or server components
import { BizuitSDK } from '@tyconsa/bizuit-form-sdk/core'
```

## Usage Examples

### Client-Side (React Components)

```typescript
'use client'

import { useBizuitSDK, buildParameters } from '@tyconsa/bizuit-form-sdk'
import type { IBizuitProcessParameter } from '@tyconsa/bizuit-form-sdk'

export function MyForm() {
  const sdk = useBizuitSDK()

  const handleSubmit = async (formData) => {
    const parameters = buildParameters(
      {
        name: { parameterName: 'Nombre' },
        email: { parameterName: 'Email' }
      },
      formData
    )

    await sdk.process.start({ processName: 'MyProcess', parameters })
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### Server-Side (Next.js API Routes)

```typescript
// app/api/bizuit/start-process/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { BizuitSDK } from '@tyconsa/bizuit-form-sdk/core'

export async function POST(request: NextRequest) {
  const { processName, parameters } = await request.json()

  // Initialize SDK without React dependencies
  const sdk = new BizuitSDK({
    apiUrl: process.env.BIZUIT_API_URL!,
    
  })

  // Authenticate
  const loginResponse = await sdk.auth.login({
    username: process.env.BIZUIT_USER!,
    password: process.env.BIZUIT_PASSWORD!
  })

  // Start process
  const result = await sdk.process.start(
    { processName, parameters },
    undefined,
    loginResponse.Token
  )

  return NextResponse.json({ success: true, instanceId: result.instanceId })
}
```

### Server-Side (Node.js Backend)

```typescript
import { BizuitSDK } from '@tyconsa/bizuit-form-sdk/core'

const sdk = new BizuitSDK({
  apiUrl: 'https://api.bizuit.com/api'
  
})

async function createInstance(processName: string, data: any) {
  const loginResponse = await sdk.auth.login({
    username: 'user',
    password: 'pass'
  })

  const result = await sdk.process.start(
    { processName, parameters: data },
    undefined,
    loginResponse.Token
  )

  return result.instanceId
}
```

## What's Included in Each Export

### `@tyconsa/bizuit-form-sdk` (Client-Side Only)

**Includes:**
- ✅ All API services (BizuitSDK, AuthService, ProcessService, etc.)
- ✅ All types and interfaces
- ✅ All utilities (buildParameters, parseParameters, etc.)
- ✅ React hooks (useBizuitSDK, useAuth)
- ✅ React components (if any)

**Use when:**
- Building React components (`'use client'`)
- Using React hooks
- Frontend-only code

### `@tyconsa/bizuit-form-sdk/core` (Universal)

**Includes:**
- ✅ All API services (BizuitSDK, AuthService, ProcessService, etc.)
- ✅ All types and interfaces
- ✅ All utilities (buildParameters, parseParameters, etc.)
- ❌ NO React hooks
- ❌ NO React components

**Use when:**
- Next.js API routes
- Next.js server components
- Node.js backends
- Any environment without React

## Migration Guide

If you have existing code using the SDK in API routes:

### Before (Broken)

```typescript
// app/api/bizuit/route.ts
import { BizuitSDK } from '@tyconsa/bizuit-form-sdk' // ❌ Causes React error

export async function POST(request) {
  const sdk = new BizuitSDK(config)
  // ...
}
```

### After (Fixed)

```typescript
// app/api/bizuit/route.ts
import { BizuitSDK } from '@tyconsa/bizuit-form-sdk/core' // ✅ No React dependencies

export async function POST(request) {
  const sdk = new BizuitSDK(config)
  // ... same code works!
}
```

## TypeScript Configuration

No additional configuration needed! TypeScript will automatically use the correct type definitions for each entry point.

## Version Compatibility

- **Next.js 13+**: ✅ Supported
- **Next.js 14+**: ✅ Supported
- **Next.js 15+**: ✅ Supported (including React 19)
- **React 18+**: ✅ Supported
- **React 19+**: ✅ Supported
- **Node.js 18+**: ✅ Supported
