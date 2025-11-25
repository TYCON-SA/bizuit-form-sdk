import { AxiosRequestConfig, AxiosInstance } from 'axios';

/**
 * Authentication and Authorization Types
 * Based on Bizuit-Web-Forms and Bizuit-Forms-Api
 */
interface IAuthCheckData {
    authControlType?: string;
    username?: string;
    useActiveDirectory?: boolean;
    useOauth?: boolean;
    useGoogleOauth?: boolean;
    googleOauthTokenProvider?: string | null;
    useFacebookOauth?: boolean;
    facebookOauthTokenProvider?: string | null;
    oauthClientId?: string | null;
    oauthUrl?: string | null;
    useEntraId?: boolean;
    entraIdClientId?: string | null;
    entraIdTenant?: string | null;
}
interface IAuthCheckResponse {
    success: boolean;
    errorType?: string;
    canRetry: boolean;
    errorMessage?: string;
    data?: IAuthCheckData;
}
interface ILoginSettings {
    useActiveDirectory: boolean;
    useOauth: boolean;
    useGoogleOauth: boolean;
    googleOauthTokenProvider: string | null;
    useFacebookOauth: boolean;
    facebookOauthTokenProvider: string | null;
    oauthClientId: string | null;
    oauthUrl: string | null;
    useEntraId: boolean;
    entraIdClientId: string | null;
    entraIdTenant: string | null;
}
interface IUserInfo {
    username: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    roles: string[];
    isSystemUser?: boolean;
}
interface IRequestCheckFormAuth {
    formId?: number;
    formDraft?: number;
    formName?: string;
    processName?: string;
    userName?: string;
    instanceId?: string;
}
interface ILoginRequest {
    username: string;
    password: string;
}
interface ILoginResponse {
    Token: string;
    User: {
        Username: string;
        UserID: number;
        DisplayName: string;
        Image?: string | null;
    };
    ForceChange?: boolean;
    ExpirationDate: string;
}
type AuthControlType = 'secure' | 'anonymous';
interface IBizuitAuthHeaders {
    'BZ-AUTH-TOKEN'?: string;
    'BZ-SESSION-TOKEN'?: string;
    'BZ-USER-NAME'?: string;
    'BZ-FORM-ID'?: string;
    'BZ-FORM-NAME'?: string;
    'BZ-FORM-VIEWER'?: string;
    'BZ-PROCESS-NAME'?: string;
    'BZ-INSTANCEID'?: string;
    'BZ-FORM'?: string;
    'BZ-DRAFT-FORM'?: string;
    'BZ-CHILD-PROCESS-NAME'?: string;
}

/**
 * Process and Instance Types
 * Based on Bizuit BPM Process Controller
 */
type ParameterType = 'SingleValue' | 'Xml' | 'ComplexObject';
type ParameterDirection = 'In' | 'Out' | 'InOut';
type ProcessStatus = 'Completed' | 'Waiting' | 'Running' | 'Error';
interface IParameter {
    name: string;
    value: string | any | null;
    valueJson?: string | null;
    type: ParameterType;
    direction: ParameterDirection;
    path?: string;
    schema?: string;
    isVariable?: boolean;
    isSystemParameter?: boolean;
    hasBinding?: boolean;
}
interface IProcessParameter extends IParameter {
    parameterType: 1 | 2 | 'SingleValue' | 'Xml' | 'Json';
}
interface IInitializeParams {
    processName: string;
    activityName?: string;
    version?: string;
    instanceId?: string;
    userName?: string;
    token?: string;
    sessionToken?: string;
    formId?: number;
    formDraftId?: number;
    childProcessName?: string;
}
interface IProcessData {
    parameters: IParameter[];
    variables?: IParameter[];
    activities?: IActivityResult[];
    processName: string;
    version: string;
    instanceId?: string;
}
interface IActivityResult {
    name: string;
    parameters: IParameter[];
    completedDate?: string;
    status: string;
}
interface IStartProcessParams {
    processName: string;
    instanceId?: string;
    parameters: IParameter[];
    processVersion?: string;
    closeOnSuccess?: boolean;
    deletedDocuments?: string[];
}
interface IProcessResult {
    instanceId: string;
    status: ProcessStatus;
    parameters: IProcessParameter[];
    errorMessage?: string;
}
interface IRaiseEventParams {
    eventName: string;
    instanceId?: string;
    parameters: IParameter[];
    eventVersion?: string;
    closeOnSuccess?: boolean;
    deletedDocuments?: string[];
}
interface IRaiseEventResult {
    instanceId: string;
    status: ProcessStatus;
    parameters: IProcessParameter[];
    errorMessage?: string;
}
interface IEventParameter extends IParameter {
    parameterType: 1 | 2 | 'SingleValue' | 'Xml' | 'Json';
}
interface IInstanceData {
    instanceId: string;
    processName: string;
    activityName: string;
    status: ProcessStatus;
    parameters: IParameter[];
    variables: IParameter[];
    createdDate: string;
    completedDate?: string;
    lockedBy?: string;
    lockedDate?: string;
}
interface ILockStatus {
    available: boolean;
    reason?: string;
    user?: string;
    sessionToken?: string;
}
interface ILockRequest {
    instanceId: string;
    activityName: string;
    operation: number;
    processName: string;
}
interface IUnlockRequest {
    instanceId: string;
    activityName: string;
    sessionToken?: string;
}

