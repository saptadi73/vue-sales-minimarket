import { postJsonRpc } from './httpClient'
import { API_CONFIG } from '@/config/api'
import type { MasterListResponse, Store, Vehicle } from '@/types'
import { getApiBaseUrl } from '@/utils/apiUrl'

export interface GetMasterDataParams {
  search?: string
  limit?: number
  offset?: number
  include_inactive?: boolean
}

function logMasterDataApiError(
  label: string,
  error: unknown,
  endpoint: string,
  params: GetMasterDataParams,
) {
  const err = error as any
  const baseUrl = getApiBaseUrl()

  console.group(`[MASTER_DATA_DEBUG] ${label} gagal`)
  console.log('Base URL:', baseUrl || '(same-origin)')
  console.log('Endpoint:', endpoint)
  console.log('Params:', params)
  console.log('HTTP Status:', err?.response?.status ?? '(no status)')
  console.log('Response Data:', err?.response?.data ?? '(no response body)')
  console.log('Error Message:', err?.message ?? '(no message)')
  console.error('Raw Error Object:', err)
  console.groupEnd()
}

function extractMasterDataErrorMessage(error: unknown, fallback: string): string {
  const err = error as any
  const candidates = [
    err?.response?.data?.message,
    err?.response?.data?.error?.message,
    err?.response?.data?.error?.data?.message,
    err?.message,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }
  }

  return fallback
}

export const masterDataService = {
  async getStores(params: GetMasterDataParams = {}): Promise<MasterListResponse<Store>> {
    const requestParams = {
      search: params.search || '',
      limit: params.limit || 100,
      offset: params.offset || 0,
      include_inactive: params.include_inactive || false,
    }

    try {
      const response = await postJsonRpc<MasterListResponse<Store>>(
        API_CONFIG.endpoints.susuOlahanStores,
        requestParams,
      )

      if (!response) {
        throw new Error('Response toko kosong dari backend')
      }

      if (response.status !== 'success') {
        throw new Error(response.message || 'Backend mengembalikan status error untuk data toko')
      }

      return response
    } catch (error) {
      logMasterDataApiError(
        'Get stores',
        error,
        API_CONFIG.endpoints.susuOlahanStores,
        requestParams,
      )
      throw new Error(
        extractMasterDataErrorMessage(error, 'Gagal memuat daftar toko dari backend.'),
      )
    }
  },

  async getVehicles(params: GetMasterDataParams = {}): Promise<MasterListResponse<Vehicle>> {
    const requestParams = {
      search: params.search || '',
      limit: params.limit || 100,
      offset: params.offset || 0,
      include_inactive: params.include_inactive || false,
    }

    try {
      const response = await postJsonRpc<MasterListResponse<Vehicle>>(
        API_CONFIG.endpoints.susuOlahanVehicles,
        requestParams,
      )

      if (!response) {
        throw new Error('Response kendaraan kosong dari backend')
      }

      if (response.status !== 'success') {
        throw new Error(
          response.message || 'Backend mengembalikan status error untuk data kendaraan',
        )
      }

      return response
    } catch (error) {
      logMasterDataApiError(
        'Get vehicles',
        error,
        API_CONFIG.endpoints.susuOlahanVehicles,
        requestParams,
      )
      throw new Error(
        extractMasterDataErrorMessage(error, 'Gagal memuat daftar kendaraan dari backend.'),
      )
    }
  },

  async listStores(search = ''): Promise<Store[]> {
    const response = await this.getStores({ search })
    return response?.data?.items || []
  },

  async listVehicles(search = ''): Promise<Vehicle[]> {
    const response = await this.getVehicles({ search })
    return response?.data?.items || []
  },
}

export default masterDataService
