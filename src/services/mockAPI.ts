/**
 * Mock API untuk development tanpa Odoo backend
 * Hapus atau disable saat deploy ke production
 */

import { httpClient } from './httpClient'

// Enable mock API: set to true untuk development
const ENABLE_MOCK_API = false

// Mock data
const mockProducts = [
  {
    product_id: 101,
    default_code: 'SUSU-UHT-200',
    barcode: '899000000001',
    name: 'Susu UHT 200ml Rasa Coklat',
    category_name: 'Susu Kemasan',
    category_id: 7,
    list_price: 4500,
    uom_id: 1,
    uom_name: 'Pcs',
    currency_id: 13,
    currency_name: 'IDR',
    quantity: 0,
  },
  {
    product_id: 102,
    default_code: 'SUSU-UHT-250',
    barcode: '899000000002',
    name: 'Susu UHT 250ml Rasa Vanilla',
    category_name: 'Susu Kemasan',
    category_id: 7,
    list_price: 5500,
    uom_id: 1,
    uom_name: 'Pcs',
    currency_id: 13,
    currency_name: 'IDR',
    quantity: 0,
  },
  {
    product_id: 103,
    default_code: 'SUSU-UHT-500',
    barcode: '899000000003',
    name: 'Susu UHT 500ml Rasa Strawberry',
    category_name: 'Susu Kemasan',
    category_id: 7,
    list_price: 8500,
    uom_id: 1,
    uom_name: 'Pcs',
    currency_id: 13,
    currency_name: 'IDR',
    quantity: 0,
  },
]

const mockCustomers = [
  {
    partner_id: 45,
    customer_id: 45,
    name: 'Alfamart Cabang A',
    ref: 'MM-A',
    customer_qr_ref: 'CUSTQR2603-000001',
    phone: '0341-1234567',
    mobile: '0812-3456789',
    email: 'store-a@minimarket.com',
    shipping_wilayah_id: 15,
    shipping_wilayah_name: 'Kecamatan A',
    payment_term_id: 4,
    payment_term_name: '14 Days',
    customer_segment_name: 'Repeat',
    last_sale_date: '2026-04-20',
    sales_frequency: 8,
    total_sales_amount: 12500000,
  },
  {
    partner_id: 46,
    customer_id: 46,
    name: 'Indomaret Cabang B',
    ref: 'MM-B',
    customer_qr_ref: 'CUSTQR2603-000002',
    phone: '0341-2345678',
    mobile: '0812-4567890',
    email: 'store-b@minimarket.com',
    shipping_wilayah_id: 16,
    shipping_wilayah_name: 'Kecamatan B',
    payment_term_id: 3,
    payment_term_name: '7 Days',
    customer_segment_name: 'Regular',
    last_sale_date: '2026-04-19',
    sales_frequency: 5,
    total_sales_amount: 8500000,
  },
]

const mockStores = [
  {
    store_id: 1,
    toko_id: 1,
    name: 'Cabang Malang Utara',
    code: 'MLG-UTR',
    display_name: 'Cabang Malang Utara',
  },
  {
    store_id: 2,
    toko_id: 2,
    name: 'Cabang Malang Selatan',
    code: 'MLG-STN',
    display_name: 'Cabang Malang Selatan',
  },
]

const mockVehicles = [
  {
    delivery_vehicle_id: 5,
    frontend_vehicle_id: 5,
    vehicle_id: 5,
    mobil_id: 5,
    name: 'Toyota Hilux / B 1234 XYZ',
    code: 'B1234XYZ',
    license_plate: 'B 1234 XYZ',
  },
  {
    delivery_vehicle_id: 6,
    frontend_vehicle_id: 6,
    vehicle_id: 6,
    mobil_id: 6,
    name: 'Mitsubishi L300 / N 9876 AB',
    code: 'N9876AB',
    license_plate: 'N 9876 AB',
  },
]