/**
 * Process Flow State Types
 * Common state machine states for Bizuit process workflows
 */
/**
 * Generic process flow status
 * Can be used for both start and continue process flows
 *
 * - idle: Initial state, waiting for user to provide process/instance information
 * - initializing: Loading process metadata or instance data
 * - ready: Data loaded, form is ready for user input
 * - submitting: Submitting form data to Bizuit API
 * - success: Process completed successfully
 * - error: An error occurred during the flow
 */
type ProcessFlowStatus = 'idle' | 'initializing' | 'ready' | 'submitting' | 'success' | 'error';
/**
 * Start process specific status
 * Similar to ProcessFlowStatus but more specific to starting new processes
 */
type StartProcessStatus = 'idle' | 'initializing' | 'ready' | 'submitting' | 'success' | 'error';
/**
 * Continue process specific status
 * Includes 'loading' instead of 'initializing' for semantic clarity
 */
type ContinueProcessStatus = 'idle' | 'loading' | 'ready' | 'submitting' | 'success' | 'error';
/**
 * Instance lock status
 * Used when checking if an instance is locked before continuing
 *
 * - checking: Checking if instance is locked
 * - locked: Instance is locked by another user
 * - unlocked: Instance is available for editing
 * - error: Error checking lock status
 */
type InstanceLockStatus = 'checking' | 'locked' | 'unlocked' | 'error';

/**
 * Main types export
 */

type Result<T, E = Error> = {
    success: true;
    data: T;
} | {
    success: false;
    error: E;
};
interface IBizuitConfig {
    apiUrl: string;
    timeout?: number;
    defaultHeaders?: Record<string, string>;
}
interface IApiError {
    message: string;
    code?: string;
    details?: unknown;
    statusCode?: number;
}

/**
 * Bizuit HTTP Client
 * Axios-based client with interceptors for Bizuit API headers
 */

declare class BizuitHttpClient {
    private axiosInstance;
    private config;
    constructor(config: IBizuitConfig);
    private setupInterceptors;
    private sanitizeHeaders;
    private handleError;
    /**
     * GET request
     */
    get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    /**
     * POST request
     */
    post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    /**
     * PUT request
     */
    put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    /**
     * PATCH request
     */
    patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    /**
     * DELETE request
     */
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    /**
     * Add Bizuit-specific headers to request
     */
    withBizuitHeaders(headers: IBizuitAuthHeaders): BizuitHttpClient;
    /**
     * Clear all Bizuit headers
     */
    clearBizuitHeaders(): BizuitHttpClient;
    /**
     * Get raw axios instance for advanced usage
     */
    getAxiosInstance(): AxiosInstance;
}

/**
 * Bizuit Authentication Service
 * Handles token validation, user info, and auth checks
 */

declare class BizuitAuthService {
    private client;
    private apiUrl;
    constructor(config: IBizuitConfig);
    /**
     * Check form authentication and authorization
     * Validates token and returns login configuration
     */
    checkFormAuth(request: IRequestCheckFormAuth, token?: string): Promise<IAuthCheckResponse>;
    /**
     * Get current user information from token
     */
    getUserInfo(token: string, userName: string): Promise<IUserInfo>;
    /**
     * Get login configuration (OAuth, AD, etc.)
     */
    getLoginConfiguration(): Promise<Partial<ILoginSettings>>;
    /**
     * Validate token and get user data
     * Returns null if token is invalid
     */
    validateToken(token: string): Promise<IUserInfo | null>;
    /**
     * Check if user has required permissions
     */
    checkPermissions(token: string, userName: string, requiredRoles: string[]): Promise<boolean>;
    /**
     * Login methods (delegated to Bizuit Dashboard API)
     */
    azureLogin(idToken: string, accessToken: string): Promise<any>;
    oauthLogin(code: string, redirectUri: string): Promise<any>;
    socialLogin(token: string, type: 'google' | 'facebook'): Promise<any>;
    /**
     * Login with username and password
     * Uses HTTP Basic Authentication as per Bizuit API specification
     * Returns token and user information
     *
     * Example response from API:
     * {
     *   "token": "ZMdufWTdCsSYUXj7...",
     *   "user": {
     *     "username": "admin",
     *     "userID": 1,
     *     "displayName": "Administrator Account",
     *     "image": null
     *   },
     *   "forceChange": false,
     *   "expirationDate": "2025-11-27T22:07:20.5095101Z"
     * }
     */
    login(credentials: ILoginRequest): Promise<ILoginResponse>;
}

/**
 * Bizuit Process Service
 * Handles process initialization, start and continue operations
 * Updated to match Bizuit API specification exactly
 */

