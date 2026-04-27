import { postJsonRpc } from './httpClient'
import { API_CONFIG } from '@/config/api'
import type { CustomersResponse, Customer } from '@/types'

export interface GetCustomersParams {
  search?: string
  limit?: number
  offset?: number
  only_customers?: boolean
}

export const customerService = {
  /**
   * Get customer minimarket susu olahan
   */
  async getSusuOlahanCustomers(params: GetCustomersParams = {}): Promise<CustomersResponse | null> {
    try {
      const response = await postJsonRpc<CustomersResponse>(
        API_CONFIG.endpoints.susuOlahanCustomers,
        {
          search: params.search || '',
          limit: params.limit || 50,
          offset: params.offset || 0,
          only_customers: params.only_customers !== false,
        },
      )
      return response
    } catch (error) {
      console.error('Get customers error:', error)
      return null
    }
  },

  /**
   * Search customer by name atau kode
   */
  async searchCustomers(query: string, limit: number = 20): Promise<Customer[]> {
    const response = await this.getSusuOlahanCustomers({
      search: query,
      limit,
    })
    return response?.data?.items || []
  },

  /**
   * Get single customer by ID
   */
  async getCustomerById(customerId: number): Promise<Customer | null> {
    const response = await this.getSusuOlahanCustomers({
      limit: 1,
    })
    const customers = response?.data?.items || []
    return customers.find((c) => c.customer_id === customerId) || null
  },
}

export default customerService
