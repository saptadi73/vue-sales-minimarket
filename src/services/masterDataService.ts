import { postJsonRpc } from './httpClient'
import { API_CONFIG } from '@/config/api'
import type { MasterListResponse, Store, Vehicle } from '@/types'

export interface GetMasterDataParams {
  search?: string
  limit?: number
  offset?: number
  include_inactive?: boolean
}

export const masterDataService = {
  async getStores(params: GetMasterDataParams = {}): Promise<MasterListResponse<Store> | null> {
    try {
      return await postJsonRpc<MasterListResponse<Store>>(API_CONFIG.endpoints.susuOlahanStores, {
        search: params.search || '',
        limit: params.limit || 100,
        offset: params.offset || 0,
        include_inactive: params.include_inactive || false,
      })
    } catch (error) {
      console.error('Get stores error:', error)
      return null
    }
  },

  async getVehicles(params: GetMasterDataParams = {}): Promise<MasterListResponse<Vehicle> | null> {
    try {
      return await postJsonRpc<MasterListResponse<Vehicle>>(
        API_CONFIG.endpoints.susuOlahanVehicles,
        {
          search: params.search || '',
          limit: params.limit || 100,
          offset: params.offset || 0,
          include_inactive: params.include_inactive || false,
        },
      )
    } catch (error) {
      console.error('Get vehicles error:', error)
      return null
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
