import { I as IBizuitConfig, B as BizuitSDK, a as IUserInfo, b as IRequestCheckFormAuth } from './xsd-parser-CARdDeJI.mjs';
export { A as AuthControlType, N as BizuitAuthService, U as BizuitDataServiceService, W as BizuitError, T as BizuitFormService, M as BizuitHttpClient, Q as BizuitInstanceLockService, O as BizuitProcessService, C as ContinueProcessStatus, ak as ErrorContext, p as IActivityResult, c as IApiError, d as IAuthCheckData, e as IAuthCheckResponse, i as IBizuitAuthHeaders, $ as IBizuitProcessParameter, J as IDataServiceExecuteByNameRequest, L as IDataServiceExecuteByPageAndNameRequest, H as IDataServiceMetadata, E as IDataServiceParameter, F as IDataServiceRequest, G as IDataServiceResponse, u as IEventParameter, n as IInitializeParams, v as IInstanceData, ab as ILoadInstanceDataOptions, aa as ILoadInstanceDataResult, a9 as ILockInfo, x as ILockRequest, w as ILockStatus, g as ILoginRequest, h as ILoginResponse, f as ILoginSettings, K as IPageMetadata, l as IParameter, af as IParameterMapping, o as IProcessData, m as IProcessParameter, r as IProcessResult, s as IRaiseEventParams, t as IRaiseEventResult, q as IStartProcessParams, y as IUnlockRequest, D as InstanceLockStatus, j as ParameterDirection, V as ParameterParser, P as ParameterType, z as ProcessFlowStatus, k as ProcessStatus, R as Result, S as StartProcessStatus, am as XmlParameter, aj as buildLoginRedirectUrl, ag as buildParameters, ai as createAuthFromUrlToken, a7 as createParameter, a1 as filterContinueParameters, a0 as filterFormParameters, a5 as formDataToParameters, al as formatBizuitError, a3 as getParameterDirectionLabel, a4 as getParameterTypeLabel, X as handleError, a2 as isParameterRequired, an as isXmlParameter, Z as jsonToXml, ac as loadInstanceDataForContinue, a8 as mergeParameters, a6 as parametersToFormData, ah as parseBizuitUrlParam, _ as parseXsdToTemplate, ae as processUrlToken, ad as releaseInstanceLock, Y as xmlToJson } from './xsd-parser-CARdDeJI.mjs';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';
import 'axios';

interface BizuitSDKProviderProps {
    config: IBizuitConfig;
    children: ReactNode;
}
declare function BizuitSDKProvider({ config, children }: BizuitSDKProviderProps): react_jsx_runtime.JSX.Element;
declare function useBizuitSDK(): BizuitSDK;

/**
 * useAuth Hook
 * Manages authentication state and operations
 */

interface UseAuthOptions {
    token?: string;
    userName?: string;
    autoValidate?: boolean;
}
interface UseAuthReturn {
    user: IUserInfo | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: Error | null;
    validateToken: (token: string) => Promise<boolean>;
    checkFormAuth: (request: IRequestCheckFormAuth) => Promise<boolean>;
    getUserInfo: (token: string, userName: string) => Promise<IUserInfo | null>;
    checkPermissions: (requiredRoles: string[]) => Promise<boolean>;
    logout: () => void;
}
declare function useAuth(options?: UseAuthOptions): UseAuthReturn;

/**
 * @bizuit/form-sdk
 * Core SDK for Bizuit BPM form integration
 *
 * IMPORTANT: This entry point exports React hooks.
 * For server-side usage (Next.js API routes, etc), use:
 * import { BizuitSDK } from '@tyconsa/bizuit-form-sdk/core'
 */

declare const VERSION = "1.0.0";

export { BizuitSDK, BizuitSDKProvider, type BizuitSDKProviderProps, IBizuitConfig, IRequestCheckFormAuth, IUserInfo, type UseAuthOptions, type UseAuthReturn, VERSION, useAuth, useBizuitSDK };