// Setup mock interceptors
export function setupMockAPI() {
  if (!ENABLE_MOCK_API) return

  httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
      const config = error.config

      // Mock authenticate endpoint
      if (config.url.includes('/api/sales/authenticate')) {
        return Promise.resolve({
          data: {
            status: 'success',
            message: 'Authentication successful',
            data: {
              uid: 2,
              session_id: 'mock_session_123',
              db: 'odoo_production',
              login: 'user@example.com',
              name: 'Sales User',
              partner_id: 1,
              company_id: 1,
              company_name: 'PT Example Company',
            },
          },
        })
      }

      // Mock grid products endpoint
      if (config.url.includes('/api/sales/minimarket/grid-products')) {
        return Promise.resolve({
          data: {
            status: 'success',
            data: {
              items: mockProducts,
              count: mockProducts.length,
              columns: [
                { key: 'default_code', label: 'Kode', readonly: true },
                { key: 'name', label: 'Produk', readonly: true },
                { key: 'uom_name', label: 'UoM', readonly: true },
                { key: 'list_price', label: 'Harga', readonly: true },
                { key: 'quantity', label: 'Qty', readonly: false, input_type: 'number' },
              ],
            },
          },
        })
      }

      // Mock customers endpoint
      if (config.url.includes('/api/sales/susu-olahan/customers')) {
        return Promise.resolve({
          data: {
            status: 'success',
            data: {
              business_category_id: 2,
              business_category_name: 'SUSU OLAHAN',
              items: mockCustomers,
              count: mockCustomers.length,
            },
          },
        })
      }

      // Mock customer autocomplete endpoint
      if (config.url.includes('/api/sales/susu-olahan/customer-search')) {
        return Promise.resolve({
          data: {
            status: 'success',
            data: {
              items: mockCustomers.map((customer) => ({
                id: customer.partner_id,
                text: `${customer.name} [${customer.ref}] ${customer.customer_qr_ref}`,
                partner_id: customer.partner_id,
                customer_id: customer.customer_id,
                name: customer.name,
                ref: customer.ref,
                customer_qr_ref: customer.customer_qr_ref,
              })),
              count: mockCustomers.length,
              has_more: false,
            },
          },
        })
      }

      // Mock create order endpoint
      if (
        config.url.includes('/api/sales/susu-olahan/draft-order') ||
        config.url.includes('/api/sales/minimarket/draft-order')
      ) {
        return Promise.resolve({
          data: {
            status: 'success',
            message: 'Order created successfully',
            data: {
              order_id: 1001,
              order_number: 'SO/2026/0001',
              partner_id: 45,
              commitment_date: '2026-04-30 10:00:00',
              total_amount: 145000,
            },
          },
        })
      }

      // Mock stores endpoint
      if (config.url.includes('/api/sales/susu-olahan/stores')) {
        return Promise.resolve({
          data: {
            status: 'success',
            data: {
              items: mockStores,
              count: mockStores.length,
            },
          },
        })
      }

      // Mock vehicles endpoint
      if (config.url.includes('/api/sales/susu-olahan/vehicles')) {
        return Promise.resolve({
          data: {
            status: 'success',
            data: {
              items: mockVehicles,
              count: mockVehicles.length,
            },
          },
        })
      }

      // Mock delivery report endpoint
      if (config.url.includes('/api/sales/susu-olahan/delivery-report')) {
        return Promise.resolve({
          data: {
            status: 'success',
            data: {
              items: [
                {
                  sale_order_id: 5001,
                  sale_order_name: 'S00051',
                  date_order: '2026-04-25 08:00:00',
                  delivery_date: '2026-04-26 00:00:00',
                  store_id: 1,
                  store_name: 'Cabang Malang Utara',
                  delivery_vehicle_id: 5,
                  vehicle_id: 5,
                  vehicle_name: 'Toyota Hilux / B 1234 XYZ',
                  product_id: 101,
                  product_name: 'Susu UHT 200ml Rasa Coklat',
                  quantity: 24,
                  price_total: 108000,
                },
              ],
              count: 1,
              summary: {
                quantity: 24,
                amount_total: 108000,
                line_count: 1,
              },
            },
          },
        })
      }

      return Promise.reject(error)
    },
  )

  console.warn('⚠️ Mock API is ENABLED. Disable before production!')
}

export default {
  setupMockAPI,
}
