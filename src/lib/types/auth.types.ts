/**
 * Authentication and Authorization Types
 * Based on Bizuit-Web-Forms and Bizuit-Forms-Api
 */

export interface IAuthCheckData {
  authControlType?: string
  username?: string
  useActiveDirectory?: boolean
  useOauth?: boolean
  useGoogleOauth?: boolean
  googleOauthTokenProvider?: string | null
  useFacebookOauth?: boolean
  facebookOauthTokenProvider?: string | null
  oauthClientId?: string | null
  oauthUrl?: string | null
  useEntraId?: boolean
  entraIdClientId?: string | null
  entraIdTenant?: string | null
}

export interface IAuthCheckResponse {
  success: boolean
  errorType?: string
  canRetry: boolean
  errorMessage?: string
  data?: IAuthCheckData
}

export interface ILoginSettings {
  useActiveDirectory: boolean
  useOauth: boolean
  useGoogleOauth: boolean
  googleOauthTokenProvider: string | null
  useFacebookOauth: boolean
  facebookOauthTokenProvider: string | null
  oauthClientId: string | null
  oauthUrl: string | null
  useEntraId: boolean
  entraIdClientId: string | null
  entraIdTenant: string | null
}

export interface IUserInfo {
  username: string
  firstName?: string
  lastName?: string
  displayName?: string
  roles: string[]
  isSystemUser?: boolean
}

export interface IRequestCheckFormAuth {
  formId?: number
  formDraft?: number
  formName?: string
  processName?: string
  userName?: string
  instanceId?: string
}

export interface ILoginRequest {
  username: string
  password: string
}

export interface ILoginResponse {
  Token: string
  User: {
    Username: string
    UserID: number
    DisplayName: string
    Image?: string | null
  }
  ForceChange?: boolean
  ExpirationDate: string
}

export type AuthControlType = 'secure' | 'anonymous'

export interface IBizuitAuthHeaders {
  'BZ-AUTH-TOKEN'?: string
  'BZ-SESSION-TOKEN'?: string
  'BZ-USER-NAME'?: string
  'BZ-FORM-ID'?: string
  'BZ-FORM-NAME'?: string
  'BZ-FORM-VIEWER'?: string
  'BZ-PROCESS-NAME'?: string
  'BZ-INSTANCEID'?: string
  'BZ-FORM'?: string
  'BZ-DRAFT-FORM'?: string
  'BZ-CHILD-PROCESS-NAME'?: string
}
