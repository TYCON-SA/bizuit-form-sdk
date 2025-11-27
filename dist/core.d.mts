export { A as AuthControlType, L as BizuitAuthService, Q as BizuitDataServiceService, U as BizuitError, O as BizuitFormService, K as BizuitHttpClient, N as BizuitInstanceLockService, M as BizuitProcessService, B as BizuitSDK, C as ContinueProcessStatus, ai as ErrorContext, p as IActivityResult, c as IApiError, d as IAuthCheckData, e as IAuthCheckResponse, i as IBizuitAuthHeaders, I as IBizuitConfig, Z as IBizuitProcessParameter, J as IDataServiceExecuteByNameRequest, H as IDataServiceMetadata, E as IDataServiceParameter, F as IDataServiceRequest, G as IDataServiceResponse, u as IEventParameter, n as IInitializeParams, v as IInstanceData, a9 as ILoadInstanceDataOptions, a8 as ILoadInstanceDataResult, a7 as ILockInfo, x as ILockRequest, w as ILockStatus, g as ILoginRequest, h as ILoginResponse, f as ILoginSettings, l as IParameter, ad as IParameterMapping, o as IProcessData, m as IProcessParameter, r as IProcessResult, s as IRaiseEventParams, t as IRaiseEventResult, b as IRequestCheckFormAuth, q as IStartProcessParams, y as IUnlockRequest, a as IUserInfo, D as InstanceLockStatus, j as ParameterDirection, T as ParameterParser, P as ParameterType, z as ProcessFlowStatus, k as ProcessStatus, R as Result, S as StartProcessStatus, ak as XmlParameter, ah as buildLoginRedirectUrl, ae as buildParameters, ag as createAuthFromUrlToken, a5 as createParameter, $ as filterContinueParameters, _ as filterFormParameters, a3 as formDataToParameters, aj as formatBizuitError, a1 as getParameterDirectionLabel, a2 as getParameterTypeLabel, V as handleError, a0 as isParameterRequired, al as isXmlParameter, X as jsonToXml, aa as loadInstanceDataForContinue, a6 as mergeParameters, a4 as parametersToFormData, af as parseBizuitUrlParam, Y as parseXsdToTemplate, ac as processUrlToken, ab as releaseInstanceLock, W as xmlToJson } from './xsd-parser-CVX--cL3.mjs';
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
