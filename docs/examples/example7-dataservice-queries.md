# Example 7: DataService Queries

## Overview

Use the DataService API to fetch lookup data, lists, and query results from BIZUIT Dashboard without creating dedicated processes.

**Use Cases:**
- Combo box data (rejection types, status lists, etc.)
- Reference tables (countries, categories, etc.)
- Read-only reports and dashboards
- Autocomplete suggestions

**Benefits:**
- No need to create BIZUIT processes for simple queries
- Reuse existing DataServices across forms and processes
- Performance optimized with caching
- Clean separation: queries ≠ business processes

---

## Basic DataService Query

### Simple Example: Get Rejection Types

```typescript
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'

interface RejectionType {
  id: number
  code: string
  description: string
  isActive: boolean
}

function RejectionTypeSelector() {
  const sdk = useBizuitSDK()
  const [rejectionTypes, setRejectionTypes] = useState<RejectionType[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadRejectionTypes()
  }, [])

  async function loadRejectionTypes() {
    setLoading(true)
    try {
      // DataService ID 42 returns rejection types
      const result = await sdk.dataService.execute<RejectionType>({
        id: 42,
        parameters: [
          { name: 'status', value: 'active' }
        ]
      }, token)

      if (result.success) {
        setRejectionTypes(result.data)
      } else {
        console.error('Failed to load rejection types:', result.errorMessage)
      }
    } catch (error) {
      console.error('Error loading rejection types:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <select>
      {rejectionTypes.map(type => (
        <option key={type.id} value={type.id}>
          {type.code} - {type.description}
        </option>
      ))}
    </select>
  )
}
```

---

## Query with Multiple Parameters

### Example: Customer Orders Lookup

```typescript
interface Order {
  orderId: number
  customerId: string
  orderDate: string
  totalAmount: number
  status: string
}

async function loadCustomerOrders(customerId: string, year: number) {
  const result = await sdk.dataService.execute<Order>({
    id: 4, // DataService ID for customer orders
    parameters: [
      { name: 'customerId', value: customerId },
      { name: 'year', value: year },
      { name: 'includeDetails', value: true }
    ],
    withoutCache: false // Use cache if available
  }, token)

  if (result.success) {
    console.log(`Found ${result.data.length} orders`)
    return result.data
  } else {
    throw new Error(result.errorMessage)
  }
}
```

---

## Multiple DataServices in Parallel

### Example: Load All Combo Data at Once

```typescript
interface ComboData {
  rejectionTypes: RejectionType[]
  statusList: Status[]
  priorities: Priority[]
}

async function loadAllComboData(token: string): Promise<ComboData> {
  // Execute 3 DataServices in parallel
  const [rejectionResult, statusResult, priorityResult] =
    await sdk.dataService.executeMany([
      { id: 42, parameters: [] }, // Rejection types
      { id: 43, parameters: [] }, // Status list
      { id: 44, parameters: [] }  // Priorities
    ], token)

  return {
    rejectionTypes: rejectionResult.success ? rejectionResult.data : [],
    statusList: statusResult.success ? statusResult.data : [],
    priorities: priorityResult.success ? priorityResult.data : []
  }
}

// Usage
function MyForm() {
  const [comboData, setComboData] = useState<ComboData>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllComboData(token).then(data => {
      setComboData(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <select>
        {comboData?.rejectionTypes.map(type => (
          <option key={type.id} value={type.id}>{type.description}</option>
        ))}
      </select>

      <select>
        {comboData?.statusList.map(status => (
          <option key={status.id} value={status.id}>{status.name}</option>
        ))}
      </select>
    </div>
  )
}
```

---

## Force Fresh Query (Skip Cache)

### Example: Real-time Dashboard

```typescript
async function loadRealtimeDashboard() {
  // Force fresh query every time
  const result = await sdk.dataService.execute({
    id: 100, // Dashboard stats DataService
    parameters: [
      { name: 'dateFrom', value: '2024-01-01' },
      { name: 'dateTo', value: '2024-12-31' }
    ],
    withoutCache: true // ⚠️ Skip cache - always fresh data
  }, token)

  return result.data
}
```

---

## Using createParameters Helper

### Example: Dynamic Filter Builder

```typescript
function buildDynamicQuery(filters: Record<string, any>) {
  // Convert object to parameters array
  const paramArray = Object.entries(filters).map(([name, value]) => ({
    name,
    value
  }))

  const params = sdk.dataService.createParameters(paramArray)

  return sdk.dataService.execute({
    id: 50,
    parameters: params
  }, token)
}

// Usage
const result = await buildDynamicQuery({
  customerId: 'ALFKI',
  orderStatus: 'Pending',
  year: 2024
})
```

---

## Error Handling Best Practices

### Example: Robust Query with Retry

```typescript
async function loadDataWithRetry<T>(
  dataServiceId: number,
  parameters: any[],
  token: string,
  maxRetries = 3
): Promise<T[]> {
  let lastError: string | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await sdk.dataService.execute<T>({
        id: dataServiceId,
        parameters
      }, token)

      if (result.success) {
        return result.data
      }

      lastError = result.errorMessage
      console.warn(`Attempt ${attempt} failed:`, lastError)

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1000))
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error'
      console.error(`Attempt ${attempt} threw error:`, error)
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts: ${lastError}`)
}

