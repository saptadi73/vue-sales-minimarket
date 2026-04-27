import { postJsonRpc } from './httpClient'
import { API_CONFIG } from '@/config/api'
import type { DeliveryReportResponse } from '@/types'

export interface DeliveryReportFilter {
  date_from?: string
  date_to?: string
  store_ids?: number[]
  delivery_vehicle_ids?: number[]
  customer_ids?: number[]
  product_ids?: number[]
  limit?: number
  offset?: number
}

export const deliveryReportService = {
  async getReport(filters: DeliveryReportFilter = {}): Promise<DeliveryReportResponse | null> {
    try {
      return await postJsonRpc<DeliveryReportResponse>(
        API_CONFIG.endpoints.susuOlahanDeliveryReport,
        {
          date_from: filters.date_from,
          date_to: filters.date_to,
          store_ids: filters.store_ids || [],
          delivery_vehicle_ids: filters.delivery_vehicle_ids || [],
          customer_ids: filters.customer_ids || [],
          product_ids: filters.product_ids || [],
          limit: filters.limit || 100,
          offset: filters.offset || 0,
        },
      )
    } catch (error) {
      console.error('Get delivery report error:', error)
      return null
    }
  },
}

export default deliveryReportService
