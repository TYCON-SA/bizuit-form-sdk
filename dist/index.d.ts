import { I as IBizuitConfig, B as BizuitSDK, a as IUserInfo, b as IRequestCheckFormAuth } from './xsd-parser-CVX--cL3.js';
export { A as AuthControlType, L as BizuitAuthService, Q as BizuitDataServiceService, U as BizuitError, O as BizuitFormService, K as BizuitHttpClient, N as BizuitInstanceLockService, M as BizuitProcessService, C as ContinueProcessStatus, ai as ErrorContext, p as IActivityResult, c as IApiError, d as IAuthCheckData, e as IAuthCheckResponse, i as IBizuitAuthHeaders, Z as IBizuitProcessParameter, J as IDataServiceExecuteByNameRequest, H as IDataServiceMetadata, E as IDataServiceParameter, F as IDataServiceRequest, G as IDataServiceResponse, u as IEventParameter, n as IInitializeParams, v as IInstanceData, a9 as ILoadInstanceDataOptions, a8 as ILoadInstanceDataResult, a7 as ILockInfo, x as ILockRequest, w as ILockStatus, g as ILoginRequest, h as ILoginResponse, f as ILoginSettings, l as IParameter, ad as IParameterMapping, o as IProcessData, m as IProcessParameter, r as IProcessResult, s as IRaiseEventParams, t as IRaiseEventResult, q as IStartProcessParams, y as IUnlockRequest, D as InstanceLockStatus, j as ParameterDirection, T as ParameterParser, P as ParameterType, z as ProcessFlowStatus, k as ProcessStatus, R as Result, S as StartProcessStatus, ak as XmlParameter, ah as buildLoginRedirectUrl, ae as buildParameters, ag as createAuthFromUrlToken, a5 as createParameter, $ as filterContinueParameters, _ as filterFormParameters, a3 as formDataToParameters, aj as formatBizuitError, a1 as getParameterDirectionLabel, a2 as getParameterTypeLabel, V as handleError, a0 as isParameterRequired, al as isXmlParameter, X as jsonToXml, aa as loadInstanceDataForContinue, a6 as mergeParameters, a4 as parametersToFormData, af as parseBizuitUrlParam, Y as parseXsdToTemplate, ac as processUrlToken, ab as releaseInstanceLock, W as xmlToJson } from './xsd-parser-CVX--cL3.js';
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
