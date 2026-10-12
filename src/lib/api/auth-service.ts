/**
 * Bizuit Authentication Service
 * Handles token validation, user info, and auth checks
 */

import { BizuitHttpClient } from './http-client'
import type {
  IAuthCheckResponse,
  IUserInfo,
  IRequestCheckFormAuth,
  ILoginSettings,
  IBizuitConfig,
  ILoginRequest,
  ILoginResponse,
  BizuitSessionType,
} from '../types'

const SESSION_TYPES: readonly BizuitSessionType[] = ['bizuit', 'external']

/**
 * Which kind of session the form was opened with, read from `dashboardParams.sessionType`.
 *
 * The runtime writes that field. Without it the session is a Bizuit one: a runtime that does not write the
 * field yet, development mode and a form running outside the runtime only know Bizuit sessions.
 *
 * It takes the whole `dashboardParams` object, whatever its type. It is informational, not an access control:
 * access is always decided by the server.
 *
 * Inside the runtime, a form made with the standard form build runs with the runtime's copy of the SDK, so
 * this function exists there only when the runtime ships SDK 2.5.0 or later.
 *
 * @throws Error if `params` is given and is not an object (for example, the value itself instead of
 *   `dashboardParams`), or if `sessionType` is present and is not exactly `'bizuit'` or `'external'`
 */
export function getSessionType(params?: object | null): BizuitSessionType {
  if (params === undefined || params === null) return 'bizuit'
  if (typeof params !== 'object' || Array.isArray(params)) {
    throw new Error(
      '[BizuitSDK] getSessionType: expected the dashboardParams object, as in getSessionType(dashboardParams)'
    )
  }

  const value = (params as { sessionType?: unknown }).sessionType
  if (value === undefined) return 'bizuit'
  if (SESSION_TYPES.includes(value as BizuitSessionType)) return value as BizuitSessionType
  throw new Error("[BizuitSDK] getSessionType: sessionType must be 'bizuit' or 'external'")
}

/**
 * True only when the form was opened with an external session. See `getSessionType`.
 */
export function isExternalSession(params?: object | null): boolean {
  return getSessionType(params) === 'external'
}

export class BizuitAuthService {
  private client: BizuitHttpClient
  private apiUrl: string

  constructor(config: IBizuitConfig) {
    this.client = new BizuitHttpClient(config)
    this.apiUrl = config.apiUrl
  }

  /**
   * Check form authentication and authorization
   * Validates token and returns login configuration
   */
  async checkFormAuth(
    request: IRequestCheckFormAuth,
    token?: string
  ): Promise<IAuthCheckResponse> {
    const headers: Record<string, string> = {
      'BZ-FORM-VIEWER': 'true',
    }

    if (token) {
      headers['BZ-AUTH-TOKEN'] = token
    }

    if (request.formId) {
      headers['BZ-FORM-ID'] = String(request.formId)
    }

    if (request.formName) {
      headers['BZ-FORM-NAME'] = request.formName
    }

    if (request.processName) {
      headers['BZ-PROCESS-NAME'] = request.processName
    }

    try {
      const response = await this.client.post<IAuthCheckResponse>(
        `${this.apiUrl}/Login/CheckFormAuth`,
        request,
        { headers }
      )

      return response
    } catch (error: any) {
      return {
        success: false,
        canRetry: error.statusCode !== 401,
        errorMessage: error.message,
        errorType: error.code,
      }
    }
  }

  /**
   * Get current user information from token
   */
  async getUserInfo(token: string, userName: string): Promise<IUserInfo> {
    this.client.withBizuitHeaders({
      'BZ-AUTH-TOKEN': token,
      'BZ-USER-NAME': userName,
    })

    const userInfo = await this.client.get<IUserInfo>(
      `${this.apiUrl}/Login/UserInfo`
    )

    this.client.clearBizuitHeaders()

    return userInfo
  }

  /**
   * Get login configuration (OAuth, AD, etc.)
   */
  async getLoginConfiguration(): Promise<Partial<ILoginSettings>> {
    const config = await this.client.get<Partial<ILoginSettings>>(
      `${this.apiUrl}/Login/LoginConfiguration`
    )

    return config
  }