// Usage
try {
  const data = await loadDataWithRetry<RejectionType>(42, [], token)
  console.log('Data loaded successfully:', data)
} catch (error) {
  console.error('Could not load data:', error)
  // Show user-friendly error message
}
```

---

## Complete Form Example

### Example: Invoice Approval Form with Lookups

```typescript
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'
import { BizuitCombo } from '@tyconsa/bizuit-ui-components'

interface InvoiceFormData {
  invoiceNumber: string
  supplierId: number
  rejectionTypeId?: number
  statusId: number
  amount: number
}

interface Supplier {
  id: number
  name: string
  taxId: string
}

interface RejectionType {
  id: number
  code: string
  description: string
}

function InvoiceApprovalForm({ token }: { token: string }) {
  const sdk = useBizuitSDK()

  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: '',
    supplierId: 0,
    statusId: 1,
    amount: 0
  })

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [rejectionTypes, setRejectionTypes] = useState<RejectionType[]>([])
  const [loading, setLoading] = useState(true)

  // Load combo data on mount
  useEffect(() => {
    loadComboData()
  }, [])

  async function loadComboData() {
    setLoading(true)
    try {
      // Load suppliers and rejection types in parallel
      const [suppliersResult, rejectionsResult] =
        await sdk.dataService.executeMany([
          { id: 101, parameters: [{ name: 'active', value: true }] }, // Suppliers
          { id: 42, parameters: [{ name: 'status', value: 'active' }] }  // Rejections
        ], token)

      if (suppliersResult.success) {
        setSuppliers(suppliersResult.data)
      }

      if (rejectionsResult.success) {
        setRejectionTypes(rejectionsResult.data)
      }
    } catch (error) {
      console.error('Error loading combo data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    // Submit invoice via process
    const result = await sdk.process.raiseEvent({
      processName: 'InvoiceApproval',
      activityName: 'SubmitInvoice',
      additionalParameters: sdk.process.createParameters([
        { name: 'pInvoiceNumber', value: formData.invoiceNumber },
        { name: 'pSupplierId', value: formData.supplierId },
        { name: 'pRejectionTypeId', value: formData.rejectionTypeId },
        { name: 'pAmount', value: formData.amount }
      ])
    }, [], token)

    if (result.success) {
      console.log('Invoice submitted successfully')
    }
  }

  if (loading) {
    return <div>Loading form data...</div>
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
      <input
        type="text"
        placeholder="Invoice Number"
        value={formData.invoiceNumber}
        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
      />

      <BizuitCombo
        label="Supplier"
        value={formData.supplierId}
        options={suppliers.map(s => ({ value: s.id, label: `${s.name} (${s.taxId})` }))}
        onChange={(value) => setFormData({ ...formData, supplierId: value as number })}
      />

      <BizuitCombo
        label="Rejection Type (Optional)"
        value={formData.rejectionTypeId}
        options={rejectionTypes.map(r => ({ value: r.id, label: `${r.code} - ${r.description}` }))}
        onChange={(value) => setFormData({ ...formData, rejectionTypeId: value as number })}
        clearable
      />

      <input
        type="number"
        placeholder="Amount"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
      />

      <button type="submit">Submit Invoice</button>
    </form>
  )
}
```

---

## API Reference

### `sdk.dataService.execute<T>(request, token)`

Execute a single DataService query.

**Parameters:**
- `request.id` (number) - DataService ID from BIZUIT Dashboard
- `request.parameters` (array) - Query parameters
- `request.withoutCache` (boolean, optional) - Skip cache (default: false)
- `request.executeFromGlobal` (boolean, optional) - Execute from global scope (default: false)
- `token` (string) - Authentication token

**Returns:** `Promise<IDataServiceResponse<T>>`

```typescript
{
  success: boolean
  data: T[]
  totalCount?: number
  errorMessage?: string
  errorType?: string
}
```

---

### `sdk.dataService.executeMany<T>(requests, token)`

Execute multiple DataService queries in parallel.

**Parameters:**
- `requests` (array) - Array of DataService requests
- `token` (string) - Authentication token

**Returns:** `Promise<IDataServiceResponse<T>[]>`

---

### `sdk.dataService.createParameters(params)`

Helper to create DataService parameters array.

**Parameters:**
- `params` (array) - Array of `{ name, value, isGroupBy? }`

**Returns:** `IDataServiceParameter[]`

---

## When to Use DataService vs Process

| Scenario | Use DataService | Use Process |
|----------|----------------|-------------|
| Combo box data | ✅ Yes | ❌ No |
| Reference tables | ✅ Yes | ❌ No |
| Read-only reports | ✅ Yes | ❌ No |
| Autocomplete | ✅ Yes | ❌ No |
| Business logic | ❌ No | ✅ Yes |
| Data updates | ❌ No | ✅ Yes |
| Workflow steps | ❌ No | ✅ Yes |
| Audit trail needed | ❌ No | ✅ Yes |

---

## Tips & Best Practices

1. **Parallel Loading:** Use `executeMany()` to load multiple combos simultaneously
2. **Cache Strategy:** Use `withoutCache: false` for reference data, `true` for real-time data
3. **Error Handling:** Always check `result.success` before using `result.data`
4. **Type Safety:** Define TypeScript interfaces for your DataService results
5. **Loading States:** Show loading indicators while fetching combo data
6. **Retry Logic:** Implement retry for critical lookups (network issues)

---

## Next Steps

- [Example 1: Simple Process Start](./example1-simple-start.md)
- [Example 2: Process with Parameters](./example2-process-with-params.md)
- [Example 4: Dynamic Forms](./example4-dynamic-form.md)
