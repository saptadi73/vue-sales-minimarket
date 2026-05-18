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
  driver_id: number | null
  driver_field: 'driver_id' | 'fleet_driver_id' | 'grt_driver_id' | 'sopir_id' | null
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

let requestUidSequence = 0

function generateRequestUid(): string {
  requestUidSequence += 1
  const now = new Date()
  const y = String(now.getFullYear())
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  const ms = String(now.getMilliseconds()).padStart(3, '0')
  const seq = String(requestUidSequence).padStart(4, '0')
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase()
  return `SO-SUBMIT-${y}${m}${d}-${hh}${mm}${ss}${ms}-${seq}-${rand}`
}

function resolveRequestUid(frontendRequestUid?: string): string {
  const trimmed = frontendRequestUid?.trim()
  if (trimmed) {
    return trimmed
  }

  return generateRequestUid()
}

function buildSubmissionFingerprint(payload: CreateOrderPayload): string {
  const normalizedLines = [...(payload.grid_lines || [])]
    .filter((line) => line.quantity > 0)
    .sort((left, right) => left.product_id - right.product_id)

  return JSON.stringify({
    partner_id: payload.partner_id || null,
    customer_qr_ref: payload.customer_qr_ref || '',
    frontend_request_uid: payload.frontend_request_uid || '',
    idempotency_key: payload.idempotency_key || '',
    commitment_date: payload.commitment_date,
    payment_term_id: payload.payment_term_id,
    business_category_id: payload.business_category_id || null,
    store_id: payload.store_id || payload.toko_id || null,
    vehicle_id: payload.delivery_vehicle_id || payload.vehicle_id || payload.mobil_id || null,
    driver_id:
      payload.driver_id ||
      payload.fleet_driver_id ||
      payload.grt_driver_id ||
      payload.sopir_id ||
      null,
    note: payload.note?.trim() || '',
    grid_lines: normalizedLines,
  })
}

function isFleetConflictMessage(message: string | undefined): boolean {
  const lower = (message || '').toLowerCase()

  return (
    lower.includes('kendaraan sudah dipakai') ||
    lower.includes('kendaraan sudah terpakai') ||
    lower.includes('jadwal keberangkatan yang sama') ||
    (lower.includes('kendaraan') && lower.includes('jadwal') && lower.includes('sama')) ||
    (lower.includes('kendaraan') && lower.includes('bentrok') && lower.includes('jadwal')) ||
    (lower.includes('armada') && lower.includes('bentrok') && lower.includes('jadwal')) ||
    lower.includes('vehicle already') ||
    (lower.includes('vehicle') && lower.includes('schedule') && lower.includes('same')) ||
    (lower.includes('vehicle') && lower.includes('schedule') && lower.includes('conflict')) ||
    (lower.includes('fleet') && lower.includes('schedule') && lower.includes('conflict'))
  )
}

function containsOrderEvidence(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false
  }

  if (Array.isArray(value)) {
    return value.some((item) => containsOrderEvidence(item))
  }

  const record = value as Record<string, unknown>

  const directOrderId = record.order_id ?? record.sale_order_id ?? record.so_id

  if (typeof directOrderId === 'number' && directOrderId > 0) {
    return true
  }

  const directOrderName = record.order_number ?? record.sale_order_name
  if (typeof directOrderName === 'string' && directOrderName.trim().length > 0) {
    return true
  }

  return Object.values(record).some((nested) => containsOrderEvidence(nested))
}

function hasOrderCreatedEvidence(response: any): boolean {
  return containsOrderEvidence(response?.data) || containsOrderEvidence(response?.debug)
}

function shouldTreatAsSoftSuccess(response: any): boolean {
  return (
    response?.status === 'error' &&
    isFleetConflictMessage(response?.message) &&
    hasOrderCreatedEvidence(response)
  )
}

