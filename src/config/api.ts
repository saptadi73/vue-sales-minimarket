// API Configuration
export const API_CONFIG = {
  // Base URL - sesuaikan dengan Odoo instance Anda
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8069',

  // Endpoints
  endpoints: {
    // Auth
    authenticate: '/api/sales/authenticate',

    // Susu Olahan
    susuOlahanCustomers: '/api/sales/susu-olahan/customers',
    susuOlahanProducts: '/api/sales/susu-olahan/products',
    susuOlahanShippingProducts: '/api/sales/susu-olahan/shipping-products',
    susuOlahanStores: '/api/sales/susu-olahan/stores',
    susuOlahanVehicles: '/api/sales/susu-olahan/vehicles',
    susuOlahanDeliveryReport: '/api/sales/susu-olahan/delivery-report',
    susuOlahanDraftOrder: '/api/sales/susu-olahan/draft-order',

    // Minimarket
    minimarketGridProducts: '/api/sales/minimarket/grid-products',
    minimarketDraftOrder: '/api/sales/minimarket/draft-order',
  },
}

export type ApiEndpoint = keyof typeof API_CONFIG.endpoints
