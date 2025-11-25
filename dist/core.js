"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/core.ts
var core_exports = {};
__export(core_exports, {
  BizuitAuthService: () => BizuitAuthService,
  BizuitError: () => BizuitError,
  BizuitFormService: () => BizuitFormService,
  BizuitHttpClient: () => BizuitHttpClient,
  BizuitInstanceLockService: () => BizuitInstanceLockService,
  BizuitProcessService: () => BizuitProcessService,
  BizuitSDK: () => BizuitSDK,
  ParameterParser: () => ParameterParser,
  VERSION: () => VERSION,
  buildLoginRedirectUrl: () => buildLoginRedirectUrl,
  buildParameters: () => buildParameters,
  createAuthFromUrlToken: () => createAuthFromUrlToken,
  createParameter: () => createParameter,
  filterContinueParameters: () => filterContinueParameters,
  filterFormParameters: () => filterFormParameters,
  formDataToParameters: () => formDataToParameters,
  formatBizuitError: () => formatBizuitError,
  getParameterDirectionLabel: () => getParameterDirectionLabel,
  getParameterTypeLabel: () => getParameterTypeLabel,
  handleError: () => handleError,
  isParameterRequired: () => isParameterRequired,
  loadInstanceDataForContinue: () => loadInstanceDataForContinue,
  mergeParameters: () => mergeParameters,
  parametersToFormData: () => parametersToFormData,
  parseBizuitUrlParam: () => parseBizuitUrlParam,
  processUrlToken: () => processUrlToken,
  releaseInstanceLock: () => releaseInstanceLock,
  xmlToJson: () => xmlToJson
});
module.exports = __toCommonJS(core_exports);

// src/lib/api/http-client.ts
var import_axios = __toESM(require("axios"));
var BizuitHttpClient = class {
  constructor(config) {
    this.config = config;
    this.axiosInstance = import_axios.default.create({
      timeout: config.timeout || 12e4,
      // 2 minutes default
      headers: {
        "Content-Type": "application/json",
        ...config.defaultHeaders
      }
    });
    this.setupInterceptors();
  }
  setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[Bizuit API Request]", {
            method: config.method?.toUpperCase(),
            url: config.url,
            headers: this.sanitizeHeaders(config.headers)
          });
        }
        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[Bizuit API Response]", {
            status: response.status,
            url: response.config.url
          });
        }
        return response;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }
  sanitizeHeaders(headers) {
    const sanitized = {};
    for (const key in headers) {
      if (key.toLowerCase().includes("token") || key.toLowerCase().includes("auth")) {
        sanitized[key] = "***REDACTED***";
      } else {
        sanitized[key] = headers[key];
      }
    }
    return sanitized;
  }
  handleError(error) {
    const apiError = {
      message: "An unexpected error occurred",
      statusCode: error.response?.status
    };
    if (error.response) {
      const data = error.response.data;
      apiError.message = data?.message || data?.errorMessage || error.message;
      apiError.code = data?.errorType || data?.code;
      apiError.details = data;
    } else if (error.request) {
      apiError.message = "No response from server";
      apiError.code = "NETWORK_ERROR";
    } else {
      apiError.message = error.message;
      apiError.code = "REQUEST_ERROR";
    }
    return apiError;
  }
  /**
   * GET request
   */
  async get(url, config) {
    const response = await this.axiosInstance.get(url, config);
    return response.data;
  }
  /**
   * POST request
   */
  async post(url, data, config) {
    const response = await this.axiosInstance.post(url, data, config);
    return response.data;
  }
  /**
   * PUT request
   */
  async put(url, data, config) {
    const response = await this.axiosInstance.put(url, data, config);
    return response.data;
  }
  /**
   * PATCH request
   */
  async patch(url, data, config) {
    const response = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }
  /**
   * DELETE request
   */
  async delete(url, config) {
    const response = await this.axiosInstance.delete(url, config);
    return response.data;
  }
  /**
   * Add Bizuit-specific headers to request
   */
  withBizuitHeaders(headers) {
    const cleanHeaders = {};
    Object.entries(headers).forEach(([key, value]) => {
      if (value !== void 0 && value !== null) {
        cleanHeaders[key] = String(value);
      }
    });
    this.axiosInstance.defaults.headers.common = {
      ...this.axiosInstance.defaults.headers.common,
      ...cleanHeaders
    };
    return this;
  }
  /**
   * Clear all Bizuit headers
   */
  clearBizuitHeaders() {
    const bizuitHeaderPrefixes = ["BZ-"];
    const headers = this.axiosInstance.defaults.headers.common;
    Object.keys(headers).forEach((key) => {
      if (bizuitHeaderPrefixes.some((prefix) => key.startsWith(prefix))) {
        delete headers[key];
      }
    });
    return this;
  }
  /**
   * Get raw axios instance for advanced usage
   */
  getAxiosInstance() {
    return this.axiosInstance;
  }
};

