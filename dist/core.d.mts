export { A as AuthControlType, a0 as BizuitAuthService, a4 as BizuitDataServiceService, a7 as BizuitError, a3 as BizuitFormService, $ as BizuitHttpClient, a2 as BizuitInstanceLockService, a1 as BizuitProcessService, B as BizuitSDK, a5 as BizuitTaskService, H as ContinueProcessStatus, ax as ErrorContext, U as IActivityMetadata, t as IActivityResult, g as IApiError, h as IAuthCheckData, i as IAuthCheckResponse, m as IBizuitAuthHeaders, I as IBizuitConfig, u as IBizuitFile, ac as IBizuitProcessParameter, W as IColumnDefinition, V as IColumnDefinitionValue, X as IConnectorMetadata, O as IDataServiceExecuteByNameRequest, T as IDataServiceExecuteByPageAndNameRequest, N as IDataServiceMetadata, K as IDataServiceParameter, L as IDataServiceRequest, M as IDataServiceResponse, Y as IEventActivity, z as IEventParameter, r as IInitializeParams, _ as IInstanceCount, C as IInstanceData, ao as ILoadInstanceDataOptions, an as ILoadInstanceDataResult, am as ILockInfo, E as ILockRequest, D as ILockStatus, k as ILoginRequest, l as ILoginResponse, j as ILoginSettings, Q as IPageMetadata, p as IParameter, as as IParameterMapping, s as IProcessData, c as IProcessMetadata, q as IProcessParameter, w as IProcessResult, x as IRaiseEventParams, y as IRaiseEventResult, b as IRequestCheckFormAuth, v as IStartProcessParams, Z as ITaskEvent, d as ITaskInstance, f as ITasksSearchRequest, e as ITasksSearchResponse, F as IUnlockRequest, a as IUserInfo, J as InstanceLockStatus, n as ParameterDirection, a6 as ParameterParser, P as ParameterType, G as ProcessFlowStatus, o as ProcessStatus, R as Result, S as StartProcessStatus, az as XmlParameter, aw as buildLoginRedirectUrl, at as buildParameters, av as createAuthFromUrlToken, ak as createParameter, ae as filterContinueParameters, ad as filterFormParameters, ai as formDataToParameters, ay as formatBizuitError, ag as getParameterDirectionLabel, ah as getParameterTypeLabel, a8 as handleError, af as isParameterRequired, aA as isXmlParameter, aa as jsonToXml, ap as loadInstanceDataForContinue, al as mergeParameters, aj as parametersToFormData, au as parseBizuitUrlParam, ab as parseXsdToTemplate, ar as processUrlToken, aq as releaseInstanceLock, a9 as xmlToJson } from './xsd-parser-BE0A_t1f.mjs';
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
