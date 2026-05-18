<template>
  <Layout>
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Edit Sales Order</h1>
          <p v-if="loadingOrder" class="text-gray-600 mt-1">Memuat data order...</p>
          <p v-else-if="currentOrder" class="text-gray-600 mt-1">
            Ubah detail order: <span class="font-semibold">{{ currentOrder.name }}</span>
          </p>
        </div>
      </div>

      <div v-if="loadingOrder" class="bg-white rounded-lg shadow p-6 text-center">
        <svg
          class="w-8 h-8 animate-spin mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <p class="mt-2 text-gray-600">Memuat data order...</p>
      </div>

      <div v-else-if="loadError" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">{{ loadError }}</p>
        <router-link to="/orders" class="text-red-600 hover:text-red-800 text-sm mt-2 inline-block">
          ← Kembali ke daftar order
        </router-link>
      </div>

      <div v-else-if="currentOrder" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="order-1 lg:col-span-6">
          <div class="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Detail Order</h2>
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p class="text-sm">
                  <span class="text-gray-600">No SO:</span>
                  <span class="font-semibold">{{ currentOrder.name }}</span>
                </p>
                <p class="text-sm mt-1">
                  <span class="text-gray-600">Status:</span>
                  <span
                    class="inline-flex px-2 py-1 rounded text-xs font-semibold ml-1"
                    :class="stateBadgeClass(currentOrder.state)"
                  >
                    {{ formatState(currentOrder.state) }}
                  </span>
                </p>
                <p v-if="currentOrder.approval_state" class="text-sm mt-1">
                  <span class="text-gray-600">Approval:</span>
                  <span class="font-semibold">{{ currentOrder.approval_state }}</span>
                </p>
              </div>
            </div>

            <form id="order-form" @submit.prevent="submitUpdate" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                <div class="p-3 bg-gray-50 border border-gray-300 rounded-lg">
                  <p class="font-medium text-gray-900">{{ currentOrder.partner_name || 'N/A' }}</p>
                  <p class="text-xs text-gray-500">{{ currentOrder.partner_ref || '' }}</p>
                </div>
              </div>

              <div>
                <label for="date" class="block text-sm font-medium text-gray-700 mb-2"
                  >Tanggal Pengiriman *</label
                >
                <input
                  v-model="orderForm.commitment_date"
                  type="datetime-local"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p v-if="orderForm.commitment_date" class="mt-1 text-xs text-gray-500">
                  {{ formatCommitmentDateDisplay(orderForm.commitment_date) }}
                </p>
              </div>

              <div>
                <label for="payment-term" class="block text-sm font-medium text-gray-700 mb-2"
                  >Syarat Pembayaran *</label
                >
                <select
                  v-model.number="orderForm.payment_term_id"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="" disabled>Pilih syarat pembayaran</option>
                  <option
                    v-for="paymentTerm in paymentTerms"
                    :key="paymentTerm.payment_term_id"
                    :value="paymentTerm.payment_term_id"
                  >
                    {{ paymentTerm.name }}
                  </option>
                </select>
              </div>

              <div>
                <label for="store" class="block text-sm font-medium text-gray-700 mb-2"
                  >Toko Pengirim *</label
                >
                <select
                  v-model.number="orderForm.store_id"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="" disabled>Pilih toko pengirim</option>
                  <option v-for="store in stores" :key="store.store_id" :value="store.store_id">
                    {{ store.display_name || store.name }}
                  </option>
                </select>
              </div>

              <div>
                <label for="vehicle" class="block text-sm font-medium text-gray-700 mb-2"
                  >Kendaraan Pengirim *</label
                >
                <select
                  v-model.number="orderForm.vehicle_id"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="" disabled>Pilih kendaraan pengirim</option>
                  <option
                    v-for="vehicle in vehicles"
                    :key="vehicle.delivery_vehicle_id || vehicle.vehicle_id"
                    :value="vehicle.delivery_vehicle_id || vehicle.vehicle_id"
                  >
                    {{ vehicle.name }}
                  </option>
                </select>
              </div>

              <div>
                <label for="note" class="block text-sm font-medium text-gray-700 mb-2"
                  >Catatan</label
                >
                <textarea
                  v-model="orderForm.note"
                  placeholder="Tambahkan catatan jika diperlukan"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="3"
                />
              </div>
            </form>
          </div>
        </div>

        <div class="order-2 lg:col-span-6 space-y-6">
          <ProductGrid :isEditMode="true" />

          <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 class="text-lg font-semibold text-gray-900">Ringkasan Order</h2>

            <div class="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Total Items:</span>
                <span class="font-semibold text-gray-900">{{ orderStore.totalItems }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Produk Berbeda:</span>
                <span class="font-semibold text-gray-900">{{ totalDistinctProducts }}</span>
              </div>
              <div class="border-t border-gray-300 pt-2 flex justify-between">
                <span class="text-gray-700 font-medium">Total Harga:</span>
                <span class="font-bold text-blue-600">{{
                  formatPrice(orderStore.totalAmount)
                }}</span>
              </div>
            </div>

            <div
              v-if="orderStore.submitError"
              class="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p class="text-sm text-red-800">{{ orderStore.submitError }}</p>
            </div>

            <div class="flex flex-col gap-3">
              <button
                form="order-form"
                type="submit"
                :disabled="orderStore.isSubmitting || !canEdit"
                class="w-full px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <span v-if="orderStore.isSubmitting" class="flex items-center justify-center gap-2">
                  <svg
                    class="w-4 h-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Mengupdate Order...
                </span>
                <span v-else>✎ Update Order</span>
              </button>

              <button
                v-if="canConfirm"
                @click="submitConfirm"
                type="button"
                :disabled="orderStore.isSubmitting"
                class="w-full px-4 py-3 bg-linear-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <span v-if="orderStore.isSubmitting" class="flex items-center justify-center gap-2">
                  <svg
                    class="w-4 h-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Mengkonfirmasi Order...
                </span>
                <span v-else>✓ Confirm Sales Order</span>
              </button>

              <router-link
                to="/orders"
                class="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition text-center"
              >
                ← Kembali ke Daftar
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Layout from '@/components/Layout.vue'
import ProductGrid from '@/components/ProductGrid.vue'
import { useOrderStore } from '@/stores/orderStore'
import productService from '@/services/productService'
import masterDataService from '@/services/masterDataService'
import orderService from '@/services/orderService'
import type { Store, Vehicle, PaymentTerm } from '@/types'
import { notifyError, notifySuccess, notifyWarning } from '@/utils/notify'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()

const saleOrderId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? parseInt(id, 10) : null
})

