/**
 * Context type for error formatting
 */
export type ErrorContext = 'load' | 'submit' | 'lock' | 'start' | 'general'

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
export function formatBizuitError(error: any, context: ErrorContext = 'general'): string {
  // Check status code
  const statusCode = error?.statusCode || error?.status || error?.response?.status

  // 401 errors - Unauthorized
  // Note: These should be handled automatically by useBizuitSDKWithAuth
  if (statusCode === 401) {
    return 'Su sesión ha expirado. Redirigiendo a login...'
  }

  // 404 errors - Not Found
  if (statusCode === 404) {
    if (context === 'load') {
      return 'No se encontró la instancia del proceso. Verifique que el ID sea correcto.'
    }
    if (context === 'start') {
      return 'El proceso no existe o no tiene parámetros definidos. Verifique el nombre del proceso.'
    }
    return 'No se encontró el recurso solicitado. Verifique los datos ingresados.'
  }

  // 400 errors - Bad Request (usually validation errors)
  if (statusCode === 400) {
    // Check for specific validation messages in error
    const message = error?.message || error?.errorMessage || ''

    if (message.toLowerCase().includes('format') || message.toLowerCase().includes('formato')) {
      return 'El formato del ID de instancia es incorrecto. Debe ser un GUID válido (ejemplo: 550e8400-e29b-41d4-a716-446655440000).'
    }

    if (message.toLowerCase().includes('required') || message.toLowerCase().includes('requerido')) {
      return 'Faltan datos requeridos. Verifique que todos los campos obligatorios estén completos.'
    }

    return 'Los datos enviados no son válidos. Verifique la información e intente nuevamente.'
  }

  // 403 errors - Forbidden
  if (statusCode === 403) {
    return 'No tiene permisos para realizar esta operación.'
  }

  // 409 errors - Conflict (instance locked by another user)
  if (statusCode === 409) {
    return 'La instancia está bloqueada por otro usuario. Intente nuevamente más tarde.'
  }

  // 500 errors - Server Error
  if (statusCode === 500 || statusCode >= 500) {
    return 'Error en el servidor. Por favor intente nuevamente o contacte al administrador.'
  }

  // Network errors
  if (
    error?.code === 'ECONNREFUSED' ||
    error?.code === 'ERR_NETWORK' ||
    error?.message?.includes('fetch failed') ||
    error?.message?.includes('Network')
  ) {
    return 'No se pudo conectar al servidor. Verifique su conexión a internet.'
  }

  // Timeout errors
  if (error?.code === 'ETIMEDOUT' || error?.message?.includes('timeout')) {
    return 'La operación tardó demasiado tiempo. Verifique su conexión e intente nuevamente.'
  }

  // If we have a user-friendly message from the API, use it
  if (error?.errorMessage && typeof error.errorMessage === 'string' && error.errorMessage.length < 200) {
    return error.errorMessage
  }

  if (error?.message && typeof error.message === 'string' && error.message.length < 200) {
    // Don't show very technical messages
    if (
      !error.message.includes('undefined') &&
      !error.message.includes('null') &&
      !error.message.includes('Cannot read') &&
      !error.message.includes('is not')
    ) {
      return error.message
    }
  }

  // Default messages by context
  if (context === 'load') {
    return 'Error al cargar los datos de la instancia. Por favor intente nuevamente.'
  }
  if (context === 'submit') {
    return 'Error al guardar los cambios. Por favor intente nuevamente.'
  }
  if (context === 'lock') {
    return 'Error al bloquear la instancia. Por favor intente nuevamente.'
  }
  if (context === 'start') {
    return 'Error al iniciar el proceso. Por favor intente nuevamente.'
  }

  return 'Ocurrió un error inesperado. Por favor intente nuevamente.'
}