// src/lib/api/auth-service.ts
var BizuitAuthService = class {
  constructor(config) {
    this.client = new BizuitHttpClient(config);
    this.apiUrl = config.apiUrl;
  }
  /**
   * Check form authentication and authorization
   * Validates token and returns login configuration
   */
  async checkFormAuth(request, token) {
    const headers = {
      "BZ-FORM-VIEWER": "true"
    };
    if (token) {
      headers["BZ-AUTH-TOKEN"] = token;
    }
    if (request.formId) {
      headers["BZ-FORM-ID"] = String(request.formId);
    }
    if (request.formName) {
      headers["BZ-FORM-NAME"] = request.formName;
    }
    if (request.processName) {
      headers["BZ-PROCESS-NAME"] = request.processName;
    }
    try {
      const response = await this.client.post(
        `${this.apiUrl}/Login/CheckFormAuth`,
        request,
        { headers }
      );
      return response;
    } catch (error) {
      return {
        success: false,
        canRetry: error.statusCode !== 401,
        errorMessage: error.message,
        errorType: error.code
      };
    }
  }
  /**
   * Get current user information from token
   */
  async getUserInfo(token, userName) {
    this.client.withBizuitHeaders({
      "BZ-AUTH-TOKEN": token,
      "BZ-USER-NAME": userName
    });
    const userInfo = await this.client.get(
      `${this.apiUrl}/Login/UserInfo`
    );
    this.client.clearBizuitHeaders();
    return userInfo;
  }
  /**
   * Get login configuration (OAuth, AD, etc.)
   */
  async getLoginConfiguration() {
    const config = await this.client.get(
      `${this.apiUrl}/Login/LoginConfiguration`
    );
    return config;
  }
  /**
   * Validate token and get user data
   * Returns null if token is invalid
   */
  async validateToken(token) {
    try {
      const decoded = atob(token.replace("Basic ", ""));
      const userName = decoded.split(":")[0];
      const userInfo = await this.getUserInfo(token, userName);
      return userInfo;
    } catch (error) {
      console.error("[BizuitAuthService] Token validation failed:", error);
      return null;
    }
  }
  /**
   * Check if user has required permissions
   */
  async checkPermissions(token, userName, requiredRoles) {
    try {
      const userInfo = await this.getUserInfo(token, userName);
      if (!userInfo.roles || requiredRoles.length === 0) {
        return true;
      }
      return requiredRoles.some((role) => userInfo.roles.includes(role));
    } catch (error) {
      console.error("[BizuitAuthService] Permission check failed:", error);
      return false;
    }
  }
  /**
   * Login methods (delegated to Bizuit Dashboard API)
   */
  async azureLogin(idToken, accessToken) {
    return this.client.post(`${this.apiUrl}/Login/AzureLogin`, {
      idToken,
      accessToken
    });
  }
  async oauthLogin(code, redirectUri) {
    return this.client.get(
      `${this.apiUrl}/Login/GetOauthLoginAsync?code=${code}&redirectUri=${redirectUri}`
    );
  }
  async socialLogin(token, type) {
    return this.client.get(`${this.apiUrl}/Login/SocialLogin?type=${type}`, {
      headers: {
        Authorization: `Basic ${token}`
      }
    });
  }
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
  async login(credentials) {
    const { username, password } = credentials;
    const authString = `${username}:${password}`;
    const base64Auth = btoa(authString);
    const authHeader = `Basic ${base64Auth}`;
    try {
      const response = await this.client.get(
        `${this.apiUrl}/Login`,
        {
          headers: {
            "Authorization": authHeader
          }
        }
      );
      const loginResponse = {
        Token: `Basic ${response.token}`,
        // Prepend "Basic " to the token
        User: {
          Username: response.user.username,
          UserID: response.user.userID,
          DisplayName: response.user.displayName,
          Image: response.user.image
        },
        ForceChange: response.forceChange,
        ExpirationDate: response.expirationDate
      };
      return loginResponse;
    } catch (error) {
      if (error.statusCode === 401) {
        throw new Error("Nombre de Usuario y/o Contrase\xF1a incorrectos.");
      } else if (error.statusCode === 403) {
        throw new Error("Acceso denegado, no tiene permiso para acceder.");
      }
      throw error;
    }
  }
};

// src/lib/utils/xml-parser.ts
function toCamelCase(str) {
  if (!str) return str;
  if (str === str.toUpperCase()) {
    return str.toLowerCase();
  }
  const match = str.match(/^([A-Z]+)([A-Z][a-z].*)$/);
  if (match) {
    return match[1].toLowerCase() + match[2];
  }
  return str.charAt(0).toLowerCase() + str.slice(1);
}
function xmlNodeToJson(node) {
  const obj = {};
  const children = Array.from(node.children);
  if (children.length === 0) {
    const textContent = node.textContent?.trim() || "";
    return textContent;
  }
  const childrenByTag = /* @__PURE__ */ new Map();
  children.forEach((child) => {
    const tagName = toCamelCase(child.tagName);
    if (!childrenByTag.has(tagName)) {
      childrenByTag.set(tagName, []);
    }
    childrenByTag.get(tagName).push(child);
  });
  childrenByTag.forEach((elements, tagName) => {
    if (elements.length === 1) {
      obj[tagName] = xmlNodeToJson(elements[0]);
    } else {
      obj[tagName] = elements.map((el) => xmlNodeToJson(el));
    }
  });
  return obj;
}
function xmlToJson(xmlString) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
      console.error("XML parsing error:", parserError.textContent);
      return null;
    }
    const rootElement = xmlDoc.documentElement;
    if (!rootElement) {
      console.error("No root element found in XML");
      return null;
    }
    const rootTagName = toCamelCase(rootElement.tagName);
    const result = {
      [rootTagName]: xmlNodeToJson(rootElement)
    };
    return result;
  } catch (error) {
    console.error("Error converting XML to JSON:", error);
    return null;
  }
}

