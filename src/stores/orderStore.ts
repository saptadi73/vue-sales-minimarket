import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import orderService from '@/services/orderService'
import type { Product, Customer, CreateOrderPayload } from '@/types'

export interface OrderDraft {
  customer: Customer | null
  commitment_date: string
  payment_term_id: number | null
  business_category_id: number | null
  store_id: number | null
  vehicle_id: number | null
  note: string
  items: Map<number, Product & { quantity: number }>
}

function formatCommitmentDateForBackend(value: string): string {
  if (!value) {
    return value
  }

  // UI uses datetime-local (YYYY-MM-DDTHH:mm), backend expects YYYY-MM-DD HH:mm.
  const normalized = value.trim().replace('T', ' ')
  return normalized.length > 16 ? normalized.slice(0, 16) : normalized
}

export const useOrderStore = defineStore('order', () => {
  const draft = ref<OrderDraft>({
    customer: null,
    commitment_date: '',
    payment_term_id: null,
    business_category_id: null,
    store_id: null,
    vehicle_id: null,
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
      business_category_id: null,
      store_id: null,
      vehicle_id: null,
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

      const quantities = Array.from(draft.value.items.values()).reduce<Record<string, number>>(
        (acc, item) => {
          acc[String(item.product_id)] = item.quantity
          return acc
        },
        {},
      )

      const productDebug = Array.from(draft.value.items.values()).map((item) => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        business_category_id: item.business_category_id,
        business_category_name: item.business_category_name,
      }))

      const uniqueProductBusinessCategories = Array.from(
        new Set(productDebug.map((item) => item.business_category_id ?? '(undefined)')),
      )

      const definedProductBusinessCategories = Array.from(
        new Set(
          productDebug
            .map((item) => item.business_category_id)
            .filter((value): value is number => typeof value === 'number'),
        ),
      )

      const payload: CreateOrderPayload = {
        partner_id: draft.value.customer?.partner_id,
        customer_qr_ref: draft.value.customer?.customer_qr_ref,
        commitment_date: formatCommitmentDateForBackend(draft.value.commitment_date),
        payment_term_id: draft.value.payment_term_id || 0,
        business_category_id: draft.value.business_category_id ?? undefined,
        store_id: draft.value.store_id ?? undefined,
        toko_id: draft.value.store_id ?? undefined,
        delivery_vehicle_id: draft.value.vehicle_id ?? undefined,
        vehicle_id: draft.value.vehicle_id ?? undefined,
        mobil_id: draft.value.vehicle_id ?? undefined,
        debug: true,
        note: draft.value.note,
        grid_lines: gridLines,
        quantities,
      }

      console.group('[ORDER_DEBUG] Draft before submit')
      console.log('isSusuOlahan:', isSusuOlahan)
      console.log('Customer:', draft.value.customer)
      console.log('Order Metadata:', {
        commitment_date: draft.value.commitment_date,
        payment_term_id: draft.value.payment_term_id,
        business_category_id: draft.value.business_category_id,
        store_id: draft.value.store_id,
        vehicle_id: draft.value.vehicle_id,
      })
      console.log('Payload:', payload)
      console.log('Products Debug:', productDebug)
      console.log('Unique Product Business Categories:', uniqueProductBusinessCategories)
      console.log('Defined Product Business Categories:', definedProductBusinessCategories)
      if (
        payload.business_category_id &&
        definedProductBusinessCategories.length > 0 &&
        !definedProductBusinessCategories.includes(payload.business_category_id)
      ) {
        console.warn(
          '[ORDER_DEBUG] Potential mismatch: payload business_category_id tidak ada di business_category_id produk yang dipilih.',
        )
      }
      console.groupEnd()

      const validation = orderService.validateOrderPayload(payload)
      if (!validation.valid) {
        console.group('[ORDER_DEBUG] Validation failed before submit')
        console.log('Validation Errors:', validation.errors)
        console.log('Payload:', payload)
        console.groupEnd()
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
        console.group('[ORDER_DEBUG] Backend returned error status')
        console.log('Backend Message:', response.message)
        console.log('Backend Debug:', response.debug ?? '(no debug field)')
        console.log('Payload:', payload)
        console.groupEnd()
        submitError.value = response.message || 'Gagal membuat order'
        return false
      }
    } catch (err) {
      console.group('[ORDER_DEBUG] Exception in submitOrder')
      console.error('Error:', err)
      console.groupEnd()
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