declare class BizuitProcessService {
    private client;
    private apiUrl;
    constructor(config: IBizuitConfig);
    /**
     * Initialize process - Get parameters for new or existing instance
     * Uses standard Authorization header as per API specification
     */
    initialize(params: IInitializeParams): Promise<IProcessData>;
    /**
     * Start process - Execute process or start new instance
     * Sends JSON directly as per Bizuit API specification
     *
     * Example from curl:
     * POST /api/instances
     * Authorization: Basic TOKEN
     * Content-Type: application/json
     * {
     *   "eventName": "DemoFlow",
     *   "parameters": [
     *     {
     *       "name": "pData",
     *       "value": "A",
     *       "type": "SingleValue",
     *       "direction": "In"
     *     }
     *   ]
     * }
     */
    start(params: IStartProcessParams, files?: File[], token?: string): Promise<IProcessResult>;
    /**
     * Get process parameters schema
     * Useful for dynamic form generation
     *
     * Example:
     * GET /api/eventmanager/workflowDefinition/parameters/{processName}?version={version}
     * Authorization: Basic TOKEN
     *
     * Returns array of parameters with:
     * - parameterType: 1 (SingleValue) or 2 (Xml)
     * - parameterDirection: 1 (In), 2 (Out), 3 (Optional)
     * - name, type, schema, isSystemParameter, isVariable
     */
    getParameters(processName: string, version?: string, token?: string): Promise<any[]>;
    /**
     * Get instance data
     * Uses standard Authorization header
     *
     * Example from curl:
     * GET /api/instances?instanceId=8d2d0e04-ea83-48f2-953d-ff858581e3df
     * Authorization: Basic TOKEN
     */
    getInstanceData(instanceId: string, token?: string): Promise<IProcessData>;
    /**
     * Acquire pessimistic lock on instance
     * Prevents concurrent editing
     */
    acquireLock(params: {
        instanceId: string;
        token: string;
    }): Promise<{
        sessionToken: string;
        processData: IProcessData;
    }>;
    /**
     * Release pessimistic lock on instance
     */
    releaseLock(params: {
        instanceId: string;
        sessionToken: string;
    }): Promise<void>;
    /**
     * Continue instance with updated parameters
     * Uses PUT method instead of POST
     *
     * Example from curl:
     * PUT /api/instances
     * Authorization: Basic TOKEN
     * Content-Type: application/json
     * {
     *   "eventName": "DemoFlow",
     *   "parameters": [...],
     *   "instanceId": "e3137f94-0ab5-4ae7-b256-10806fe92958"
     * }
     */
    continue(params: IStartProcessParams, files?: File[], token?: string): Promise<IProcessResult>;
    /**
     * Get Bizuit configuration settings for an organization
     * @param organizationId - Organization identifier
     * @param token - Authentication token
     * @returns Configuration settings object
     */
    getConfigurationSettings(organizationId: string, token?: string): Promise<Record<string, any>>;
}

/**
 * Bizuit Instance Lock Service
 * Handles pessimistic locking for process instances
 */

declare class BizuitInstanceLockService {
    private client;
    private apiUrl;
    constructor(config: IBizuitConfig);
    /**
     * Check if instance is locked
     */
    checkLockStatus(instanceId: string, activityName: string, token: string): Promise<ILockStatus>;
    /**
     * Lock instance for editing
     */
    lock(request: ILockRequest, token: string): Promise<ILockStatus>;
    /**
     * Unlock instance
     */
    unlock(request: IUnlockRequest, token: string): Promise<ILockStatus>;
    /**
     * Execute a callback with automatic lock/unlock
     * Ensures instance is always unlocked even if callback throws
     */
    withLock<T>(request: ILockRequest, token: string, callback: (sessionToken: string) => Promise<T>): Promise<T>;
    /**
     * Force unlock (admin only)
     * Use with caution
     */
    forceUnlock(instanceId: string, activityName: string, token: string): Promise<void>;
}

/**
 * Form utilities for converting form data to Bizuit API format
 */

/**
 * Bizuit Process Parameter from API
 * Structure returned by getProcessParameters endpoint
 */
interface IBizuitProcessParameter {
    name: string;
    parameterType: number;
    parameterDirection: number;
    type: string;
    schema: string;
    value: string | null;
    isSystemParameter: boolean;
    isVariable: boolean;
}
/**
 * Filters process parameters to get only those that should be displayed in the START PROCESS form
 * Excludes system parameters, variables, and output-only parameters
 *
 * @param parameters - Array of process parameters from getProcessParameters
 * @returns Filtered array of parameters for START process form display
 *
 * @example
 * ```typescript
 * const allParams = await sdk.process.getProcessParameters('MyProcess', '', token)
 * const formParams = filterFormParameters(allParams)
 * // Returns only input (direction=1) and optional (direction=3) parameters
 * // that are not system parameters or variables
 * ```
 */
