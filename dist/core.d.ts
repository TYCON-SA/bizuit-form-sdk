export { A as AuthControlType, J as BizuitAuthService, N as BizuitDataServiceService, Q as BizuitError, M as BizuitFormService, H as BizuitHttpClient, L as BizuitInstanceLockService, K as BizuitProcessService, B as BizuitSDK, C as ContinueProcessStatus, ag as ErrorContext, p as IActivityResult, c as IApiError, d as IAuthCheckData, e as IAuthCheckResponse, i as IBizuitAuthHeaders, I as IBizuitConfig, X as IBizuitProcessParameter, E as IDataServiceParameter, F as IDataServiceRequest, G as IDataServiceResponse, u as IEventParameter, n as IInitializeParams, v as IInstanceData, a7 as ILoadInstanceDataOptions, a6 as ILoadInstanceDataResult, a5 as ILockInfo, x as ILockRequest, w as ILockStatus, g as ILoginRequest, h as ILoginResponse, f as ILoginSettings, l as IParameter, ab as IParameterMapping, o as IProcessData, m as IProcessParameter, r as IProcessResult, s as IRaiseEventParams, t as IRaiseEventResult, b as IRequestCheckFormAuth, q as IStartProcessParams, y as IUnlockRequest, a as IUserInfo, D as InstanceLockStatus, j as ParameterDirection, O as ParameterParser, P as ParameterType, z as ProcessFlowStatus, k as ProcessStatus, R as Result, S as StartProcessStatus, ai as XmlParameter, af as buildLoginRedirectUrl, ac as buildParameters, ae as createAuthFromUrlToken, a3 as createParameter, Z as filterContinueParameters, Y as filterFormParameters, a1 as formDataToParameters, ah as formatBizuitError, $ as getParameterDirectionLabel, a0 as getParameterTypeLabel, T as handleError, _ as isParameterRequired, aj as isXmlParameter, V as jsonToXml, a8 as loadInstanceDataForContinue, a4 as mergeParameters, a2 as parametersToFormData, ad as parseBizuitUrlParam, W as parseXsdToTemplate, aa as processUrlToken, a9 as releaseInstanceLock, U as xmlToJson } from './xsd-parser-Bk8NzXRY.js';
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
