/**
 * @bizuit/form-sdk
 * Core SDK for Bizuit BPM form integration
 *
 * IMPORTANT: This entry point exports React hooks.
 * For server-side usage (Next.js API routes, etc), use:
 * import { BizuitSDK } from '@tyconsa/bizuit-form-sdk/core'
 */

// Types
export * from './lib/types'

// API Services
export * from './lib/api'

// Utilities
export * from './lib/utils'

// React Hooks (client-side only)
export * from './lib/hooks/useBizuitSDK.tsx'
export * from './lib/hooks/useAuth.tsx'

// Version
export const VERSION = '1.0.0'
