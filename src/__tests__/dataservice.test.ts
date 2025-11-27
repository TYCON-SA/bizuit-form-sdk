import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BizuitDataServiceService } from '../lib/api/dataservice-service'
import { BizuitHttpClient } from '../lib/api/http-client'
import type { IBizuitConfig, IDataServiceResponse } from '../lib/types'

// Mock BizuitHttpClient
vi.mock('../lib/api/http-client', () => {
  return {
    BizuitHttpClient: vi.fn().mockImplementation(() => ({
      post: vi.fn(),
    })),
  }
})

describe('BizuitDataServiceService', () => {
  let service: BizuitDataServiceService
  let mockHttpClient: { post: ReturnType<typeof vi.fn> }
  const mockConfig: IBizuitConfig = {
    apiUrl: 'https://test.bizuit.com/bizuitdashboardapi/api',
  }
  const mockToken = 'test-token-123'

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Create service
    service = new BizuitDataServiceService(mockConfig)

    // Get mocked http client
    mockHttpClient = (service as any).client as { post: ReturnType<typeof vi.fn> }
  })

  describe('execute', () => {
    it('should execute a simple DataService query', async () => {
      const mockResponse: IDataServiceResponse = {
        success: true,
        data: [
          { id: 1, code: 'R001', description: 'Invalid data' },
          { id: 2, code: 'R002', description: 'Missing fields' },
        ],
      }

      mockHttpClient.post.mockResolvedValueOnce(mockResponse)

      const result = await service.execute(
        {
          id: 42,
          parameters: [],
        },
        mockToken
      )

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toHaveProperty('code', 'R001')

      // Verify HTTP call
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/Dashboard/DataService/Execute'),
        {
          id: 42,
          parameters: [],
        },
        {
          headers: {
            'bz-auth-token': `Basic ${mockToken}`,
          },
        }
      )
    })

    it('should execute query with parameters', async () => {
      const mockResponse: IDataServiceResponse = {
        success: true,
        data: [{ customerId: 'ALFKI', companyName: 'Alfreds Futterkiste' }],
      }

      mockHttpClient.post.mockResolvedValueOnce(mockResponse)

      const result = await service.execute(
        {
          id: 4,
          parameters: [
            { name: 'customerId', value: 'ALFKI' },
            { name: 'year', value: 2024 },
          ],
        },
        mockToken
      )

      expect(result.success).toBe(true)
      expect(result.data[0].customerId).toBe('ALFKI')

      // Verify parameters were sent
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          parameters: [
            { name: 'customerId', value: 'ALFKI', isGroupBy: false },
            { name: 'year', value: 2024, isGroupBy: false },
          ],
        }),
        expect.any(Object)
      )
    })

    it('should include withoutCache query param', async () => {
      const mockResponse: IDataServiceResponse = {
        success: true,
        data: [],
      }

      mockHttpClient.post.mockResolvedValueOnce(mockResponse)

      await service.execute(
        {
          id: 100,
          parameters: [],
          withoutCache: true,
        },
        mockToken
      )

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.stringContaining('withoutCache=true'),
        expect.any(Object),
        expect.any(Object)
      )
    })

    it('should include executeFromGlobal query param', async () => {
      const mockResponse: IDataServiceResponse = {
        success: true,
        data: [],
      }

      mockHttpClient.post.mockResolvedValueOnce(mockResponse)

      await service.execute(
        {
          id: 100,
          parameters: [],
          executeFromGlobal: true,
        },
        mockToken
      )

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.stringContaining('executeFromGlobal=true'),
        expect.any(Object),
        expect.any(Object)
      )
    })

    it('should handle errors gracefully', async () => {
      const mockError = {
        message: 'DataService not found',
        code: 'DS_NOT_FOUND',
      }

      mockHttpClient.post.mockRejectedValueOnce(mockError)

      const result = await service.execute(
        {
          id: 999,
          parameters: [],
        },
        mockToken
      )

      expect(result.success).toBe(false)
      expect(result.data).toEqual([])
      expect(result.errorMessage).toBe('DataService not found')
      expect(result.errorType).toBe('DS_NOT_FOUND')
    })

    it('should support typed responses', async () => {
      interface RejectionType {
        id: number
        code: string
        description: string
        isActive: boolean
      }

      const mockResponse: IDataServiceResponse<RejectionType> = {
        success: true,
        data: [
          { id: 1, code: 'R001', description: 'Invalid', isActive: true },
        ],
      }

      mockHttpClient.post.mockResolvedValueOnce(mockResponse)

      const result = await service.execute<RejectionType>(
        {
          id: 1,
          parameters: [{ name: 'typename', value: 'Motivos de Rechazo' }],
        },
        mockToken
      )

      expect(result.success).toBe(true)
      expect(result.data[0].code).toBe('R001')
      expect(result.data[0].isActive).toBe(true)
    })

    it('should set default values for optional parameters', async () => {
      const mockResponse: IDataServiceResponse = {
        success: true,
        data: [],
      }

      mockHttpClient.post.mockResolvedValueOnce(mockResponse)

      await service.execute(
        {
          id: 42,
          // No parameters, withoutCache, or executeFromGlobal
        },
        mockToken
      )

      // Verify defaults
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.stringContaining('withoutCache=false'),
        expect.objectContaining({
          parameters: [],
        }),
        expect.any(Object)
      )
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.stringContaining('executeFromGlobal=false'),
        expect.any(Object),
        expect.any(Object)
      )
    })
  })

  describe('createParameters', () => {
    it('should create parameters array from simple objects', () => {
      const params = service.createParameters([
        { name: 'customerId', value: 'ALFKI' },
        { name: 'year', value: 2024 },
      ])

      expect(params).toEqual([
        { name: 'customerId', value: 'ALFKI', isGroupBy: false },
        { name: 'year', value: 2024, isGroupBy: false },
      ])
    })

    it('should respect isGroupBy when provided', () => {
      const params = service.createParameters([
        { name: 'category', value: 'Electronics', isGroupBy: true },
        { name: 'status', value: 'Active' },
      ])

      expect(params).toEqual([
        { name: 'category', value: 'Electronics', isGroupBy: true },
        { name: 'status', value: 'Active', isGroupBy: false },
      ])
    })

    it('should handle empty array', () => {
      const params = service.createParameters([])

      expect(params).toEqual([])
    })

    it('should handle various value types', () => {
      const params = service.createParameters([
        { name: 'stringParam', value: 'text' },
        { name: 'numberParam', value: 42 },
        { name: 'boolParam', value: true },
        { name: 'nullParam', value: null },
      ])

      expect(params).toHaveLength(4)
      expect(params[0].value).toBe('text')
      expect(params[1].value).toBe(42)
      expect(params[2].value).toBe(true)
      expect(params[3].value).toBe(null)
    })
  })

  describe('executeMany', () => {
    it('should execute multiple DataService queries in parallel', async () => {
      const mockResponse1: IDataServiceResponse = {
        success: true,
        data: [{ id: 1, name: 'Supplier 1' }],
      }

      const mockResponse2: IDataServiceResponse = {
        success: true,
        data: [{ id: 1, status: 'Active' }],
      }

      mockHttpClient.post
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2)

      const results = await service.executeMany(
        [
          { id: 101, parameters: [] },
          { id: 102, parameters: [] },
        ],
        mockToken
      )

      expect(results).toHaveLength(2)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(true)
      expect(results[0].data[0].name).toBe('Supplier 1')
      expect(results[1].data[0].status).toBe('Active')

      // Verify both calls were made
      expect(mockHttpClient.post).toHaveBeenCalledTimes(2)
    })

    it('should handle mixed success and failure', async () => {
      const mockResponse1: IDataServiceResponse = {
        success: true,
        data: [{ id: 1 }],
      }

      const mockError = {
        message: 'DataService not found',
        code: 'DS_NOT_FOUND',
      }

      mockHttpClient.post
        .mockResolvedValueOnce(mockResponse1)
        .mockRejectedValueOnce(mockError)

      const results = await service.executeMany(
        [
          { id: 101, parameters: [] },
          { id: 999, parameters: [] }, // This will fail
        ],
        mockToken
      )

      expect(results).toHaveLength(2)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(false)
      expect(results[1].errorMessage).toBe('DataService not found')
    })

    it('should handle empty requests array', async () => {
      const results = await service.executeMany([], mockToken)

      expect(results).toEqual([])
      expect(mockHttpClient.post).not.toHaveBeenCalled()
    })

    it('should support typed responses for multiple queries', async () => {
      interface Supplier {
        id: number
        name: string
      }

      interface Status {
        id: number
        name: string
      }

      const mockResponse1: IDataServiceResponse<Supplier> = {
        success: true,
        data: [{ id: 1, name: 'Supplier A' }],
      }

      const mockResponse2: IDataServiceResponse<Status> = {
        success: true,
        data: [{ id: 1, name: 'Active' }],
      }

      mockHttpClient.post
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2)

      const results = await service.executeMany<Supplier | Status>(
        [
          { id: 101, parameters: [] },
          { id: 102, parameters: [] },
        ],
        mockToken
      )

      expect(results[0].data[0]).toHaveProperty('name', 'Supplier A')
      expect(results[1].data[0]).toHaveProperty('name', 'Active')
    })
  })

  describe('Integration scenarios', () => {
    it('should support combo box data loading pattern', async () => {
      const mockRejectionTypes: IDataServiceResponse = {
        success: true,
        data: [
          { id: 1, code: 'R001', description: 'Invalid data' },
          { id: 2, code: 'R002', description: 'Missing fields' },
        ],
      }

      mockHttpClient.post.mockResolvedValueOnce(mockRejectionTypes)

      const result = await service.execute(
        {
          id: 1,
          parameters: [
            { name: 'typename', value: 'Motivos de Rechazo' },
          ],
        },
        mockToken
      )

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)

      // Verify can be used for combo box
      const comboOptions = result.data.map((item: any) => ({
        value: item.id,
        label: `${item.code} - ${item.description}`,
      }))

      expect(comboOptions).toEqual([
        { value: 1, label: 'R001 - Invalid data' },
        { value: 2, label: 'R002 - Missing fields' },
      ])
    })

    it('should support loading multiple combos simultaneously', async () => {
      const mockSuppliers: IDataServiceResponse = {
        success: true,
        data: [{ id: 1, name: 'Supplier A' }],
      }

      const mockStatuses: IDataServiceResponse = {
        success: true,
        data: [{ id: 1, name: 'Active' }],
      }

      const mockPriorities: IDataServiceResponse = {
        success: true,
        data: [{ id: 1, name: 'High' }],
      }

      mockHttpClient.post
        .mockResolvedValueOnce(mockSuppliers)
        .mockResolvedValueOnce(mockStatuses)
        .mockResolvedValueOnce(mockPriorities)

      const [suppliers, statuses, priorities] = await service.executeMany(
        [
          { id: 101, parameters: [] },
          { id: 102, parameters: [] },
          { id: 103, parameters: [] },
        ],
        mockToken
      )

      expect(suppliers.success).toBe(true)
      expect(statuses.success).toBe(true)
      expect(priorities.success).toBe(true)
      expect(suppliers.data[0].name).toBe('Supplier A')
      expect(statuses.data[0].name).toBe('Active')
      expect(priorities.data[0].name).toBe('High')
    })
  })

  describe('getByTabModuleId', () => {
    it('should fetch all DataServices for a tab module', async () => {
      const mockDataServices = [
        { id: 1, name: 'Motivos de Rechazo', tabModuleId: 1018, isActive: true },
        { id: 2, name: 'Estados', tabModuleId: 1018, isActive: true },
        { id: 3, name: 'Prioridades', tabModuleId: 1018, isActive: true },
      ]

      // Mock GET request
      const mockGet = vi.fn().mockResolvedValueOnce(mockDataServices)
      mockHttpClient.get = mockGet

      const result = await service.getByTabModuleId(1018, mockToken)

      expect(result).toHaveLength(3)
      expect(result[0].name).toBe('Motivos de Rechazo')
      expect(result[1].name).toBe('Estados')
      expect(result[2].name).toBe('Prioridades')

      // Verify API call
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/Dashboard/DataService/GetByTabModuleId?tabModuleId=1018'),
        expect.objectContaining({
          headers: {
            'Authorization': `Basic ${mockToken}`,
          },
        })
      )
    })

    it('should return empty array on error', async () => {
      const mockGet = vi.fn().mockRejectedValueOnce(new Error('Network error'))
      mockHttpClient.get = mockGet

      const result = await service.getByTabModuleId(1018, mockToken)

      expect(result).toEqual([])
    })

    it('should handle empty response', async () => {
      const mockGet = vi.fn().mockResolvedValueOnce([])
      mockHttpClient.get = mockGet

      const result = await service.getByTabModuleId(1018, mockToken)

      expect(result).toEqual([])
    })
  })

  describe('executeByName', () => {
    it('should find and execute DataService by name', async () => {
      const mockDataServices = [
        { id: 1, name: 'Motivos de Rechazo', tabModuleId: 1018 },
        { id: 2, name: 'Estados', tabModuleId: 1018 },
      ]

      const mockExecuteResponse = {
        success: true,
        data: [
          { id: 1, code: 'R001', description: 'Invalid data' },
        ],
      }

      // Mock getByTabModuleId
      const mockGet = vi.fn().mockResolvedValueOnce(mockDataServices)
      mockHttpClient.get = mockGet

      // Mock execute
      mockHttpClient.post.mockResolvedValueOnce(mockExecuteResponse)

      const result = await service.executeByName({
        tabModuleId: 1018,
        dataServiceName: 'Motivos de Rechazo',
        parameters: [{ name: 'status', value: 'active' }],
      }, mockToken)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].code).toBe('R001')

      // Verify getByTabModuleId was called
      expect(mockGet).toHaveBeenCalled()

      // Verify execute was called with correct ID
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          id: 1, // ID from 'Motivos de Rechazo'
          parameters: [{ name: 'status', value: 'active', isGroupBy: false }],
        }),
        expect.any(Object)
      )
    })

    it('should return error if DataService not found', async () => {
      const mockDataServices = [
        { id: 1, name: 'Estados', tabModuleId: 1018 },
      ]

      const mockGet = vi.fn().mockResolvedValueOnce(mockDataServices)
      mockHttpClient.get = mockGet

      const result = await service.executeByName({
        tabModuleId: 1018,
        dataServiceName: 'NonExistent',
        parameters: [],
      }, mockToken)

      expect(result.success).toBe(false)
      expect(result.errorMessage).toContain('not found')
      expect(result.errorType).toBe('DS_NOT_FOUND')
      expect(result.data).toEqual([])
    })

    it('should support cache control', async () => {
      const mockDataServices = [
        { id: 1, name: 'Test DS', tabModuleId: 1018 },
      ]

      const mockGet = vi.fn().mockResolvedValueOnce(mockDataServices)
      mockHttpClient.get = mockGet

      mockHttpClient.post.mockResolvedValueOnce({ success: true, data: [] })

      await service.executeByName({
        tabModuleId: 1018,
        dataServiceName: 'Test DS',
        withoutCache: true,
      }, mockToken)

      // Verify withoutCache was passed through
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.stringContaining('withoutCache=true'),
        expect.any(Object),
        expect.any(Object)
      )
    })
  })

  describe('findByName', () => {
    it('should find DataService by name', async () => {
      const mockDataServices = [
        { id: 1, name: 'Motivos de Rechazo', tabModuleId: 1018 },
        { id: 2, name: 'Estados', tabModuleId: 1018 },
      ]

      const mockGet = vi.fn().mockResolvedValueOnce(mockDataServices)
      mockHttpClient.get = mockGet

      const result = await service.findByName(1018, 'Estados', mockToken)

      expect(result).not.toBeNull()
      expect(result?.id).toBe(2)
      expect(result?.name).toBe('Estados')
    })

    it('should return null if not found', async () => {
      const mockDataServices = [
        { id: 1, name: 'Estados', tabModuleId: 1018 },
      ]

      const mockGet = vi.fn().mockResolvedValueOnce(mockDataServices)
      mockHttpClient.get = mockGet

      const result = await service.findByName(1018, 'NonExistent', mockToken)

      expect(result).toBeNull()
    })
  })

  describe('Developer Experience - executeByName', () => {
    it('should simplify form development with name-based lookup', async () => {
      // Developer doesn't need to know DataService ID
      // Only needs: tabModuleId (page ID) + DataService name

      const mockDataServices = [
        { id: 42, name: 'Motivos de Rechazo', tabModuleId: 1018 },
      ]

      const mockRejectionTypes = {
        success: true,
        data: [
          { id: 1, code: 'R001', description: 'Invalid data' },
          { id: 2, code: 'R002', description: 'Missing fields' },
        ],
      }

      const mockGet = vi.fn().mockResolvedValueOnce(mockDataServices)
      mockHttpClient.get = mockGet
      mockHttpClient.post.mockResolvedValueOnce(mockRejectionTypes)

      // Simple, descriptive API
      const result = await service.executeByName({
        tabModuleId: 1018,
        dataServiceName: 'Motivos de Rechazo',
      }, mockToken)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)

      // Can be used directly for combo box
      const comboOptions = result.data.map(item => ({
        value: item.id,
        label: `${item.code} - ${item.description}`,
      }))

      expect(comboOptions[0]).toEqual({ value: 1, label: 'R001 - Invalid data' })
    })
  })
})
