import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { API_CONFIG } from '@/config/api'
import { getApiBaseUrl } from '@/utils/apiUrl'

// Create axios instance dengan konfigurasi default
export const httpClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  // Penting: kirim session cookie
  withCredentials: true,
})

/**
 * Update base URL dari httpClient
 * Dipanggil ketika user login dengan URL baru
 */
export function updateHttpClientBaseUrl(newUrl: string): void {
  httpClient.defaults.baseURL = newUrl
}

// Interceptor untuk menambahkan error handling global
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle error global
    if (error.response?.status === 401) {
      // Session expired - redirect ke login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// Helper function untuk JSON-RPC format
export async function postJsonRpc<T = any>(
  endpoint: string,
  params: any,
  config?: AxiosRequestConfig,
) {
  const response = await httpClient.post<T>(endpoint, { params }, config)
  const payload: any = response.data

  // Backend Odoo JSON-RPC biasanya membungkus data di { result: ... }
  // Namun beberapa endpoint/mock bisa langsung mengembalikan object final.
  if (payload && typeof payload === 'object' && 'result' in payload) {
    return payload.result as T
  }

  return payload as T
}

// Helper function untuk GET requests
export async function getRequest<T = any>(endpoint: string, config?: AxiosRequestConfig) {
  const response = await httpClient.get<T>(endpoint, config)
  return response.data
}

export default httpClient
