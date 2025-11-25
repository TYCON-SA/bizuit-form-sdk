/**
 * @bizuit/form-sdk/core
 * Core SDK without React dependencies - safe for server-side usage
 *
 * Use this entry point in:
 * - Next.js API routes
 * - Server components
 * - Node.js backends
 * - Any environment without React
 */

// Types
export * from './lib/types'

// API Services (no React dependencies)
export * from './lib/api'

// Utilities (no React dependencies)
export * from './lib/utils'

// Version
export const VERSION = '1.0.0'
