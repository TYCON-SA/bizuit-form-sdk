export { A as AuthControlType, $ as BizuitAuthService, a3 as BizuitDataServiceService, a6 as BizuitError, a2 as BizuitFormService, _ as BizuitHttpClient, a1 as BizuitInstanceLockService, a0 as BizuitProcessService, B as BizuitSDK, a4 as BizuitTaskService, G as ContinueProcessStatus, aw as ErrorContext, T as IActivityMetadata, t as IActivityResult, g as IApiError, h as IAuthCheckData, i as IAuthCheckResponse, m as IBizuitAuthHeaders, I as IBizuitConfig, ab as IBizuitProcessParameter, V as IColumnDefinition, U as IColumnDefinitionValue, W as IConnectorMetadata, N as IDataServiceExecuteByNameRequest, Q as IDataServiceExecuteByPageAndNameRequest, M as IDataServiceMetadata, J as IDataServiceParameter, K as IDataServiceRequest, L as IDataServiceResponse, X as IEventActivity, y as IEventParameter, r as IInitializeParams, Z as IInstanceCount, z as IInstanceData, an as ILoadInstanceDataOptions, am as ILoadInstanceDataResult, al as ILockInfo, D as ILockRequest, C as ILockStatus, k as ILoginRequest, l as ILoginResponse, j as ILoginSettings, O as IPageMetadata, p as IParameter, ar as IParameterMapping, s as IProcessData, c as IProcessMetadata, q as IProcessParameter, v as IProcessResult, w as IRaiseEventParams, x as IRaiseEventResult, b as IRequestCheckFormAuth, u as IStartProcessParams, Y as ITaskEvent, d as ITaskInstance, f as ITasksSearchRequest, e as ITasksSearchResponse, E as IUnlockRequest, a as IUserInfo, H as InstanceLockStatus, n as ParameterDirection, a5 as ParameterParser, P as ParameterType, F as ProcessFlowStatus, o as ProcessStatus, R as Result, S as StartProcessStatus, ay as XmlParameter, av as buildLoginRedirectUrl, as as buildParameters, au as createAuthFromUrlToken, aj as createParameter, ad as filterContinueParameters, ac as filterFormParameters, ah as formDataToParameters, ax as formatBizuitError, af as getParameterDirectionLabel, ag as getParameterTypeLabel, a7 as handleError, ae as isParameterRequired, az as isXmlParameter, a9 as jsonToXml, ao as loadInstanceDataForContinue, ak as mergeParameters, ai as parametersToFormData, at as parseBizuitUrlParam, aa as parseXsdToTemplate, aq as processUrlToken, ap as releaseInstanceLock, a8 as xmlToJson } from './xsd-parser-Sa1s7xQS.mjs';
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
