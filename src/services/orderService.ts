import { postJsonRpc } from './httpClient'
import { API_CONFIG } from '@/config/api'
import type { CreateOrderPayload, OrderResponse } from '@/types'

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

  if (lower.includes('partner_id') || lower.includes('customer_qr_ref') || lower.includes('customer')) {
    return 'Data customer tidak valid atau belum dipilih.'
  }
  if (lower.includes('payment_term') || lower.includes('syarat pembayaran')) {
    return 'Syarat pembayaran tidak valid. Pilih payment term yang tersedia di Odoo.'
  }
  if (lower.includes('team_id') || lower.includes('team sales') || lower.includes('sales team')) {
    return 'Team sales tidak valid. Pilih team yang sesuai dengan akses user.'
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
  if (lower.includes('sale_order_type')) {
    return 'Tipe sales order tidak valid untuk business category ini.'
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
    return 'Business category tidak sesuai. Pastikan transaksi memakai kategori SUSU OLAHAN.'
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
    try {
      const response = await postJsonRpc<OrderResponse>(
        API_CONFIG.endpoints.minimarketDraftOrder,
        payload,
      )
      return response
    } catch (error) {
      const backendMessage = extractBackendErrorMessage(error)
      return {
        status: 'error',
        message: normalizeBackendOrderError(backendMessage),
      }
    }
  },

  /**
   * Create draft sales order untuk susu olahan
   * Backend memakai metadata toko dan armada tanpa menambah line ongkir
   */
  async createSusuOlahanOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
    try {
      const response = await postJsonRpc<OrderResponse>(
        API_CONFIG.endpoints.susuOlahanDraftOrder,
        payload,
      )
      return response
    } catch (error) {
      const backendMessage = extractBackendErrorMessage(error)
      return {
        status: 'error',
        message: normalizeBackendOrderError(backendMessage),
      }
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
      team_id: data.team_id,
      business_category_id: data.business_category_id,
      store_id: data.store_id,
      toko_id: data.toko_id,
      delivery_vehicle_id: data.delivery_vehicle_id,
      vehicle_id: data.vehicle_id,
      mobil_id: data.mobil_id,
      sale_order_type: data.sale_order_type || 'reguler',
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
    if (!payload.team_id) {
      errors.push('Team sales harus dipilih')
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
