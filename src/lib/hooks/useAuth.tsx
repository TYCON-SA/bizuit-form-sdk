/**
 * useAuth Hook
 * Manages authentication state and operations
 */

import { useState, useEffect, useCallback } from 'react'
import { useBizuitSDK } from './useBizuitSDK'
import type { IUserInfo, IRequestCheckFormAuth } from '../types'

export interface UseAuthOptions {
  token?: string
  userName?: string
  autoValidate?: boolean
}

export interface UseAuthReturn {
  user: IUserInfo | null
  isAuthenticated: boolean
  isLoading: boolean
  error: Error | null
  validateToken: (token: string) => Promise<boolean>
  checkFormAuth: (request: IRequestCheckFormAuth) => Promise<boolean>
  getUserInfo: (token: string, userName: string) => Promise<IUserInfo | null>
  checkPermissions: (requiredRoles: string[]) => Promise<boolean>
  logout: () => void
}

export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const sdk = useBizuitSDK()
  const [user, setUser] = useState<IUserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(options.autoValidate || false)
  const [error, setError] = useState<Error | null>(null)

  const validateToken = useCallback(
    async (token: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        const userInfo = await sdk.auth.validateToken(token)

        if (userInfo) {
          setUser(userInfo)
          return true
        }

        setUser(null)
        return false
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Token validation failed')
        setError(error)
        setUser(null)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [sdk]
  )

  const checkFormAuth = useCallback(
    async (request: IRequestCheckFormAuth): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await sdk.auth.checkFormAuth(request, options.token)

        if (response.success && response.data?.username) {
          // Set basic user info from auth check
          setUser({
            username: response.data.username,
            roles: [],
          })
          return true
        }

        setError(new Error(response.errorMessage || 'Authentication failed'))
        return false
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Form auth check failed')
        setError(error)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [sdk, options.token]
  )

  const getUserInfo = useCallback(
    async (token: string, userName: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const userInfo = await sdk.auth.getUserInfo(token, userName)
        setUser(userInfo)
        return userInfo
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to get user info')
        setError(error)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [sdk]
  )

  const checkPermissions = useCallback(
    async (requiredRoles: string[]): Promise<boolean> => {
      if (!options.token || !options.userName) {
        return false
      }

      try {
        return await sdk.auth.checkPermissions(
          options.token,
          options.userName,
          requiredRoles
        )
      } catch (err) {
        console.error('Permission check failed:', err)
        return false
      }
    },
    [sdk, options.token, options.userName]
  )

  const logout = useCallback(() => {
    setUser(null)
    setError(null)
  }, [])

  // Auto-validate on mount if token provided
  useEffect(() => {
    if (options.autoValidate && options.token) {
      validateToken(options.token)
    }
  }, []) // Run only once on mount

  return {
    user,
    isAuthenticated: user !== null,
    isLoading,
    error,
    validateToken,
    checkFormAuth,
    getUserInfo,
    checkPermissions,
    logout,
  }
}
