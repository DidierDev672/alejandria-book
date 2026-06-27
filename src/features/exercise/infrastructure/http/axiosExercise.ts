import axiosInstance from '@/infrastructure/http/axiosInstance'

/**
 * Instancia de Axios configurada para el módulo de Exercise
 * Reutiliza los interceptores del axiosInstance central
 */
const axiosExercise = axiosInstance.create({
  baseURL: '/exercises',
  timeout: 10000,
})

// Interceptor de autenticación (create() no hereda interceptors)
axiosExercise.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Debug interceptor para desarrollo
axiosExercise.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(
        `[Exercise API] ${config.method?.toUpperCase()} ${config.url}`,
        config.params || config.data || '',
      )
    }
    return config
  },
  (error) => {
    console.error('[Exercise API] Error en request:', error)
    return Promise.reject(error)
  },
)

axiosExercise.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[Exercise API] Response ${response.status}:`, response.data)
    }
    return response
  },
  (error) => {
    const status = error.response?.status
    const errorMessage = error.response?.data?.error || error.message

    switch (status) {
      case 403:
        console.error('[Exercise API] Acceso denegado:', errorMessage)
        break
      case 404:
        console.error('[Exercise API] Ejercicio no encontrado:', errorMessage)
        break
      case 422:
        console.error('[Exercise API] Error de validación:', error.response?.data?.errors)
        break
      case 500:
        console.error('[Exercise API] Error del servidor:', errorMessage)
        break
    }

    return Promise.reject(error)
  },
)

export default axiosExercise
