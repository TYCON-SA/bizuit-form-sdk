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
export type ProcessFlowStatus = 'idle' | 'initializing' | 'ready' | 'submitting' | 'success' | 'error'

/**
 * Start process specific status
 * Similar to ProcessFlowStatus but more specific to starting new processes
 */
export type StartProcessStatus = 'idle' | 'initializing' | 'ready' | 'submitting' | 'success' | 'error'

/**
 * Continue process specific status
 * Includes 'loading' instead of 'initializing' for semantic clarity
 */
export type ContinueProcessStatus = 'idle' | 'loading' | 'ready' | 'submitting' | 'success' | 'error'

/**
 * Instance lock status
 * Used when checking if an instance is locked before continuing
 *
 * - checking: Checking if instance is locked
 * - locked: Instance is locked by another user
 * - unlocked: Instance is available for editing
 * - error: Error checking lock status
 */
export type InstanceLockStatus = 'checking' | 'locked' | 'unlocked' | 'error'