// src/lib/api/process-service.ts
var BizuitProcessService = class {
  constructor(config) {
    this.client = new BizuitHttpClient(config);
    this.apiUrl = config.apiUrl;
  }
  /**
   * Initialize process - Get parameters for new or existing instance
   * Uses standard Authorization header as per API specification
   */
  async initialize(params) {
    const queryParams = new URLSearchParams();
    queryParams.append("processName", params.processName);
    if (params.activityName) queryParams.append("activityName", params.activityName);
    if (params.version) queryParams.append("version", params.version);
    if (params.instanceId) queryParams.append("instanceId", params.instanceId);
    const headers = {};
    if (params.token) {
      headers["Authorization"] = params.token;
    }
    if (params.sessionToken) {
      headers["BZ-SESSION-TOKEN"] = params.sessionToken;
    }
    if (params.userName) {
      headers["BZ-USER-NAME"] = params.userName;
    }
    if (params.formId) {
      headers["BZ-FORM"] = String(params.formId);
    }
    if (params.formDraftId) {
      headers["BZ-DRAFT-FORM"] = String(params.formDraftId);
    }
    if (params.processName) {
      headers["BZ-PROCESS-NAME"] = params.processName;
    }
    if (params.instanceId) {
      headers["BZ-INSTANCEID"] = params.instanceId;
    }
    if (params.childProcessName) {
      headers["BZ-CHILD-PROCESS-NAME"] = params.childProcessName;
    }
    const processData = await this.client.get(
      `${this.apiUrl}/Process/Initialize?${queryParams.toString()}`,
      { headers }
    );
    return processData;
  }
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
  async start(params, files, token) {
    const headers = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = token;
    }
    const payload = {
      eventName: params.processName,
      parameters: params.parameters || []
    };
    if (params.instanceId) {
      payload.instanceId = params.instanceId;
    }
    if (params.processVersion) {
      payload.eventVersion = params.processVersion;
    }
    if (params.closeOnSuccess !== void 0) {
      payload.closeOnSuccess = params.closeOnSuccess;
    }
    if (params.deletedDocuments && params.deletedDocuments.length > 0) {
      payload.deletedDocuments = params.deletedDocuments;
    }
    if (files && files.length > 0) {
      console.warn("File upload in start is not yet implemented in JSON mode");
    }
    const result = await this.client.post(
      `${this.apiUrl}/instances`,
      payload,
      { headers }
    );
    const parametersArray = result.tyconParameters || result.parameters;
    if (parametersArray && Array.isArray(parametersArray)) {
      parametersArray.forEach((param) => {
        if ((param.parameterType === 2 || param.parameterType === "Xml") && param.value) {
          try {
            const parsedJson = xmlToJson(param.value);
            if (parsedJson !== null) {
              param.value = parsedJson;
              param.parameterType = "Json";
              console.log(`\u2705 Auto-parsed XML parameter: ${param.name}`);
            } else {
              console.warn(`\u26A0\uFE0F Failed to parse XML parameter: ${param.name}, keeping original XML`);
            }
          } catch (error) {
            console.warn(`\u26A0\uFE0F Error parsing XML parameter ${param.name}:`, error);
          }
        }
      });
      if (result.tyconParameters) {
        result.parameters = parametersArray;
      }
    }
    return result;
  }
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
  async getParameters(processName, version, token) {
    const headers = {};
    if (token) {
      headers["Authorization"] = token;
    }
    const queryParams = new URLSearchParams();
    queryParams.append("version", version || "");
    const url = `${this.apiUrl}/eventmanager/workflowDefinition/parameters/${processName}?${queryParams.toString()}`;
    const parameters = await this.client.get(url, { headers });
    return parameters;
  }
  /**
   * Get instance data
   * Uses standard Authorization header
   *
   * Example from curl:
   * GET /api/instances?instanceId=8d2d0e04-ea83-48f2-953d-ff858581e3df
   * Authorization: Basic TOKEN
   */
  async getInstanceData(instanceId, token) {
    const headers = {};
    if (token) {
      headers["Authorization"] = token;
    }
    const data = await this.client.get(
      `${this.apiUrl}/instances?instanceId=${instanceId}`,
      { headers }
    );
    return data;
  }
  /**
   * Acquire pessimistic lock on instance
   * Prevents concurrent editing
   */
  async acquireLock(params) {
    const headers = {
      "Authorization": params.token
    };
    const result = await this.client.post(
      `${this.apiUrl}/ProcessInstance/AcquireLock`,
      { instanceId: params.instanceId },
      { headers }
    );
    return result;
  }
  /**
   * Release pessimistic lock on instance
   */
  async releaseLock(params) {
    const headers = {
      "BZ-SESSION-TOKEN": params.sessionToken
    };
    await this.client.post(
      `${this.apiUrl}/ProcessInstance/ReleaseLock`,
      { instanceId: params.instanceId },
      { headers }
    );
  }
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
  async continue(params, files, token) {
    if (!params.instanceId) {
      throw new Error("instanceId is required for continue");
    }
    const headers = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = token;
    }
    const payload = {
      eventName: params.processName,
      parameters: params.parameters || [],
      instanceId: params.instanceId
    };
    if (params.processVersion) {
      payload.eventVersion = params.processVersion;
    }
    if (params.closeOnSuccess !== void 0) {
      payload.closeOnSuccess = params.closeOnSuccess;
    }
    if (params.deletedDocuments && params.deletedDocuments.length > 0) {
      payload.deletedDocuments = params.deletedDocuments;
    }
    if (files && files.length > 0) {
      console.warn("File upload in continue is not yet implemented in JSON mode");
    }
    const result = await this.client.put(
      `${this.apiUrl}/instances`,
      payload,
      { headers }
    );
    const parametersArray = result.tyconParameters || result.parameters;
    if (parametersArray && Array.isArray(parametersArray)) {
      parametersArray.forEach((param) => {
        if ((param.parameterType === 2 || param.parameterType === "Xml") && param.value) {
          try {
            const parsedJson = xmlToJson(param.value);
            if (parsedJson !== null) {
              param.value = parsedJson;
              param.parameterType = "Json";
              console.log(`\u2705 Auto-parsed XML parameter: ${param.name}`);
            } else {
              console.warn(`\u26A0\uFE0F Failed to parse XML parameter: ${param.name}, keeping original XML`);
            }
          } catch (error) {
            console.warn(`\u26A0\uFE0F Error parsing XML parameter ${param.name}:`, error);
          }
        }
      });
      if (result.tyconParameters) {
        result.parameters = parametersArray;
      }
    }
    return result;
  }
  /**
   * Get Bizuit configuration settings for an organization
   * @param organizationId - Organization identifier
   * @param token - Authentication token
   * @returns Configuration settings object
   */
  async getConfigurationSettings(organizationId, token) {
    const headers = {};
    if (token) {
      headers["Authorization"] = token;
    }
    const result = await this.client.get(
      `${this.apiUrl}/bpmn/configuration-settings?organizationId=${organizationId}`,
      { headers }
    );
    return result;
  }
};

