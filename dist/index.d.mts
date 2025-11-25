import { I as IBizuitConfig, B as BizuitSDK, a as IUserInfo, b as IRequestCheckFormAuth } from './xsd-parser-Ci6yB_dp.mjs';
export { A as AuthControlType, F as BizuitAuthService, L as BizuitError, J as BizuitFormService, E as BizuitHttpClient, H as BizuitInstanceLockService, G as BizuitProcessService, C as ContinueProcessStatus, ac as ErrorContext, p as IActivityResult, c as IApiError, d as IAuthCheckData, e as IAuthCheckResponse, i as IBizuitAuthHeaders, T as IBizuitProcessParameter, u as IEventParameter, n as IInitializeParams, v as IInstanceData, a3 as ILoadInstanceDataOptions, a2 as ILoadInstanceDataResult, a1 as ILockInfo, x as ILockRequest, w as ILockStatus, g as ILoginRequest, h as ILoginResponse, f as ILoginSettings, l as IParameter, a7 as IParameterMapping, o as IProcessData, m as IProcessParameter, r as IProcessResult, s as IRaiseEventParams, t as IRaiseEventResult, q as IStartProcessParams, y as IUnlockRequest, D as InstanceLockStatus, j as ParameterDirection, K as ParameterParser, P as ParameterType, z as ProcessFlowStatus, k as ProcessStatus, R as Result, S as StartProcessStatus, ae as XmlParameter, ab as buildLoginRedirectUrl, a8 as buildParameters, aa as createAuthFromUrlToken, $ as createParameter, V as filterContinueParameters, U as filterFormParameters, Z as formDataToParameters, ad as formatBizuitError, X as getParameterDirectionLabel, Y as getParameterTypeLabel, M as handleError, W as isParameterRequired, af as isXmlParameter, O as jsonToXml, a4 as loadInstanceDataForContinue, a0 as mergeParameters, _ as parametersToFormData, a9 as parseBizuitUrlParam, Q as parseXsdToTemplate, a6 as processUrlToken, a5 as releaseInstanceLock, N as xmlToJson } from './xsd-parser-Ci6yB_dp.mjs';
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