declare function filterFormParameters(parameters: IBizuitProcessParameter[]): IBizuitProcessParameter[];
/**
 * Filters process parameters to get only those that should be displayed in the CONTINUE PROCESS form
 * Includes Input, Optional, AND Variables (different from filterFormParameters)
 * Excludes only system parameters and output-only parameters
 *
 * @param parameters - Array of process parameters from getProcessParameters
 * @returns Filtered array of parameters for CONTINUE process form display
 *
 * @example
 * ```typescript
 * const allParams = await sdk.process.getProcessParameters('MyProcess', '', token)
 * const formParams = filterContinueParameters(allParams)
 * // Returns input (direction=1), optional (direction=3) parameters,
 * // AND variables (isVariable=true) that are not system parameters
 * ```
 */
declare function filterContinueParameters(parameters: IBizuitProcessParameter[]): IBizuitProcessParameter[];
/**
 * Checks if a parameter is required or optional
 *
 * @param param - Process parameter
 * @returns true if parameter is required (direction=1), false if optional (direction=3)
 */
declare function isParameterRequired(param: IBizuitProcessParameter): boolean;
/**
 * Gets a human-readable label for parameter direction
 *
 * @param direction - Parameter direction number
 * @returns Human-readable label
 */
declare function getParameterDirectionLabel(direction: number): string;
/**
 * Gets a human-readable label for parameter type
 *
 * @param parameterType - Parameter type number
 * @returns Human-readable label
 */
declare function getParameterTypeLabel(parameterType: number): string;
/**
 * Converts form data to IParameter[] format expected by Bizuit API
 *
 * @param formData - Object with form field values
 * @returns Array of IParameter objects
 *
 * @example
 * ```typescript
 * const formData = {
 *   priority: 'high',
 *   categories: ['sales', 'support'],
 *   startDate: new Date(),
 *   budget: 75,
 *   description: 'Process description',
 *   files: [file1, file2]
 * }
 *
 * const parameters = formDataToParameters(formData)
 * // Returns:
 * // [
 * //   { name: 'priority', value: 'high', type: 'SingleValue', direction: 'In' },
 * //   { name: 'categories', value: '["sales","support"]', type: 'SingleValue', direction: 'In' },
 * //   ...
 * // ]
 * ```
 */
declare function formDataToParameters(formData: Record<string, any>): IParameter[];
/**
 * Converts IParameter[] back to form data object
 * Useful for loading existing instance data into the form
 *
 * @param parameters - Array of IParameter objects
 * @returns Object with form field values
 *
 * @example
 * ```typescript
 * const parameters = [
 *   { name: 'priority', value: 'high', type: 'SingleValue', direction: 'In' },
 *   { name: 'categories', value: '["sales","support"]', type: 'SingleValue', direction: 'In' }
 * ]
 *
 * const formData = parametersToFormData(parameters)
 * // Returns: { priority: 'high', categories: ['sales', 'support'] }
 * ```
 */
declare function parametersToFormData(parameters: IParameter[]): Record<string, any>;
/**
 * Creates a parameter with explicit type and direction
 * Useful for creating specific parameters that need custom configuration
 *
 * @param name - Parameter name
 * @param value - Parameter value
 * @param type - Parameter type (default: 'SingleValue')
 * @param direction - Parameter direction (default: 'In')
 * @returns IParameter object
 *
 * @example
 * ```typescript
 * const param = createParameter('userId', '12345', 'SingleValue', 'In')
 * ```
 */
declare function createParameter(name: string, value: any, type?: 'SingleValue' | 'Xml' | 'ComplexObject', direction?: 'In' | 'Out' | 'InOut'): IParameter;
/**
 * Merges multiple parameter arrays, with later arrays overriding earlier ones
 * Useful for combining default parameters with form data
 *
 * @param parameterArrays - Arrays of parameters to merge
 * @returns Merged array of parameters
 *
 * @example
 * ```typescript
 * const defaults = [{ name: 'status', value: 'pending', type: 'SingleValue', direction: 'In' }]
 * const formParams = formDataToParameters(formData)
 * const merged = mergeParameters(defaults, formParams)
 * ```
 */
declare function mergeParameters(...parameterArrays: IParameter[][]): IParameter[];
/**
 * Lock information returned by loadInstanceDataForContinue
 */
interface ILockInfo {
    /** Whether the instance is currently locked by this user */
    isLocked: boolean;
    /** Session token for unlocking (only present if isLocked is true) */
    sessionToken?: string;
    /** User who has the lock (only present if locked by another user) */
    lockedBy?: string;
    /** Reason for lock failure (only present if lock failed) */
    lockFailReason?: string;
}
/**
 * Result type for loadInstanceDataForContinue helper
 */
interface ILoadInstanceDataResult {
    instanceData: any;
    processName: string;
    eventName: string;
    formParameters: IBizuitProcessParameter[];
    formData: Record<string, any>;
    /** Lock information (only present if autoLock was requested) */
    lockInfo?: ILockInfo;
}
/**
 * Options for loadInstanceDataForContinue helper
 */