const stores = ref<Store[]>([])
const vehicles = ref<Vehicle[]>([])
const paymentTerms = ref<PaymentTerm[]>([])
const currentOrder = ref<any>(null)
const loadingOrder = ref(true)
const loadError = ref<string | null>(null)

const totalDistinctProducts = computed(
  () => Array.from(orderStore.draft.items.values()).filter((p) => p.quantity > 0).length,
)

const canEdit = computed(
  () =>
    currentOrder.value &&
    (typeof currentOrder.value.can_edit === 'boolean'
      ? currentOrder.value.can_edit
      : currentOrder.value.state === 'draft' || currentOrder.value.state === 'sent'),
)

const canConfirm = computed(
  () =>
    currentOrder.value &&
    (typeof currentOrder.value.can_confirm === 'boolean'
      ? currentOrder.value.can_confirm
      : canEdit.value &&
        (currentOrder.value.state === 'draft' || currentOrder.value.state === 'sent')),
)

const orderForm = reactive({
  commitment_date: '',
  payment_term_id: null as number | null,
  store_id: null as number | null,
  vehicle_id: null as number | null,
  driver_id: null as number | null,
  driver_field: null as 'driver_id' | 'fleet_driver_id' | 'grt_driver_id' | 'sopir_id' | null,
  note: '',
})

