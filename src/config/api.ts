// API Configuration
export const API_CONFIG = {
  // Base URL - sesuaikan dengan Odoo instance Anda
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',

  // Endpoints
  endpoints: {
    // Auth
    authenticate: '/api/sales/authenticate',

    // Susu Olahan
    susuOlahanCustomers: '/api/sales/susu-olahan/customers',
    susuOlahanCustomerSearch: '/api/sales/susu-olahan/customer-search',
    susuOlahanCustomersSearch: '/api/sales/susu-olahan/customers/search',
    susuOlahanProducts: '/api/sales/susu-olahan/products',
    susuOlahanShippingProducts: '/api/sales/susu-olahan/shipping-products',
    susuOlahanStores: '/api/sales/susu-olahan/stores',
    susuOlahanVehicles: '/api/sales/susu-olahan/vehicles',
    susuOlahanDeliveryReport: '/api/sales/susu-olahan/delivery-report',
    susuOlahanDraftOrder: '/api/sales/susu-olahan/draft-order',
    susuOlahanOrderDetail: '/api/sales/susu-olahan/order-detail',
    susuOlahanUpdateOrder: '/api/sales/susu-olahan/update-order',
    susuOlahanConfirmOrder: '/api/sales/susu-olahan/confirm-order',
    susuOlahanOrders: '/api/sales/susu-olahan/orders',

    // Minimarket
    minimarketGridProducts: '/api/sales/minimarket/grid-products',
    minimarketDraftOrder: '/api/sales/minimarket/draft-order',
    minimarketOrderDetail: '/api/sales/minimarket/order-detail',
    minimarketUpdateOrder: '/api/sales/minimarket/update-order',
    minimarketConfirmOrder: '/api/sales/minimarket/confirm-order',
    minimarketOrders: '/api/sales/minimarket/orders',

    // Generic
    paymentTerms: '/api/sales/payment-terms',
    salesOrders: '/api/sales/orders',
  },
}

export type ApiEndpoint = keyof typeof API_CONFIG.endpoints
