import { postJsonRpc, updateHttpClientBaseUrl } from './httpClient'
import { API_CONFIG } from '@/config/api'
import { getApiBaseUrl } from '@/utils/apiUrl'
import type { LoginCredentials, AuthResponse, User } from '@/types'

function extractBackendAuthErrorMessage(error: unknown): string {
  const err = error as any

  const responseData = err?.response?.data
  if (responseData?.message && typeof responseData.message === 'string') {
    return responseData.message
  }

  if (responseData?.error?.message && typeof responseData.error.message === 'string') {
    return responseData.error.message
  }

  if (responseData?.error?.data?.message && typeof responseData.error.data.message === 'string') {
    return responseData.error.data.message
  }

  if (err?.message && typeof err.message === 'string') {
    return err.message
  }

  return 'Terjadi kesalahan saat login'
}

function debugLoginError(
  error: unknown,
  endpoint: string,
  baseUrl: string,
  credentials: LoginCredentials,
) {
  const err = error as any
  const requestUrl = `${baseUrl || ''}${endpoint}`

  // Jangan log password asli untuk keamanan
  const safeCredentials = {
    login: credentials.login,
    db: credentials.db,
    password: credentials.password ? '***' : '(empty)',
  }

  console.group('[AUTH_DEBUG] Login gagal')
  console.log('Endpoint:', endpoint)
  console.log('Base URL:', baseUrl || '(same-origin)')
  console.log('Resolved URL:', requestUrl)
  console.log('Credentials:', safeCredentials)
  console.log('HTTP Status:', err?.response?.status ?? '(no status)')
  console.log('Response Data:', err?.response?.data ?? '(no response body)')
  console.log('Error Message:', err?.message ?? '(no message)')
  console.error('Raw Error Object:', err)
  console.groupEnd()
}

function debugLoginFailedResponse(
  response: AuthResponse,
  endpoint: string,
  baseUrl: string,
  credentials: LoginCredentials,
) {
  const requestUrl = `${baseUrl || ''}${endpoint}`

  // Jangan log password asli untuk keamanan
  const safeCredentials = {
    login: credentials.login,
    db: credentials.db,
    password: credentials.password ? '***' : '(empty)',
  }

  console.group('[AUTH_DEBUG] Login ditolak backend')
  console.log('Endpoint:', endpoint)
  console.log('Base URL:', baseUrl || '(same-origin)')
  console.log('Resolved URL:', requestUrl)
  console.log('Credentials:', safeCredentials)
  console.log('Backend Response:', response)
  console.log('Backend Message:', response?.message || '(no message)')
  console.groupEnd()
}

export const authService = {
  /**
   * Login ke Odoo
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Ensure httpClient uses the correct base URL
      const baseUrl = getApiBaseUrl()
      updateHttpClientBaseUrl(baseUrl)

      const response = await postJsonRpc<AuthResponse>(API_CONFIG.endpoints.authenticate, {
        login: credentials.login,
        password: credentials.password,
        db: credentials.db,
      })

      // Kasus umum Odoo: HTTP 200 tapi status API = error
      if (response.status !== 'success' || !response.data) {
        debugLoginFailedResponse(response, API_CONFIG.endpoints.authenticate, baseUrl, credentials)
      }

      return response
    } catch (error) {
      const baseUrl = getApiBaseUrl()
      debugLoginError(error, API_CONFIG.endpoints.authenticate, baseUrl, credentials)

      return {
        status: 'error',
        message: extractBackendAuthErrorMessage(error),
      }
    }
  },

  /**
   * Logout (clear session)
   */
  async logout(): Promise<void> {
    try {
      // Clear session di browser
      sessionStorage.removeItem('user')
      localStorage.removeItem('user')
    } catch (error) {
      console.error('Logout error:', error)
    }
  },

  /**
   * Get current user dari session storage
   */
  getCurrentUser(): User | null {
    try {
      const user = sessionStorage.getItem('user') || localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  },

  /**
   * Save user ke session storage
   */
  saveUser(userData: any): void {
    try {
      sessionStorage.setItem('user', JSON.stringify(userData))
    } catch (error) {
      console.error('Error saving user:', error)
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getCurrentUser()
  },
}

export default authService