// src/lib/api/instance-lock-service.ts
var BizuitInstanceLockService = class {
  constructor(config) {
    this.client = new BizuitHttpClient(config);
    this.apiUrl = config.apiUrl;
  }
  /**
   * Check if instance is locked
   */
  async checkLockStatus(instanceId, activityName, token) {
    this.client.withBizuitHeaders({
      "BZ-AUTH-TOKEN": token
    });
    const status = await this.client.get(
      `${this.apiUrl}/instances/status/${instanceId}?activityName=${activityName}`
    );
    this.client.clearBizuitHeaders();
    return {
      available: status
    };
  }
  /**
   * Lock instance for editing
   */
  async lock(request, token) {
    this.client.withBizuitHeaders({
      "BZ-AUTH-TOKEN": token
    });
    const queryParams = new URLSearchParams({
      activityName: request.activityName,
      operation: String(request.operation),
      processName: request.processName
    });
    const result = await this.client.patch(
      `${this.apiUrl}/instances/lock/${request.instanceId}?${queryParams.toString()}`
    );
    this.client.clearBizuitHeaders();
    return result;
  }
  /**
   * Unlock instance
   */
  async unlock(request, token) {
    this.client.withBizuitHeaders({
      "BZ-AUTH-TOKEN": token
    });
    const result = await this.client.patch(
      `${this.apiUrl}/instances/unlock/${request.instanceId}`,
      request
    );
    this.client.clearBizuitHeaders();
    return result;
  }
  /**
   * Execute a callback with automatic lock/unlock
   * Ensures instance is always unlocked even if callback throws
   */
  async withLock(request, token, callback) {
    const lockResult = await this.lock(request, token);
    if (!lockResult.available) {
      throw new Error(
        `Instance is locked by ${lockResult.user}. Reason: ${lockResult.reason}`
      );
    }
    const sessionToken = lockResult.sessionToken || "";
    try {
      const result = await callback(sessionToken);
      return result;
    } finally {
      try {
        await this.unlock(
          {
            instanceId: request.instanceId,
            activityName: request.activityName,
            sessionToken
          },
          token
        );
      } catch (unlockError) {
        console.error("[BizuitInstanceLockService] Failed to unlock instance:", unlockError);
      }
    }
  }
  /**
   * Force unlock (admin only)
   * Use with caution
   */
  async forceUnlock(instanceId, activityName, token) {
    await this.unlock(
      {
        instanceId,
        activityName
      },
      token
    );
  }
};

