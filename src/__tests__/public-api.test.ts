/**
 * Public API (story 11.16)
 *
 * The session type is an additive change: these tests pin that nothing that 2.4.6 exported went away, that the
 * signatures of `BizuitAuthService` did not change, and that the package papers (version, changelog, README)
 * describe the new functions.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect, expectTypeOf } from 'vitest'
import * as index from '../index'
import * as core from '../core'
import { BizuitAuthService } from '../lib/api/auth-service'
import type { BizuitSessionType as IndexSessionType } from '../index'
import type { BizuitSessionType as CoreSessionType } from '../core'
import type {
  IAuthCheckResponse,
  ILoginRequest,
  ILoginResponse,
  ILoginSettings,
  IRequestCheckFormAuth,
  IUserInfo,
} from '../lib/types'

const PACKAGE_ROOT = resolve(__dirname, '../..')
const readPackageFile = (name: string) => readFileSync(resolve(PACKAGE_ROOT, name), 'utf8')

/** Every runtime name exported by `index` in 2.4.6, taken from that version before this story touched it. */
const INDEX_EXPORTS_2_4_6 = [
  'BizuitAuthService',
  'BizuitDataServiceService',
  'BizuitError',
  'BizuitFormService',
  'BizuitHttpClient',
  'BizuitInstanceLockService',
  'BizuitProcessService',
  'BizuitSDK',
  'BizuitSDKProvider',
  'BizuitTaskService',
  'ParameterParser',
  'VERSION',
  'XmlParameter',
  'buildLoginRedirectUrl',
  'buildParameters',
  'createAuthFromUrlToken',
  'createParameter',
  'filterContinueParameters',
  'filterFormParameters',
  'formDataToParameters',
  'formatBizuitError',
  'getParameterDirectionLabel',
  'getParameterTypeLabel',
  'handleError',
  'isParameterRequired',
  'isXmlParameter',
  'jsonToXml',
  'loadInstanceDataForContinue',
  'mergeParameters',
  'parametersToFormData',
  'parseBizuitUrlParam',
  'parseXsdToTemplate',
  'processUrlToken',
  'releaseInstanceLock',
  'useAuth',
  'useBizuitSDK',
  'useTasks',
  'xmlToJson',
]

/** The same for `core`: everything in `index` except the React provider and hooks. */
const CORE_EXPORTS_2_4_6 = INDEX_EXPORTS_2_4_6.filter(
  (name) => !['BizuitSDKProvider', 'useAuth', 'useBizuitSDK', 'useTasks'].includes(name)
)

const AUTH_SERVICE_METHODS_2_4_6 = [
  'checkFormAuth',
  'getUserInfo',
  'getLoginConfiguration',
  'validateToken',
  'checkPermissions',
  'azureLogin',
  'oauthLogin',
  'socialLogin',
  'login',
] as const

