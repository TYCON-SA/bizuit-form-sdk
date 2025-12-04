# File Upload Examples - Flexible File Sources

The Bizuit SDK supports multiple file sources for uploads:
- Browser `File` objects (traditional file input)
- Base64 encoded strings
- `Blob` objects
- `ArrayBuffer` objects

## Table of Contents
- [Browser File Upload](#1-browser-file-upload-traditional)
- [Base64 String Upload](#2-base64-string-upload)
- [Blob Upload](#3-blob-upload)
- [ArrayBuffer Upload](#4-arraybuffer-upload)
- [Mixed File Sources](#5-mixed-file-sources)
- [TypeScript Interface](#typescript-interface)

---

## 1. Browser File Upload (Traditional)

Upload files directly from a file input:

```typescript
import { BizuitProcessService } from '@tyconsa/bizuit-form-sdk'

const service = new BizuitProcessService({
  apiUrl: 'https://api.bizuit.com'
})

// From file input
const fileInput = document.getElementById('fileInput') as HTMLInputElement
const files = Array.from(fileInput.files || [])

// Start process with files
const result = await service.start(
  {
    processName: 'UploadDocuments',
    parameters: []
  },
  files,
  authToken
)
```

---

## 2. Base64 String Upload

Upload files from base64 strings (useful for data URLs, camera captures, or server data):

```typescript
import { BizuitProcessService, IBizuitFile } from '@tyconsa/bizuit-form-sdk'

const service = new BizuitProcessService({
  apiUrl: 'https://api.bizuit.com'
})

// Example 1: From data URL (e.g., canvas.toDataURL())
const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
const fileFromDataUrl: IBizuitFile = {
  fileName: 'screenshot.png',
  content: dataUrl,  // SDK automatically handles data URL prefix
  mimeType: 'image/png',
  encoding: 'base64'
}

// Example 2: From pure base64 string
const base64Content = 'iVBORw0KGgoAAAANSUhEUgAA...'
const fileFromBase64: IBizuitFile = {
  fileName: 'document.pdf',
  content: base64Content,
  mimeType: 'application/pdf',
  encoding: 'base64'
}

// Start process with base64 files
const result = await service.start(
  {
    processName: 'UploadDocuments',
    parameters: [],
    files: [fileFromDataUrl, fileFromBase64]  // ← IBizuitFile[] instead of File[]
  },
  undefined,
  authToken
)
```

---

## 3. Blob Upload

Upload files from Blob objects (useful for API responses, canvas blobs, etc.):

```typescript
import { BizuitProcessService, IBizuitFile } from '@tyconsa/bizuit-form-sdk'

const service = new BizuitProcessService({
  apiUrl: 'https://api.bizuit.com'
})

// Example 1: From canvas
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement
canvas.toBlob(async (blob) => {
  if (!blob) return

  const file: IBizuitFile = {
    fileName: 'drawing.png',
    content: blob,
    mimeType: 'image/png'
  }

  await service.start(
    {
      processName: 'UploadDrawing',
      parameters: [],
      files: [file]
    },
    undefined,
    authToken
  )
})

// Example 2: From fetch response
const response = await fetch('https://example.com/document.pdf')
const blob = await response.blob()

const file: IBizuitFile = {
  fileName: 'remote-document.pdf',
  content: blob,
  mimeType: blob.type || 'application/pdf'
}

await service.start(
  {
    processName: 'UploadDocument',
    parameters: [],
    files: [file]
  },
  undefined,
  authToken
)
```

---

## 4. ArrayBuffer Upload

Upload files from ArrayBuffer (useful for binary data, WebSocket transfers, etc.):

```typescript
import { BizuitProcessService, IBizuitFile } from '@tyconsa/bizuit-form-sdk'

const service = new BizuitProcessService({
  apiUrl: 'https://api.bizuit.com'
})

// Example 1: From fetch response
const response = await fetch('https://example.com/binary-data.bin')
const arrayBuffer = await response.arrayBuffer()

const file: IBizuitFile = {
  fileName: 'data.bin',
  content: arrayBuffer,
  mimeType: 'application/octet-stream'
}

await service.start(
  {
    processName: 'UploadBinaryData',
    parameters: [],
    files: [file]
  },
  undefined,
  authToken
)

// Example 2: From FileReader
const fileInput = document.getElementById('fileInput') as HTMLInputElement
const browserFile = fileInput.files?.[0]

if (browserFile) {
  const reader = new FileReader()
  reader.onload = async (e) => {
    const arrayBuffer = e.target?.result as ArrayBuffer

    const file: IBizuitFile = {
      fileName: browserFile.name,
      content: arrayBuffer,
      mimeType: browserFile.type
    }

    await service.start(
      {
        processName: 'UploadDocument',
        parameters: [],
        files: [file]
      },
      undefined,
      authToken
    )
  }
  reader.readAsArrayBuffer(browserFile)
}
```

---

## 5. Mixed File Sources

You can mix different file sources in the same upload:

```typescript
import { BizuitProcessService, IBizuitFile } from '@tyconsa/bizuit-form-sdk'

const service = new BizuitProcessService({
  apiUrl: 'https://api.bizuit.com'
})

// Get browser file
const fileInput = document.getElementById('fileInput') as HTMLInputElement
const browserFile = fileInput.files?.[0]

// Create base64 file
const base64File: IBizuitFile = {
  fileName: 'signature.png',
  content: 'iVBORw0KGgoAAAANSUhEUgAA...',
  mimeType: 'image/png',
  encoding: 'base64'
}

// Create blob file
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const blob = await new Promise<Blob>((resolve) => {
  canvas.toBlob((b) => resolve(b!), 'image/png')
})
const blobFile: IBizuitFile = {
  fileName: 'drawing.png',
  content: blob,
  mimeType: 'image/png'
}

// Upload all together - mix of File, base64, and Blob
const files: (File | IBizuitFile)[] = []
if (browserFile) files.push(browserFile)  // Browser File
files.push(base64File)  // Base64 string
files.push(blobFile)    // Blob

await service.start(
  {
    processName: 'UploadDocuments',
    parameters: [],
    files: files
  },
  undefined,
  authToken
)
```

---

## TypeScript Interface

### `IBizuitFile` Interface

```typescript
interface IBizuitFile {
  fileName: string                              // Name for the uploaded file
  content: File | string | Blob | ArrayBuffer   // File content from various sources
  mimeType?: string                             // MIME type (e.g., 'image/png', 'application/pdf')
  encoding?: 'base64' | 'binary'                // Encoding type (only relevant for strings)
}
```

### Usage in `IStartProcessParams`

```typescript
interface IStartProcessParams {
  processName: string
  instanceId?: string
  parameters: IParameter[]
  processVersion?: string
  closeOnSuccess?: boolean
  deletedDocuments?: string[]
  files?: File[] | IBizuitFile[]  // ← Supports both traditional and flexible files
}
```

---

## Continue Operation with Files

The same flexible file support works for `continue()` operations:

```typescript
// Continue with new files
await service.continue(
  {
    processName: 'UploadDocuments',
    instanceId: 'existing-instance-id',
    parameters: [],
    files: [
      {
        fileName: 'additional-document.pdf',
        content: base64String,
        mimeType: 'application/pdf',
        encoding: 'base64'
      }
    ],
    deletedDocuments: ['16', '17']  // Document IDs to delete
  },
  undefined,
  authToken
)
```

---

## Important Notes

1. **Backward Compatibility**: The SDK still accepts `File[]` arrays, so existing code doesn't break.

2. **Automatic Conversion**: The SDK automatically converts all file sources to `File` objects before sending to the API.

3. **Base64 Handling**: The SDK automatically detects and strips data URL prefixes (e.g., `data:image/png;base64,`).

4. **MIME Types**: If not provided, the SDK will use a default MIME type:
   - Blob: Uses `blob.type`
   - ArrayBuffer/base64: Uses `'application/octet-stream'`

5. **Error Handling**: If a base64 string is malformed, the SDK will throw an error with a descriptive message.

---

## Real-World Use Cases

### Use Case 1: Camera Capture
```typescript
// Capture photo from camera and upload
const stream = await navigator.mediaDevices.getUserMedia({ video: true })
const video = document.createElement('video')
video.srcObject = stream

const canvas = document.createElement('canvas')
canvas.width = video.videoWidth
canvas.height = video.videoHeight
const ctx = canvas.getContext('2d')!
ctx.drawImage(video, 0, 0)

const base64Image = canvas.toDataURL('image/jpeg')

await service.start({
  processName: 'UploadPhoto',
  parameters: [],
  files: [{
    fileName: 'photo.jpg',
    content: base64Image,
    mimeType: 'image/jpeg',
    encoding: 'base64'
  }]
}, undefined, authToken)
```

### Use Case 2: Download and Re-upload
```typescript
// Download from one instance, upload to another
const documents = await service.getDocuments(sourceInstanceId, authToken)
const file = documents[0]

// Download the document
const blob = await service.downloadDocument(file.ID, file.Version, authToken)

// Upload to new instance
await service.start({
  processName: 'UploadDocument',
  parameters: [],
  files: [{
    fileName: file.FileName,
    content: blob,
    mimeType: blob.type
  }]
}, undefined, authToken)
```

### Use Case 3: Generate PDF from HTML
```typescript
// Using a library like jsPDF
import jsPDF from 'jspdf'

const doc = new jsPDF()
doc.text('Hello world!', 10, 10)
const pdfBlob = doc.output('blob')

await service.start({
  processName: 'UploadReport',
  parameters: [],
  files: [{
    fileName: 'report.pdf',
    content: pdfBlob,
    mimeType: 'application/pdf'
  }]
}, undefined, authToken)
```

---

## Complete Example: Multi-Source Form

```typescript
import { BizuitProcessService, IBizuitFile } from '@tyconsa/bizuit-form-sdk'

async function submitForm(formData: {
  name: string
  age: number
  browserFiles: FileList
  signatureBase64: string
  photoBlob: Blob
}) {
  const service = new BizuitProcessService({
    apiUrl: 'https://api.bizuit.com'
  })

  // Collect files from different sources
  const files: (File | IBizuitFile)[] = []

  // 1. Browser file input
  for (let i = 0; i < formData.browserFiles.length; i++) {
    files.push(formData.browserFiles[i])
  }

  // 2. Base64 signature
  files.push({
    fileName: 'signature.png',
    content: formData.signatureBase64,
    mimeType: 'image/png',
    encoding: 'base64'
  })

  // 3. Photo blob
  files.push({
    fileName: 'photo.jpg',
    content: formData.photoBlob,
    mimeType: 'image/jpeg'
  })

  // Start process
  const result = await service.start(
    {
      processName: 'SubmitApplication',
      parameters: [
        { name: 'pName', value: formData.name, type: 'SingleValue', direction: 'In' },
        { name: 'pAge', value: String(formData.age), type: 'SingleValue', direction: 'In' }
      ],
      files: files
    },
    undefined,
    authToken
  )

  console.log('Process started:', result.instanceId)
  return result
}
```

---

## Testing

The SDK includes comprehensive tests for all file upload scenarios. See [process-file-upload.test.ts](src/__tests__/process-file-upload.test.ts) for details.