// src/lib/utils/form-utils.ts
function filterFormParameters(parameters) {
  return parameters.filter((param) => {
    if (param.isSystemParameter || param.isVariable) {
      return false;
    }
    return param.parameterDirection === 1 || param.parameterDirection === 3;
  });
}
function filterContinueParameters(parameters) {
  return parameters.filter((param) => {
    if (param.isSystemParameter) {
      return false;
    }
    if (param.isVariable) {
      return true;
    }
    return param.parameterDirection === 1 || param.parameterDirection === 3;
  });
}
function isParameterRequired(param) {
  return param.parameterDirection === 1;
}
function getParameterDirectionLabel(direction) {
  switch (direction) {
    case 1:
      return "Input";
    case 2:
      return "Output";
    case 3:
      return "Optional";
    default:
      return "Unknown";
  }
}
function getParameterTypeLabel(parameterType) {
  switch (parameterType) {
    case 1:
      return "SingleValue";
    case 2:
      return "Xml";
    default:
      return "Unknown";
  }
}
function formDataToParameters(formData) {
  const parameters = [];
  for (const [key, value] of Object.entries(formData)) {
    if (value === void 0 || value === null || value === "") {
      continue;
    }
    if (value instanceof File || Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
      continue;
    }
    let stringValue;
    let paramType = "SingleValue";
    if (Array.isArray(value)) {
      stringValue = JSON.stringify(value);
    } else if (value instanceof Date) {
      stringValue = value.toISOString();
    } else if (typeof value === "object") {
      stringValue = JSON.stringify(value);
      paramType = "ComplexObject";
    } else if (typeof value === "boolean") {
      stringValue = value.toString();
    } else {
      stringValue = String(value);
    }
    parameters.push({
      name: key,
      value: stringValue,
      type: paramType,
      direction: "In"
    });
  }
  return parameters;
}
function parametersToFormData(parameters) {
  const formData = {};
  for (const param of parameters) {
    if (!param.value) continue;
    try {
      const parsedValue = JSON.parse(param.value);
      formData[param.name] = parsedValue;
    } catch {
      if (isISODate(param.value)) {
        formData[param.name] = new Date(param.value);
      } else if (param.value === "true" || param.value === "false") {
        formData[param.name] = param.value === "true";
      } else if (!isNaN(Number(param.value)) && param.value.trim() !== "") {
        formData[param.name] = Number(param.value);
      } else {
        formData[param.name] = param.value;
      }
    }
  }
  return formData;
}
function isISODate(str) {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  return isoDateRegex.test(str);
}
function createParameter(name, value, type = "SingleValue", direction = "In") {
  return {
    name,
    value: typeof value === "string" ? value : JSON.stringify(value),
    type,
    direction
  };
}
function mergeParameters(...parameterArrays) {
  const paramMap = /* @__PURE__ */ new Map();
  for (const params of parameterArrays) {
    for (const param of params) {
      paramMap.set(param.name, param);
    }
  }
  return Array.from(paramMap.values());
}
function mapApiParameterToInternal(apiParam) {
  return {
    name: apiParam.name,
    value: typeof apiParam.value === "object" ? JSON.stringify(apiParam.value) : String(apiParam.value || ""),
    type: apiParam.parameterType === "SingleValue" ? "SingleValue" : apiParam.parameterType === "Xml" ? "Xml" : "SingleValue",
    direction: apiParam.parameterDirection === "In" ? "In" : apiParam.parameterDirection === "Out" ? "Out" : apiParam.parameterDirection === "Optional" ? "InOut" : "In"
  };
}
function mapApiParameterToFormParameter(apiParam) {
  let direction = 1;
  if (apiParam.parameterDirection === "Out") direction = 2;
  else if (apiParam.parameterDirection === "Optional") direction = 3;
  else if (apiParam.parameterDirection === "In") direction = 1;
  let paramType = 1;
  if (apiParam.parameterType === "Xml") paramType = 2;
  return {
    name: apiParam.name,
    parameterType: paramType,
    parameterDirection: direction,
    type: guessTypeFromValue(apiParam.value),
    schema: "",
    value: typeof apiParam.value === "object" ? JSON.stringify(apiParam.value) : String(apiParam.value || ""),
    isSystemParameter: apiParam.name === "InstanceId" || apiParam.name === "LoggedUser" || apiParam.name === "ExceptionParameter",
    isVariable: false
    // API doesn't distinguish, assume false for now
  };
}
function guessTypeFromValue(value) {
  if (value === null || value === void 0 || value === "") return "string";
  if (typeof value === "boolean") return "bool";
  if (typeof value === "number") return "int";
  if (typeof value === "object") return "string";
  if (!isNaN(Number(value)) && value.toString().trim() !== "") return "int";
  return "string";
}
async function loadInstanceDataForContinue(sdk, options, token) {
  const opts = typeof options === "string" ? { instanceId: options, autoLock: false } : options;
  const { instanceId, activityName, processName, autoLock = false, lockOperation = 1 } = opts;
  const instanceData = await sdk.process.getInstanceData(instanceId, token);
  let formParameters = [];
  let formData = {};
  let lockInfo;
  const apiParameters = instanceData?.results?.tyconParameters?.tyconParameter;
  if (apiParameters && Array.isArray(apiParameters)) {
    const allParams = apiParameters.map(mapApiParameterToFormParameter);
    formParameters = allParams.filter((param) => {
      if (param.isSystemParameter) return false;
      if (param.parameterDirection === 2) return false;
      return true;
    });
    const parameters = apiParameters.map(mapApiParameterToInternal);
    formData = parametersToFormData(parameters);
  }
  if (autoLock) {
    if (!activityName || !processName) {
      throw new Error("activityName and processName are required when autoLock is true");
    }
    try {
      const lockResult = await sdk.lock.lock(
        {
          instanceId,
          activityName,
          processName,
          operation: lockOperation
        },
        token
      );
      if (lockResult.available) {
        lockInfo = {
          isLocked: true,
          sessionToken: lockResult.sessionToken
        };
      } else {
        lockInfo = {
          isLocked: false,
          lockedBy: lockResult.user,
          lockFailReason: lockResult.reason || "Instance is locked by another user"
        };
      }
    } catch (err) {
      lockInfo = {
        isLocked: false,
        lockFailReason: err.message || "Failed to acquire lock"
      };
    }
  }
  return {
    instanceData,
    processName: processName || "",
    // Use provided processName if available
    eventName: "",
    // Must be provided by user separately
    formParameters,
    formData,
    lockInfo
  };
}
async function releaseInstanceLock(sdk, options, token) {
  try {
    await sdk.lock.unlock(options, token);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[releaseInstanceLock] Failed to release lock:", err.message);
    }
  }
}
function processUrlToken(token, username = "bizuit-user", displayName = "Usuario Bizuit", expirationHours = 24) {
  return {
    Token: token,
    User: {
      Username: username,
      UserID: 0,
      DisplayName: displayName
    },
    ExpirationDate: new Date(Date.now() + expirationHours * 60 * 60 * 1e3).toISOString()
  };
}
function buildParameters(mapping, formData) {
  const parameters = [];
  for (const [formFieldName, config] of Object.entries(mapping)) {
    let value = formData[formFieldName];
    if (value === void 0) {
      continue;
    }
    if ((value === null || value === "") && !config.transform) {
      continue;
    }
    if (config.transform) {
      value = config.transform(value);
    }
    let stringValue;
    let paramType = config.type || "SingleValue";
    if (value instanceof File || Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
      continue;
    } else if (Array.isArray(value)) {
      stringValue = JSON.stringify(value);
    } else if (value instanceof Date) {
      stringValue = value.toISOString();
    } else if (typeof value === "object" && value !== null) {
      stringValue = JSON.stringify(value);
      if (!config.type) {
        paramType = "ComplexObject";
      }
    } else if (typeof value === "boolean") {
      stringValue = value.toString();
    } else {
      stringValue = String(value);
    }
    parameters.push({
      name: config.parameterName,
      value: stringValue,
      type: paramType,
      direction: config.direction || "In"
    });
  }
  return parameters;
}

