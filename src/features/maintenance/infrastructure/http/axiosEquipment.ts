import axios from 'axios'

/**
 * Instancia de Axios configurada para el módulo de Equipment
 * Base URL: /equipment
 * Timeout: 10 segundos
 */
const axiosEquipment = axios.create({
  baseURL: import.meta.env.VITE_API_ATREIDES
    ? `${import.meta.env.VITE_API_ATREIDES}/equipment`
    : 'http://localhost:8080/equipment',
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================
axiosEquipment.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')

    // Debug en desarrollo
    if (import.meta.env.DEV) {
      console.log(
        `[Equipment API] ${config.method?.toUpperCase()} ${config.url}`,
        config.params || config.data || '',
      )
    }

    // Agregar token de autenticación si existe
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    console.error('[Equipment API] Error en request:', error)
    return Promise.reject(error)
  },
)

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================
axiosEquipment.interceptors.response.use(
  (response) => {
    // Debug en desarrollo
    if (import.meta.env.DEV) {
      console.log(`[Equipment API] Response ${response.status}:`, response.data)
    }
    return response
  },
  (error) => {
    const status = error.response?.status
    const errorCode = error.response?.data?.code
    const errorMessage = error.response?.data?.message || error.message

    // Manejo de errores específicos
    switch (status) {
      case 401:
        // Token inválido o expirado
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?error=session_expired'
        }
        break

      case 403:
        console.error('[Equipment API] Acceso denegado:', errorMessage)
        break

      case 404:
        console.error('[Equipment API] Recurso no encontrado:', errorMessage)
        break

      case 422:
        // Error de validación
        console.error('[Equipment API] Error de validación:', error.response?.data?.errors)
        break

      case 500:
        console.error('[Equipment API] Error del servidor:', errorMessage)
        break

      default:
        console.error('[Equipment API] Error:', status, errorMessage)
    }

    // Enriquecer el error con información adicional
    const enhancedError = new Error(errorMessage)
    ;(enhancedError as any).status = status
    ;(enhancedError as any).code = errorCode
    ;(enhancedError as any).errors = error.response?.data?.errors

    return Promise.reject(enhancedError)
  },
)

export default axiosEquipment
