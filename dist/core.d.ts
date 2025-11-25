export { A as AuthControlType, F as BizuitAuthService, L as BizuitError, J as BizuitFormService, E as BizuitHttpClient, H as BizuitInstanceLockService, G as BizuitProcessService, B as BizuitSDK, C as ContinueProcessStatus, aa as ErrorContext, p as IActivityResult, c as IApiError, d as IAuthCheckData, e as IAuthCheckResponse, i as IBizuitAuthHeaders, I as IBizuitConfig, O as IBizuitProcessParameter, u as IEventParameter, n as IInitializeParams, v as IInstanceData, a1 as ILoadInstanceDataOptions, a0 as ILoadInstanceDataResult, $ as ILockInfo, x as ILockRequest, w as ILockStatus, g as ILoginRequest, h as ILoginResponse, f as ILoginSettings, l as IParameter, a5 as IParameterMapping, o as IProcessData, m as IProcessParameter, r as IProcessResult, s as IRaiseEventParams, t as IRaiseEventResult, b as IRequestCheckFormAuth, q as IStartProcessParams, y as IUnlockRequest, a as IUserInfo, D as InstanceLockStatus, j as ParameterDirection, K as ParameterParser, P as ParameterType, z as ProcessFlowStatus, k as ProcessStatus, R as Result, S as StartProcessStatus, a9 as buildLoginRedirectUrl, a6 as buildParameters, a8 as createAuthFromUrlToken, Z as createParameter, T as filterContinueParameters, Q as filterFormParameters, X as formDataToParameters, ab as formatBizuitError, V as getParameterDirectionLabel, W as getParameterTypeLabel, M as handleError, U as isParameterRequired, a2 as loadInstanceDataForContinue, _ as mergeParameters, Y as parametersToFormData, a7 as parseBizuitUrlParam, a4 as processUrlToken, a3 as releaseInstanceLock, N as xmlToJson } from './xml-parser-CeHtefUS.js';
import 'axios';

/**
 * @bizuit/form-sdk/core
 * Core SDK without React dependencies - safe for server-side usage
 *
 * Use this entry point in:
 * - Next.js API routes
 * - Server components
 * - Node.js backends
 * - Any environment without React
 */

declare const VERSION = "1.0.0";

export { VERSION };
