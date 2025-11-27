export { A as AuthControlType, N as BizuitAuthService, U as BizuitDataServiceService, W as BizuitError, T as BizuitFormService, M as BizuitHttpClient, Q as BizuitInstanceLockService, O as BizuitProcessService, B as BizuitSDK, C as ContinueProcessStatus, ak as ErrorContext, p as IActivityResult, c as IApiError, d as IAuthCheckData, e as IAuthCheckResponse, i as IBizuitAuthHeaders, I as IBizuitConfig, $ as IBizuitProcessParameter, J as IDataServiceExecuteByNameRequest, L as IDataServiceExecuteByPageAndNameRequest, H as IDataServiceMetadata, E as IDataServiceParameter, F as IDataServiceRequest, G as IDataServiceResponse, u as IEventParameter, n as IInitializeParams, v as IInstanceData, ab as ILoadInstanceDataOptions, aa as ILoadInstanceDataResult, a9 as ILockInfo, x as ILockRequest, w as ILockStatus, g as ILoginRequest, h as ILoginResponse, f as ILoginSettings, K as IPageMetadata, l as IParameter, af as IParameterMapping, o as IProcessData, m as IProcessParameter, r as IProcessResult, s as IRaiseEventParams, t as IRaiseEventResult, b as IRequestCheckFormAuth, q as IStartProcessParams, y as IUnlockRequest, a as IUserInfo, D as InstanceLockStatus, j as ParameterDirection, V as ParameterParser, P as ParameterType, z as ProcessFlowStatus, k as ProcessStatus, R as Result, S as StartProcessStatus, am as XmlParameter, aj as buildLoginRedirectUrl, ag as buildParameters, ai as createAuthFromUrlToken, a7 as createParameter, a1 as filterContinueParameters, a0 as filterFormParameters, a5 as formDataToParameters, al as formatBizuitError, a3 as getParameterDirectionLabel, a4 as getParameterTypeLabel, X as handleError, a2 as isParameterRequired, an as isXmlParameter, Z as jsonToXml, ac as loadInstanceDataForContinue, a8 as mergeParameters, a6 as parametersToFormData, ah as parseBizuitUrlParam, _ as parseXsdToTemplate, ae as processUrlToken, ad as releaseInstanceLock, Y as xmlToJson } from './xsd-parser-CARdDeJI.mjs';
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
