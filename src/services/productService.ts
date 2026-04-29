import { postJsonRpc } from './httpClient'
import { API_CONFIG } from '@/config/api'
import type { GridProductsResponse, Product, ShippingProductsResponse } from '@/types'

export interface GetProductsParams {
  search?: string
  limit?: number
  offset?: number
  category_ids?: number[]
  product_ids?: number[]
  quantities?: Record<string, number>
  customer_id?: number
  partner_id?: number
  customer_qr_ref?: string
}

export const productService = {
  /**
   * Get produk susu olahan
   */
  async getSusuOlahanProducts(
    params: GetProductsParams = {},
  ): Promise<GridProductsResponse | null> {
    try {
      const response = await postJsonRpc<GridProductsResponse>(
        API_CONFIG.endpoints.susuOlahanProducts,
        {
          customer_id: params.customer_id,
          partner_id: params.partner_id,
          customer_qr_ref: params.customer_qr_ref,
          search: params.search || '',
          limit: params.limit || 100,
          offset: params.offset || 0,
        },
      )
      return response
    } catch (error) {
      console.error('Get susu olahan products error:', error)
      return null
    }
  },

  /**
   * Get produk dalam format grid untuk minimarket
   */
  async getGridProducts(params: GetProductsParams = {}): Promise<GridProductsResponse | null> {
    try {
      const response = await postJsonRpc<GridProductsResponse>(
        API_CONFIG.endpoints.minimarketGridProducts,
        {
          customer_id: params.customer_id,
          partner_id: params.partner_id,
          customer_qr_ref: params.customer_qr_ref,
          search: params.search || '',
          category_ids: params.category_ids || [],
          product_ids: params.product_ids || [],
          quantities: params.quantities || {},
          limit: params.limit || 100,
          offset: params.offset || 0,
        },
      )
      return response
    } catch (error) {
      console.error('Get grid products error:', error)
      return null
    }
  },

  /**
   * Get produk ongkos kirim
   */
  async getShippingProducts(search: string = ''): Promise<ShippingProductsResponse | null> {
    try {
      const response = await postJsonRpc<ShippingProductsResponse>(
        API_CONFIG.endpoints.susuOlahanShippingProducts,
        {
          search,
          limit: 100,
          offset: 0,
        },
      )
      return response
    } catch (error) {
      console.error('Get shipping products error:', error)
      return null
    }
  },

  /**
   * Format harga ke IDR currency
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  },
}

export default productService
