/**
 * useBizuitSDK Hook
 * Provides access to Bizuit SDK instance via Context
 */

import { createContext, useContext, ReactNode } from 'react'
import { BizuitSDK } from '../api'
import type { IBizuitConfig } from '../types'

const BizuitSDKContext = createContext<BizuitSDK | null>(null)

export interface BizuitSDKProviderProps {
  config: IBizuitConfig
  children: ReactNode
}

export function BizuitSDKProvider({ config, children }: BizuitSDKProviderProps) {
  const sdk = new BizuitSDK(config)

  return <BizuitSDKContext.Provider value={sdk}>{children}</BizuitSDKContext.Provider>
}

export function useBizuitSDK(): BizuitSDK {
  const context = useContext(BizuitSDKContext)

  if (!context) {
    throw new Error('useBizuitSDK must be used within BizuitSDKProvider')
  }

  return context
}
