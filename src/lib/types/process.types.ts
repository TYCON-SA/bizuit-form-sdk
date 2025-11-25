/**
 * Process and Instance Types
 * Based on Bizuit BPM Process Controller
 */

export type ParameterType = 'SingleValue' | 'Xml' | 'ComplexObject'
export type ParameterDirection = 'In' | 'Out' | 'InOut'
export type ProcessStatus = 'Completed' | 'Waiting' | 'Running' | 'Error'

export interface IParameter {
  name: string
  value: string | any | null  // Can be string or parsed JSON object for XML parameters
  valueJson?: string | null
  type: ParameterType
  direction: ParameterDirection
  path?: string
  schema?: string
  isVariable?: boolean
  isSystemParameter?: boolean
  hasBinding?: boolean
}

export interface IProcessParameter extends IParameter {
  parameterType: 1 | 2 | 'SingleValue' | 'Xml' | 'Json' // 1 = SingleValue, 2 = Complex/Xml, 'Json' after parsing
}

export interface IInitializeParams {
  processName: string
  activityName?: string
  version?: string
  instanceId?: string
  userName?: string
  token?: string
  sessionToken?: string
  formId?: number
  formDraftId?: number
  childProcessName?: string
}

export interface IProcessData {
  parameters: IParameter[]
  variables?: IParameter[]
  activities?: IActivityResult[]
  processName: string
  version: string
  instanceId?: string
}

export interface IActivityResult {
  name: string
  parameters: IParameter[]
  completedDate?: string
  status: string
}

export interface IStartProcessParams {
  processName: string
  instanceId?: string
  parameters: IParameter[]
  processVersion?: string
  closeOnSuccess?: boolean
  deletedDocuments?: string[]
}

export interface IProcessResult {
  instanceId: string
  status: ProcessStatus
  parameters: IProcessParameter[]
  errorMessage?: string
}

// @deprecated Use IStartProcessParams instead
export interface IRaiseEventParams {
  eventName: string
  instanceId?: string
  parameters: IParameter[]
  eventVersion?: string
  closeOnSuccess?: boolean
  deletedDocuments?: string[]
}

// @deprecated Use IProcessResult instead
export interface IRaiseEventResult {
  instanceId: string
  status: ProcessStatus
  parameters: IProcessParameter[]
  errorMessage?: string
}

// @deprecated Use IProcessParameter instead
export interface IEventParameter extends IParameter {
  parameterType: 1 | 2 | 'SingleValue' | 'Xml' | 'Json' // 1 = SingleValue, 2 = Complex/Xml, 'Json' after parsing
}

export interface IInstanceData {
  instanceId: string
  processName: string
  activityName: string
  status: ProcessStatus
  parameters: IParameter[]
  variables: IParameter[]
  createdDate: string
  completedDate?: string
  lockedBy?: string
  lockedDate?: string
}

export interface ILockStatus {
  available: boolean
  reason?: string
  user?: string
  sessionToken?: string
}

export interface ILockRequest {
  instanceId: string
  activityName: string
  operation: number
  processName: string
}

export interface IUnlockRequest {
  instanceId: string
  activityName: string
  sessionToken?: string
}
