import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'
import { setApiBaseUrl } from '@/utils/apiUrl'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  // Load user dari storage saat init
  function initializeAuth() {
    const savedUser = authService.getCurrentUser()
    if (savedUser) {
      user.value = savedUser
    }
  }

  async function login(
    email: string,
    password: string,
    database: string,
    apiUrl?: string,
  ): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      // Jika URL diberikan, set ke API base
      if (apiUrl) {
        setApiBaseUrl(apiUrl)
      }

      const response = await authService.login({
        login: email,
        password,
        db: database,
      })

      if (response.status === 'success' && response.data) {
        const userData: User = {
          id: response.data.uid,
          email: response.data.login,
          name: response.data.name,
          partner_id: response.data.partner_id,
          company_id: response.data.company_id,
          company_name: response.data.company_name,
        }

        user.value = userData
        authService.saveUser(userData)
        return true
      } else {
        console.error('[AUTH_DEBUG] Login gagal di authStore', {
          status: response.status,
          message: response.message,
          hasData: !!response.data,
        })
        error.value = response.message || 'Login gagal'
        return false
      }
    } catch (err) {
      console.error('[AUTH_DEBUG] Exception di authStore.login', err)
      error.value = 'Terjadi kesalahan: ' + (err as any).message
      return false
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    user.value = null
    error.value = null
    authService.logout()
  }

  function clearError() {
    error.value = null
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    initializeAuth,
    login,
    logout,
    clearError,
  }
})
