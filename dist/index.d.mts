import { I as IBizuitConfig, B as BizuitSDK, a as IUserInfo, b as IRequestCheckFormAuth, c as IProcessMetadata, d as ITaskInstance, e as ITasksSearchResponse, f as ITasksSearchRequest } from './xsd-parser-Sa1s7xQS.mjs';
export { A as AuthControlType, $ as BizuitAuthService, a3 as BizuitDataServiceService, a6 as BizuitError, a2 as BizuitFormService, _ as BizuitHttpClient, a1 as BizuitInstanceLockService, a0 as BizuitProcessService, a4 as BizuitTaskService, G as ContinueProcessStatus, aw as ErrorContext, T as IActivityMetadata, t as IActivityResult, g as IApiError, h as IAuthCheckData, i as IAuthCheckResponse, m as IBizuitAuthHeaders, ab as IBizuitProcessParameter, V as IColumnDefinition, U as IColumnDefinitionValue, W as IConnectorMetadata, N as IDataServiceExecuteByNameRequest, Q as IDataServiceExecuteByPageAndNameRequest, M as IDataServiceMetadata, J as IDataServiceParameter, K as IDataServiceRequest, L as IDataServiceResponse, X as IEventActivity, y as IEventParameter, r as IInitializeParams, Z as IInstanceCount, z as IInstanceData, an as ILoadInstanceDataOptions, am as ILoadInstanceDataResult, al as ILockInfo, D as ILockRequest, C as ILockStatus, k as ILoginRequest, l as ILoginResponse, j as ILoginSettings, O as IPageMetadata, p as IParameter, ar as IParameterMapping, s as IProcessData, q as IProcessParameter, v as IProcessResult, w as IRaiseEventParams, x as IRaiseEventResult, u as IStartProcessParams, Y as ITaskEvent, E as IUnlockRequest, H as InstanceLockStatus, n as ParameterDirection, a5 as ParameterParser, P as ParameterType, F as ProcessFlowStatus, o as ProcessStatus, R as Result, S as StartProcessStatus, ay as XmlParameter, av as buildLoginRedirectUrl, as as buildParameters, au as createAuthFromUrlToken, aj as createParameter, ad as filterContinueParameters, ac as filterFormParameters, ah as formDataToParameters, ax as formatBizuitError, af as getParameterDirectionLabel, ag as getParameterTypeLabel, a7 as handleError, ae as isParameterRequired, az as isXmlParameter, a9 as jsonToXml, ao as loadInstanceDataForContinue, ak as mergeParameters, ai as parametersToFormData, at as parseBizuitUrlParam, aa as parseXsdToTemplate, aq as processUrlToken, ap as releaseInstanceLock, a8 as xmlToJson } from './xsd-parser-Sa1s7xQS.mjs';
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
