# Changelog

All notable changes to `@tyconsa/bizuit-form-sdk` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2025-11-27

### Added

- **DataService Support**: Execute queries via BIZUIT Dashboard DataService API
  - `BizuitDataServiceService` class for executing DataService queries
  - `sdk.dataService.execute<T>()` - Execute single query with typed responses
  - `sdk.dataService.executeMany<T>()` - Execute multiple queries in parallel
  - `sdk.dataService.createParameters()` - Helper for creating parameters array
  - Full TypeScript support with `IDataServiceRequest` and `IDataServiceResponse` types
  - Cache control via `withoutCache` parameter
  - 17 comprehensive unit tests

### Documentation

- Added [DATASERVICE_QUICKSTART.md](./docs/DATASERVICE_QUICKSTART.md) - Quick start guide
- Added [Example 7: DataService Queries](./docs/examples/example7-dataservice-queries.md) - Complete usage examples
- Updated main README with DataService API reference
- Added architecture decision documentation (Option C vs other approaches)

### Use Cases

Perfect for:
- Loading combo box data (rejection types, status lists)
- Fetching reference tables (countries, categories)
- Read-only reports and dashboards
- Autocomplete suggestions

NOT for:
- Business logic execution (use `process.raiseEvent()`)
- Data updates (use processes)
- Workflow steps (use processes)

---

## [2.1.1] - 2025-11-25

### Fixed

- XmlParameter types and helpers refinement
- XML parser edge cases

---

## [2.1.0] - 2025-11-25

### Added

- **XmlParameter Class**: Mutable object representation for XML parameters
  - Parse XML to JavaScript objects automatically
  - Modify objects and convert back to XML
  - Type-safe operations with TypeScript
  - Support for nested structures, arrays, and XSD schemas
  - 56 comprehensive unit tests
  - Full documentation in [XMLPARAMETER_GUIDE.md](./XMLPARAMETER_GUIDE.md)

### Documentation

- Added [XMLPARAMETER_GUIDE.md](./XMLPARAMETER_GUIDE.md) - Complete guide
- Added [EXAMPLES_XMLPARAMETER.md](./EXAMPLES_XMLPARAMETER.md) - 6 real-world examples

---

## [2.0.0] - 2025-11-20

### Changed (Breaking)

- **Simplified Configuration**: Single `apiUrl` parameter instead of separate endpoints
  - Before: `{ authUrl, processUrl, formsUrl }`
  - After: `{ apiUrl }` (e.g., `https://server.com/bizuitdashboardapi/api`)
  - SDK automatically appends correct endpoint paths

### Migration Guide

```typescript
// Before (v1.x)
const sdk = new BizuitSDK({
  authUrl: 'https://server.com/bizuitdashboardapi/api/Login',
  processUrl: 'https://server.com/bizuitdashboardapi/api/Process',
  formsUrl: 'https://server.com/bizuitdashboardapi/api/Forms'
})

// After (v2.0+)
const sdk = new BizuitSDK({
  apiUrl: 'https://server.com/bizuitdashboardapi/api'
})
```

---

## [1.5.0] - 2025-11-15

### Added

- **Server-Side Support**: New `/core` export for Next.js API routes and Node.js
  - Use `@tyconsa/bizuit-form-sdk/core` for server-side code
  - No React dependencies in core export
  - Full documentation in [SERVER-SIDE-USAGE.md](./SERVER-SIDE-USAGE.md)

---

## [1.4.0] - 2025-11-10

### Added

- Instance locking service (`BizuitInstanceLockService`)
- `withLock()` method for automatic lock/unlock
- Pessimistic locking support for concurrent access control

---

## [1.3.0] - 2025-11-05

### Added

- Process initialization support (`initialize()` method)
- Form metadata service (`BizuitFormService`)
- Dynamic form field generation support

---

## [1.2.0] - 2025-11-01

### Added

- React hooks (`useBizuitSDK`, `useAuth`)
- Zustand state management integration
- Improved error handling

---

## [1.1.0] - 2025-10-25

### Added

- Process management service (`BizuitProcessService`)
- File upload support for processes
- Parameter helpers (`buildParameters`, `formDataToParameters`)

---

## [1.0.0] - 2025-10-20

### Added

- Initial release
- Authentication service (`BizuitAuthService`)
- Token validation
- User info retrieval
- Basic TypeScript types
