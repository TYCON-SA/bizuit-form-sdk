# Example 8: File Uploads

This example demonstrates how to upload files when starting or continuing a process using the Bizuit SDK with the Dashboard API.

## Overview

The SDK automatically handles file uploads by:
- Using Dashboard API endpoint (`/instances/RaiseEvent`)
- Encoding JSON data as Base64
- Sending files with `multipart/form-data`
- Using Basic Authentication

**Key Features:**
- 📎 Upload one or multiple files
- 🔄 Works with both `start()` and `continue()` methods
- 🗑️ Support for `deletedDocuments` to remove old files
- 🎯 Automatic detection - no manual configuration needed

## Basic File Upload - Starting a Process

```typescript
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'
import { useState } from 'react'

function DocumentUploadForm() {
  const sdk = useBizuitSDK()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async () => {
    setUploading(true)

    try {
      const token = 'Basic ' + btoa('username:password')

      // Start process with files
      const result = await sdk.process.start({
        processName: 'DocumentUpload',
        parameters: [],
        files: files  // ✅ Files automatically handled with Dashboard API
      }, undefined, token)

      if (result.status === 'Completed') {
        console.log('✅ Files uploaded successfully!')
        console.log('Instance ID:', result.instanceId)
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        disabled={uploading}
      />
      <button onClick={handleSubmit} disabled={uploading || files.length === 0}>
        {uploading ? 'Uploading...' : 'Upload Files'}
      </button>
      <p>{files.length} file(s) selected</p>
    </div>
  )
}
```

## Alternative: Files as Second Parameter

You can also pass files as the second parameter (legacy support):

```typescript
const result = await sdk.process.start(
  {
    processName: 'DocumentUpload',
    parameters: []
  },
  files,  // ✅ Files as second parameter
  token
)
```

Both approaches work identically - use whichever fits your code style better.

## Continuing a Process with Files

When continuing an existing process instance, use the `continue()` method:

```typescript
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'

function AddMoreDocuments({ instanceId }: { instanceId: string }) {
  const sdk = useBizuitSDK()

  const addDocuments = async (newFiles: File[]) => {
    const token = 'Basic ' + btoa('username:password')

    const result = await sdk.process.continue({
      processName: 'DocumentUpload',
      instanceId: instanceId,  // ✅ Required for continue
      parameters: [],
      files: newFiles
    }, undefined, token)

    return result
  }

  return (
    <input
      type="file"
      multiple
      onChange={(e) => {
        if (e.target.files) {
          addDocuments(Array.from(e.target.files))
        }
      }}
    />
  )
}
```

## Replacing Files (Upload + Delete)

To replace existing files, use the `deletedDocuments` array:

```typescript
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'

function ReplaceDocuments({ instanceId }: { instanceId: string }) {
  const sdk = useBizuitSDK()

  const replaceFiles = async (newFiles: File[], filesToDelete: string[]) => {
    const token = 'Basic ' + btoa('username:password')

    const result = await sdk.process.continue({
      processName: 'DocumentUpload',
      instanceId: instanceId,
      parameters: [],
      files: newFiles,
      deletedDocuments: filesToDelete  // ✅ Files to remove
    }, undefined, token)

    return result
  }

  return (
    <button onClick={() => {
      const newFile = new File(['new content'], 'updated-doc.pdf')
      replaceFiles(
        [newFile],
        ['old-doc-1.pdf', 'old-doc-2.pdf']  // Remove old files
      )
    }}>
      Replace Documents
    </button>
  )
}
```

## Technical Details

### How it Works

The SDK automatically switches between JSON and multipart modes:

**Without Files (JSON mode):**
```typescript
// SDK sends:
POST /api/instances
Content-Type: application/json
Authorization: Basic TOKEN

{
  "eventName": "MyProcess",
  "parameters": [...]
}
```

**With Files (Multipart mode):**
```typescript
// SDK automatically sends to Dashboard API:
POST /api/instances/RaiseEvent
Content-Type: multipart/form-data
Authorization: Basic TOKEN

// FormData with:
// - 'data' field: Base64 encoded JSON
// - Files with their actual filenames as keys
```

### File Naming Convention

Files are appended to FormData using their actual filenames:
- File "invoice.pdf" → FormData key: "invoice.pdf"
- File "contract.docx" → FormData key: "contract.docx"

This matches the Dashboard API specification.

### Authentication

File uploads require Basic Authentication:

```typescript
// Encode username:password as Base64
const token = 'Basic ' + btoa(username + ':' + password)

await sdk.process.start({
  processName: 'MyProcess',
  files: files
}, undefined, token)
```

## Complete Example with BizuitFileUpload

```typescript
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'
import { BizuitFileUpload } from '@tyconsa/bizuit-ui-components'
import { useState } from 'react'

interface Props {
  processName: string
  username: string
  password: string
  onSuccess?: (instanceId: string) => void
  onError?: (error: Error) => void
}

function ProcessWithFiles({ processName, username, password, onSuccess, onError }: Props) {
  const sdk = useBizuitSDK()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      const token = 'Basic ' + btoa(`${username}:${password}`)

      const result = await sdk.process.start({
        processName: processName,
        parameters: [],
        files: files,
        closeOnSuccess: true
      }, undefined, token)

      if (result.status === 'Completed') {
        onSuccess?.(result.instanceId)
      }
    } catch (error) {
      onError?.(error as Error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Documents:</label>
        <BizuitFileUpload
          onChange={setFiles}
          maxFiles={10}
          maxSize={10 * 1024 * 1024} // 10MB
          accept={{
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'image/*': ['.jpg', '.jpeg', '.png']
          }}
        />
      </div>

      <button type="submit" disabled={uploading || files.length === 0}>
        {uploading ? 'Uploading...' : `Submit with ${files.length} file(s)`}
      </button>
    </form>
  )
}
```

## Best Practices

### ✅ Do:
- Validate file types and sizes before uploading
- Show upload progress to users
- Handle errors gracefully
- Use TypeScript for type safety
- Combine with BizuitFileUpload for better UX
- Use Basic Authentication for Dashboard API

### ❌ Don't:
- Upload files larger than server limits (check with your admin)
- Forget to handle errors
- Skip validation on file types
- Upload sensitive files without encryption
- Forget to encode credentials as Base64 for Basic Auth

## Troubleshooting

### Files not uploading

Check that:
1. Files are properly passed to `files` parameter
2. File objects are valid (not `null` or `undefined`)
3. Server supports multipart/form-data
4. File size is within server limits
5. Using Basic Authentication correctly

### "401 Unauthorized" error

Make sure you're using Basic Authentication:

```typescript
// ✅ Correct
const token = 'Basic ' + btoa('username:password')

// ❌ Wrong
const token = 'username:password'
```

### "Content-Type not supported" error

Make sure you're using SDK version 2.4.0 or later. Earlier versions don't support file uploads.

```bash
npm install @tyconsa/bizuit-form-sdk@latest
```

## Related

- [BizuitFileUpload Component](../../bizuit-ui-components/README.md) - Full component documentation
- [Process Service API](../api/process-service.md) - Complete API reference
- [Dashboard API Documentation](https://docs.bizuit.com) - Bizuit Dashboard API docs

## Version History

- **v2.4.0** (2024-12) - Added Dashboard API multipart/form-data support for file uploads
