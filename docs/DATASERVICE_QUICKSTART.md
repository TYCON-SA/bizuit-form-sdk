# DataService Quick Start Guide

## What is DataService?

DataService is BIZUIT Dashboard's query abstraction layer. It allows you to execute pre-defined database queries without creating dedicated BIZUIT processes.

**Perfect for:**
- Loading combo box options (rejection types, status lists, categories)
- Fetching reference data (countries, currencies, customers)
- Read-only reports and dashboards
- Autocomplete suggestions

**NOT for:**
- Business logic execution → Use `sdk.process.raiseEvent()`
- Data updates → Use processes
- Workflow steps → Use processes

---

## Installation

The DataService feature is included in `@tyconsa/bizuit-form-sdk` v2.2.0+

```bash
npm install @tyconsa/bizuit-form-sdk@latest
```

---

## Basic Usage

### 1. Simple Query (No Parameters)

```typescript
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'

function MyForm() {
  const sdk = useBizuitSDK()
  const [countries, setCountries] = useState([])

  useEffect(() => {
    loadCountries()
  }, [])

  async function loadCountries() {
    const result = await sdk.dataService.execute({
      id: 50, // DataService ID for countries list
      parameters: []
    }, token)

    if (result.success) {
      setCountries(result.data)
    } else {
      console.error('Failed to load countries:', result.errorMessage)
    }
  }

  return (
    <select>
      {countries.map(country => (
        <option key={country.id} value={country.id}>
          {country.name}
        </option>
      ))}
    </select>
  )
}
```

---

### 2. Query with Parameters

```typescript
async function loadRejectionTypes(category: string) {
  const result = await sdk.dataService.execute({
    id: 1, // DataService ID
    parameters: [
      { name: 'typename', value: category }
    ]
  }, token)

  return result.data
}

// Usage
const rejectionTypes = await loadRejectionTypes('Motivos de Rechazo')
```

---

### 3. Load Multiple Combos in Parallel

```typescript
async function loadFormCombos() {
  const [rejectionTypes, statuses, priorities] =
    await sdk.dataService.executeMany([
      { id: 1, parameters: [{ name: 'typename', value: 'Motivos de Rechazo' }] },
      { id: 102, parameters: [] }, // Status list
      { id: 103, parameters: [] }  // Priorities
    ], token)

  return {
    rejectionTypes: rejectionTypes.success ? rejectionTypes.data : [],
    statuses: statuses.success ? statuses.data : [],
    priorities: priorities.success ? priorities.data : []
  }
}
```

---

## TypeScript Support

Define your data types for full type safety:

```typescript
interface RejectionType {
  id: number
  code: string
  description: string
  isActive: boolean
}

// Typed query
const result = await sdk.dataService.execute<RejectionType>({
  id: 1,
  parameters: [
    { name: 'typename', value: 'Motivos de Rechazo' }
  ]
}, token)

// result.data is RejectionType[]
result.data.forEach(type => {
  console.log(type.code, type.description)
})
```

---

## Real-World Example: Invoice Form

Complete example showing DataService integration in a form:

```typescript
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'
import { BizuitCombo } from '@tyconsa/bizuit-ui-components'

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

function InvoiceForm({ token }: { token: string }) {
  const sdk = useBizuitSDK()

  // Form state
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    supplierId: 0,
    rejectionTypeId: undefined,
    amount: 0
  })

  // Combo data
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [rejectionTypes, setRejectionTypes] = useState<RejectionType[]>([])
  const [loading, setLoading] = useState(true)

  // Load combos on mount
  useEffect(() => {
    loadComboData()
  }, [])

  async function loadComboData() {
    setLoading(true)
    try {
      // Load both combos in parallel
      const [suppliersResult, rejectionsResult] =
        await sdk.dataService.executeMany<Supplier | RejectionType>([
          { id: 101, parameters: [{ name: 'active', value: true }] },
          { id: 1, parameters: [{ name: 'typename', value: 'Motivos de Rechazo' }] }
        ], token)

      if (suppliersResult.success) {
        setSuppliers(suppliersResult.data as Supplier[])
      }

      if (rejectionsResult.success) {
        setRejectionTypes(rejectionsResult.data as RejectionType[])
      }
    } catch (error) {
      console.error('Error loading combos:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    // Submit via BIZUIT process
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
      alert('Invoice submitted successfully!')
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
        options={suppliers.map(s => ({
          value: s.id,
          label: `${s.name} (${s.taxId})`
        }))}
        onChange={(value) => setFormData({ ...formData, supplierId: value as number })}
      />

      <BizuitCombo
        label="Rejection Type (Optional)"
        value={formData.rejectionTypeId}
        options={rejectionTypes.map(r => ({
          value: r.id,
          label: `${r.code} - ${r.description}`
        }))}
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

```typescript
const result = await sdk.dataService.execute<MyType>({
  id: 42,                    // DataService ID (required)
  parameters: [],            // Query parameters (optional)
  withoutCache: false,       // Skip cache? (optional, default: false)
  executeFromGlobal: false   // Execute from global scope? (optional, default: false)
}, token)

