/**
 * Task-related type definitions for Bizuit BPM task list functionality
 */

/**
 * Activity metadata from process definition
 */
export interface IActivityMetadata {
  /** Activity internal name */
  activityName: string
  /** Display name for UI */
  displayName: string
  /** Child event name if applicable */
  childEventName: string | null
  /** Whether this is a process start point */
  isStartPoint: boolean
  /** Whether activity has quick form */
  hasQuickForm: boolean
  /** Whether activity is empty */
  isEmpty: boolean
  /** Connector URL template with placeholders */
  connectorUrl: string | null
  /** Binded connector ID */
  idBindedConnector: string | null
  /** HTML instructions for the activity */
  instructions: string | null
  /** Whether this is the default connector */
  isDefault: boolean
  /** Process version */
  version: string | null
  /** Connector type (WebForm, WebPage, BIZUIT, etc.) */
  connectorType: string | null
  /** Connector width */
  width: number
  /** Connector height */
  height: number
  /** Form name if WebForm connector */
  formName: string | null
  /** Form ID if WebForm connector */
  formId: number
  /** Whether this is a grouping activity */
  isGroupingActivity: boolean
}

/**
 * Process metadata with activities and start points
 */
export interface IProcessMetadata {
  /** List of activities in the process */
  activities: IActivityMetadata[]
  /** Process internal name */
  name: string
  /** Process display name */
  workflowDisplayName: string
  /** Workflow internal name */
  workflowName: string
  /** Process category */
  category: string
  /** Process sub-category */
  subCategory: string
  /** Icon identifier */
  icon: string | null
  /** Icon color */
  iconColor: string | null
}

/**
 * Column definition value in task instance
 */
export interface IColumnDefinitionValue {
  /** Column name */
  columnName: string
  /** Column value */
  value: string
}

/**
 * Task instance from Instances/Search API
 *
 * NOTE: The SDK automatically flattens dynamic columns from columnDefinitionValues
 * into direct properties using user-friendly headerText as property names.
 * Redundant properties (eventName, activityName, instanceDescription, columnDefinitionValues)
 * are removed for a clean, flat JSON structure.
 *
 * Example usage:
 * ```typescript
 * const tasks = await sdk.tasks.searchTasks({
 *   ProcessName: 'TestWix',
 *   ActivityName: 'activity1'
 * }, token)
 *
 * tasks.instances.forEach(instance => {
 *   // Standard properties
 *   console.log(instance.instanceId)
 *   console.log(instance.locked)
 *   console.log(instance.lockedBy)
 *
 *   // Dynamic columns with user-friendly names (from headerText)
 *   console.log(instance['CLIENTE'])               // Direct access with friendly name
 *   console.log(instance['Descripción'])           // Uses headerText from API
 *   console.log(instance['Versión'])               // No xCol_* prefixes!
 *   console.log(instance['Último ejecutado por'])  // User-friendly property names
 * })
 * ```
 */
export interface ITaskInstance {
  /** Process event name */
  eventName: string
  /** Activity name */
  activityName: string
  /** Instance description */
  instanceDescription: string
  /** Whether instance is locked */
  locked: boolean
  /** Instance unique identifier */
  instanceId: string
  /** Execution date/time display text */
  executionDateTime: string
  /** ISO date string for comparison */
  dateToCompare: string
  /** Warning level ID */
  warningLevelId: string
  /** User who locked the instance */
  lockedBy: string
  /** Background color for UI */
  backColor: string
  /** Foreground color for UI */
  foreColor: string
  /** Number of attached documents */
  documentsQuantity: number
  /** Column definition values (original array format) */
  columnDefinitionValues: IColumnDefinitionValue[]
  /** Process version */
  version: string
  /**
   * Dynamic columns are flattened as direct properties (e.g., xCol_Description, xCol_Version)
   * TypeScript index signature allows accessing these dynamic properties
   */
  [key: string]: any
}

/**
 * Column definition metadata
 */
export interface IColumnDefinition {
  /** Column name */
  name: string
  /** Column header text */
  headerText: string
  /** Column type */
  type: string
  /** Conditions XML */
  condition: string
  /** Date formatting properties */
  dateProperties: {
    applyFormat: boolean
    format: string
    customFormat: string
  }
}

/**
 * Connector metadata
 */
export interface IConnectorMetadata {
  /** Display name */
  displayName: string
  /** Whether has quick form */
  hasQuickForm: boolean
  /** Binded connector ID */
  idBindedConnector: number
  /** Whether is default connector */
  isDefault: boolean
  /** Connector name */
  name: string
  /** Version */
  version: string
  /** Connector type */
  connectorType: string
  /** Base URL template */
  baseUrl: string
  /** Executable path (for desktop connectors) */
  executablePath: string | null
  /** Width */
  width: number
  /** Height */
  height: number
}

/**
 * Activity with connectors from event
 */
export interface IEventActivity {
  /** Activity name */
  activityName: string
  /** Whether has quick form */
  hasQuickForm: boolean
  /** Whether has multiple quick forms */
  hasMultipleQuickForm: boolean
  /** Process name to execute for multiple quick forms */
  multipleQuickFormProcessNameToExecute: string
  /** Multiple quick form text */
  multipleQuickFormText: string
  /** Multiple quick form version */
  multipleQuickFormVersion: string
  /** Multiple quick form column restriction */
  multipleQuickFormColumnRestriction: string
  /** Quick form properties */
  quickFormProperties: any[]
  /** Binded connector ID */
  idBindedConnector: string
  /** Connector URL template */
  connectorUrl: string
  /** Column definitions */
  columnsDefinitions: IColumnDefinition[]
  /** Available connectors */
  connectors: IConnectorMetadata[]
  /** Whether is grouping activity */
  isGroupingActivity: boolean
  /** Open settings */
  openSettings: any | null
}

/**
 * Event with activities from search response
 */
export interface ITaskEvent {
  /** Event name */
  eventName: string
  /** Activities in the event */
  activities: IEventActivity[]
}

/**
 * Instance count per event
 */
export interface IInstanceCount {
  /** Event name */
  eventName: string
  /** Total count of instances */
  count: number
  /** Instances list (null in summary) */
  instancesList: any | null
}

/**
 * Parameters for task instance search
 */
export interface ITasksSearchRequest {
  /** Process name to search */
  ProcessName: string
  /** Activity name to search */
  ActivityName: string
  /** Expiration interval filter */
  ExpirationInterval?: string
  /** Date from filter (format: YYYY-MM-DD) */
  DateFrom?: string
  /** Date to filter (format: YYYY-MM-DD) */
  DateTo?: string
  /** Locked state filter (-1 = all, 0 = unlocked, 1 = locked) */
  LockedState?: number
  /** Serialized filters */
  SerializedFilters?: string
  /** Include warnings */
  IncludeWarnings?: boolean
  /** Child process name filter */
  ChildProcessName?: string
  /** Is mobile request */
  IsMobile?: boolean
  /** Additional parameters */
  Parameters?: any[]
  /** Page number (1-based, sent via bz-page header) */
  pageNumber?: number
  /** Page size (sent via bz-page-size header) */
  pageSize?: number
}

/**
 * Response from task instance search
 */
export interface ITasksSearchResponse {
  /** Events with activity metadata */
  events: ITaskEvent[]
  /** Task instances */
  instances: ITaskInstance[]
  /** Whether there are more results than limit */
  moreThanLimit: boolean
  /** Total count per event */
  instancesTotalCount: IInstanceCount[]
}
