import type { ILoginResponse } from '../types/auth.types'

/**
 * Parse URL parameters that come from Bizuit BPM with &amp; HTML encoding
 *
 * When Bizuit generates URLs in HTML context, browsers URL-encode &amp; as &amp%3B
 * This breaks standard query parameter parsing since "amp;" becomes part of param name
 *
 * @param paramName - The parameter name to extract
 * @param searchParams - URLSearchParams object from useSearchParams()
 * @returns The parameter value or null if not found
 *
 * @example
 * ```tsx
 * const searchParams = useSearchParams()
 * const token = parseBizuitUrlParam('token', searchParams)
 * const eventName = parseBizuitUrlParam('eventName', searchParams)
 * ```
 */
export function parseBizuitUrlParam(paramName: string, searchParams: URLSearchParams): string | null {
  // Try standard parsing first
  const standardValue = searchParams.get(paramName)
  if (standardValue) {
    return standardValue
  }

  // If standard parsing fails, manually parse query string
  // This handles cases where &amp; was URL-encoded to &amp%3B
  if (typeof window !== 'undefined') {
    const rawUrl = window.location.href

    // Extract query string after ?
    const queryStartIndex = rawUrl.indexOf('?')
    if (queryStartIndex === -1) {
      return null
    }

    let queryString = rawUrl.substring(queryStartIndex + 1)

    // Clean up the query string:
    // 1. Replace &amp%3B with & (URL-encoded &amp;)
    // 2. Replace &amp; with & (HTML entity)
    // 3. Replace %3B with nothing (leftover semicolons)
    queryString = queryString
      .replace(/&amp%3B/gi, '&')
      .replace(/&amp;/gi, '&')
      .replace(/%3B/gi, '')

    // Parse manually
    const params = new URLSearchParams(queryString)
    return params.get(paramName)
  }

  return null
}

/**
 * Create an ILoginResponse object from a URL token
 *
 * This is useful when receiving authentication tokens from Bizuit BPM URLs.
 * The token will be prefixed with "Basic " if not already present.
 *
 * @param urlToken - The token from the URL (without "Basic " prefix)
 * @param userName - Optional username (defaults to 'bizuit-user')
 * @param expirationMinutes - Token expiration in minutes (defaults to 1440 = 24 hours)
 * @returns ILoginResponse object ready to use with setAuthData()
 *
 * @example
 * ```tsx
 * const urlToken = searchParams.get('token')
 * const userName = searchParams.get('UserName')
 *
 * if (urlToken) {
 *   const authData = createAuthFromUrlToken(urlToken, userName, 120) // 2 hours
 *   setAuthData(authData)
 * }
 * ```
 */
export function createAuthFromUrlToken(
  urlToken: string,
  userName?: string,
  expirationMinutes: number = 1440
): ILoginResponse {
  // Add "Basic " prefix if not already present
  const tokenWithPrefix = urlToken.startsWith('Basic ') ? urlToken : `Basic ${urlToken}`

  const expirationMs = expirationMinutes * 60 * 1000

  return {
    Token: tokenWithPrefix,
    User: {
      Username: userName || 'bizuit-user',
      UserID: 0,
      DisplayName: userName || 'Usuario Bizuit',
    },
    ExpirationDate: new Date(Date.now() + expirationMs).toISOString(),
  }
}

/**
 * Build a login redirect URL with return path
 *
 * @param returnPath - The path to redirect to after login (e.g., '/start-process')
 * @param params - Optional additional query parameters to include in the return URL
 * @returns Complete login URL with redirect parameter
 *
 * @example
 * ```tsx
 * // Simple redirect
 * const loginUrl = buildLoginRedirectUrl('/start-process')
 * // "/login?redirect=%2Fstart-process"
 *
 * // With additional parameters
 * const loginUrl = buildLoginRedirectUrl('/start-process', { eventName: 'MyEvent' })
 * // "/login?redirect=%2Fstart-process%3FeventName%3DMyEvent"
 * ```
 */
export function buildLoginRedirectUrl(returnPath: string, params?: Record<string, string>): string {
  // Build return URL with optional parameters
  let returnUrl = returnPath

  if (params && Object.keys(params).length > 0) {
    const queryParams = new URLSearchParams(params)
    returnUrl = `${returnPath}?${queryParams.toString()}`
  }

  // Build login URL with redirect parameter
  const loginParams = new URLSearchParams()
  loginParams.set('redirect', returnUrl)

  return `/login?${loginParams.toString()}`
}
