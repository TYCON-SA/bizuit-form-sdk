import { I as IBizuitConfig, B as BizuitSDK, a as IUserInfo, b as IRequestCheckFormAuth } from './xml-parser-CeHtefUS.js';
export { A as AuthControlType, F as BizuitAuthService, L as BizuitError, J as BizuitFormService, E as BizuitHttpClient, H as BizuitInstanceLockService, G as BizuitProcessService, C as ContinueProcessStatus, aa as ErrorContext, p as IActivityResult, c as IApiError, d as IAuthCheckData, e as IAuthCheckResponse, i as IBizuitAuthHeaders, O as IBizuitProcessParameter, u as IEventParameter, n as IInitializeParams, v as IInstanceData, a1 as ILoadInstanceDataOptions, a0 as ILoadInstanceDataResult, $ as ILockInfo, x as ILockRequest, w as ILockStatus, g as ILoginRequest, h as ILoginResponse, f as ILoginSettings, l as IParameter, a5 as IParameterMapping, o as IProcessData, m as IProcessParameter, r as IProcessResult, s as IRaiseEventParams, t as IRaiseEventResult, q as IStartProcessParams, y as IUnlockRequest, D as InstanceLockStatus, j as ParameterDirection, K as ParameterParser, P as ParameterType, z as ProcessFlowStatus, k as ProcessStatus, R as Result, S as StartProcessStatus, a9 as buildLoginRedirectUrl, a6 as buildParameters, a8 as createAuthFromUrlToken, Z as createParameter, T as filterContinueParameters, Q as filterFormParameters, X as formDataToParameters, ab as formatBizuitError, V as getParameterDirectionLabel, W as getParameterTypeLabel, M as handleError, U as isParameterRequired, a2 as loadInstanceDataForContinue, _ as mergeParameters, Y as parametersToFormData, a7 as parseBizuitUrlParam, a4 as processUrlToken, a3 as releaseInstanceLock, N as xmlToJson } from './xml-parser-CeHtefUS.js';
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
