import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LoginCredentials, User } from '../../domain/AuthEntity'
import { AuthService } from '../../application/AuthService'
import { AuthApi } from '../../infrastructure/AuthApi'

const authService = new AuthService(new AuthApi())

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(authService.getStoredUser())
  const token = ref<string | null>(authService.getStoredToken())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials: LoginCredentials): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      const response = await authService.login(credentials)
      token.value = response.token
      user.value = response.user
      return true
    } catch (err: any) {
      const message = err?.response?.data?.error || err.message || 'Error al iniciar sesión'
      error.value = message
      return false
    } finally {
      isLoading.value = false
    }
  }

  function logout(): void {
    authService.logout()
    token.value = null
    user.value = null
    error.value = null
  }

  function clearError(): void {
    error.value = null
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    clearError,
  }
})