interface ILoadInstanceDataOptions {
    /** Instance ID to load */
    instanceId: string;
    /** Activity name (required if autoLock is true) */
    activityName?: string;
    /** Process name (required if autoLock is true) */
    processName?: string;
    /** Automatically acquire lock for editing (default: false) */
    autoLock?: boolean;
    /** Lock operation type (default: 1 = Edit) */
    lockOperation?: number;
}
/**
 * Helper function to load all necessary data for continuing a process instance
 * This encapsulates the business logic of:
 * 1. Getting instance data with parameters
 * 2. Converting API parameters to form-friendly format
 * 3. Filtering editable parameters (excludes Output-only and system params)
 * 4. Parsing existing parameter values into form data
 * 5. Optionally acquiring a pessimistic lock for editing
 *
 * @param sdk - Bizuit SDK instance with process and lock services
 * @param options - Configuration options
 * @param token - Authentication token
 * @returns Promise with all data needed to render continue form
 *
 * @example
 * ```typescript
 * // Load without lock (read-only)
 * const result = await loadInstanceDataForContinue(sdk, {
 *   instanceId: '123-456-789'
 * }, token)
 *
 * // Load with automatic lock (for editing)
 * const result = await loadInstanceDataForContinue(sdk, {
 *   instanceId: '123-456-789',
 *   activityName: 'ReviewTask',
 *   processName: 'ApprovalProcess',
 *   autoLock: true
 * }, token)
 *
 * // Check lock status
 * if (result.lockInfo?.isLocked) {
 *   console.log('Locked with session:', result.lockInfo.sessionToken)
 * }
 * ```
 */
declare function loadInstanceDataForContinue(sdk: any, // TODO: Type this properly as BizuitSDK
options: string | ILoadInstanceDataOptions, // Support old API (string) and new API (options object)
token: string): Promise<ILoadInstanceDataResult>;
/**
 * Release a lock acquired by loadInstanceDataForContinue
 *
 * This is a convenience helper that wraps sdk.lock.unlock().
 * Use this to release locks when canceling edits or after successful submit.
 *
 * @param sdk - Bizuit SDK instance with lock service
 * @param options - Lock release options
 * @param token - Authentication token
 * @returns Promise that resolves when lock is released
 *
 * @example
 * ```typescript
 * // After loading with lock
 * const result = await loadInstanceDataForContinue(sdk, {
 *   instanceId: '123',
 *   activityName: 'Task',
 *   processName: 'Process',
 *   autoLock: true
 * }, token)
 *
 * // ... user cancels or finishes editing ...
 *
 * // Release the lock
 * if (result.lockInfo?.sessionToken) {
 *   await releaseInstanceLock(sdk, {
 *     instanceId: '123',
 *     activityName: 'Task',
 *     sessionToken: result.lockInfo.sessionToken
 *   }, token)
 * }
 * ```
 */
declare function releaseInstanceLock(sdk: any, options: {
    instanceId: string;
    activityName: string;
    sessionToken: string;
}, token: string): Promise<void>;
/**
 * Processes a URL token and creates a mock login response
 * This is useful when Bizuit BPM passes a token via URL parameter
 *
 * @param token - The authentication token from URL
 * @param username - Optional username (defaults to 'bizuit-user')
 * @param displayName - Optional display name (defaults to 'Usuario Bizuit')
 * @param expirationHours - Token expiration in hours (defaults to 24)
 * @returns ILoginResponse object ready for auth context
 *
 * @example
 * ```typescript
 * import { processUrlToken } from '@bizuit/form-sdk'
 *
 * const urlToken = searchParams.get('token')
 * if (urlToken) {
 *   const loginResponse = processUrlToken(urlToken)
 *   setAuthData(loginResponse)
 * }
 * ```
 */
declare function processUrlToken(token: string, username?: string, displayName?: string, expirationHours?: number): {
    Token: string;
    User: {
        Username: string;
        UserID: number;
        DisplayName: string;
    };
    ExpirationDate: string;
};
/**
 * Parameter mapping configuration
 * Maps form fields to Bizuit parameters/variables with optional transformation
 */
