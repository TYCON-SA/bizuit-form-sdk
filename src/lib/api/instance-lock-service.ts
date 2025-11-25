/**
 * Bizuit Instance Lock Service
 * Handles pessimistic locking for process instances
 */

import { BizuitHttpClient } from './http-client'
import type {
  IBizuitConfig,
  ILockStatus,
  ILockRequest,
  IUnlockRequest,
} from '../types'

export class BizuitInstanceLockService {
  private client: BizuitHttpClient
  private apiUrl: string

  constructor(config: IBizuitConfig) {
    this.client = new BizuitHttpClient(config)
    this.apiUrl = config.apiUrl
  }

  /**
   * Check if instance is locked
   */
  async checkLockStatus(
    instanceId: string,
    activityName: string,
    token: string
  ): Promise<ILockStatus> {
    this.client.withBizuitHeaders({
      'BZ-AUTH-TOKEN': token,
    })

    const status = await this.client.get<boolean>(
      `${this.apiUrl}/instances/status/${instanceId}?activityName=${activityName}`
    )

    this.client.clearBizuitHeaders()

    return {
      available: status,
    }
  }

  /**
   * Lock instance for editing
   */
  async lock(
    request: ILockRequest,
    token: string
  ): Promise<ILockStatus> {
    this.client.withBizuitHeaders({
      'BZ-AUTH-TOKEN': token,
    })

    const queryParams = new URLSearchParams({
      activityName: request.activityName,
      operation: String(request.operation),
      processName: request.processName,
    })

    const result = await this.client.patch<ILockStatus>(
      `${this.apiUrl}/instances/lock/${request.instanceId}?${queryParams.toString()}`
    )

    this.client.clearBizuitHeaders()

    return result
  }

  /**
   * Unlock instance
   */
  async unlock(
    request: IUnlockRequest,
    token: string
  ): Promise<ILockStatus> {
    this.client.withBizuitHeaders({
      'BZ-AUTH-TOKEN': token,
    })

    const result = await this.client.patch<ILockStatus>(
      `${this.apiUrl}/instances/unlock/${request.instanceId}`,
      request
    )

    this.client.clearBizuitHeaders()

    return result
  }

  /**
   * Execute a callback with automatic lock/unlock
   * Ensures instance is always unlocked even if callback throws
   */
  async withLock<T>(
    request: ILockRequest,
    token: string,
    callback: (sessionToken: string) => Promise<T>
  ): Promise<T> {
    // Lock instance
    const lockResult = await this.lock(request, token)

    if (!lockResult.available) {
      throw new Error(
        `Instance is locked by ${lockResult.user}. Reason: ${lockResult.reason}`
      )
    }

    const sessionToken = lockResult.sessionToken || ''

    try {
      // Execute callback
      const result = await callback(sessionToken)
      return result
    } finally {
      // Always unlock, even if callback throws
      try {
        await this.unlock(
          {
            instanceId: request.instanceId,
            activityName: request.activityName,
            sessionToken,
          },
          token
        )
      } catch (unlockError) {
        console.error('[BizuitInstanceLockService] Failed to unlock instance:', unlockError)
      }
    }
  }

  /**
   * Force unlock (admin only)
   * Use with caution
   */
  async forceUnlock(
    instanceId: string,
    activityName: string,
    token: string
  ): Promise<void> {
    await this.unlock(
      {
        instanceId,
        activityName,
      },
      token
    )
  }
}
