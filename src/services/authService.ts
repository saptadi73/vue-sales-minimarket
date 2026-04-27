import { postJsonRpc, updateHttpClientBaseUrl } from './httpClient'
import { API_CONFIG } from '@/config/api'
import { getApiBaseUrl } from '@/utils/apiUrl'
import type { LoginCredentials, AuthResponse, User } from '@/types'

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
      return response
    } catch (error) {
      return {
        status: 'error',
        message: 'Login failed: ' + (error as any).message,
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
