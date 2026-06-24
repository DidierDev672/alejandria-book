import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_ATREIDES || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
})

// Evento personalizado para notificar sobre expiración de sesión
const SESSION_EXPIRED_EVENT = 'auth:session-expired'

// Request interceptor - Agrega token de autenticación
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')

    // Debug: Log en desarrollo
    if (import.meta.env.DEV) {
      console.log(`[Axios] ${config.method?.toUpperCase()} ${config.url}`)
      console.log(`[Axios] Token presente: ${!!token}`)
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Maneja errores 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const errorCode = error.response?.data?.code
    const errorMessage = error.response?.data?.error || error.message

    if (status === 401) {
      // Token inválido, expirado o no proporcionado
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')

      // Emitir evento para que los componentes puedan reaccionar
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, {
          detail: { message: errorMessage, code: errorCode }
        }))

        // Redirigir al login si no estamos ya allí
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?error=session_expired'
        }
      }
    }

    return Promise.reject(error)
  },
)

// Helper para verificar si hay sesión activa
export function hasActiveSession(): boolean {
  return !!localStorage.getItem('auth_token')
}

// Helper para obtener el token actual
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token')
}

// Helper para setear el token (útil para login)
export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token)
}

// Helper para limpiar la sesión
export function clearSession(): void {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
}

export { SESSION_EXPIRED_EVENT }
export default axiosInstance