interface IParameterMapping {
    /** Name of the Bizuit parameter or variable */
    parameterName: string;
    /** Whether this is a variable (true) or parameter (false). Default: false */
    isVariable?: boolean;
    /** Optional function to transform the form value before sending */
    transform?: (value: any) => any;
    /** Parameter type. Default: 'SingleValue' */
    type?: 'SingleValue' | 'Xml' | 'ComplexObject';
    /** Parameter direction. Default: 'In' */
    direction?: 'In' | 'Out' | 'InOut';
}
/**
 * Builds parameters array by selectively mapping form fields to Bizuit parameters/variables
 *
 * This function gives you complete control over which form fields are sent as parameters,
 * allowing you to:
 * - Map form field names to different parameter names
 * - Specify which fields are variables vs parameters
 * - Transform values before sending
 * - Send only specific fields instead of all form data
 *
 * @param mapping - Object mapping form field names to parameter configuration
 * @param formData - Form data object
 * @returns Array of IParameter objects ready for Bizuit API
 *
 * @example
 * ```typescript
 * // Map form fields to parameters and variables
 * const parameters = buildParameters({
 *   // Simple mapping: form field 'empleado' → parameter 'pEmpleado'
 *   'empleado': {
 *     parameterName: 'pEmpleado'
 *   },
 *
 *   // Map to different name with transformation
 *   'monto': {
 *     parameterName: 'pMonto',
 *     transform: (val) => parseFloat(val).toFixed(2)
 *   },
 *
 *   // Map to a variable (for continue process)
 *   'aprobado': {
 *     parameterName: 'vAprobado',
 *     isVariable: true
 *   },
 *
 *   // Complex object with custom type
 *   'detalles': {
 *     parameterName: 'pDetalles',
 *     type: 'ComplexObject'
 *   }
 * }, formData)
 *
 * // Only fields in mapping are included, all others are ignored
 * ```
 *
 * @example
 * ```typescript
 * // Continue process with selective fields
 * const parameters = buildParameters({
 *   // Only send these 2 fields, ignore all others
 *   'comentarios': { parameterName: 'pComentarios' },
 *   'estadoAprobacion': {
 *     parameterName: 'vEstado',
 *     isVariable: true
 *   }
 * }, formData)
 *
 * await sdk.process.raiseEvent({
 *   eventName: 'AprobacionVacaciones',
 *   instanceId: 'existing-instance-id',
 *   parameters
 * }, [], token)
 * ```
 */
declare function buildParameters(mapping: Record<string, IParameterMapping>, formData: Record<string, any>): IParameter[];

/**
 * Bizuit Form Service
 * High-level service for common form workflows
 *
 * Provides simplified methods that encapsulate common patterns:
 * - Starting new processes with form data + additional parameters
 * - Continuing existing processes with selective field mapping
 * - Managing locks automatically
 *
 * Use this service for common cases. For advanced control, use BizuitProcessService directly.
 */

declare class BizuitFormService {
    private sdk;
    constructor(sdk: any);
    /**
     * Prepares a form for STARTING a new process
     *
     * @returns Parameters ready to render the form
     */
    prepareStartForm(options: {
        processName: string;
        version?: string;
        token: string;
    }): Promise<{
        parameters: IBizuitProcessParameter[];
        formData: Record<string, any>;
    }>;
    /**
     * Starts a new process combining:
     * - Parameters mapped from form fields
     * - Additional parameters (not associated with fields)
     *
     * @example
     * ```typescript
     * // Only form data (send all fields)
     * await formService.startProcess({
     *   processName: 'ExpenseRequest',
     *   token,
     *   formData: { empleado: 'Juan', monto: '5000' }
     * })
     *
     * // Form data with selective mapping
     * await formService.startProcess({
     *   processName: 'ExpenseRequest',
     *   token,
     *   formData,
     *   fieldMapping: {
     *     'empleado': { parameterName: 'pEmpleado' },
     *     'monto': {
     *       parameterName: 'pMonto',
     *       transform: (val) => parseFloat(val).toFixed(2)
     *     }
     *   }
     * })
     *
     * // Form data + additional parameters
     * await formService.startProcess({
     *   processName: 'ExpenseRequest',
     *   token,
     *   formData,
     *   fieldMapping,
     *   additionalParameters: formService.createParameters([
     *     { name: 'pUsuarioCreador', value: currentUser.username },
     *     { name: 'pFechaCreacion', value: new Date().toISOString() }
     *   ])
     * })
     * ```
     */
    startProcess(options: {
        processName: string;
        processVersion?: string;
        formData?: Record<string, any>;
        fieldMapping?: Record<string, IParameterMapping>;
        additionalParameters?: IParameter[];
        files?: File[];
        token: string;
    }): Promise<IProcessResult>;
    /**
     * Prepares a form for CONTINUING an existing instance
     *
     * @returns Instance data ready to render and edit
     */
    prepareContinueForm(options: {
        instanceId: string;
        processName: string;
        activityName?: string;
        autoLock?: boolean;
        token: string;
    }): Promise<{
        parameters: IBizuitProcessParameter[];
        formData: Record<string, any>;
        lockInfo?: ILockInfo;
        instanceData: any;
    }>;
    /**
     * Continues an existing process combining:
     * - Parameters mapped from form fields
     * - Additional parameters (not associated with fields)
     *
     * @example
     * ```typescript
     * // Form data + context parameters
     * await formService.continueProcess({
     *   instanceId: '123-456',
     *   processName: 'ExpenseRequest',
     *   token,
     *   formData,
     *   fieldMapping: {
     *     'aprobado': {
     *       parameterName: 'vAprobado',
     *       isVariable: true
     *     },
     *     'comentarios': { parameterName: 'pComentarios' }
     *   },
     *   additionalParameters: formService.createParameters([
     *     { name: 'vAprobador', value: currentUser.username },
     *     { name: 'vFechaAprobacion', value: new Date().toISOString() }
     *   ])
     * })
     * ```
     */
    continueProcess(options: {
        instanceId: string;
        processName: string;
        formData?: Record<string, any>;
        fieldMapping?: Record<string, IParameterMapping>;
        additionalParameters?: IParameter[];
        files?: File[];
        token: string;
    }): Promise<IProcessResult>;
    /**
     * Releases a lock acquired during prepareContinueForm
     */
    releaseLock(options: {
        instanceId: string;
        activityName: string;
        sessionToken: string;
        token: string;
    }): Promise<void>;
    /**
     * Helper to create a single parameter easily
     */
    createParameter(name: string, value: any, options?: {
        type?: 'SingleValue' | 'Xml' | 'ComplexObject';
        direction?: 'In' | 'Out' | 'InOut';
    }): IParameter;
    /**
     * Helper to create multiple parameters easily
     *
     * @example
     * ```typescript
     * const params = formService.createParameters([
     *   { name: 'pUsuario', value: currentUser.username },
     *   { name: 'pFecha', value: new Date().toISOString() },
     *   { name: 'pConfig', value: { theme: 'dark' }, type: 'ComplexObject' }
     * ])
     * ```
     */
    createParameters(params: Array<{
        name: string;
        value: any;
        type?: 'SingleValue' | 'Xml' | 'ComplexObject';
        direction?: 'In' | 'Out' | 'InOut';
    }>): IParameter[];
}

