import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import orderService from '@/services/orderService'
import type { Product, Customer, CreateOrderPayload } from '@/types'

export interface OrderDraft {
  customer: Customer | null
  commitment_date: string
  payment_term_id: number | null
  team_id: number | null
  business_category_id: number | null
  store_id: number | null
  vehicle_id: number | null
  sale_order_type: 'reguler' | 'kering' | 'partus' | 'silase'
  note: string
  items: Map<number, Product & { quantity: number }>
}

export const useOrderStore = defineStore('order', () => {
  const draft = ref<OrderDraft>({
    customer: null,
    commitment_date: '',
    payment_term_id: null,
    team_id: null,
    business_category_id: 2, // SUSU OLAHAN
    store_id: null,
    vehicle_id: null,
    sale_order_type: 'reguler',
    note: '',
    items: new Map(),
  })

  const isSubmitting = ref(false)
  const submitError = ref<string | null>(null)

  // Total item dalam order
  const totalItems = computed(() => {
    let total = 0
    draft.value.items.forEach((item) => {
      total += item.quantity || 0
    })
    return total
  })

  // Total harga order
  const totalAmount = computed(() => {
    let total = 0
    draft.value.items.forEach((item) => {
      total += (item.list_price || 0) * (item.quantity || 0)
    })
    return total
  })

  // Daftar items dalam order
  const orderItems = computed(() => {
    return Array.from(draft.value.items.values())
  })

  // Set customer
  function setCustomer(customer: Customer | null) {
    draft.value.customer = customer
  }

  // Set order metadata
  function setOrderMetadata(data: Partial<OrderDraft>) {
    Object.assign(draft.value, data)
  }

  // Add atau update produk quantity
  function setProductQuantity(product: Product, quantity: number) {
    if (quantity <= 0) {
      draft.value.items.delete(product.product_id)
    } else {
      draft.value.items.set(product.product_id, {
        ...product,
        quantity,
      })
    }
  }

  // Remove produk dari order
  function removeProduct(productId: number) {
    draft.value.items.delete(productId)
  }

  // Clear semua items
  function clearItems() {
    draft.value.items.clear()
  }

  // Reset draft order
  function resetDraft() {
    draft.value = {
      customer: null,
      commitment_date: '',
      payment_term_id: null,
      team_id: null,
      business_category_id: 2, // SUSU OLAHAN
      store_id: null,
      vehicle_id: null,
      sale_order_type: 'reguler',
      note: '',
      items: new Map(),
    }
    submitError.value = null
  }

  // Submit order ke backend
  async function submitOrder(isSusuOlahan: boolean = true): Promise<boolean> {
    isSubmitting.value = true
    submitError.value = null

    try {
      // Validate order
      const gridLines = Array.from(draft.value.items.values()).map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }))

      const payload: CreateOrderPayload = {
        partner_id: draft.value.customer?.partner_id,
        customer_qr_ref: draft.value.customer?.customer_qr_ref,
        commitment_date: draft.value.commitment_date,
        payment_term_id: draft.value.payment_term_id || 0,
        team_id: draft.value.team_id || 0,
        business_category_id: draft.value.business_category_id || 2,
        store_id: draft.value.store_id ?? undefined,
        toko_id: draft.value.store_id ?? undefined,
        delivery_vehicle_id: draft.value.vehicle_id ?? undefined,
        vehicle_id: draft.value.vehicle_id ?? undefined,
        mobil_id: draft.value.vehicle_id ?? undefined,
        sale_order_type: draft.value.sale_order_type,
        note: draft.value.note,
        grid_lines: gridLines,
      }

      const validation = orderService.validateOrderPayload(payload)
      if (!validation.valid) {
        submitError.value = validation.errors.join('\n')
        return false
      }

      // Submit
      const response = isSusuOlahan
        ? await orderService.createSusuOlahanOrder(payload)
        : await orderService.createMinimarketOrder(payload)

      if (response.status === 'success') {
        resetDraft()
        return true
      } else {
        submitError.value = response.message || 'Gagal membuat order'
        return false
      }
    } catch (err) {
      submitError.value = 'Terjadi kesalahan: ' + (err as any).message
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  function clearSubmitError() {
    submitError.value = null
  }

  return {
    draft,
    isSubmitting,
    submitError,
    totalItems,
    totalAmount,
    orderItems,
    setCustomer,
    setOrderMetadata,
    setProductQuantity,
    removeProduct,
    clearItems,
    resetDraft,
    submitOrder,
    clearSubmitError,
  }
})
