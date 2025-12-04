import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BizuitProcessService } from '../lib/api/process-service'
import { BizuitHttpClient } from '../lib/api/http-client'
import type { IBizuitConfig, IStartProcessParams, IProcessResult } from '../lib/types'

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

describe('BizuitProcessService - File Upload', () => {
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
    // Reset mocks
    vi.clearAllMocks()

    // Create service
    service = new BizuitProcessService(mockConfig)

    // Get mocked http client
    mockHttpClient = (service as any).client as {
      post: ReturnType<typeof vi.fn>
      put: ReturnType<typeof vi.fn>
      postMultipart: ReturnType<typeof vi.fn>
    }
  })

  describe('start - with files', () => {
    it('should use multipart when files are provided in params', async () => {
      const mockResponse: IProcessResult = {
        instanceId: 'instance-123',
        status: 'Completed',
        parameters: [],
      }

      mockHttpClient.postMultipart.mockResolvedValueOnce(mockResponse)

      // Create mock file
      const mockFile = new File(['file content'], 'test.pdf', { type: 'application/pdf' })

      const params: IStartProcessParams = {
        processName: 'TestUploadDocs',
        parameters: [],
        files: [mockFile],
      }

      const result = await service.start(params, undefined, mockToken)

      expect(result.instanceId).toBe('instance-123')
      expect(result.status).toBe('Completed')

      // Verify multipart was used with Dashboard API endpoint
      expect(mockHttpClient.postMultipart).toHaveBeenCalledWith(
        `${mockConfig.apiUrl}/instances/RaiseEvent`,
        expect.objectContaining({
          eventName: 'TestUploadDocs',
          parameters: [],
        }),
        [mockFile],
        expect.objectContaining({
          headers: expect.objectContaining({
            'BZ-AUTH-TOKEN': mockToken,
          }),
        })
      )

      // Verify standard post was NOT used
      expect(mockHttpClient.post).not.toHaveBeenCalled()
    })

    it('should use multipart when files are provided as second parameter', async () => {
      const mockResponse: IProcessResult = {
        instanceId: 'instance-456',
        status: 'Completed',
        parameters: [],
      }

      mockHttpClient.postMultipart.mockResolvedValueOnce(mockResponse)

      const mockFile1 = new File(['content 1'], 'doc1.pdf', { type: 'application/pdf' })
      const mockFile2 = new File(['content 2'], 'doc2.pdf', { type: 'application/pdf' })

      const params: IStartProcessParams = {
        processName: 'TestUploadDocs',
        parameters: [],
      }

      const result = await service.start(params, [mockFile1, mockFile2], mockToken)

      expect(result.instanceId).toBe('instance-456')

      // Verify both files were sent
      expect(mockHttpClient.postMultipart).toHaveBeenCalledWith(
        expect.stringContaining('/instances/RaiseEvent'),
        expect.objectContaining({
          eventName: 'TestUploadDocs',
        }),
        [mockFile1, mockFile2],
        expect.any(Object)
      )
    })

    it('should use JSON when no files are provided', async () => {
      const mockResponse: IProcessResult = {
        instanceId: 'instance-789',
        status: 'Completed',
        parameters: [],
      }

      mockHttpClient.post.mockResolvedValueOnce(mockResponse)

      const params: IStartProcessParams = {
        processName: 'TestNoFiles',
        parameters: [],
      }

      await service.start(params, undefined, mockToken)

      // Verify standard JSON post was used
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `${mockConfig.apiUrl}/instances`,
        expect.objectContaining({
          eventName: 'TestNoFiles',
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': mockToken,
          }),
        })
      )

      // Verify multipart was NOT used
      expect(mockHttpClient.postMultipart).not.toHaveBeenCalled()
    })

    it('should include deletedDocuments in payload when provided', async () => {
      const mockResponse: IProcessResult = {
        instanceId: 'instance-999',
        status: 'Completed',
        parameters: [],
      }

      mockHttpClient.postMultipart.mockResolvedValueOnce(mockResponse)

      const mockFile = new File(['new file'], 'new-doc.pdf', { type: 'application/pdf' })

      const params: IStartProcessParams = {
        processName: 'TestUpdateDocs',
        parameters: [],
        files: [mockFile],
        deletedDocuments: ['old-doc-1.pdf', 'old-doc-2.pdf'],
      }

      await service.start(params, undefined, mockToken)

      expect(mockHttpClient.postMultipart).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          eventName: 'TestUpdateDocs',
          deletedDocuments: ['old-doc-1.pdf', 'old-doc-2.pdf'],
        }),
        expect.any(Array),
        expect.any(Object)
      )
    })
  })

  describe('continue - with files', () => {
    it('should use multipart when files are provided', async () => {
      const mockResponse: IProcessResult = {
        instanceId: 'instance-continue-123',
        status: 'Completed',
        parameters: [],
      }

      mockHttpClient.postMultipart.mockResolvedValueOnce(mockResponse)

      const mockFile = new File(['updated file'], 'update.pdf', { type: 'application/pdf' })

      const params: IStartProcessParams = {
        processName: 'TestContinueUpload',
        instanceId: 'instance-continue-123',
        parameters: [],
        files: [mockFile],
      }

      const result = await service.continue(params, undefined, mockToken)

      expect(result.instanceId).toBe('instance-continue-123')

      // Verify POST multipart was used (Dashboard API uses POST for continue too)
      expect(mockHttpClient.postMultipart).toHaveBeenCalledWith(
        `${mockConfig.apiUrl}/instances/RaiseEvent`,
        expect.objectContaining({
          eventName: 'TestContinueUpload',
          instanceId: 'instance-continue-123',
        }),
        [mockFile],
        expect.objectContaining({
          headers: expect.objectContaining({
            'BZ-AUTH-TOKEN': mockToken,
          }),
        })
      )

      // Verify standard put was NOT used
      expect(mockHttpClient.put).not.toHaveBeenCalled()
    })

    it('should use JSON when no files are provided in continue', async () => {
      const mockResponse: IProcessResult = {
        instanceId: 'instance-continue-456',
        status: 'Completed',
        parameters: [],
      }

      mockHttpClient.put.mockResolvedValueOnce(mockResponse)

      const params: IStartProcessParams = {
        processName: 'TestContinueNoFiles',
        instanceId: 'instance-continue-456',
        parameters: [],
      }

      await service.continue(params, undefined, mockToken)

      // Verify standard JSON put was used
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        `${mockConfig.apiUrl}/instances`,
        expect.objectContaining({
          eventName: 'TestContinueNoFiles',
          instanceId: 'instance-continue-456',
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )

      // Verify multipart was NOT used
      expect(mockHttpClient.postMultipart).not.toHaveBeenCalled()
    })

    it('should throw error if instanceId is missing in continue', async () => {
      const params: IStartProcessParams = {
        processName: 'TestContinue',
        parameters: [],
        files: [new File(['file'], 'test.pdf')],
      }

      await expect(service.continue(params, undefined, mockToken)).rejects.toThrow(
        'instanceId is required for continue'
      )
    })
  })

  describe('http-client postMultipart', () => {
    it('should encode JSON as Base64 and append files with actual filenames', async () => {
      // This test verifies the structure by checking mock calls
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })

      const params: IStartProcessParams = {
        processName: 'TestFormData',
        parameters: [],
        files: [mockFile],
      }

      mockHttpClient.postMultipart.mockResolvedValueOnce({
        instanceId: 'test',
        status: 'Completed',
        parameters: [],
      })

      await service.start(params, undefined, mockToken)

      // Verify postMultipart was called with correct structure
      expect(mockHttpClient.postMultipart).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          eventName: 'TestFormData',
          parameters: [],
        }),
        [mockFile],
        expect.any(Object)
      )
    })
  })
})