/**
 * Bizuit SDK - Main entry point
 * Provides unified access to all Bizuit services
 */

declare class BizuitSDK {
    auth: BizuitAuthService;
    process: BizuitProcessService;
    instanceLock: BizuitInstanceLockService;
    forms: BizuitFormService;
    private config;
    constructor(config: IBizuitConfig);
    /**
     * Get current configuration
     */
    getConfig(): IBizuitConfig;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<IBizuitConfig>): void;
}

/**
 * Parameter Parser Utilities
 * Handles complex parameter structures (JSON, XML, nested objects)
 */

declare class ParameterParser {
    /**
     * Parse complex parameter value from JSON string
     */
    static parseComplexValue(parameter: IParameter): any;
    /**
     * Serialize complex value to parameter format
     */
    static serializeComplexValue(value: any, type: 'SingleValue' | 'Xml' | 'ComplexObject'): {
        value: string;
        valueJson?: string;
    };
    /**
     * Get value from nested path (e.g., "customer.address.street")
     */
    static getNestedValue(obj: any, path: string): any;
    /**
     * Set value at nested path
     */
    static setNestedValue(obj: any, path: string, value: any): any;
    /**
     * Flatten parameters for form data
     */
    static flattenParameters(parameters: IParameter[]): Record<string, any>;
    /**
     * Unflatten form data back to parameters
     */
    static unflattenToParameters(data: Record<string, any>, originalParameters: IParameter[]): IParameter[];
    /**
     * Merge parameters with form values
     */
    static mergeWithFormData(parameters: IParameter[], formData: Record<string, any>): IParameter[];
    /**
     * Filter parameters by direction
     */
    static filterByDirection(parameters: IParameter[], direction: 'In' | 'Out' | 'InOut'): IParameter[];
    /**
     * Get input parameters only
     */
    static getInputParameters(parameters: IParameter[]): IParameter[];
    /**
     * Get output parameters only
     */
    static getOutputParameters(parameters: IParameter[]): IParameter[];
    /**
     * Validate required parameters
     */
    static validateRequired(parameters: IParameter[], formData: Record<string, any>): {
        valid: boolean;
        missing: string[];
    };
}

/**
 * Error Handler Utilities
 */

declare class BizuitError extends Error {
    code?: string;
    statusCode?: number;
    details?: unknown;
    constructor(message: string, code?: string, statusCode?: number, details?: unknown);
    static fromApiError(apiError: IApiError): BizuitError;
    isAuthError(): boolean;
    isNetworkError(): boolean;
    isValidationError(): boolean;
}
declare function handleError(error: unknown): BizuitError;

/**
 * Parse URL parameters that come from Bizuit BPM with &amp; HTML encoding
 *
 * When Bizuit generates URLs in HTML context, browsers URL-encode &amp; as &amp%3B
 * This breaks standard query parameter parsing since "amp;" becomes part of param name
 *
 * @param paramName - The parameter name to extract
 * @param searchParams - URLSearchParams object from useSearchParams()
 * @returns The parameter value or null if not found
 *
 * @example
 * ```tsx
 * const searchParams = useSearchParams()
 * const token = parseBizuitUrlParam('token', searchParams)
 * const eventName = parseBizuitUrlParam('eventName', searchParams)
 * ```
 */
declare function parseBizuitUrlParam(paramName: string, searchParams: URLSearchParams): string | null;
/**
 * Create an ILoginResponse object from a URL token
 *
 * This is useful when receiving authentication tokens from Bizuit BPM URLs.
 * The token will be prefixed with "Basic " if not already present.
 *
 * @param urlToken - The token from the URL (without "Basic " prefix)
 * @param userName - Optional username (defaults to 'bizuit-user')
 * @param expirationMinutes - Token expiration in minutes (defaults to 1440 = 24 hours)
 * @returns ILoginResponse object ready to use with setAuthData()
 *
 * @example
 * ```tsx
 * const urlToken = searchParams.get('token')
 * const userName = searchParams.get('UserName')
 *
 * if (urlToken) {
 *   const authData = createAuthFromUrlToken(urlToken, userName, 120) // 2 hours
 *   setAuthData(authData)
 * }
 * ```
 */