function formatPrice(price: number): string {
  return productService.formatPrice(price)
}

function formatState(state: string): string {
  const stateMap: Record<string, string> = {
    draft: 'Draft',
    sent: 'Sent',
    sale: 'Sale',
    done: 'Done',
    cancel: 'Cancel',
  }
  return stateMap[state] || state
}

function stateBadgeClass(state: string): string {
  const classMap: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-blue-100 text-blue-800',
    sale: 'bg-green-100 text-green-800',
    done: 'bg-gray-100 text-gray-800',
    cancel: 'bg-red-100 text-red-800',
  }
  return classMap[state] || 'bg-gray-100 text-gray-800'
}

function formatCommitmentDateDisplay(value: string): string {
  const dateOnly = value.trim().slice(0, 10)
  const timePart = value.includes('T') ? value.split('T')[1] : ''
  const time = timePart ? timePart.slice(0, 5) : ''
  const [year, month, day] = dateOnly.split('-')
  if (!year || !month || !day) return value
  const formattedDate = `${day}/${month}/${year}`
  return time ? `${formattedDate} ${time}` : formattedDate
}

function formatLocalDateTimeForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function extractNumericId(value: unknown): number | null {
  if (Array.isArray(value)) {
    return typeof value[0] === 'number' ? value[0] : null
  }

  return typeof value === 'number' ? value : null
}

function extractOrderDetail(response: any): any | null {
  const data = response?.data
  if (!data || typeof data !== 'object') {
    return null
  }

  if (data.order && typeof data.order === 'object') {
    return data.order
  }

  return data
}

function extractOrderLines(orderDetail: any): any[] {
  if (Array.isArray(orderDetail?.order_line)) {
    return orderDetail.order_line
  }
  if (Array.isArray(orderDetail?.lines)) {
    return orderDetail.lines
  }
  if (Array.isArray(orderDetail?.grid_lines)) {
    return orderDetail.grid_lines
  }

  return []
}

function extractGridItems(orderDetail: any): any[] {
  if (Array.isArray(orderDetail?.grid_items)) {
    return orderDetail.grid_items
  }
  if (Array.isArray(orderDetail?.items)) {
    return orderDetail.items
  }
  if (Array.isArray(orderDetail?.products)) {
    return orderDetail.products
  }

  return []
}

function parseNumericQuantity(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value.trim().replace(',', '.')
    const parsed = Number(normalized)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return 0
}

function extractLineQuantity(line: any): number {
  return Math.max(
    parseNumericQuantity(line?.qty_ordered),
    parseNumericQuantity(line?.quantity),
    parseNumericQuantity(line?.qty),
    parseNumericQuantity(line?.product_uom_qty),
  )
}

