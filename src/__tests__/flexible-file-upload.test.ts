import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BizuitProcessService } from '../lib/api/process-service'
import { BizuitHttpClient } from '../lib/api/http-client'
import type { IBizuitConfig, IStartProcessParams, IProcessResult, IBizuitFile } from '../lib/types'

// Mock BizuitHttpClient
vi.mock('../lib/api/http-client', () => {
  return {
    BizuitHttpClient: vi.fn().mockImplementation(() => ({
      post: vi.fn(),
      put: vi.fn(),
      postMultipart: vi.fn(),
    })),
  }
})

describe('BizuitProcessService - Flexible File Upload', () => {
  let service: BizuitProcessService
  let mockHttpClient: {
    post: ReturnType<typeof vi.fn>
    put: ReturnType<typeof vi.fn>
    postMultipart: ReturnType<typeof vi.fn>
  }
  const mockConfig: IBizuitConfig = {
    apiUrl: 'https://test.bizuit.com/arielschBIZUITDashboardAPI/api',
  }
  const mockToken = 'Basic test-token-123'

  beforeEach(() => {
    vi.clearAllMocks()
    service = new BizuitProcessService(mockConfig)
    mockHttpClient = (service as any).client as {
      post: ReturnType<typeof vi.fn>
      put: ReturnType<typeof vi.fn>
      postMultipart: ReturnType<typeof vi.fn>
    }
  })

  describe('start - with IBizuitFile[]', () => {
    it('should handle base64 string files', async () => {
      const mockResponse: IProcessResult = {
        instanceId: 'instance-123',
        status: 'Completed',
        parameters: [],
      }

      mockHttpClient.postMultipart.mockResolvedValueOnce(mockResponse)

      // Create base64 file
      const base64Content = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      const bizuitFile: IBizuitFile = {
        fileName: 'test.png',
        content: base64Content,
        mimeType: 'image/png',
        encoding: 'base64'
      }

      const params: IStartProcessParams = {
        processName: 'TestBase64Upload',
        parameters: [],
        files: [bizuitFile],
      }

      const result = await service.start(params, undefined, mockToken)

      expect(result.instanceId).toBe('instance-123')
      expect(mockHttpClient.postMultipart).toHaveBeenCalled()

      // Get the files argument
      const callArgs = mockHttpClient.postMultipart.mock.calls[0]
      const filesArg = callArgs[2]

      // Should convert IBizuitFile to File array
      expect(Array.isArray(filesArg)).toBe(true)
    })

    it('should handle data URL base64 strings', async () => {
      const mockResponse: IProcessResult = {
        instanceId: 'instance-456',
        status: 'Completed',
        parameters: [],
      }

      mockHttpClient.postMultipart.mockResolvedValueOnce(mockResponse)

      // Create data URL file
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      const bizuitFile: IBizuitFile = {
        fileName: 'screenshot.png',
        content: dataUrl,
        mimeType: 'image/png',
        encoding: 'base64'
      }

      const params: IStartProcessParams = {
        processName: 'TestDataUrlUpload',
        parameters: [],
        files: [bizuitFile],
      }

      await service.start(params, undefined, mockToken)

      expect(mockHttpClient.postMultipart).toHaveBeenCalled()
    })

    it('should handle Blob files', async () => {
      const mockResponse: IProcessResult = {
        instanceId: 'instance-789',
        status: 'Completed',
        parameters: [],
      }

      mockHttpClient.postMultipart.mockResolvedValueOnce(mockResponse)

      // Create blob file
      const blob = new Blob(['test content'], { type: 'text/plain' })
      const bizuitFile: IBizuitFile = {
        fileName: 'test.txt',
        content: blob,
        mimeType: 'text/plain'
      }

      const params: IStartProcessParams = {
        processName: 'TestBlobUpload',
        parameters: [],
        files: [bizuitFile],
      }

      await service.start(params, undefined, mockToken)

      expect(mockHttpClient.postMultipart).toHaveBeenCalled()
    })

    it('should handle ArrayBuffer files', async () => {
      const mockResponse: IProcessResult = {
        instanceId: 'instance-101',
        status: 'Completed',
        parameters: [],
      }

      mockHttpClient.postMultipart.mockResolvedValueOnce(mockResponse)

      // Create ArrayBuffer file
      const buffer = new ArrayBuffer(8)
      const view = new Uint8Array(buffer)
      view[0] = 72 // 'H'
      view[1] = 101 // 'e'
      view[2] = 108 // 'l'
      view[3] = 108 // 'l'
      view[4] = 111 // 'o'

      const bizuitFile: IBizuitFile = {
        fileName: 'binary.bin',
        content: buffer,
        mimeType: 'application/octet-stream'
      }

      const params: IStartProcessParams = {
        processName: 'TestArrayBufferUpload',
        parameters: [],
        files: [bizuitFile],
      }

      await service.start(params, undefined, mockToken)

      expect(mockHttpClient.postMultipart).toHaveBeenCalled()
    })

    it('should handle mixed File and IBizuitFile arrays', async () => {
      const mockResponse: IProcessResult = {
        instanceId: 'instance-202',
        status: 'Completed',
        parameters: [],
      }

      mockHttpClient.postMultipart.mockResolvedValueOnce(mockResponse)

      // Create browser File
      const browserFile = new File(['browser content'], 'browser.txt', { type: 'text/plain' })

      // Create base64 IBizuitFile
      const base64File: IBizuitFile = {
        fileName: 'base64.txt',
        content: btoa('base64 content'),
        mimeType: 'text/plain',
        encoding: 'base64'
      }

      const params: IStartProcessParams = {
        processName: 'TestMixedUpload',
        parameters: [],
        files: [browserFile, base64File],
      }

      await service.start(params, undefined, mockToken)

      expect(mockHttpClient.postMultipart).toHaveBeenCalled()

      // Get the files argument
      const callArgs = mockHttpClient.postMultipart.mock.calls[0]
      const filesArg = callArgs[2]

      // Both should be in the array
      expect(filesArg.length).toBe(2)
    })

    it('should handle IBizuitFile with File content', async () => {
      const mockResponse: IProcessResult = {
        instanceId: 'instance-303',
        status: 'Completed',
        parameters: [],
      }

      mockHttpClient.postMultipart.mockResolvedValueOnce(mockResponse)

      // Create IBizuitFile wrapping a File
      const browserFile = new File(['file content'], 'wrapped.txt', { type: 'text/plain' })
      const bizuitFile: IBizuitFile = {
        fileName: 'wrapped.txt',
        content: browserFile,
        mimeType: 'text/plain'
      }

      const params: IStartProcessParams = {
        processName: 'TestWrappedFileUpload',
        parameters: [],
        files: [bizuitFile],
      }

      await service.start(params, undefined, mockToken)

      expect(mockHttpClient.postMultipart).toHaveBeenCalled()
    })
  })

  describe('continue - with IBizuitFile[]', () => {
    it('should use multipart when IBizuitFile[] provided', async () => {
      const mockResponse: IProcessResult = {
        instanceId: 'instance-continue-123',
        status: 'Completed',
        parameters: [],
      }

      mockHttpClient.postMultipart.mockResolvedValueOnce(mockResponse)

      const base64File: IBizuitFile = {
        fileName: 'update.pdf',
        content: 'JVBERi0xLjQK',
        mimeType: 'application/pdf',
        encoding: 'base64'
      }

      const params: IStartProcessParams = {
        processName: 'TestContinueFlexible',
        instanceId: 'instance-continue-123',
        parameters: [],
        files: [base64File],
      }

      const result = await service.continue(params, undefined, mockToken)

      expect(result.instanceId).toBe('instance-continue-123')
      expect(mockHttpClient.postMultipart).toHaveBeenCalled()
      expect(mockHttpClient.put).not.toHaveBeenCalled()
    })

    it('should handle multiple IBizuitFile types in continue', async () => {
      const mockResponse: IProcessResult = {
        instanceId: 'instance-continue-456',
        status: 'Completed',
        parameters: [],
      }

      mockHttpClient.postMultipart.mockResolvedValueOnce(mockResponse)

      const blob = new Blob(['blob content'], { type: 'text/plain' })
      const blobFile: IBizuitFile = {
        fileName: 'blob.txt',
        content: blob,
        mimeType: 'text/plain'
      }

      const base64File: IBizuitFile = {
        fileName: 'base64.txt',
        content: btoa('base64 content'),
        mimeType: 'text/plain',
        encoding: 'base64'
      }

      const params: IStartProcessParams = {
        processName: 'TestContinueMultiple',
        instanceId: 'instance-continue-456',
        parameters: [],
        files: [blobFile, base64File],
        deletedDocuments: ['old-doc-1', 'old-doc-2']
      }

      await service.continue(params, undefined, mockToken)

      expect(mockHttpClient.postMultipart).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          eventName: 'TestContinueMultiple',
          instanceId: 'instance-continue-456',
          deletedDocuments: ['old-doc-1', 'old-doc-2']
        }),
        expect.any(Array),
        expect.any(Object)
      )
    })
  })

  describe('backward compatibility', () => {
    it('should still accept File[] arrays', async () => {
      const mockResponse: IProcessResult = {
        instanceId: 'instance-compat',
        status: 'Completed',
        parameters: [],
      }

      mockHttpClient.postMultipart.mockResolvedValueOnce(mockResponse)

      const file1 = new File(['content 1'], 'file1.txt', { type: 'text/plain' })
      const file2 = new File(['content 2'], 'file2.txt', { type: 'text/plain' })

      const params: IStartProcessParams = {
        processName: 'TestBackwardCompat',
        parameters: [],
        files: [file1, file2], // Traditional File[] array
      }

      const result = await service.start(params, undefined, mockToken)

      expect(result.instanceId).toBe('instance-compat')
      expect(mockHttpClient.postMultipart).toHaveBeenCalled()
    })

    it('should accept files as second parameter (legacy API)', async () => {
      const mockResponse: IProcessResult = {
        instanceId: 'instance-legacy',
        status: 'Completed',
        parameters: [],
      }

      mockHttpClient.postMultipart.mockResolvedValueOnce(mockResponse)

      const file = new File(['content'], 'file.txt', { type: 'text/plain' })

      const params: IStartProcessParams = {
        processName: 'TestLegacyAPI',
        parameters: [],
      }

      // Legacy: files passed as second parameter
      await service.start(params, [file], mockToken)

      expect(mockHttpClient.postMultipart).toHaveBeenCalled()
    })
  })
})
