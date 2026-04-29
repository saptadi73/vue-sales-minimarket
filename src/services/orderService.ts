import { postJsonRpc } from './httpClient'
import { API_CONFIG } from '@/config/api'
import type { CreateOrderPayload, OrderResponse, SalesOrderListResponse } from '@/types'
import { getApiBaseUrl } from '@/utils/apiUrl'

export interface GetSalesOrdersParams {
  business_category_id?: number
  frontend_only?: boolean
  include_lines?: boolean
  include_accounting?: boolean
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
}

function summarizePayloadForDebug(payload: CreateOrderPayload) {
  return {
    partner_id: payload.partner_id,
    customer_qr_ref: payload.customer_qr_ref,
    commitment_date: payload.commitment_date,
    payment_term_id: payload.payment_term_id,
    business_category_id: payload.business_category_id,
    store_id: payload.store_id,
    toko_id: payload.toko_id,
    delivery_vehicle_id: payload.delivery_vehicle_id,
    vehicle_id: payload.vehicle_id,
    mobil_id: payload.mobil_id,
    debug: payload.debug,
    grid_lines_count: payload.grid_lines?.length || 0,
    product_ids: (payload.grid_lines || []).map((line) => line.product_id),
    quantities_count: payload.quantities ? Object.keys(payload.quantities).length : 0,
  }
}

function logOrderSubmitDebug(
  stage: 'REQUEST' | 'RESPONSE_ERROR_STATUS' | 'RESPONSE_SUCCESS',
  endpoint: string,
  payload: CreateOrderPayload,
  response?: OrderResponse,
) {
  const baseUrl = getApiBaseUrl()
  const resolvedUrl = `${baseUrl || ''}${endpoint}`

  console.group(`[ORDER_DEBUG] ${stage} ${endpoint}`)
  console.log('Base URL:', baseUrl || '(same-origin)')
  console.log('Resolved URL:', resolvedUrl)
  console.log('Payload Summary:', summarizePayloadForDebug(payload))
  if (response) {
    console.log('Response Status:', response.status)
    console.log('Response Message:', response.message)
    console.log('Response Debug:', response.debug ?? '(no debug field)')
    console.log('Raw Response:', response)
  }
  console.groupEnd()
}

function logOrderSubmitException(error: unknown, endpoint: string, payload: CreateOrderPayload) {
  const err = error as any
  const baseUrl = getApiBaseUrl()
  const resolvedUrl = `${baseUrl || ''}${endpoint}`

  console.group(`[ORDER_DEBUG] EXCEPTION ${endpoint}`)
  console.log('Base URL:', baseUrl || '(same-origin)')
  console.log('Resolved URL:', resolvedUrl)
  console.log('Payload Summary:', summarizePayloadForDebug(payload))
  console.log('HTTP Status:', err?.response?.status ?? '(no status)')
  console.log('Response Data:', err?.response?.data ?? '(no response body)')
  console.log('Error Message:', err?.message ?? '(no message)')
  console.error('Raw Error Object:', err)
  console.groupEnd()
}

async function submitOrderRequest(
  endpoint: string,
  payload: CreateOrderPayload,
): Promise<OrderResponse> {
  try {
    logOrderSubmitDebug('REQUEST', endpoint, payload)
    const response = await postJsonRpc<OrderResponse>(endpoint, payload)

    if (response?.status === 'error') {
      logOrderSubmitDebug('RESPONSE_ERROR_STATUS', endpoint, payload, response)
    } else {
      logOrderSubmitDebug('RESPONSE_SUCCESS', endpoint, payload, response)
    }

    return response
  } catch (error) {
    logOrderSubmitException(error, endpoint, payload)
    const backendMessage = extractBackendErrorMessage(error)
    return {
      status: 'error',
      message: normalizeBackendOrderError(backendMessage),
    }
  }
}

function extractBackendErrorMessage(error: unknown): string {
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

  return 'Unknown backend error'
}

function normalizeBackendOrderError(message: string): string {
  const lower = message.toLowerCase()

  if (
    lower.includes('partner_id') ||
    lower.includes('customer_qr_ref') ||
    lower.includes('customer')
  ) {
    return 'Data customer tidak valid atau belum dipilih.'
  }
  if (lower.includes('payment_term') || lower.includes('syarat pembayaran')) {
    return 'Syarat pembayaran tidak valid. Pilih payment term yang tersedia di Odoo.'
  }
  if (lower.includes('store_id') || lower.includes('toko_id') || lower.includes('store')) {
    return 'Toko pengirim tidak valid. Pastikan toko masih aktif di master data Odoo.'
  }
  if (
    lower.includes('delivery_vehicle_id') ||
    lower.includes('vehicle_id') ||
    lower.includes('mobil_id') ||
    lower.includes('fleet') ||
    lower.includes('vehicle')
  ) {
    return 'Kendaraan pengirim tidak valid. Pastikan kendaraan masih aktif di Fleet Odoo.'
  }
  if (
    lower.includes('grid_lines') ||
    lower.includes('quantities') ||
    lower.includes('quantity') ||
    lower.includes('product')
  ) {
    return 'Data produk/quantity tidak valid. Pastikan minimal satu produk memiliki quantity > 0.'
  }
  if (lower.includes('business_category')) {
    return `Business category tidak sesuai. Pastikan transaksi memakai kategori SUSU OLAHAN. Backend: ${message}`
  }
  if (
    lower.includes('unauthorized') ||
    lower.includes('session') ||
    lower.includes('auth') ||
    lower.includes('401')
  ) {
    return 'Sesi login Odoo tidak valid atau sudah berakhir. Silakan login ulang.'
  }

  return message
}

