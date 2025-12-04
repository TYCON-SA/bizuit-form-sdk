/**
 * BizuitTaskService Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BizuitTaskService } from '../lib/api/task-service'
import { BizuitHttpClient } from '../lib/api/http-client'
import type { IBizuitConfig } from '../lib/types'
import type { IProcessMetadata, ITasksSearchResponse } from '../lib/types/tasks.types'

// Mock BizuitHttpClient
vi.mock('../lib/api/http-client')

describe('BizuitTaskService', () => {
  let service: BizuitTaskService
  let mockClient: any
  const config: IBizuitConfig = {
    apiUrl: 'https://test.bizuit.com/api',
    timeout: 30000,
  }
  const testToken = 'Basic dGVzdDp0ZXN0'

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Create mock client instance
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    }

    // Mock BizuitHttpClient constructor
    vi.mocked(BizuitHttpClient).mockImplementation(() => mockClient)

    // Create service instance
    service = new BizuitTaskService(config)
  })

  describe('getProcesses', () => {
    it('should fetch all processes', async () => {
      const mockProcesses: IProcessMetadata[] = [
        {
          name: 'TestProcess1',
          workflowDisplayName: 'Test Process 1',
          workflowName: 'TestProcess1',
          category: 'Test',
          subCategory: '',
          icon: null,
          iconColor: null,
          activities: [
            {
              activityName: 'startPointActivity1',
              displayName: 'Start',
              childEventName: null,
              isStartPoint: true,
              hasQuickForm: false,
              isEmpty: false,
              connectorUrl: 'https://example.com/form',
              idBindedConnector: '123',
              instructions: null,
              isDefault: true,
              version: '1.0.0.0',
              connectorType: 'WebForm',
              width: 0,
              height: 0,
              formName: 'StartForm',
              formId: 100,
              isGroupingActivity: false,
            },
          ],
        },
      ]

      mockClient.get.mockResolvedValue(mockProcesses)

      const result = await service.getProcesses(testToken)

      expect(mockClient.get).toHaveBeenCalledWith(
        'https://test.bizuit.com/api/Processes?isMobile=false',
        {
          headers: {
            Authorization: testToken,
          },
        }
      )
      expect(result).toEqual(mockProcesses)
    })

    it('should handle errors when fetching processes', async () => {
      const error = new Error('Network error')
      mockClient.get.mockRejectedValue(error)

      await expect(service.getProcesses(testToken)).rejects.toThrow('Network error')
    })
  })

  describe('getProcessDetails', () => {
    it('should fetch specific process details', async () => {
      const mockProcess: IProcessMetadata = {
        name: 'TestWix',
        workflowDisplayName: 'TestWix',
        workflowName: 'TestWix',
        category: '',
        subCategory: '',
        icon: null,
        iconColor: null,
        activities: [
          {
            activityName: 'TestPayLoad',
            displayName: 'TestPayLoad',
            childEventName: null,
            isStartPoint: true,
            hasQuickForm: false,
            isEmpty: false,
            connectorUrl: 'https://example.com/form',
            idBindedConnector: '4550',
            instructions: null,
            isDefault: true,
            version: '3.0.0.0',
            connectorType: 'BIZUIT',
            width: 1085,
            height: 428,
            formName: null,
            formId: 0,
            isGroupingActivity: false,
          },
          {
            activityName: 'userInteractionActivity1',
            displayName: 'userInteractionActivity1',
            childEventName: '',
            isStartPoint: false,
            hasQuickForm: false,
            isEmpty: false,
            connectorUrl: null,
            idBindedConnector: null,
            instructions: '',
            isDefault: false,
            version: null,
            connectorType: null,
            width: 0,
            height: 0,
            formName: null,
            formId: 0,
            isGroupingActivity: false,
          },
        ],
      }

      mockClient.get.mockResolvedValue([mockProcess])

      const result = await service.getProcessDetails('TestWix', testToken)

      expect(mockClient.get).toHaveBeenCalledWith(
        'https://test.bizuit.com/api/Processes?eventName=TestWix&isMobile=false',
        {
          headers: {
            Authorization: testToken,
          },
        }
      )
      expect(result).toEqual(mockProcess)
    })

    it('should return null when process not found', async () => {
      mockClient.get.mockResolvedValue([])

      const result = await service.getProcessDetails('NonExistent', testToken)

      expect(result).toBeNull()
    })

    it('should URL-encode process name', async () => {
      mockClient.get.mockResolvedValue([])

      await service.getProcessDetails('Process With Spaces', testToken)

      expect(mockClient.get).toHaveBeenCalledWith(
        'https://test.bizuit.com/api/Processes?eventName=Process%20With%20Spaces&isMobile=false',
        expect.any(Object)
      )
    })
  })

  describe('searchTasks', () => {
    it('should search for task instances', async () => {
      const mockResponse: ITasksSearchResponse = {
        events: [
          {
            eventName: 'TestWix',
            activities: [],
          },
        ],
        instances: [
          {
            eventName: 'TestWix',
            activityName: 'userInteractionActivity1',
            instanceDescription: 'Test instance',
            locked: false,
            instanceId: 'inst-123',
            executionDateTime: '1 día',
            dateToCompare: '2025-11-29T10:00:00Z',
            warningLevelId: '',
            lockedBy: '',
            backColor: '',
            foreColor: '',
            documentsQuantity: 0,
            columnDefinitionValues: [],
            version: '1.0.0.0',
          },
        ],
        moreThanLimit: false,
        instancesTotalCount: [
          {
            eventName: 'TestWix',
            count: 1,
            instancesList: null,
          },
        ],
      }

      mockClient.post.mockResolvedValue(mockResponse)

      const result = await service.searchTasks(
        {
          ProcessName: 'TestWix',
          ActivityName: 'userInteractionActivity1',
        },
        testToken
      )

      expect(mockClient.post).toHaveBeenCalledWith(
        'https://test.bizuit.com/api/Instances/Search',
        {
          ProcessName: 'TestWix',
          ActivityName: 'userInteractionActivity1',
          DateFrom: '1900-01-01',
          DateTo: '2100-01-01',
          LockedState: -1,
          SerializedFilters: '',
          IncludeWarnings: true,
          ChildProcessName: '',
          IsMobile: false,
          Parameters: [],
        },
        {
          headers: {
            Authorization: testToken,
          },
        }
      )

      // Service transforms instances by removing redundant fields
      expect(result.events).toEqual(mockResponse.events)
      expect(result.moreThanLimit).toBe(mockResponse.moreThanLimit)
      expect(result.instancesTotalCount).toEqual(mockResponse.instancesTotalCount)
      expect(result.instances).toHaveLength(1)
      expect(result.instances[0].instanceId).toBe('inst-123')
      expect(result.instances[0].locked).toBe(false)
      // These fields are removed by transformSearchResponse
      expect(result.instances[0]).not.toHaveProperty('columnDefinitionValues')
      expect(result.instances[0]).not.toHaveProperty('eventName')
      expect(result.instances[0]).not.toHaveProperty('activityName')
      expect(result.instances[0]).not.toHaveProperty('instanceDescription')
    })

    it('should include pagination headers when provided', async () => {
      const mockResponse: ITasksSearchResponse = {
        events: [],
        instances: [],
        moreThanLimit: false,
        instancesTotalCount: [],
      }

      mockClient.post.mockResolvedValue(mockResponse)

      await service.searchTasks(
        {
          ProcessName: 'TestWix',
          ActivityName: 'userInteractionActivity1',
          pageNumber: 2,
          pageSize: 50,
        },
        testToken
      )

      expect(mockClient.post).toHaveBeenCalledWith(
        'https://test.bizuit.com/api/Instances/Search',
        expect.objectContaining({
          ProcessName: 'TestWix',
          ActivityName: 'userInteractionActivity1',
        }),
        {
          headers: {
            Authorization: testToken,
            'bz-page': '2',
            'bz-page-size': '50',
          },
        }
      )
    })

    it('should allow custom date filters', async () => {
      mockClient.post.mockResolvedValue({
        events: [],
        instances: [],
        moreThanLimit: false,
        instancesTotalCount: [],
      })

      await service.searchTasks(
        {
          ProcessName: 'TestWix',
          ActivityName: 'userInteractionActivity1',
          DateFrom: '2025-01-01',
          DateTo: '2025-12-31',
          LockedState: 0, // Only unlocked
        },
        testToken
      )

      expect(mockClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          DateFrom: '2025-01-01',
          DateTo: '2025-12-31',
          LockedState: 0,
        }),
        expect.any(Object)
      )
    })
  })

  describe('getTaskCount', () => {
    it('should return task count for process and activity', async () => {
      const mockResponse: ITasksSearchResponse = {
        events: [],
        instances: [],
        moreThanLimit: false,
        instancesTotalCount: [
          {
            eventName: 'TestWix',
            count: 42,
            instancesList: null,
          },
        ],
      }

      mockClient.post.mockResolvedValue(mockResponse)

      const count = await service.getTaskCount('TestWix', 'userInteractionActivity1', testToken)

      expect(count).toBe(42)
      expect(mockClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          ProcessName: 'TestWix',
          ActivityName: 'userInteractionActivity1',
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'bz-page-size': '1',
          }),
        })
      )
    })

    it('should return 0 when no count data found', async () => {
      const mockResponse: ITasksSearchResponse = {
        events: [],
        instances: [],
        moreThanLimit: false,
        instancesTotalCount: [],
      }

      mockClient.post.mockResolvedValue(mockResponse)

      const count = await service.getTaskCount('TestWix', 'userInteractionActivity1', testToken)

      expect(count).toBe(0)
    })
  })

  describe('getStartPoints', () => {
    it('should return all start points across processes', async () => {
      const mockProcesses: IProcessMetadata[] = [
        {
          name: 'Process1',
          workflowDisplayName: 'Process 1',
          workflowName: 'Process1',
          category: '',
          subCategory: '',
          icon: null,
          iconColor: null,
          activities: [
            {
              activityName: 'start1',
              displayName: 'Start Point 1',
              childEventName: null,
              isStartPoint: true,
              hasQuickForm: false,
              isEmpty: false,
              connectorUrl: 'https://example.com',
              idBindedConnector: '1',
              instructions: null,
              isDefault: true,
              version: '1.0.0.0',
              connectorType: 'WebForm',
              width: 0,
              height: 0,
              formName: 'Form1',
              formId: 1,
              isGroupingActivity: false,
            },
            {
              activityName: 'activity1',
              displayName: 'Activity 1',
              childEventName: '',
              isStartPoint: false,
              hasQuickForm: false,
              isEmpty: false,
              connectorUrl: null,
              idBindedConnector: null,
              instructions: null,
              isDefault: false,
              version: null,
              connectorType: null,
              width: 0,
              height: 0,
              formName: null,
              formId: 0,
              isGroupingActivity: false,
            },
          ],
        },
      ]

      mockClient.get.mockResolvedValue(mockProcesses)

      const startPoints = await service.getStartPoints(testToken)

      expect(startPoints).toHaveLength(1)
      expect(startPoints[0].activityName).toBe('start1')
      expect(startPoints[0].processName).toBe('Process1')
      expect(startPoints[0].processDisplayName).toBe('Process 1')
      expect(startPoints[0].isStartPoint).toBe(true)
    })
  })

  describe('getActivities', () => {
    it('should return all non-start-point activities', async () => {
      const mockProcesses: IProcessMetadata[] = [
        {
          name: 'Process1',
          workflowDisplayName: 'Process 1',
          workflowName: 'Process1',
          category: '',
          subCategory: '',
          icon: null,
          iconColor: null,
          activities: [
            {
              activityName: 'start1',
              displayName: 'Start Point 1',
              childEventName: null,
              isStartPoint: true,
              hasQuickForm: false,
              isEmpty: false,
              connectorUrl: 'https://example.com',
              idBindedConnector: '1',
              instructions: null,
              isDefault: true,
              version: '1.0.0.0',
              connectorType: 'WebForm',
              width: 0,
              height: 0,
              formName: 'Form1',
              formId: 1,
              isGroupingActivity: false,
            },
            {
              activityName: 'activity1',
              displayName: 'Activity 1',
              childEventName: '',
              isStartPoint: false,
              hasQuickForm: false,
              isEmpty: false,
              connectorUrl: null,
              idBindedConnector: null,
              instructions: null,
              isDefault: false,
              version: null,
              connectorType: null,
              width: 0,
              height: 0,
              formName: null,
              formId: 0,
              isGroupingActivity: false,
            },
          ],
        },
      ]

      mockClient.get.mockResolvedValue(mockProcesses)

      const activities = await service.getActivities(testToken)

      expect(activities).toHaveLength(1)
      expect(activities[0].activityName).toBe('activity1')
      expect(activities[0].processName).toBe('Process1')
      expect(activities[0].processDisplayName).toBe('Process 1')
      expect(activities[0].isStartPoint).toBe(false)
    })
  })
})
