# Example 7: DataService Queries

This example demonstrates how to use the DataService API to fetch lookup data, lists, and reports from BIZUIT Dashboard.

## Overview

The DataService API provides three ways to execute queries, each with different levels of developer experience:

1. **`execute()`** - Execute by numeric ID (legacy)
2. **`executeByName()`** - Execute by page ID + DataService name
3. **`executeByPageAndName()`** ⭐ **RECOMMENDED** - Execute by page name + DataService name

## Method 1: Execute by ID (Legacy)

```typescript
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'

function RejectionTypeCombo() {
  const sdk = useBizuitSDK()
  const [options, setOptions] = useState([])

  useEffect(() => {
    async function loadData() {
      const token = 'your-auth-token'

      // ❌ Hard to maintain - what is ID 42?
      const result = await sdk.dataService.execute({
        id: 42,
        parameters: []
      }, token)

      if (result.success) {
        setOptions(result.data)
      }
    }
    loadData()
  }, [])

  return (
    <select>
      {options.map(opt => (
        <option key={opt.id} value={opt.id}>
          {opt.name}
        </option>
      ))}
    </select>
  )
}
```

**Problems:**
- ❌ Magic number `42` - what does it mean?
- ❌ ID may differ across environments (dev/qa/prod)
- ❌ Hard to maintain and understand

## Method 2: Execute by Name (Better)

```typescript
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'

interface RejectionType {
  ParameterId: number
  ParameterName: string
  TypeId: number
}

function RejectionTypeCombo() {
  const sdk = useBizuitSDK()
  const [options, setOptions] = useState<RejectionType[]>([])

  useEffect(() => {
    async function loadData() {
      const token = 'your-auth-token'

      // ✅ Better - descriptive name
      const result = await sdk.dataService.executeByName<RejectionType>({
        tabModuleId: 1018,                     // Still a magic number
        dataServiceName: 'Motivos de Rechazo', // But name is clear!
        parameters: []
      }, token)

      if (result.success) {
        setOptions(result.data)
      } else {
        console.error('Error:', result.errorMessage)
      }
    }
    loadData()
  }, [])

  return (
    <select>
      {options.map(opt => (
        <option key={opt.ParameterId} value={opt.ParameterId}>
          {opt.ParameterName}
        </option>
      ))}
    </select>
  )
}
```

**Benefits:**
- ✅ Self-documenting - "Motivos de Rechazo"
- ✅ Still has magic number for page ID
- ⚠️ Need to know tabModuleId

## Method 3: Execute by Page Name + DataService Name ⭐ RECOMMENDED

```typescript
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'

interface RejectionType {
  ParameterId: number
  ParameterName: string
  TypeId: number
}

function RejectionTypeCombo() {
  const sdk = useBizuitSDK()
  const [options, setOptions] = useState<RejectionType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError(null)

      const token = 'your-auth-token'

      // 🎯 BEST - Zero magic numbers!
      const result = await sdk.dataService.executeByPageAndName<RejectionType>({
        pageName: 'DataService',              // Human-readable page name
        dataServiceName: 'GetParametersByType', // DataService name from grid.title
        parameters: [
          { name: 'typename', value: 'Motivos de Rechazo' }
        ]
      }, token)

      setLoading(false)

      if (result.success) {
        setOptions(result.data)
      } else {
        // Handle different error types
        if (result.errorType === 'PAGE_NOT_FOUND') {
          setError('User does not have access to this page')
        } else if (result.errorType === 'NO_MODULES_FOUND') {
          setError('Page has no DataServices configured')
        } else if (result.errorType === 'DS_NOT_FOUND') {
          setError('DataService not found in page')
        } else {
          setError(result.errorMessage || 'Unknown error')
        }
      }
    }
    loadData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <select>
      {options.map(opt => (
        <option key={opt.ParameterId} value={opt.ParameterId}>
          {opt.ParameterName}
        </option>
      ))}
    </select>
  )
}
```

**Benefits:**
- ✅ **ZERO magic numbers** - everything is descriptive
- ✅ **Self-documenting** - code reads like English
- ✅ **Environment-portable** - same names work everywhere
- ✅ **Automatic security** - only accessible pages returned
- ✅ **Copy-paste friendly** - easy to share across team

## Complete Example: Form with Multiple Lookups

