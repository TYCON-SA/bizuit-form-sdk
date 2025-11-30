/**
 * useTasks Hook
 *
 * React hook for managing task lists from Bizuit BPM.
 * Provides state management and methods for:
 * - Loading all processes
 * - Getting process details
 * - Searching task instances
 * - Loading/error states
 */

import { useState, useCallback, useEffect } from 'react'
import { useBizuitSDK } from './useBizuitSDK'
import type {
  IProcessMetadata,
  ITaskInstance,
  ITasksSearchRequest,
  ITasksSearchResponse,
} from '../types/tasks.types'

export interface UseTasksOptions {
  /** Authorization token (required) */
  token: string
  /** Auto-load processes on mount */
  autoLoadProcesses?: boolean
}

export interface UseTasksReturn {
  /** All processes available to user */
  processes: IProcessMetadata[] | null
  /** Current task instances from search */
  tasks: ITaskInstance[]
  /** Full search response with metadata */
  searchResponse: ITasksSearchResponse | null
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: Error | null
  /** Load all processes */
  getProcesses: () => Promise<void>
  /** Load specific process details */
  getProcessDetails: (processName: string) => Promise<IProcessMetadata | null>
  /** Search for task instances */
  searchTasks: (request: ITasksSearchRequest) => Promise<void>
  /** Get task count without loading instances */
  getTaskCount: (processName: string, activityName: string) => Promise<number>
  /** Get all start points across processes */
  getStartPoints: () => Promise<void>
  /** Get all activities (non-start points) */
  getActivities: () => Promise<void>
  /** Clear error state */
  clearError: () => void
  /** Reset all state */
  reset: () => void
}

/**
 * Hook for managing Bizuit task lists
 *
 * @param options - Configuration options
 * @returns Task state and methods
 *
 * @example
 * ```typescript
 * function TaskList() {
 *   const { tasks, isLoading, error, searchTasks } = useTasks({
 *     token: authToken,
 *     autoLoadProcesses: true
 *   })
 *
 *   useEffect(() => {
 *     searchTasks({
 *       ProcessName: 'TestWix',
 *       ActivityName: 'userInteractionActivity1',
 *       pageNumber: 1,
 *       pageSize: 20
 *     })
 *   }, [searchTasks])
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *
 *   return (
 *     <ul>
 *       {tasks.map(task => (
 *         <li key={task.instanceId}>
 *           {task.instanceDescription}
 *           {task.locked && <span> (Locked by {task.lockedBy})</span>}
 *         </li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */
export function useTasks(options: UseTasksOptions): UseTasksReturn {
  const sdk = useBizuitSDK()
  const [processes, setProcesses] = useState<IProcessMetadata[] | null>(null)
  const [tasks, setTasks] = useState<ITaskInstance[]>([])
  const [searchResponse, setSearchResponse] = useState<ITasksSearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Load all processes available to user
   */
  const getProcesses = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await sdk.tasks.getProcesses(options.token)
      setProcesses(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get processes')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [sdk, options.token])

  /**
   * Load specific process details
   */
  const getProcessDetails = useCallback(
    async (processName: string): Promise<IProcessMetadata | null> => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await sdk.tasks.getProcessDetails(processName, options.token)
        return result
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error(`Failed to get process details for ${processName}`)
        setError(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [sdk, options.token]
  )

  /**
   * Search for task instances
   */
  const searchTasks = useCallback(
    async (request: ITasksSearchRequest) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await sdk.tasks.searchTasks(request, options.token)
        setSearchResponse(result)
        setTasks(result.instances)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to search tasks')
        setError(error)
        setSearchResponse(null)
        setTasks([])
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [sdk, options.token]
  )

  /**
   * Get task count without loading instances
   */
  const getTaskCount = useCallback(
    async (processName: string, activityName: string): Promise<number> => {
      setIsLoading(true)
      setError(null)
      try {
        const count = await sdk.tasks.getTaskCount(processName, activityName, options.token)
        return count
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to get task count')
        setError(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [sdk, options.token]
  )

  /**
   * Get all start points across processes
   */
  const getStartPoints = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await sdk.tasks.getStartPoints(options.token)
      // Store as processes format for compatibility
      setProcesses(
        result.map((sp) => ({
          name: sp.processName,
          workflowDisplayName: sp.processDisplayName,
          workflowName: sp.processName,
          category: '',
          subCategory: '',
          icon: null,
          iconColor: null,
          activities: [sp],
        }))
      )
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get start points')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [sdk, options.token])

  /**
   * Get all activities (non-start points)
   */
  const getActivities = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await sdk.tasks.getActivities(options.token)
      // Store as processes format for compatibility
      setProcesses(
        result.map((activity) => ({
          name: activity.processName,
          workflowDisplayName: activity.processDisplayName,
          workflowName: activity.processName,
          category: '',
          subCategory: '',
          icon: null,
          iconColor: null,
          activities: [activity],
        }))
      )
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get activities')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [sdk, options.token])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setProcesses(null)
    setTasks([])
    setSearchResponse(null)
    setError(null)
    setIsLoading(false)
  }, [])

  /**
   * Auto-load processes on mount if configured
   */
  useEffect(() => {
    if (options.autoLoadProcesses) {
      getProcesses()
    }
  }, [options.autoLoadProcesses, getProcesses])

  return {
    processes,
    tasks,
    searchResponse,
    isLoading,
    error,
    getProcesses,
    getProcessDetails,
    searchTasks,
    getTaskCount,
    getStartPoints,
    getActivities,
    clearError,
    reset,
  }
}
