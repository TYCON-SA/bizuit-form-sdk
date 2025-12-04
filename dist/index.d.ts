import { I as IBizuitConfig, B as BizuitSDK, a as IUserInfo, b as IRequestCheckFormAuth, c as IProcessMetadata, d as ITaskInstance, e as ITasksSearchResponse, f as ITasksSearchRequest } from './xsd-parser-BE0A_t1f.js';
export { A as AuthControlType, a0 as BizuitAuthService, a4 as BizuitDataServiceService, a7 as BizuitError, a3 as BizuitFormService, $ as BizuitHttpClient, a2 as BizuitInstanceLockService, a1 as BizuitProcessService, a5 as BizuitTaskService, H as ContinueProcessStatus, ax as ErrorContext, U as IActivityMetadata, t as IActivityResult, g as IApiError, h as IAuthCheckData, i as IAuthCheckResponse, m as IBizuitAuthHeaders, u as IBizuitFile, ac as IBizuitProcessParameter, W as IColumnDefinition, V as IColumnDefinitionValue, X as IConnectorMetadata, O as IDataServiceExecuteByNameRequest, T as IDataServiceExecuteByPageAndNameRequest, N as IDataServiceMetadata, K as IDataServiceParameter, L as IDataServiceRequest, M as IDataServiceResponse, Y as IEventActivity, z as IEventParameter, r as IInitializeParams, _ as IInstanceCount, C as IInstanceData, ao as ILoadInstanceDataOptions, an as ILoadInstanceDataResult, am as ILockInfo, E as ILockRequest, D as ILockStatus, k as ILoginRequest, l as ILoginResponse, j as ILoginSettings, Q as IPageMetadata, p as IParameter, as as IParameterMapping, s as IProcessData, q as IProcessParameter, w as IProcessResult, x as IRaiseEventParams, y as IRaiseEventResult, v as IStartProcessParams, Z as ITaskEvent, F as IUnlockRequest, J as InstanceLockStatus, n as ParameterDirection, a6 as ParameterParser, P as ParameterType, G as ProcessFlowStatus, o as ProcessStatus, R as Result, S as StartProcessStatus, az as XmlParameter, aw as buildLoginRedirectUrl, at as buildParameters, av as createAuthFromUrlToken, ak as createParameter, ae as filterContinueParameters, ad as filterFormParameters, ai as formDataToParameters, ay as formatBizuitError, ag as getParameterDirectionLabel, ah as getParameterTypeLabel, a8 as handleError, af as isParameterRequired, aA as isXmlParameter, aa as jsonToXml, ap as loadInstanceDataForContinue, al as mergeParameters, aj as parametersToFormData, au as parseBizuitUrlParam, ab as parseXsdToTemplate, ar as processUrlToken, aq as releaseInstanceLock, a9 as xmlToJson } from './xsd-parser-BE0A_t1f.js';
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
 * useTasks Hook
 *
 * React hook for managing task lists from Bizuit BPM.
 * Provides state management and methods for:
 * - Loading all processes
 * - Getting process details
 * - Searching task instances
 * - Loading/error states
 */

interface UseTasksOptions {
    /** Authorization token (required) */
    token: string;
    /** Auto-load processes on mount */
    autoLoadProcesses?: boolean;
}
interface UseTasksReturn {
    /** All processes available to user */
    processes: IProcessMetadata[] | null;
    /** Current task instances from search */
    tasks: ITaskInstance[];
    /** Full search response with metadata */
    searchResponse: ITasksSearchResponse | null;
    /** Loading state */
    isLoading: boolean;
    /** Error state */
    error: Error | null;
    /** Load all processes */
    getProcesses: () => Promise<void>;
    /** Load specific process details */
    getProcessDetails: (processName: string) => Promise<IProcessMetadata | null>;
    /** Search for task instances */
    searchTasks: (request: ITasksSearchRequest) => Promise<void>;
    /** Get task count without loading instances */
    getTaskCount: (processName: string, activityName: string) => Promise<number>;
    /** Get all start points across processes */
    getStartPoints: () => Promise<void>;
    /** Get all activities (non-start points) */
    getActivities: () => Promise<void>;
    /** Clear error state */
    clearError: () => void;
    /** Reset all state */
    reset: () => void;
}
/**
 * Hook for managing Bizuit task lists
 *
 * @param options - Configuration options
 * @returns Task state and methods
 *
 * @example
 * ```typescript
 * function TaskList() {
 *   const { tasks, isLoading, error, searchTasks } = useTasks({
 *     token: authToken,
 *     autoLoadProcesses: true
 *   })
 *
 *   useEffect(() => {
 *     searchTasks({
 *       ProcessName: 'TestWix',
 *       ActivityName: 'userInteractionActivity1',
 *       pageNumber: 1,
 *       pageSize: 20
 *     })
 *   }, [searchTasks])
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *
 *   return (
 *     <ul>
 *       {tasks.map(task => (
 *         <li key={task.instanceId}>
 *           {task.instanceDescription}
 *           {task.locked && <span> (Locked by {task.lockedBy})</span>}
 *         </li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */
declare function useTasks(options: UseTasksOptions): UseTasksReturn;

/**
 * @bizuit/form-sdk
 * Core SDK for Bizuit BPM form integration
 *
 * IMPORTANT: This entry point exports React hooks.
 * For server-side usage (Next.js API routes, etc), use:
 * import { BizuitSDK } from '@tyconsa/bizuit-form-sdk/core'
 */

declare const VERSION = "1.0.0";

export { BizuitSDK, BizuitSDKProvider, type BizuitSDKProviderProps, IBizuitConfig, IProcessMetadata, IRequestCheckFormAuth, ITaskInstance, ITasksSearchRequest, ITasksSearchResponse, IUserInfo, type UseAuthOptions, type UseAuthReturn, type UseTasksOptions, type UseTasksReturn, VERSION, useAuth, useBizuitSDK, useTasks };
