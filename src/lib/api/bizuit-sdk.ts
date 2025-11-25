/**
 * Bizuit SDK - Main entry point
 * Provides unified access to all Bizuit services
 */

import { BizuitAuthService } from './auth-service'
import { BizuitProcessService } from './process-service'
import { BizuitInstanceLockService } from './instance-lock-service'
import { BizuitFormService } from './form-service'
import type { IBizuitConfig } from '../types'

export class BizuitSDK {
  public auth: BizuitAuthService
  public process: BizuitProcessService
  public instanceLock: BizuitInstanceLockService
  public forms: BizuitFormService

  private config: IBizuitConfig

  constructor(config: IBizuitConfig) {
    this.config = config
    this.auth = new BizuitAuthService(config)
    this.process = new BizuitProcessService(config)
    this.instanceLock = new BizuitInstanceLockService(config)
    this.forms = new BizuitFormService(this)
  }

  /**
   * Get current configuration
   */
  getConfig(): IBizuitConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<IBizuitConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // Recreate services with new config
    this.auth = new BizuitAuthService(this.config)
    this.process = new BizuitProcessService(this.config)
    this.instanceLock = new BizuitInstanceLockService(this.config)
    this.forms = new BizuitFormService(this)
  }
}

/**
 * Factory function to create SDK instance
 */
export function createBizuitSDK(config: IBizuitConfig): BizuitSDK {
  return new BizuitSDK(config)
}
