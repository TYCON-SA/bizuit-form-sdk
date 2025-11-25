export { A as AuthControlType, F as BizuitAuthService, L as BizuitError, J as BizuitFormService, E as BizuitHttpClient, H as BizuitInstanceLockService, G as BizuitProcessService, B as BizuitSDK, C as ContinueProcessStatus, ac as ErrorContext, p as IActivityResult, c as IApiError, d as IAuthCheckData, e as IAuthCheckResponse, i as IBizuitAuthHeaders, I as IBizuitConfig, T as IBizuitProcessParameter, u as IEventParameter, n as IInitializeParams, v as IInstanceData, a3 as ILoadInstanceDataOptions, a2 as ILoadInstanceDataResult, a1 as ILockInfo, x as ILockRequest, w as ILockStatus, g as ILoginRequest, h as ILoginResponse, f as ILoginSettings, l as IParameter, a7 as IParameterMapping, o as IProcessData, m as IProcessParameter, r as IProcessResult, s as IRaiseEventParams, t as IRaiseEventResult, b as IRequestCheckFormAuth, q as IStartProcessParams, y as IUnlockRequest, a as IUserInfo, D as InstanceLockStatus, j as ParameterDirection, K as ParameterParser, P as ParameterType, z as ProcessFlowStatus, k as ProcessStatus, R as Result, S as StartProcessStatus, ae as XmlParameter, ab as buildLoginRedirectUrl, a8 as buildParameters, aa as createAuthFromUrlToken, $ as createParameter, V as filterContinueParameters, U as filterFormParameters, Z as formDataToParameters, ad as formatBizuitError, X as getParameterDirectionLabel, Y as getParameterTypeLabel, M as handleError, W as isParameterRequired, af as isXmlParameter, O as jsonToXml, a4 as loadInstanceDataForContinue, a0 as mergeParameters, _ as parametersToFormData, a9 as parseBizuitUrlParam, Q as parseXsdToTemplate, a6 as processUrlToken, a5 as releaseInstanceLock, N as xmlToJson } from './xsd-parser-Ci6yB_dp.js';
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