// src/lib/api/form-service.ts
var BizuitFormService = class {
  constructor(sdk) {
    this.sdk = sdk;
  }
  /**
   * Prepares a form for STARTING a new process
   *
   * @returns Parameters ready to render the form
   */
  async prepareStartForm(options) {
    const processData = await this.sdk.process.initialize({
      processName: options.processName,
      version: options.version,
      token: options.token
    });
    const parameters = processData.parameters || [];
    const formData = {};
    parameters.forEach((param) => {
      if (param.value !== null && param.value !== void 0) {
        formData[param.name] = param.value;
      }
    });
    return { parameters, formData };
  }
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
  async startProcess(options) {
    const parameters = [];
    if (options.formData && options.fieldMapping) {
      const mappedParams = buildParameters(options.fieldMapping, options.formData);
      parameters.push(...mappedParams);
    } else if (options.formData && !options.fieldMapping) {
      const allParams = formDataToParameters(options.formData);
      parameters.push(...allParams);
    }
    if (options.additionalParameters) {
      parameters.push(...options.additionalParameters);
    }
    return await this.sdk.process.start({
      processName: options.processName,
      processVersion: options.processVersion,
      parameters
    }, options.files, options.token);
  }
  /**
   * Prepares a form for CONTINUING an existing instance
   *
   * @returns Instance data ready to render and edit
   */
  async prepareContinueForm(options) {
    const result = await loadInstanceDataForContinue(
      this.sdk,
      {
        instanceId: options.instanceId,
        processName: options.processName,
        activityName: options.activityName,
        autoLock: options.autoLock
      },
      options.token
    );
    return {
      parameters: result.formParameters,
      formData: result.formData,
      lockInfo: result.lockInfo,
      instanceData: result.instanceData
    };
  }
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
  async continueProcess(options) {
    const parameters = [];
    if (options.formData && options.fieldMapping) {
      const mappedParams = buildParameters(options.fieldMapping, options.formData);
      parameters.push(...mappedParams);
    } else if (options.formData && !options.fieldMapping) {
      const allParams = formDataToParameters(options.formData);
      parameters.push(...allParams);
    }
    if (options.additionalParameters) {
      parameters.push(...options.additionalParameters);
    }
    return await this.sdk.process.continue({
      processName: options.processName,
      instanceId: options.instanceId,
      parameters
    }, options.files, options.token);
  }
  /**
   * Releases a lock acquired during prepareContinueForm
   */
  async releaseLock(options) {
    return await releaseInstanceLock(
      this.sdk,
      {
        instanceId: options.instanceId,
        activityName: options.activityName,
        sessionToken: options.sessionToken
      },
      options.token
    );
  }
  /**
   * Helper to create a single parameter easily
   */
  createParameter(name, value, options) {
    return createParameter(
      name,
      value,
      options?.type || "SingleValue",
      options?.direction || "In"
    );
  }
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
  createParameters(params) {
    return params.map((p) => this.createParameter(p.name, p.value, {
      type: p.type,
      direction: p.direction
    }));
  }
};