async function loadOrderData() {
  if (!saleOrderId.value) {
    loadError.value = 'ID order tidak valid'
    loadingOrder.value = false
    return
  }

  try {
    loadingOrder.value = true
    loadError.value = null

    // Remove stale items from previous page before hydrating current order.
    orderStore.clearItems()

    // Fetch order detail from backend
    const response = await orderService.getOrderDetail(saleOrderId.value)

    if (!response || response.status !== 'success') {
      throw new Error(response?.message || 'Gagal memuat detail order')
    }

    const orderDetail = extractOrderDetail(response)
    if (!orderDetail) {
      throw new Error('Format detail order tidak valid')
    }

    const partnerId =
      extractNumericId(orderDetail.partner_id) ||
      extractNumericId(orderDetail.customer_id) ||
      (typeof orderDetail.partner_id === 'number' ? orderDetail.partner_id : null) ||
      (typeof orderDetail.customer_id === 'number' ? orderDetail.customer_id : null)

    if (!partnerId) {
      throw new Error('Data customer order tidak ditemukan')
    }

    currentOrder.value = {
      ...orderDetail,
      partner_id: partnerId,
      partner_name: orderDetail.partner_name || orderDetail.customer_name || '',
      partner_ref: orderDetail.partner_ref || orderDetail.ref || '',
      customer_qr_ref: orderDetail.customer_qr_ref || '',
    }

    // Initialize order store with existing data
    orderStore.setCustomer({
      partner_id: currentOrder.value.partner_id,
      customer_id: currentOrder.value.partner_id,
      name: currentOrder.value.partner_name,
      ref: currentOrder.value.partner_ref || '',
      customer_qr_ref: currentOrder.value.customer_qr_ref || '',
      phone: '',
      mobile: '',
      email: '',
      payment_term_id: 0,
      payment_term_name: '',
    })

    // Load existing lines into order store
    const detailGridItems = extractGridItems(currentOrder.value)
    if (detailGridItems.length > 0) {
      detailGridItems.forEach((item: any) => {
        const productId =
          extractNumericId(item.product_id) ||
          (typeof item.product_id === 'number' ? item.product_id : null)
        const quantity = extractLineQuantity(item)

        if (productId && quantity > 0) {
          orderStore.setProductQuantity(
            {
              product_id: productId,
              default_code: item.default_code || item.product_code || '',
              barcode: item.barcode || '',
              name: item.name || item.product_name || '',
              list_price:
                parseNumericQuantity(item.list_price) || parseNumericQuantity(item.price_unit),
              uom_name: item.uom_name || item.product_uom?.name || 'Unit',
              category_name: item.category_name || '',
              business_category_id: parseNumericQuantity(item.business_category_id),
              business_category_name: item.business_category_name || '',
            },
            quantity,
          )
        }
      })
    }

    const existingLines = extractOrderLines(currentOrder.value)
    if (existingLines.length > 0) {
      existingLines.forEach((line: any) => {
        const productId =
          extractNumericId(line.product_id) ||
          (typeof line.product_id === 'number' ? line.product_id : null)
        const quantity = extractLineQuantity(line)

        if (productId && quantity > 0) {
          orderStore.setProductQuantity(
            {
              product_id: productId,
              default_code: line.product_code || '',
              barcode: '',
              name: line.name || line.product_name || '',
              list_price: line.price_unit || 0,
              uom_name: line.product_uom?.name || line.uom_name || 'Unit',
              category_name: '',
              business_category_id: 0,
              business_category_name: '',
            },
            quantity,
          )
        }
      })
    }

    if (currentOrder.value.quantities && typeof currentOrder.value.quantities === 'object') {
      Object.entries(currentOrder.value.quantities).forEach(([productIdKey, rawQuantity]) => {
        const productId = Number(productIdKey)
        const quantity = parseNumericQuantity(rawQuantity)

        if (Number.isFinite(productId) && productId > 0 && quantity > 0) {
          const existingItem = orderStore.draft.items.get(productId)

          orderStore.setProductQuantity(
            existingItem || {
              product_id: productId,
              default_code: '',
              barcode: '',
              name: '',
              list_price: 0,
              uom_name: 'Unit',
              category_name: '',
              business_category_id: 0,
              business_category_name: '',
            },
            quantity,
          )
        }
      })
    }

    // Populate form from current order
    orderForm.commitment_date = currentOrder.value.commitment_date
      ? formatLocalDateTimeForInput(new Date(currentOrder.value.commitment_date))
      : ''
    orderForm.payment_term_id = extractNumericId(currentOrder.value.payment_term_id)
    orderForm.store_id = extractNumericId(currentOrder.value.store_id)
    orderForm.vehicle_id =
      extractNumericId(currentOrder.value.delivery_vehicle_id) ||
      extractNumericId(currentOrder.value.vehicle_id)
    orderForm.note = currentOrder.value.note || ''
  } catch (error) {
    console.error('Failed to load order detail:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    loadError.value = `Gagal memuat data order. Detail: ${errorMessage}`
  } finally {
    loadingOrder.value = false
  }
}

async function loadMasterData() {
  try {
    const [storesResult, vehiclesResult, paymentTermsResult] = await Promise.allSettled([
      masterDataService.listStores(),
      masterDataService.listVehicles(),
      masterDataService.listPaymentTerms(),
    ])

    if (storesResult.status === 'fulfilled') {
      stores.value = storesResult.value
    }

    if (vehiclesResult.status === 'fulfilled') {
      vehicles.value = vehiclesResult.value
    }

    if (paymentTermsResult.status === 'fulfilled') {
      paymentTerms.value = paymentTermsResult.value
    }
  } catch (error) {
    console.error('Failed to load master data:', error)
  }
}

async function submitUpdate() {
  if (orderStore.isSubmitting || !canEdit.value || !saleOrderId.value) {
    return
  }

  orderStore.clearSubmitError()

  if (
    !orderForm.commitment_date ||
    !orderForm.payment_term_id ||
    !orderForm.store_id ||
    !orderForm.vehicle_id
  ) {
    orderStore.submitError = 'Isi semua field yang wajib'
    return
  }

  try {
    orderStore.isSubmitting = true

    // Build quantities map
    const quantities: Record<string, number> = {}
    orderStore.draft.items.forEach((item) => {
      quantities[String(item.product_id)] = item.quantity
    })

    // Get selected vehicle for driver extraction
    const selectedVehicle = vehicles.value.find((v) => {
      const id = v.delivery_vehicle_id || v.vehicle_id || v.mobil_id
      return id === orderForm.vehicle_id
    })
    const driverId = selectedVehicle?.fleet_driver_id || selectedVehicle?.driver_id || null

    // Generate frontend request UID for tracking & idempotency
    const frontendRequestUid = `SO-EDIT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    // Call update order endpoint
    const response = await orderService.updateOrder(
      saleOrderId.value,
      {
        partner_id: currentOrder.value.partner_id,
        customer_qr_ref: currentOrder.value.customer_qr_ref || '',
        frontend_request_uid: frontendRequestUid,
        commitment_date: orderForm.commitment_date.replace('T', ' '),
        payment_term_id: orderForm.payment_term_id,
        store_id: orderForm.store_id,
        vehicle_id: orderForm.vehicle_id,
        delivery_vehicle_id: orderForm.vehicle_id,
        fleet_driver_id: driverId,
        note: orderForm.note,
        quantities,
      },
      {
        endpoint: currentOrder.value.update_endpoint,
        preferredScope: 'susu-olahan',
      },
    )

    if (!response || response.status !== 'success') {
      throw new Error(response?.message || 'Gagal update order')
    }

    notifySuccess('Order berhasil diupdate', 'Data order telah diperbarui.')

    setTimeout(() => {
      router.push('/orders')
    }, 1500)
  } catch (error) {
    console.error('Failed to update order:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    orderStore.submitError = `Gagal update order. Detail: ${errorMessage}`
    notifyError('Gagal update order', errorMessage)
  } finally {
    orderStore.isSubmitting = false
  }
}

async function submitConfirm() {
  if (orderStore.isSubmitting || !canConfirm.value || !saleOrderId.value) {
    return
  }

  if (!confirm('Apakah Anda yakin ingin confirm Sales Order ini?')) {
    return
  }

  try {
    orderStore.isSubmitting = true

    const response = await orderService.confirmOrder(saleOrderId.value, {
      endpoint: currentOrder.value.confirm_endpoint,
      preferredScope: 'susu-olahan',
    })

    if (!response || response.status !== 'success') {
      throw new Error(response?.message || 'Gagal confirm order')
    }

    notifySuccess('Order berhasil dikonfirmasi', 'Sales Order telah dikonfirmasi.')

    setTimeout(() => {
      router.push('/orders')
    }, 1500)
  } catch (error) {
    console.error('Failed to confirm order:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    orderStore.submitError = `Gagal confirm order. Detail: ${errorMessage}`
    notifyError('Gagal confirm order', errorMessage)
  } finally {
    orderStore.isSubmitting = false
  }
}

onMounted(async () => {
  await Promise.all([loadOrderData(), loadMasterData()])
})
</script>
