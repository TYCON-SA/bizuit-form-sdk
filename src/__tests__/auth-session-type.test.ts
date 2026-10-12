/**
 * Session type — `getSessionType` / `isExternalSession` (story 11.16)
 *
 * The runtime writes `dashboardParams.sessionType`; the SDK only reads it. These tests pin the two values of
 * the contract, the default when the field is missing, and the error on any other value.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BizuitAuthService, getSessionType, isExternalSession } from '../lib/api/auth-service'
import { BizuitHttpClient } from '../lib/api/http-client'
import type { IBizuitConfig } from '../lib/types'

vi.mock('../lib/api/http-client')

/** Every value the contract does not allow (AC 14). Compared exactly: no lowercasing, no trimming. */
const UNKNOWN_VALUES: unknown[] = ['External', 'jwt', '', ' external', null, 1, {}]

describe('@story-11.16 getSessionType', () => {
  it('@story-11.16 @ac-6 @ac-13 T6 GetSessionType_External', () => {
    expect(getSessionType({ sessionType: 'external' })).toBe('external')
  })

  it('@story-11.16 @ac-7 @ac-13 T7 GetSessionType_Bizuit', () => {
    expect(getSessionType({ sessionType: 'bizuit' })).toBe('bizuit')
  })

  it('@story-11.16 @ac-8 T8 GetSessionType_SinElCampo_Bizuit', () => {
    expect(getSessionType({})).toBe('bizuit')
    expect(getSessionType({ sessionType: undefined })).toBe('bizuit')
    expect(getSessionType(undefined)).toBe('bizuit')
    expect(getSessionType(null)).toBe('bizuit')
  })

  it('@story-11.16 @ac-9 T9 GetSessionType_SoloMiraSessionType', () => {
    // A Bizuit session whose user name and token look external is still a Bizuit session, and the other way round.
    const looksExternal = { sessionType: 'bizuit', userName: 'ext.google.0123456789abcdef', token: 'bzext-session' }
    const looksBizuit = { sessionType: 'external', userName: 'admin', token: 'Basic abc' }

    expect(getSessionType(looksExternal)).toBe('bizuit')
    expect(getSessionType(looksBizuit)).toBe('external')

    // Without the field there is nothing to deduce either: a user name or a token that look external do not count.
    expect(getSessionType({ userName: 'ext.google.0123456789abcdef' })).toBe('bizuit')
    expect(getSessionType({ token: 'bzext-session' })).toBe('bizuit')
    expect(isExternalSession({ userName: 'ext.google.0123456789abcdef', token: 'bzext-session' })).toBe(false)
  })

  it.each(UNKNOWN_VALUES.map((value) => [JSON.stringify(value), value]))(
    '@story-11.16 @ac-14 T13 GetSessionType_ValorDesconocido_Lanza: %s',
    (_, value) => {
      for (const read of [getSessionType, isExternalSession]) {
        let thrown: unknown
        try {
          read({ sessionType: value })
        } catch (error) {
          thrown = error
        }

        expect(thrown).toBeInstanceOf(Error)
        const message = (thrown as Error).message
        expect(message).toContain('getSessionType')
        expect(message).toContain("'bizuit'")
        expect(message).toContain("'external'")
      }
    }
  )

  it.each(['jwt', 'External'])(
    '@story-11.16 @ac-14 T13 GetSessionType_ValorDesconocido_Lanza: the message does not repeat %s',
    (value) => {
      for (const read of [getSessionType, isExternalSession]) {
        let message = ''
        try {
          read({ sessionType: value })
        } catch (error) {
          message = (error as Error).message
        }

        // It is the SDK's own error (not some other failure), and it does not echo what it received.
        expect(message).toContain('getSessionType')
        expect(message).not.toContain(value)
      }
    }
  )
})

/** What a form passes by mistake instead of the `dashboardParams` object (AC 23). */
const NOT_AN_OBJECT: unknown[] = ['external', 'bizuit', 'jwt', 5, true, ['external']]

describe('@story-11.16 getSessionType with something that is not the params object', () => {
  it.each(NOT_AN_OBJECT.map((value) => [JSON.stringify(value), value]))(
    '@story-11.16 @ac-23 T23 GetSessionType_NoEsUnObjeto_Lanza: %s',
    (_, value) => {
      for (const read of [getSessionType, isExternalSession]) {
        let thrown: unknown
        try {
          read(value as never)
        } catch (error) {
          thrown = error
        }

        expect(thrown).toBeInstanceOf(Error)
        const message = (thrown as Error).message
        expect(message).toContain('getSessionType')
        expect(message).toContain('dashboardParams')
        // It does not echo what it received.
        if (typeof value === 'string') expect(message).not.toContain(value)
      }
    }
  )
})

describe('@story-11.16 isExternalSession', () => {
  it('@story-11.16 @ac-10 T10 IsExternalSession_SoloConExternal', () => {
    expect(isExternalSession({ sessionType: 'external' })).toBe(true)
    expect(isExternalSession({ sessionType: 'bizuit' })).toBe(false)
    expect(isExternalSession({})).toBe(false)
  })
})

describe('@story-11.16 BizuitAuthService session type', () => {
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

    service = new BizuitAuthService(config)
  })

  it('@story-11.16 @ac-11 T11 AuthService_GetSessionType_SinPedidosDeRed', () => {
    expect(service.getSessionType({ sessionType: 'external' })).toBe('external')
    expect(service.getSessionType({ sessionType: 'bizuit' })).toBe('bizuit')
    expect(service.getSessionType({})).toBe('bizuit')
    expect(service.getSessionType({ sessionType: undefined })).toBe('bizuit')
    expect(service.getSessionType(undefined)).toBe('bizuit')
    expect(service.getSessionType(null)).toBe('bizuit')

    expect(service.isExternalSession({ sessionType: 'external' })).toBe(true)
    expect(service.isExternalSession({ sessionType: 'bizuit' })).toBe(false)
    expect(service.isExternalSession({})).toBe(false)

    expect(mockClient.get).not.toHaveBeenCalled()
    expect(mockClient.post).not.toHaveBeenCalled()
  })

  it('@story-11.16 @ac-11 @ac-14 @ac-23 T11 AuthService_GetSessionType_SinPedidosDeRed: the methods throw like the functions', () => {
    expect(() => service.getSessionType({ sessionType: 'jwt' })).toThrow(/getSessionType/)
    expect(() => service.isExternalSession({ sessionType: 'jwt' })).toThrow(/getSessionType/)
    expect(() => service.getSessionType('external' as never)).toThrow(/getSessionType/)
    expect(() => service.isExternalSession('external' as never)).toThrow(/getSessionType/)
  })
})