describe('@story-11.16 public API', () => {
  it('@story-11.16 @ac-12 T12 PublicApi_ExportaElTipoDeSesion', () => {
    for (const entry of [index, core] as Record<string, unknown>[]) {
      expect(typeof entry.getSessionType).toBe('function')
      expect(typeof entry.isExternalSession).toBe('function')
    }

    // The type is exported from both entry points too (checked by `npm run typecheck`).
    expectTypeOf<IndexSessionType>().toEqualTypeOf<'bizuit' | 'external'>()
    expectTypeOf<CoreSessionType>().toEqualTypeOf<'bizuit' | 'external'>()
  })

  it('@story-11.16 @ac-16 T14 PublicApi_FirmasDeAuthService_SinCambios', () => {
    // Signatures written by hand from 2.4.6. This is a type check: `npm run typecheck` fails it, `vitest run` does not.
    type Service = BizuitAuthService
    expectTypeOf<Service['checkFormAuth']>().toEqualTypeOf<
      (request: IRequestCheckFormAuth, token?: string) => Promise<IAuthCheckResponse>
    >()
    expectTypeOf<Service['getUserInfo']>().toEqualTypeOf<(token: string, userName: string) => Promise<IUserInfo>>()
    expectTypeOf<Service['getLoginConfiguration']>().toEqualTypeOf<() => Promise<Partial<ILoginSettings>>>()
    expectTypeOf<Service['validateToken']>().toEqualTypeOf<(token: string) => Promise<IUserInfo | null>>()
    expectTypeOf<Service['checkPermissions']>().toEqualTypeOf<
      (token: string, userName: string, requiredRoles: string[]) => Promise<boolean>
    >()
    expectTypeOf<Service['azureLogin']>().toEqualTypeOf<(idToken: string, accessToken: string) => Promise<any>>()
    expectTypeOf<Service['oauthLogin']>().toEqualTypeOf<(code: string, redirectUri: string) => Promise<any>>()
    expectTypeOf<Service['socialLogin']>().toEqualTypeOf<
      (token: string, type: 'google' | 'facebook') => Promise<any>
    >()
    expectTypeOf<Service['login']>().toEqualTypeOf<(credentials: ILoginRequest) => Promise<ILoginResponse>>()

    for (const method of AUTH_SERVICE_METHODS_2_4_6) {
      expect(typeof BizuitAuthService.prototype[method]).toBe('function')
    }
  })

  it('@story-11.16 @ac-24 T24 PublicApi_AceptaDashboardParamsTipado', () => {
    // What a form already has: a typed `dashboardParams` that does not declare `sessionType`. The first shape is
    // the one of the form template (with an index signature); the second has no index signature at all.
    // This is a type check: `npm run typecheck` fails it if the functions stop accepting these types.
    interface TemplateDashboardParameters {
      instanceId?: string
      userName?: string
      token?: string
      apiUrl?: string
      [key: string]: any
    }
    interface ClosedDashboardParameters {
      userName?: string
      token?: string
    }
    const fromTemplate: TemplateDashboardParameters | null | undefined = { userName: 'admin', token: 'Basic x' }
    const closed: ClosedDashboardParameters = { userName: 'admin', token: 'Basic x' }
    const service = new BizuitAuthService({ apiUrl: 'https://test.bizuit.com/api' })

    expect(index.getSessionType(fromTemplate)).toBe('bizuit')
    expect(index.isExternalSession(fromTemplate)).toBe(false)
    expect(core.getSessionType(closed)).toBe('bizuit')
    expect(core.isExternalSession(closed)).toBe(false)
    expect(service.getSessionType(fromTemplate)).toBe('bizuit')
    expect(service.isExternalSession(closed)).toBe(false)
    expect(index.getSessionType({ ...fromTemplate, sessionType: 'external' })).toBe('external')
  })

  it('@story-11.16 @ac-16 @ac-21 T15 PublicApi_ExportsDeLa246_SiguenTodos', () => {
    expect(Object.keys(index)).toEqual(expect.arrayContaining(INDEX_EXPORTS_2_4_6))
    expect(Object.keys(core)).toEqual(expect.arrayContaining(CORE_EXPORTS_2_4_6))
  })
})

describe('@story-11.16 package papers', () => {
  it('@story-11.16 @ac-18 T20 Paquete_Version250YChangelog', () => {
    const { version } = JSON.parse(readPackageFile('package.json'))
    expect(version).toBe('2.5.0')

    const changelog = readPackageFile('CHANGELOG.md')
    const start = changelog.indexOf('## [2.5.0]')
    expect(start).toBeGreaterThan(-1)

    const next = changelog.indexOf('\n## [', start + 1)
    const entry = changelog.slice(start, next === -1 ? undefined : next)
    const sections = entry.match(/^### .+$/gm)
    expect(sections).toEqual(['### Added'])
  })

  it('@story-11.16 @ac-20 T21 Readme_ExplicaElTipoDeSesion', () => {
    const readme = readPackageFile('README.md')

    // The section itself: from its heading to the next heading of the same level.
    const start = readme.search(/^### Session type/m)
    expect(start).toBeGreaterThan(-1)
    const end = readme.indexOf('\n### ', start + 1)
    const section = readme.slice(start, end === -1 ? undefined : end)

    expect(section).toContain('getSessionType(dashboardParams)')
    expect(section).toContain("| `'external'` | `'external'` | `true` |")
    expect(section).toContain("| `'bizuit'` | `'bizuit'` | `false` |")
    expect(section).toMatch(/not an access control/i)
    // Inside the runtime a form runs with the runtime's copy of the SDK: the function is there only from 2.5.0 on.
    expect(section).toMatch(/runtime.*2\.5\.0/is)
    expect(section).toContain('dashboardParams.sessionType')
    for (const method of ['validateToken', 'getUserInfo', 'checkPermissions', 'checkFormAuth', 'useAuth']) {
      expect(section).toContain(method)
    }

    // A note next to each place that recommends the token-based methods: «Use Authentication», the
    // BizuitAuthService reference and the useAuth reference.
    expect(readme.match(/^> \*\*External sessions:\*\*/gm)).toHaveLength(3)
  })
})
