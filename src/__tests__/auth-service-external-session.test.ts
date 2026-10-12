/**
 * BizuitAuthService with an external session (story 11.16)
 *
 * A form opened with an external session receives the fixed placeholder `bzext-session` in
 * `dashboardParams.token`. It is not a Bizuit token. These tests pin what each existing method does with it
 * today, so the behaviour is documented and does not change by accident.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BizuitAuthService } from '../lib/api/auth-service'
import { BizuitHttpClient } from '../lib/api/http-client'
import type { IBizuitConfig } from '../lib/types'

vi.mock('../lib/api/http-client')

const PLACEHOLDER_TOKEN = 'bzext-session'
const EXTERNAL_USER = 'ext.x'

describe('@story-11.16 BizuitAuthService with the external session placeholder token', () => {
  let service: BizuitAuthService
  let mockClient: any
  const config: IBizuitConfig = {
    apiUrl: 'https://test.bizuit.com/api',
    timeout: 30000,
  }

  beforeEach(() => {
    vi.clearAllMocks()

    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      withBizuitHeaders: vi.fn(),
      clearBizuitHeaders: vi.fn(),
    }
    vi.mocked(BizuitHttpClient).mockImplementation(() => mockClient)
    vi.spyOn(console, 'error').mockImplementation(() => {})

    service = new BizuitAuthService(config)
  })

  it('@story-11.16 @ac-17 T16 ValidateToken_TokenDeRelleno_NullSinPedidos', async () => {
    const result = await service.validateToken(PLACEHOLDER_TOKEN)

    expect(result).toBeNull()
    expect(mockClient.get).not.toHaveBeenCalled()
    expect(mockClient.post).not.toHaveBeenCalled()
    expect(mockClient.withBizuitHeaders).not.toHaveBeenCalled()
  })

  it('@story-11.16 @ac-17 T17 GetUserInfo_TokenDeRelleno_PideYDejaPasarElRechazo', async () => {
    const rejection = { statusCode: 401, message: 'Unauthorized' }
    mockClient.get.mockRejectedValue(rejection)

    await expect(service.getUserInfo(PLACEHOLDER_TOKEN, EXTERNAL_USER)).rejects.toBe(rejection)

    expect(mockClient.withBizuitHeaders).toHaveBeenCalledWith({
      'BZ-AUTH-TOKEN': PLACEHOLDER_TOKEN,
      'BZ-USER-NAME': EXTERNAL_USER,
    })
    expect(mockClient.get).toHaveBeenCalledTimes(1)
    expect(mockClient.get).toHaveBeenCalledWith('https://test.bizuit.com/api/Login/UserInfo')
  })

  it('@story-11.16 @ac-17 T18 CheckPermissions_TokenDeRelleno_False', async () => {
    mockClient.get.mockRejectedValue({ statusCode: 401, message: 'Unauthorized' })

    const allowed = await service.checkPermissions(PLACEHOLDER_TOKEN, EXTERNAL_USER, ['Rol'])

    expect(allowed).toBe(false)
    expect(mockClient.get).toHaveBeenCalledWith('https://test.bizuit.com/api/Login/UserInfo')
  })

  it('@story-11.16 @ac-17 T19 CheckFormAuth_TokenDeRelleno_NoLanza', async () => {
    mockClient.post.mockRejectedValue({ statusCode: 401, message: 'x', code: 'y' })

    const result = await service.checkFormAuth({ formName: 'f' }, PLACEHOLDER_TOKEN)

    expect(result).toEqual({ success: false, canRetry: false, errorMessage: 'x', errorType: 'y' })
    expect(mockClient.post).toHaveBeenCalledTimes(1)
    expect(mockClient.post.mock.calls[0][0]).toBe('https://test.bizuit.com/api/Login/CheckFormAuth')
    expect(mockClient.post.mock.calls[0][2].headers['BZ-AUTH-TOKEN']).toBe(PLACEHOLDER_TOKEN)
  })
})