export const orderService = {
  /**
   * Create draft sales order untuk minimarket
   */
  async createMinimarketOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
    return submitOrderRequest(API_CONFIG.endpoints.minimarketDraftOrder, payload)
  },

  /**
   * Create draft sales order untuk susu olahan
   * Backend memakai metadata toko dan armada tanpa menambah line ongkir
   */
  async createSusuOlahanOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
    return submitOrderRequest(API_CONFIG.endpoints.susuOlahanDraftOrder, payload)
  },

  async getSusuOlahanOrders(
    params: GetSalesOrdersParams = {},
  ): Promise<SalesOrderListResponse | null> {
    try {
      return await postJsonRpc<SalesOrderListResponse>(API_CONFIG.endpoints.susuOlahanOrders, {
        frontend_only: params.frontend_only,
        include_lines: params.include_lines ?? false,
        include_accounting: params.include_accounting ?? true,
        business_category_id: params.business_category_id,
        date_from: params.date_from,
        date_to: params.date_to,
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
      })
    } catch (error) {
      console.error('Get susu olahan orders error:', error)
      return null
    }
  },

  async getMinimarketOrders(
    params: GetSalesOrdersParams = {},
  ): Promise<SalesOrderListResponse | null> {
    try {
      return await postJsonRpc<SalesOrderListResponse>(API_CONFIG.endpoints.minimarketOrders, {
        frontend_only: params.frontend_only,
        include_lines: params.include_lines ?? false,
        include_accounting: params.include_accounting ?? true,
        business_category_id: params.business_category_id,
        date_from: params.date_from,
        date_to: params.date_to,
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
      })
    } catch (error) {
      console.error('Get minimarket orders error:', error)
      return null
    }
  },

  async getOrders(params: GetSalesOrdersParams = {}): Promise<SalesOrderListResponse | null> {
    try {
      return await postJsonRpc<SalesOrderListResponse>(API_CONFIG.endpoints.salesOrders, {
        frontend_only: params.frontend_only,
        include_lines: params.include_lines ?? false,
        include_accounting: params.include_accounting ?? true,
        business_category_id: params.business_category_id,
        date_from: params.date_from,
        date_to: params.date_to,
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
      })
    } catch (error) {
      console.error('Get generic orders error:', error)
      return null
    }
  },

  /**
   * Format order payload dari grid lines
   */
  formatOrderPayload(data: any, gridItems: any[]): CreateOrderPayload {
    // Filter hanya item yang memiliki quantity > 0
    const gridLines = gridItems
      .filter((item) => item.quantity && item.quantity > 0)
      .map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }))

    return {
      partner_id: data.partner_id,
      customer_qr_ref: data.customer_qr_ref,
      commitment_date: data.commitment_date,
      payment_term_id: data.payment_term_id,
      business_category_id: data.business_category_id,
      store_id: data.store_id,
      toko_id: data.toko_id,
      delivery_vehicle_id: data.delivery_vehicle_id,
      vehicle_id: data.vehicle_id,
      mobil_id: data.mobil_id,
      note: data.note,
      grid_lines: gridLines,
    }
  },

  /**
   * Validate order payload
   */
  validateOrderPayload(payload: CreateOrderPayload): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (!payload.partner_id && !payload.customer_qr_ref) {
      errors.push('Customer harus dipilih')
    }
    if (!payload.commitment_date) {
      errors.push('Tanggal pengiriman harus diisi')
    }
    if (!payload.store_id && !payload.toko_id) {
      errors.push('Toko pengirim harus dipilih')
    }
    if (!payload.delivery_vehicle_id && !payload.vehicle_id && !payload.mobil_id) {
      errors.push('Kendaraan pengirim harus dipilih')
    }
    if (!payload.payment_term_id) {
      errors.push('Syarat pembayaran harus dipilih')
    }
    const hasItems =
      (payload.grid_lines && payload.grid_lines.length > 0) ||
      (payload.quantities && Object.values(payload.quantities).some((q) => q > 0))
    if (!hasItems) {
      errors.push('Minimal 1 produk dengan quantity > 0 harus ada')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  },
}

export default orderService
