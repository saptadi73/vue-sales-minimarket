// Auth Types
export interface LoginCredentials {
  login: string
  password: string
  db: string
}

export interface AuthResponse {
  status: 'success' | 'error'
  message: string
  data?: {
    uid: number
    session_id: string
    db: string
    login: string
    name: string
    partner_id: number
    company_id: number
    company_name: string
  }
}

export interface User {
  id: number
  email: string
  name: string
  partner_id: number
  company_id: number
  company_name: string
}

// Product Types
export interface Product {
  product_id: number
  default_code: string
  barcode: string | boolean
  name: string
  category_name?: string
  category_id?: number
  list_price: number
  uom_id?: number
  uom_name: string
  currency_id?: number
  currency_name?: string
  quantity?: number
  business_category_id?: number
  business_category_name?: string
}

export interface ProductGridColumn {
  key: string
  label: string
  readonly: boolean
  input_type?: string
}

export interface GridProductsResponse {
  status: 'success' | 'error'
  message?: string
  data: {
    business_category_id?: number
    business_category_name?: string
    customer_id?: number
    customer_name?: string
    pricelist_id?: number
    pricelist_name?: string
    items: Product[]
    count: number
    columns: ProductGridColumn[]
  }
}

// Customer Types
export interface Customer {
  partner_id: number
  customer_id: number
  name: string
  ref: string
  customer_qr_ref: string
  phone: string
  mobile: string
  email: string
  shipping_wilayah_id?: number
  shipping_wilayah_name?: string
  payment_term_id: number
  payment_term_name: string
  customer_segment_name?: string
  last_sale_date?: string
  sales_frequency?: number
  total_sales_amount?: number
}

export interface CustomersResponse {
  status: 'success' | 'error'
  message?: string
  data: {
    business_category_id: number
    business_category_name: string
    items: Customer[]
    count: number
  }
}

export interface CustomerSearchItem {
  id: number
  text?: string
  partner_id?: number
  customer_id?: number
  name?: string
  ref?: string
  customer_qr_ref?: string
}

export interface CustomerSearchResponse {
  status: 'success' | 'error'
  message?: string
  data: {
    items?: CustomerSearchItem[]
    results?: CustomerSearchItem[]
    count?: number
    has_more?: boolean
  }
}

// Shipping Types
export interface ShippingProduct extends Product {
  category_id: number
  category_name: string
}

export interface ShippingProductsResponse {
  status: 'success' | 'error'
  message?: string
  data: {
    business_category_id: number
    business_category_name: string
    category_id: number
    category_name: string
    items: ShippingProduct[]
    count: number
  }
}

// Store & Vehicle Types
export interface Store {
  store_id: number
  toko_id?: number
  name: string
  code: string
  display_name?: string
  partner_id?: number
  partner_name?: string
  phone?: string
  street?: string
  address?: string
  city?: string
}

export interface Vehicle {
  delivery_vehicle_id?: number
  frontend_vehicle_id?: number
  vehicle_id: number
  mobil_id?: number
  name: string
  code: string
  vehicle_type?: string
  license_plate?: string
  model_id?: number
  model_name?: string
  driver_id?: number
  driver_name?: string
  plate_number?: string
  capacity?: number
}

export interface MasterListResponse<T> {
  status: 'success' | 'error'
  message?: string
  data: {
    items: T[]
    count: number
  }
}

// Order Types
export interface OrderLineItem {
  product_id: number
  quantity: number
}

export interface CreateOrderPayload {
  partner_id?: number
  customer_qr_ref?: string
  commitment_date: string
  payment_term_id: number
  business_category_id?: number
  store_id?: number
  toko_id?: number
  delivery_vehicle_id?: number
  vehicle_id?: number
  mobil_id?: number
  debug?: boolean
  note?: string
  grid_lines?: OrderLineItem[]
  quantities?: Record<string, number>
}

export interface OrderResponse {
  status: 'success' | 'error'
  message: string
  debug?: Record<string, any>
  data?: {
    order_id?: number
    order_number?: string
    sale_order_id?: number
    name?: string
    state?: string
    amount_total?: number
    line_count?: number
    partner_id: number
    commitment_date: string
    total_amount: number
    store_id?: number
    store_name?: string
    delivery_vehicle_id?: number
    frontend_vehicle_id?: number
    vehicle_id?: number
    mobil_id?: number
    vehicle_name?: string
  }
}

export interface SalesOrderListItem {
  order_id?: number
  sale_order_id?: number
  id?: number
  order_number?: string
  sale_order_name?: string
  name?: string
  date_order?: string
  create_date?: string
  commitment_date?: string
  partner_id?: number
  customer_id?: number
  partner_name?: string
  customer_name?: string
  state?: string
  approval_state?: string
  payment_status?: string
  amount_total?: number
  total_amount?: number
  store_id?: number
  store_name?: string
  delivery_vehicle_id?: number
  frontend_vehicle_id?: number
  vehicle_id?: number
  mobil_id?: number
  vehicle_name?: string
  fleet_booking_id?: number
  fleet_booking_name?: string
  fleet_booking_state?: string
  fleet_driver_id?: number
  fleet_driver_name?: string
}

export interface SalesOrderListResponse {
  status: 'success' | 'error'
  message?: string
  data?: {
    items?: SalesOrderListItem[]
    count?: number
  }
}

// Report Types
export interface DeliveryReportResponse {
  status: 'success' | 'error'
  message?: string
  data: {
    items: DeliveryReportItem[]
    count: number
    summary?: DeliveryReportSummary
  }
}

export interface DeliveryReportItem {
  sale_order_id?: number
  sale_order_name?: string
  date_order?: string
  delivery_date?: string
  customer_id?: number
  customer_name?: string
  store_id?: number
  store_name?: string
  delivery_vehicle_id?: number
  frontend_vehicle_id?: number
  vehicle_id?: number
  mobil_id?: number
  vehicle_name?: string
  product_id?: number
  product_name?: string
  quantity?: number
  price_unit?: number
  tax_amount?: number
  price_subtotal?: number
  price_total?: number
  state?: string
}

export interface DeliveryReportSummary {
  total_orders?: number
  total_quantity?: number
  total_amount?: number
  quantity?: number
  amount_untaxed?: number
  tax_amount?: number
  amount_total?: number
  line_count?: number
}

// Generic API Response
export interface ApiResponse<T = any> {
  status: 'success' | 'error'
  message?: string
  data?: T
}
