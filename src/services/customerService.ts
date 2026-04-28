import { postJsonRpc } from './httpClient'
import { API_CONFIG } from '@/config/api'
import type {
  CustomersResponse,
  Customer,
  CustomerSearchItem,
  CustomerSearchResponse,
} from '@/types'
import { getApiBaseUrl } from '@/utils/apiUrl'

export interface GetCustomersParams {
  search?: string
  limit?: number
  offset?: number
  only_customers?: boolean
}

export interface SearchCustomerAutocompleteParams {
  query: string
  limit?: number
  min_chars?: number
}

function logCustomerApiError(error: unknown, endpoint: string, params: GetCustomersParams) {
  const err = error as any
  const baseUrl = getApiBaseUrl()

  console.group('[CUSTOMER_DEBUG] Request gagal')
  console.log('Base URL:', baseUrl || '(same-origin)')
  console.log('Endpoint:', endpoint)
  console.log('Params:', params)
  console.log('HTTP Status:', err?.response?.status ?? '(no status)')
  console.log('Response Data:', err?.response?.data ?? '(no response body)')
  console.log('Error Message:', err?.message ?? '(no message)')
  console.error('Raw Error Object:', err)
  console.groupEnd()
}

export const customerService = {
  /**
   * Get customer minimarket susu olahan
   */
  async getSusuOlahanCustomers(params: GetCustomersParams = {}): Promise<CustomersResponse | null> {
    const requestParams = {
      search: params.search || '',
      limit: params.limit || 50,
      offset: params.offset || 0,
    }

    try {
      const response = await postJsonRpc<CustomersResponse>(
        API_CONFIG.endpoints.susuOlahanCustomers,
        requestParams,
      )

      if (!response) {
        throw new Error('Response customer kosong dari backend')
      }

      if (response.status !== 'success') {
        const backendMessage = response.message || 'Backend mengembalikan status error'
        throw new Error(backendMessage)
      }

      return response
    } catch (error) {
      logCustomerApiError(error, API_CONFIG.endpoints.susuOlahanCustomers, requestParams)
      return null
    }
  },

  /**
   * Search customer autocomplete untuk input ketik-pilih (mobile friendly)
   */
  async searchCustomerAutocomplete(
    params: SearchCustomerAutocompleteParams,
  ): Promise<CustomerSearchItem[]> {
    const query = params.query.trim()
    if (!query) {
      return []
    }

    const requestParams = {
      q: query,
      term: query,
      query,
      search: query,
      limit: params.limit || 20,
      min_chars: params.min_chars ?? 1,
    }

    try {
      const response = await postJsonRpc<CustomerSearchResponse>(
        API_CONFIG.endpoints.susuOlahanCustomerSearch,
        requestParams,
      )

      if (!response) {
        throw new Error('Response customer-search kosong dari backend')
      }

      if (response.status !== 'success') {
        const backendMessage = response.message || 'Backend mengembalikan status error'
        throw new Error(backendMessage)
      }

      return response.data?.items || response.data?.results || []
    } catch (error) {
      logCustomerApiError(error, API_CONFIG.endpoints.susuOlahanCustomerSearch, requestParams)
      throw new Error(
        'Gagal memuat customer autocomplete. Periksa URL API, session login, dan response backend.',
      )
    }
  },

  /**
   * Resolve data customer lengkap berdasarkan hasil autocomplete.
   */
  async resolveCustomerFromSearch(option: CustomerSearchItem): Promise<Customer | null> {
    const candidateId = option.partner_id || option.customer_id || option.id
    const searchHint = option.name || option.ref || ''

    if (!candidateId) {
      return null
    }

    const responseByHint = await this.getSusuOlahanCustomers({
      search: searchHint,
      limit: 50,
      offset: 0,
    })
    const byHint =
      responseByHint?.data?.items?.find(
        (customer) => customer.partner_id === candidateId || customer.customer_id === candidateId,
      ) || null
    if (byHint) {
      return byHint
    }

    const responseFallback = await this.getSusuOlahanCustomers({
      search: '',
      limit: 100,
      offset: 0,
    })
    return (
      responseFallback?.data?.items?.find(
        (customer) => customer.partner_id === candidateId || customer.customer_id === candidateId,
      ) || null
    )
  },

  /**
   * Search customer by name atau kode
   */
  async searchCustomers(query: string, limit: number = 20): Promise<Customer[]> {
    const response = await this.getSusuOlahanCustomers({
      search: query,
      limit,
    })

    if (!response) {
      throw new Error(
        'Gagal memuat customer. Periksa URL API, session login, dan response backend.',
      )
    }

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