export const useOrderStore = defineStore('order', () => {
  const draft = ref<OrderDraft>({
    customer: null,
    commitment_date: '',
    payment_term_id: null,
    business_category_id: null,
    store_id: null,
    vehicle_id: null,
    driver_id: null,
    driver_field: null,
    note: '',
    items: new Map(),
  })

  const isSubmitting = ref(false)
  const submitError = ref<string | null>(null)
  const submitWarning = ref<string | null>(null)
  const lastSubmittedFingerprint = ref<string | null>(null)
  const lastSubmittedAt = ref(0)
  const DUPLICATE_SUBMISSION_WINDOW_MS = 15_000

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
      driver_id: null,
      driver_field: null,
      note: '',
      items: new Map(),
    }
    submitError.value = null
    submitWarning.value = null
  }

  // Submit order ke backend
  async function submitOrder(
    isSusuOlahan: boolean = true,
    frontendRequestUid?: string,
    options?: { skipDuplicateGuard?: boolean },
  ): Promise<boolean> {
    if (isSubmitting.value) {
      submitWarning.value = 'Permintaan pembuatan order masih diproses. Tunggu sampai selesai.'
      return false
    }

    submitError.value = null
    submitWarning.value = null

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

      const effectiveRequestUid = resolveRequestUid(frontendRequestUid)

      const payload: CreateOrderPayload = {
        partner_id: draft.value.customer?.partner_id,
        customer_qr_ref: draft.value.customer?.customer_qr_ref,
        frontend_request_uid: effectiveRequestUid,
        idempotency_key: effectiveRequestUid,
        commitment_date: formatCommitmentDateForBackend(draft.value.commitment_date),
        payment_term_id: draft.value.payment_term_id || 0,
        store_id: draft.value.store_id ?? undefined,
        toko_id: draft.value.store_id ?? undefined,
        delivery_vehicle_id: draft.value.vehicle_id ?? undefined,
        vehicle_id: draft.value.vehicle_id ?? undefined,
        mobil_id: draft.value.vehicle_id ?? undefined,
        driver_id:
          draft.value.driver_field === 'driver_id' || !draft.value.driver_field
            ? (draft.value.driver_id ?? undefined)
            : undefined,
        fleet_driver_id:
          draft.value.driver_field === 'fleet_driver_id'
            ? (draft.value.driver_id ?? undefined)
            : undefined,
        grt_driver_id:
          draft.value.driver_field === 'grt_driver_id'
            ? (draft.value.driver_id ?? undefined)
            : undefined,
        sopir_id:
          draft.value.driver_field === 'sopir_id'
            ? (draft.value.driver_id ?? undefined)
            : undefined,
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
        driver_id: draft.value.driver_id,
        driver_field: draft.value.driver_field,
      })
      console.log('Payload:', payload)
      console.log('Products Debug:', productDebug)
      console.log('Unique Product Business Categories:', uniqueProductBusinessCategories)
      console.log('Defined Product Business Categories:', definedProductBusinessCategories)
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

      const fingerprint = buildSubmissionFingerprint(payload)
      const now = Date.now()
      const skipDuplicateGuard = options?.skipDuplicateGuard === true
      if (
        !skipDuplicateGuard &&
        lastSubmittedFingerprint.value === fingerprint &&
        now - lastSubmittedAt.value < DUPLICATE_SUBMISSION_WINDOW_MS
      ) {
        submitWarning.value =
          'Payload order yang sama baru saja dikirim. Tunggu beberapa detik agar tidak terjadi double sales order.'
        return false
      }

      isSubmitting.value = true
      lastSubmittedFingerprint.value = fingerprint
      lastSubmittedAt.value = now

      // Submit
      const response = isSusuOlahan
        ? await orderService.createSusuOlahanOrder(payload)
        : await orderService.createMinimarketOrder(payload)

      if (response.status === 'success' || shouldTreatAsSoftSuccess(response)) {
        const warningMessage =
          response.status === 'error'
            ? 'Order berhasil dibuat, tetapi ada catatan jadwal armada: kendaraan terdeteksi sudah dipakai pada jadwal yang sama. Mohon cek ulang booking fleet di Odoo.'
            : null

        resetDraft()

        if (warningMessage) {
          submitWarning.value = warningMessage
        }
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
    submitWarning.value = null
  }

  return {
    draft,
    isSubmitting,
    submitError,
    submitWarning,
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