  /**
   * Validate token and get user data
   * Returns null if token is invalid
   */
  async validateToken(token: string): Promise<IUserInfo | null> {
    try {
      // Extract username from token (Basic auth: base64(username:password))
      const decoded = atob(token.replace('Basic ', ''))
      const userName = decoded.split(':')[0]

      const userInfo = await this.getUserInfo(token, userName)
      return userInfo
    } catch (error) {
      console.error('[BizuitAuthService] Token validation failed:', error)
      return null
    }
  }

  /**
   * Check if user has required permissions
   */
  async checkPermissions(
    token: string,
    userName: string,
    requiredRoles: string[]
  ): Promise<boolean> {
    try {
      const userInfo = await this.getUserInfo(token, userName)

      if (!userInfo.roles || requiredRoles.length === 0) {
        return true
      }

      return requiredRoles.some((role) => userInfo.roles.includes(role))
    } catch (error) {
      console.error('[BizuitAuthService] Permission check failed:', error)
      return false
    }
  }

  /**
   * Which kind of session the form was opened with. Reads `dashboardParams.sessionType`; makes no request.
   */
  getSessionType(params?: object | null): BizuitSessionType {
    return getSessionType(params)
  }

  /**
   * True only when the form was opened with an external session. Makes no request.
   */
  isExternalSession(params?: object | null): boolean {
    return isExternalSession(params)
  }

  /**
   * Login methods (delegated to Bizuit Dashboard API)
   */
  async azureLogin(idToken: string, accessToken: string): Promise<any> {
    return this.client.post(`${this.apiUrl}/Login/AzureLogin`, {
      idToken,
      accessToken,
    })
  }

  async oauthLogin(code: string, redirectUri: string): Promise<any> {
    return this.client.get(
      `${this.apiUrl}/Login/GetOauthLoginAsync?code=${code}&redirectUri=${redirectUri}`
    )
  }

  async socialLogin(token: string, type: 'google' | 'facebook'): Promise<any> {
    return this.client.get(`${this.apiUrl}/Login/SocialLogin?type=${type}`, {
      headers: {
        Authorization: `Basic ${token}`,
      },
    })
  }

  /**
   * Login with username and password
   * Uses HTTP Basic Authentication as per Bizuit API specification
   * Returns token and user information
   *
   * Example response from API:
   * {
   *   "token": "ZMdufWTdCsSYUXj7...",
   *   "user": {
   *     "username": "admin",
   *     "userID": 1,
   *     "displayName": "Administrator Account",
   *     "image": null
   *   },
   *   "forceChange": false,
   *   "expirationDate": "2025-11-27T22:07:20.5095101Z"
   * }
   */
  async login(credentials: ILoginRequest): Promise<ILoginResponse> {
    const { username, password } = credentials

    // Create Basic Auth header: base64(username:password)
    const authString = `${username}:${password}`
    const base64Auth = btoa(authString)
    const authHeader = `Basic ${base64Auth}`

    try {
      // The API returns a JSON object with token and user info
      const response = await this.client.get<any>(
        `${this.apiUrl}/Login`,
        {
          headers: {
            'Authorization': authHeader,
          },
        }
      )

      // Map the API response to our ILoginResponse format
      const loginResponse: ILoginResponse = {
        Token: `Basic ${response.token}`, // Prepend "Basic " to the token
        User: {
          Username: response.user.username,
          UserID: response.user.userID,
          DisplayName: response.user.displayName,
          Image: response.user.image,
        },
        ForceChange: response.forceChange,
        ExpirationDate: response.expirationDate,
      }

      return loginResponse
    } catch (error: any) {
      // Handle specific error messages from API
      if (error.statusCode === 401) {
        throw new Error('Nombre de Usuario y/o Contraseña incorrectos.')
      } else if (error.statusCode === 403) {
        throw new Error('Acceso denegado, no tiene permiso para acceder.')
      }

      throw error
    }
  }
}