// Returns:
// {
//   success: boolean
//   data: T[]
//   errorMessage?: string
//   errorType?: string
// }
```

---

### `sdk.dataService.executeMany<T>(requests, token)`

Execute multiple DataService queries in parallel.

```typescript
const results = await sdk.dataService.executeMany<MyType>([
  { id: 101, parameters: [] },
  { id: 102, parameters: [] },
  { id: 103, parameters: [] }
], token)

// Returns: IDataServiceResponse<T>[]
```

---

### `sdk.dataService.createParameters(params)`

Helper to create parameters array.

```typescript
const params = sdk.dataService.createParameters([
  { name: 'customerId', value: 'ALFKI' },
  { name: 'year', value: 2024 },
  { name: 'includeDetails', value: true }
])

// Returns:
// [
//   { name: 'customerId', value: 'ALFKI', isGroupBy: false },
//   { name: 'year', value: 2024, isGroupBy: false },
//   { name: 'includeDetails', value: true, isGroupBy: false }
// ]
```

---

## Cache Control

### Use Cache (Default)

Good for reference data that doesn't change often:

```typescript
const countries = await sdk.dataService.execute({
  id: 50,
  parameters: [],
  withoutCache: false // Default - use cache
}, token)
```

### Force Fresh Query

Good for real-time dashboards:

```typescript
const liveStats = await sdk.dataService.execute({
  id: 100,
  parameters: [],
  withoutCache: true // Skip cache - always fresh
}, token)
```

---

## Error Handling

Always check `result.success` before using data:

```typescript
const result = await sdk.dataService.execute({ id: 42 }, token)

if (result.success) {
  console.log('Data loaded:', result.data)
} else {
  console.error('Query failed:', result.errorMessage)
  // Show user-friendly error
}
```

---

## Best Practices

1. **Load combos in parallel** using `executeMany()` for better performance
2. **Use TypeScript types** for type safety
3. **Check success flag** before using data
4. **Show loading states** while fetching
5. **Handle errors gracefully** with user-friendly messages
6. **Use cache for reference data**, skip cache for real-time data
7. **Separate concerns**: DataService for queries, processes for business logic

---

## FAQ

**Q: Can I use DataService for data updates?**
A: No. DataService is read-only. Use BIZUIT processes for data updates.

**Q: Do I need to create a BIZUIT process to use DataService?**
A: No. DataServices are pre-defined queries in BIZUIT Dashboard. Just use the ID.

**Q: How do I find the DataService ID?**
A: Check with your BIZUIT Dashboard administrator or look in the Dashboard admin panel.

**Q: Can I execute SQL directly?**
A: No. DataServices must be pre-defined in BIZUIT Dashboard for security.

**Q: What if the DataService doesn't exist?**
A: You'll get `success: false` with an error message. Always check the success flag.

**Q: Can I use DataService in server-side code?**
A: Yes! Use `@tyconsa/bizuit-form-sdk/core` import for server-side usage.

---

## Next Steps

- See [Example 7: DataService Queries](./examples/example7-dataservice-queries.md) for complete examples
- Read the [Full API Reference](../README.md#bizuitdataserviceservice)
- Check out [Process Integration](./examples/example1-simple-start.md) for business logic