declare function createAuthFromUrlToken(urlToken: string, userName?: string, expirationMinutes?: number): ILoginResponse;
/**
 * Build a login redirect URL with return path
 *
 * @param returnPath - The path to redirect to after login (e.g., '/start-process')
 * @param params - Optional additional query parameters to include in the return URL
 * @returns Complete login URL with redirect parameter
 *
 * @example
 * ```tsx
 * // Simple redirect
 * const loginUrl = buildLoginRedirectUrl('/start-process')
 * // "/login?redirect=%2Fstart-process"
 *
 * // With additional parameters
 * const loginUrl = buildLoginRedirectUrl('/start-process', { eventName: 'MyEvent' })
 * // "/login?redirect=%2Fstart-process%3FeventName%3DMyEvent"
 * ```
 */
declare function buildLoginRedirectUrl(returnPath: string, params?: Record<string, string>): string;

/**
 * Context type for error formatting
 */
type ErrorContext = 'load' | 'submit' | 'lock' | 'start' | 'general';
/**
 * Convert API errors to user-friendly messages
 *
 * Handles common HTTP status codes and network errors to provide
 * helpful feedback to users instead of technical error messages.
 *
 * @param error - The error object from API call
 * @param context - The context where the error occurred
 * @returns User-friendly error message in Spanish
 *
 * @example
 * ```tsx
 * try {
 *   await sdk.process.raiseEvent(...)
 * } catch (err) {
 *   const message = formatBizuitError(err, 'start')
 *   setError(message)
 * }
 * ```
 */
declare function formatBizuitError(error: any, context?: ErrorContext): string;

/**
 * XML to JSON Converter
 * Automatically converts XML strings to JavaScript objects
 * Used by process-service to parse XML parameters
 */
/**
 * Converts an XML string to a JavaScript object
 *
 * @param xmlString - The XML string to parse
 * @returns JavaScript object representation of the XML, or null on error
 *
 * @example
 * ```typescript
 * const xml = `
 *   <Deudor>
 *     <DatosPersonales>
 *       <ID>75</ID>
 *       <Nombre>John Doe</Nombre>
 *     </DatosPersonales>
 *     <Contactos>
 *       <Contacto><ID>1</ID></Contacto>
 *       <Contacto><ID>2</ID></Contacto>
 *     </Contactos>
 *   </Deudor>
 * `
 *
 * const result = xmlToJson(xml)
 * // {
 * //   deudor: {
 * //     datosPersonales: {
 * //       id: "75",
 * //       nombre: "John Doe"
 * //     },
 * //     contactos: {
 * //       contacto: [
 * //         { id: "1" },
 * //         { id: "2" }
 * //       ]
 * //     }
 * //   }
 * // }
 * ```
 */
declare function xmlToJson(xmlString: string): any | null;

export { type ILockInfo as $, type AuthControlType as A, BizuitSDK as B, type ContinueProcessStatus as C, type InstanceLockStatus as D, BizuitHttpClient as E, BizuitAuthService as F, BizuitProcessService as G, BizuitInstanceLockService as H, type IBizuitConfig as I, BizuitFormService as J, ParameterParser as K, BizuitError as L, handleError as M, xmlToJson as N, type IBizuitProcessParameter as O, type ParameterType as P, filterFormParameters as Q, type Result as R, type StartProcessStatus as S, filterContinueParameters as T, isParameterRequired as U, getParameterDirectionLabel as V, getParameterTypeLabel as W, formDataToParameters as X, parametersToFormData as Y, createParameter as Z, mergeParameters as _, type IUserInfo as a, type ILoadInstanceDataResult as a0, type ILoadInstanceDataOptions as a1, loadInstanceDataForContinue as a2, releaseInstanceLock as a3, processUrlToken as a4, type IParameterMapping as a5, buildParameters as a6, parseBizuitUrlParam as a7, createAuthFromUrlToken as a8, buildLoginRedirectUrl as a9, type ErrorContext as aa, formatBizuitError as ab, type IRequestCheckFormAuth as b, type IApiError as c, type IAuthCheckData as d, type IAuthCheckResponse as e, type ILoginSettings as f, type ILoginRequest as g, type ILoginResponse as h, type IBizuitAuthHeaders as i, type ParameterDirection as j, type ProcessStatus as k, type IParameter as l, type IProcessParameter as m, type IInitializeParams as n, type IProcessData as o, type IActivityResult as p, type IStartProcessParams as q, type IProcessResult as r, type IRaiseEventParams as s, type IRaiseEventResult as t, type IEventParameter as u, type IInstanceData as v, type ILockStatus as w, type ILockRequest as x, type IUnlockRequest as y, type ProcessFlowStatus as z };