```typescript
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'
import { useState, useEffect } from 'react'

interface Parameter {
  ParameterId: number
  ParameterName: string
  TypeId: number
}

interface FormData {
  rejectionType: number | null
  status: number | null
  priority: number | null
}

function ExpenseRequestForm() {
  const sdk = useBizuitSDK()
  const [formData, setFormData] = useState<FormData>({
    rejectionType: null,
    status: null,
    priority: null
  })

  const [lookups, setLookups] = useState({
    rejectionTypes: [] as Parameter[],
    statuses: [] as Parameter[],
    priorities: [] as Parameter[]
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLookups() {
      const token = 'your-auth-token'

      // Load all lookups in parallel
      const [rejectionTypes, statuses, priorities] = await sdk.dataService.executeMany([
        {
          pageName: 'DataService',
          dataServiceName: 'GetParametersByType',
          parameters: [{ name: 'typename', value: 'Motivos de Rechazo' }]
        },
        {
          pageName: 'DataService',
          dataServiceName: 'GetParametersByType',
          parameters: [{ name: 'typename', value: 'Estados' }]
        },
        {
          pageName: 'DataService',
          dataServiceName: 'GetParametersByType',
          parameters: [{ name: 'typename', value: 'Prioridades' }]
        }
      ], token)

      setLookups({
        rejectionTypes: rejectionTypes.success ? rejectionTypes.data : [],
        statuses: statuses.success ? statuses.data : [],
        priorities: priorities.success ? priorities.data : []
      })

      setLoading(false)
    }

    loadLookups()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Submit form with selected values
    console.log('Form data:', formData)
  }

  if (loading) return <div>Loading lookups...</div>

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Rejection Type:</label>
        <select
          value={formData.rejectionType || ''}
          onChange={(e) => setFormData({ ...formData, rejectionType: Number(e.target.value) })}
        >
          <option value="">Select...</option>
          {lookups.rejectionTypes.map(opt => (
            <option key={opt.ParameterId} value={opt.ParameterId}>
              {opt.ParameterName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Status:</label>
        <select
          value={formData.status || ''}
          onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
        >
          <option value="">Select...</option>
          {lookups.statuses.map(opt => (
            <option key={opt.ParameterId} value={opt.ParameterId}>
              {opt.ParameterName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Priority:</label>
        <select
          value={formData.priority || ''}
          onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
        >
          <option value="">Select...</option>
          {lookups.priorities.map(opt => (
            <option key={opt.ParameterId} value={opt.ParameterId}>
              {opt.ParameterName}
            </option>
          ))}
        </select>
      </div>

      <button type="submit">Submit</button>
    </form>
  )
}
```

## With Custom Hook (Reusable Pattern)

```typescript
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'
import { useState, useEffect } from 'react'

interface UseDataServiceOptions {
  pageName: string
  dataServiceName: string
  parameters?: Array<{ name: string; value: any }>
  token: string
}

function useDataService<T = any>(options: UseDataServiceOptions) {
  const sdk = useBizuitSDK()
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      const result = await sdk.dataService.executeByPageAndName<T>({
        pageName: options.pageName,
        dataServiceName: options.dataServiceName,
        parameters: options.parameters || []
      }, options.token)

      setLoading(false)

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.errorMessage || 'Unknown error')
      }
    }

    fetchData()
  }, [options.pageName, options.dataServiceName, options.token])

  return { data, loading, error }
}

// Usage:
function MyForm() {
  const token = 'your-auth-token'

  const { data: rejectionTypes, loading: loadingRejections } = useDataService({
    pageName: 'DataService',
    dataServiceName: 'GetParametersByType',
    parameters: [{ name: 'typename', value: 'Motivos de Rechazo' }],
    token
  })

  if (loadingRejections) return <div>Loading...</div>

  return (
    <select>
      {rejectionTypes.map((type: any) => (
        <option key={type.ParameterId} value={type.ParameterId}>
          {type.ParameterName}
        </option>
      ))}
    </select>
  )
}
```

## Server-Side Usage (Next.js API Route)

```typescript
// app/api/lookups/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { BizuitSDK } from '@tyconsa/bizuit-form-sdk/core'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const typename = searchParams.get('typename') || 'Motivos de Rechazo'

  // Initialize SDK (server-side)
  const sdk = new BizuitSDK({
    apiUrl: process.env.BIZUIT_API_URL!
  })

  // Get token (from your auth system)
  const token = 'your-auth-token'

  // Execute DataService
  const result = await sdk.dataService.executeByPageAndName({
    pageName: 'DataService',
    dataServiceName: 'GetParametersByType',
    parameters: [
      { name: 'typename', value: typename }
    ]
  }, token)

  if (result.success) {
    return NextResponse.json({
      success: true,
      data: result.data
    })
  } else {
    return NextResponse.json({
      success: false,
      error: result.errorMessage
    }, { status: 500 })
  }
}
```

## Key Takeaways

1. **Always use `executeByPageAndName()`** for new code - zero magic numbers!
2. **TypeScript support** - Define your data interfaces for type safety
3. **Error handling** - Check `errorType` for specific error cases
4. **Automatic security** - Only accessible pages are returned
5. **Environment portability** - Same code works across dev/qa/prod
6. **Custom hooks** - Create reusable patterns for your team
7. **Server-side support** - Use `/core` export for API routes