// src/lib/api/bizuit-sdk.ts
var BizuitSDK = class {
  constructor(config) {
    this.config = config;
    this.auth = new BizuitAuthService(config);
    this.process = new BizuitProcessService(config);
    this.instanceLock = new BizuitInstanceLockService(config);
    this.forms = new BizuitFormService(this);
  }
  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.auth = new BizuitAuthService(this.config);
    this.process = new BizuitProcessService(this.config);
    this.instanceLock = new BizuitInstanceLockService(this.config);
    this.forms = new BizuitFormService(this);
  }
};

// src/lib/utils/parameter-parser.ts
var ParameterParser = class {
  /**
   * Parse complex parameter value from JSON string
   */
  static parseComplexValue(parameter) {
    if (!parameter.valueJson) {
      return parameter.value;
    }
    try {
      return JSON.parse(parameter.valueJson);
    } catch (error) {
      console.warn("[ParameterParser] Failed to parse valueJson:", error);
      return parameter.value;
    }
  }
  /**
   * Serialize complex value to parameter format
   */
  static serializeComplexValue(value, type) {
    if (type === "SingleValue") {
      return {
        value: String(value ?? "")
      };
    }
    if (typeof value === "object") {
      const jsonString = JSON.stringify(value);
      return {
        value: jsonString,
        valueJson: jsonString
      };
    }
    return {
      value: String(value ?? ""),
      valueJson: String(value ?? "")
    };
  }
  /**
   * Get value from nested path (e.g., "customer.address.street")
   */
  static getNestedValue(obj, path) {
    if (!path) return obj;
    const parts = path.split(/[./]/);
    let current = obj;
    for (const part of parts) {
      if (current === null || current === void 0) {
        return void 0;
      }
      current = current[part];
    }
    return current;
  }
  /**
   * Set value at nested path
   */
  static setNestedValue(obj, path, value) {
    if (!path) return value;
    const parts = path.split(/[./]/);
    const last = parts.pop();
    let current = obj;
    for (const part of parts) {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    current[last] = value;
    return obj;
  }
  /**
   * Flatten parameters for form data
   */
  static flattenParameters(parameters) {
    const flattened = {};
    parameters.forEach((param) => {
      if (param.type === "SingleValue") {
        flattened[param.name] = param.value;
      } else {
        flattened[param.name] = this.parseComplexValue(param);
      }
    });
    return flattened;
  }
  /**
   * Unflatten form data back to parameters
   */
  static unflattenToParameters(data, originalParameters) {
    return originalParameters.map((param) => {
      const value = data[param.name];
      if (value === void 0) {
        return param;
      }
      const serialized = this.serializeComplexValue(value, param.type);
      return {
        ...param,
        ...serialized
      };
    });
  }
  /**
   * Merge parameters with form values
   */
  static mergeWithFormData(parameters, formData) {
    return parameters.map((param) => {
      if (formData.hasOwnProperty(param.name)) {
        const serialized = this.serializeComplexValue(formData[param.name], param.type);
        return {
          ...param,
          ...serialized,
          hasBinding: true
        };
      }
      return param;
    });
  }
  /**
   * Filter parameters by direction
   */
  static filterByDirection(parameters, direction) {
    return parameters.filter((p) => p.direction === direction || p.direction === "InOut");
  }
  /**
   * Get input parameters only
   */
  static getInputParameters(parameters) {
    return this.filterByDirection(parameters, "In");
  }
  /**
   * Get output parameters only
   */
  static getOutputParameters(parameters) {
    return this.filterByDirection(parameters, "Out");
  }
  /**
   * Validate required parameters
   */
  static validateRequired(parameters, formData) {
    const inputParams = this.getInputParameters(parameters);
    const missing = [];
    inputParams.forEach((param) => {
      if (!param.isSystemParameter) {
        const value = formData[param.name];
        if (value === void 0 || value === null || value === "") {
          missing.push(param.name);
        }
      }
    });
    return {
      valid: missing.length === 0,
      missing
    };
  }
};

// src/lib/utils/error-handler.ts
var BizuitError = class _BizuitError extends Error {
  constructor(message, code, statusCode, details) {
    super(message);
    this.name = "BizuitError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
  static fromApiError(apiError) {
    return new _BizuitError(
      apiError.message,
      apiError.code,
      apiError.statusCode,
      apiError.details
    );
  }
  isAuthError() {
    return this.statusCode === 401 || this.code === "UNAUTHORIZED";
  }
  isNetworkError() {
    return this.code === "NETWORK_ERROR";
  }
  isValidationError() {
    return this.statusCode === 400 || this.code === "VALIDATION_ERROR";
  }
};
function handleError(error) {
  if (error instanceof BizuitError) {
    return error;
  }
  if (error instanceof Error) {
    return new BizuitError(error.message);
  }
  if (typeof error === "object" && error !== null) {
    const apiError = error;
    if (apiError.message) {
      return BizuitError.fromApiError(apiError);
    }
  }
  return new BizuitError("An unknown error occurred");
}

// src/lib/utils/auth-utils.ts
function parseBizuitUrlParam(paramName, searchParams) {
  const standardValue = searchParams.get(paramName);
  if (standardValue) {
    return standardValue;
  }
  if (typeof window !== "undefined") {
    const rawUrl = window.location.href;
    const queryStartIndex = rawUrl.indexOf("?");
    if (queryStartIndex === -1) {
      return null;
    }
    let queryString = rawUrl.substring(queryStartIndex + 1);
    queryString = queryString.replace(/&amp%3B/gi, "&").replace(/&amp;/gi, "&").replace(/%3B/gi, "");
    const params = new URLSearchParams(queryString);
    return params.get(paramName);
  }
  return null;
}
function createAuthFromUrlToken(urlToken, userName, expirationMinutes = 1440) {
  const tokenWithPrefix = urlToken.startsWith("Basic ") ? urlToken : `Basic ${urlToken}`;
  const expirationMs = expirationMinutes * 60 * 1e3;
  return {
    Token: tokenWithPrefix,
    User: {
      Username: userName || "bizuit-user",
      UserID: 0,
      DisplayName: userName || "Usuario Bizuit"
    },
    ExpirationDate: new Date(Date.now() + expirationMs).toISOString()
  };
}
function buildLoginRedirectUrl(returnPath, params) {
  let returnUrl = returnPath;
  if (params && Object.keys(params).length > 0) {
    const queryParams = new URLSearchParams(params);
    returnUrl = `${returnPath}?${queryParams.toString()}`;
  }
  const loginParams = new URLSearchParams();
  loginParams.set("redirect", returnUrl);
  return `/login?${loginParams.toString()}`;
}

// src/lib/utils/error-formatter.ts
function formatBizuitError(error, context = "general") {
  const statusCode = error?.statusCode || error?.status || error?.response?.status;
  if (statusCode === 401) {
    return "Su sesi\xF3n ha expirado. Redirigiendo a login...";
  }
  if (statusCode === 404) {
    if (context === "load") {
      return "No se encontr\xF3 la instancia del proceso. Verifique que el ID sea correcto.";
    }
    if (context === "start") {
      return "El proceso no existe o no tiene par\xE1metros definidos. Verifique el nombre del proceso.";
    }
    return "No se encontr\xF3 el recurso solicitado. Verifique los datos ingresados.";
  }
  if (statusCode === 400) {
    const message = error?.message || error?.errorMessage || "";
    if (message.toLowerCase().includes("format") || message.toLowerCase().includes("formato")) {
      return "El formato del ID de instancia es incorrecto. Debe ser un GUID v\xE1lido (ejemplo: 550e8400-e29b-41d4-a716-446655440000).";
    }
    if (message.toLowerCase().includes("required") || message.toLowerCase().includes("requerido")) {
      return "Faltan datos requeridos. Verifique que todos los campos obligatorios est\xE9n completos.";
    }
    return "Los datos enviados no son v\xE1lidos. Verifique la informaci\xF3n e intente nuevamente.";
  }
  if (statusCode === 403) {
    return "No tiene permisos para realizar esta operaci\xF3n.";
  }
  if (statusCode === 409) {
    return "La instancia est\xE1 bloqueada por otro usuario. Intente nuevamente m\xE1s tarde.";
  }
  if (statusCode === 500 || statusCode >= 500) {
    return "Error en el servidor. Por favor intente nuevamente o contacte al administrador.";
  }
  if (error?.code === "ECONNREFUSED" || error?.code === "ERR_NETWORK" || error?.message?.includes("fetch failed") || error?.message?.includes("Network")) {
    return "No se pudo conectar al servidor. Verifique su conexi\xF3n a internet.";
  }
  if (error?.code === "ETIMEDOUT" || error?.message?.includes("timeout")) {
    return "La operaci\xF3n tard\xF3 demasiado tiempo. Verifique su conexi\xF3n e intente nuevamente.";
  }
  if (error?.errorMessage && typeof error.errorMessage === "string" && error.errorMessage.length < 200) {
    return error.errorMessage;
  }
  if (error?.message && typeof error.message === "string" && error.message.length < 200) {
    if (!error.message.includes("undefined") && !error.message.includes("null") && !error.message.includes("Cannot read") && !error.message.includes("is not")) {
      return error.message;
    }
  }
  if (context === "load") {
    return "Error al cargar los datos de la instancia. Por favor intente nuevamente.";
  }
  if (context === "submit") {
    return "Error al guardar los cambios. Por favor intente nuevamente.";
  }
  if (context === "lock") {
    return "Error al bloquear la instancia. Por favor intente nuevamente.";
  }
  if (context === "start") {
    return "Error al iniciar el proceso. Por favor intente nuevamente.";
  }
  return "Ocurri\xF3 un error inesperado. Por favor intente nuevamente.";
}

// src/core.ts
var VERSION = "1.0.0";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BizuitAuthService,
  BizuitError,
  BizuitFormService,
  BizuitHttpClient,
  BizuitInstanceLockService,
  BizuitProcessService,
  BizuitSDK,
  ParameterParser,
  VERSION,
  buildLoginRedirectUrl,
  buildParameters,
  createAuthFromUrlToken,
  createParameter,
  filterContinueParameters,
  filterFormParameters,
  formDataToParameters,
  formatBizuitError,
  getParameterDirectionLabel,
  getParameterTypeLabel,
  handleError,
  isParameterRequired,
  loadInstanceDataForContinue,
  mergeParameters,
  parametersToFormData,
  parseBizuitUrlParam,
  processUrlToken,
  releaseInstanceLock,
  xmlToJson
});
//# sourceMappingURL=core.js.map