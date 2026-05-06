<template>
  <Layout>
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Buat Sales Order</h1>
          <p class="text-gray-600 mt-1">Masukkan data order dan pilih produk yang ingin dijual</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="order-1 lg:col-span-6">
          <div class="bg-white rounded-lg shadow-md p-6 space-y-6">
            <h2 class="text-lg font-semibold text-gray-900">Detail Order</h2>

            <form id="order-form" @submit.prevent="submitOrder" class="space-y-4">
              <div>
                <label for="customer" class="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Customer *
                </label>
                <CustomerAutocomplete
                  ref="customerAutocompleteRef"
                  :min-chars="1"
                  :limit="20"
                  @select="selectCustomerFromAutocomplete"
                  @error="handleCustomerSearchError"
                />

                <div
                  v-if="orderStore.draft.customer"
                  class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <p class="font-medium text-blue-900">{{ orderStore.draft.customer.name }}</p>
                  <p class="text-xs text-blue-700">
                    {{ orderStore.draft.customer.ref || orderStore.draft.customer.customer_qr_ref }}
                  </p>
                  <button
                    @click="clearSelectedCustomer"
                    type="button"
                    class="text-xs text-blue-600 hover:text-blue-800 mt-1"
                  >
                    Ubah Customer
                  </button>
                </div>
              </div>

              <div>
                <label for="date" class="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Pengiriman *
                </label>
                <input
                  v-model="orderForm.commitment_date"
                  type="datetime-local"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p v-if="orderForm.commitment_date" class="mt-1 text-xs text-gray-500">
                  Format Indonesia: {{ formatCommitmentDateDisplay(orderForm.commitment_date) }}
                </p>
              </div>

              <div>
                <label for="payment-term" class="block text-sm font-medium text-gray-700 mb-2">
                  Syarat Pembayaran *
                </label>
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
                <p v-if="loadingMasterData" class="mt-1 text-xs text-gray-500">
                  Memuat syarat pembayaran dari Odoo...
                </p>
              </div>

              <div>
                <label for="store" class="block text-sm font-medium text-gray-700 mb-2">
                  Toko Pengirim *
                </label>
                <select
                  v-model.number="orderForm.store_id"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="" disabled>
                    {{ loadingMasterData ? 'Memuat toko...' : 'Pilih toko pengirim' }}
                  </option>
                  <option v-for="store in stores" :key="store.store_id" :value="store.store_id">
                    {{ store.display_name || store.name }}
                  </option>
                </select>
              </div>

              <div>
                <label for="vehicle" class="block text-sm font-medium text-gray-700 mb-2">
                  Kendaraan Pengirim *
                </label>
                <select
                  v-model.number="orderForm.vehicle_id"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="" disabled>
                    {{ loadingMasterData ? 'Memuat kendaraan...' : 'Pilih kendaraan pengirim' }}
                  </option>
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
                <label for="note" class="block text-sm font-medium text-gray-700 mb-2">
                  Catatan
                </label>
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
          <ProductGrid />

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

            <button
              form="order-form"
              type="submit"
              :disabled="orderStore.isSubmitting || !orderStore.draft.customer"
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
                Membuat Order...
              </span>
              <span v-else>✓ Buat Draft Order</span>
            </button>

            <button
              @click="resetForm"
              type="button"
              class="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Reset Form
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="showVehicleConflictConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      >
        <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900">Konfirmasi Jadwal Kendaraan</h3>
          <p class="mt-2 text-sm text-gray-700">
            {{ vehicleConflictMessage }}
          </p>
          <p class="mt-2 text-xs text-gray-500">
            Jika lanjut, sistem akan kirim ulang dengan request yang sama untuk memastikan ini benar
            skenario konfirmasi, bukan double create.
          </p>

          <div class="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              :disabled="orderStore.isSubmitting"
              @click="cancelVehicleConflictConfirm"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="orderStore.isSubmitting"
              @click="confirmVehicleConflictRetry"
              class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Ya, lanjutkan
            </button>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Layout from '@/components/Layout.vue'
import ProductGrid from '@/components/ProductGrid.vue'
import CustomerAutocomplete from '@/components/CustomerAutocomplete.vue'
import { useOrderStore } from '@/stores/orderStore'
import customerService from '@/services/customerService'
import productService from '@/services/productService'
import masterDataService from '@/services/masterDataService'
import type { Customer, CustomerSearchItem, PaymentTerm, Store, Vehicle } from '@/types'
import { notifyError, notifySuccess, notifyWarning } from '@/utils/notify'

const router = useRouter()
const orderStore = useOrderStore()

const customerAutocompleteRef = ref<InstanceType<typeof CustomerAutocomplete> | null>(null)
const stores = ref<Store[]>([])
const vehicles = ref<Vehicle[]>([])
const paymentTerms = ref<PaymentTerm[]>([])
const loadingMasterData = ref(false)
const showVehicleConflictConfirm = ref(false)
const vehicleConflictMessage = ref('')
const pendingSubmitRequestUid = ref<string | null>(null)
const totalDistinctProducts = computed(
  () => Array.from(orderStore.draft.items.values()).filter((p) => p.quantity > 0).length,
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

function resolveVehicleDriver(vehicle: Vehicle | undefined): {
  driver_id: number | null
  driver_field: 'driver_id' | 'fleet_driver_id' | 'grt_driver_id' | 'sopir_id' | null
} {
  if (!vehicle) {
    return { driver_id: null, driver_field: null }
  }

  // Prioritize driver_id because latest vehicles contract returns this as canonical driver field.
  if (vehicle.driver_id) {
    return { driver_id: vehicle.driver_id, driver_field: 'driver_id' }
  }
  if (vehicle.fleet_driver_id) {
    return { driver_id: vehicle.fleet_driver_id, driver_field: 'fleet_driver_id' }
  }
  if (vehicle.grt_driver_id) {
    return { driver_id: vehicle.grt_driver_id, driver_field: 'grt_driver_id' }
  }
  if (vehicle.sopir_id) {
    return { driver_id: vehicle.sopir_id, driver_field: 'sopir_id' }
  }

  return { driver_id: null, driver_field: null }
}

function formatLocalDateTimeForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function getDateOnly(value: string): string {
  return value.trim().slice(0, 10)
}

function formatDateStringId(dateOnly: string): string {
  const [year, month, day] = dateOnly.split('-')
  if (!year || !month || !day) return dateOnly
  return `${day}/${month}/${year}`
}

function formatCommitmentDateDisplay(value: string): string {
  const dateOnly = getDateOnly(value)
  const timePart = value.includes('T') ? value.split('T')[1] : ''
  const time = timePart ? timePart.slice(0, 5) : ''
  const formattedDate = formatDateStringId(dateOnly)
  return time ? `${formattedDate} ${time}` : formattedDate
}

function buildFrontendRequestUid(): string {
  const now = new Date()
  const y = String(now.getFullYear())
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `SO-SUSU-${y}${m}${d}-${hh}${mm}${ss}-${rand}`
}

function isVehicleConflictError(message: string | null | undefined): boolean {
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

function closeVehicleConflictConfirm() {
  showVehicleConflictConfirm.value = false
  vehicleConflictMessage.value = ''
}

function cancelVehicleConflictConfirm() {
  closeVehicleConflictConfirm()
  pendingSubmitRequestUid.value = null
  notifyWarning('Pengiriman order dibatalkan', 'Silakan ubah jadwal atau ganti kendaraan.')
}

async function confirmVehicleConflictRetry() {
  if (!pendingSubmitRequestUid.value) {
    closeVehicleConflictConfirm()
    return
  }

  const requestUid = pendingSubmitRequestUid.value
  closeVehicleConflictConfirm()
  await executeSubmit(requestUid, false)
}

async function executeSubmit(frontendRequestUid: string, allowConflictConfirm: boolean) {
  const success = await orderStore.submitOrder(true, frontendRequestUid, {
    skipDuplicateGuard: !allowConflictConfirm,
  }) // isSusuOlahan = true

  if (success) {
    pendingSubmitRequestUid.value = null
    closeVehicleConflictConfirm()

    if (orderStore.submitWarning) {
      notifyWarning('Draft order berhasil dibuat dengan catatan', orderStore.submitWarning)
    } else {
      notifySuccess('Draft order berhasil dibuat', 'Data order sudah dikirim ke Odoo.')
    }

    setTimeout(() => {
      router.push('/orders')
    }, 1500)
    return
  }

  if (orderStore.submitWarning) {
    notifyWarning('Pengiriman order dibatalkan', orderStore.submitWarning)
    return
  }

  if (allowConflictConfirm && isVehicleConflictError(orderStore.submitError)) {
    vehicleConflictMessage.value =
      orderStore.submitError ||
      'Kendaraan terdeteksi sudah dipakai pada jadwal yang sama. Lanjutkan konfirmasi?'
    showVehicleConflictConfirm.value = true
    return
  }

  pendingSubmitRequestUid.value = null
  notifyError(
    'Gagal membuat draft order',
    orderStore.submitError || 'Terjadi kesalahan saat submit.',
  )
}

onMounted(async () => {
  // Set default commitment date to tomorrow at 10:00
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)
  orderForm.commitment_date = formatLocalDateTimeForInput(tomorrow)

  await loadMasterData()
})

async function loadMasterData() {
  loadingMasterData.value = true
  try {
    const [storesResult, vehiclesResult, paymentTermsResult] = await Promise.allSettled([
      masterDataService.listStores(),
      masterDataService.listVehicles(),
      masterDataService.listPaymentTerms(),
    ])

    if (storesResult.status === 'fulfilled') {
      stores.value = storesResult.value
    } else {
      stores.value = []
      const storeError =
        storesResult.reason instanceof Error
          ? storesResult.reason.message
          : 'Gagal memuat daftar toko dari backend.'
      notifyError('Gagal memuat toko', storeError)
    }

    if (vehiclesResult.status === 'fulfilled') {
      vehicles.value = vehiclesResult.value
    } else {
      vehicles.value = []
      const vehicleError =
        vehiclesResult.reason instanceof Error
          ? vehiclesResult.reason.message
          : 'Gagal memuat daftar kendaraan dari backend.'
      notifyError('Gagal memuat kendaraan', vehicleError)
    }

    if (paymentTermsResult.status === 'fulfilled') {
      paymentTerms.value = paymentTermsResult.value
    } else {
      paymentTerms.value = []
      const paymentTermError =
        paymentTermsResult.reason instanceof Error
          ? paymentTermsResult.reason.message
          : 'Gagal memuat daftar syarat pembayaran dari backend.'
      notifyError('Gagal memuat syarat pembayaran', paymentTermError)
    }

    if (!stores.value.length || !vehicles.value.length || !paymentTerms.value.length) {
      notifyWarning(
        'Master data belum lengkap',
        'Daftar toko, kendaraan, atau syarat pembayaran kosong. Pastikan master data Odoo sudah tersedia.',
      )
    }
  } catch (error) {
    console.error('Failed to load master data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    notifyError(
      'Gagal memuat master data',
      `Tidak dapat mengambil data toko/kendaraan/syarat pembayaran dari backend Odoo. Detail: ${errorMessage}`,
    )
  } finally {
    loadingMasterData.value = false
  }
}

async function selectCustomerFromAutocomplete(option: CustomerSearchItem) {
  try {
    const resolved = await customerService.resolveCustomerFromSearch(option)

    const fallbackId = option.partner_id || option.customer_id || option.id
    const fallbackCustomer: Customer = {
      partner_id: fallbackId,
      customer_id: fallbackId,
      name: option.name || option.text || 'Customer',
      ref: option.ref || '',
      customer_qr_ref: option.customer_qr_ref || '',
      phone: '',
      mobile: '',
      email: '',
      payment_term_id: 0,
      payment_term_name: '',
    }

    const customer = resolved || fallbackCustomer
    orderStore.setCustomer(customer)

    if (customer.payment_term_id) {
      orderForm.payment_term_id = customer.payment_term_id
    }
  } catch (error) {
    console.error('Customer selection failed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    notifyError('Gagal memilih customer', `Silakan cek backend. Detail: ${errorMessage}`)
  }
}

function handleCustomerSearchError(message: string) {
  notifyError('Gagal mencari customer', `Silakan cek backend. Detail: ${message}`)
}

function clearSelectedCustomer() {
  orderStore.setCustomer(null)
  customerAutocompleteRef.value?.clearInput()
}

function formatPrice(price: number): string {
  return productService.formatPrice(price)
}

async function submitOrder() {
  if (orderStore.isSubmitting) {
    return
  }

  orderStore.clearSubmitError()

  if (!orderStore.draft.customer) {
    orderStore.submitError = 'Pilih customer terlebih dahulu'
    return
  }

  if (
    !orderForm.commitment_date ||
    !orderForm.payment_term_id ||
    !orderForm.store_id ||
    !orderForm.vehicle_id
  ) {
    orderStore.submitError = 'Isi semua field yang wajib'
    return
  }

  const selectedVehicle = vehicles.value.find((vehicle) => {
    const id = vehicle.delivery_vehicle_id || vehicle.vehicle_id || vehicle.mobil_id
    return id === orderForm.vehicle_id
  })
  const resolvedDriver = resolveVehicleDriver(selectedVehicle)
  orderForm.driver_id = resolvedDriver.driver_id
  orderForm.driver_field = resolvedDriver.driver_field

  if (!orderForm.driver_id) {
    orderStore.submitError =
      'Driver kendaraan belum tersedia. Pastikan kendaraan memiliki default driver di Fleet Odoo.'
    notifyError('Driver wajib diisi', orderStore.submitError)
    return
  }

  // Update order metadata
  const frontendRequestUid = buildFrontendRequestUid()

  orderStore.setOrderMetadata({
    commitment_date: orderForm.commitment_date,
    payment_term_id: orderForm.payment_term_id,
    store_id: orderForm.store_id,
    vehicle_id: orderForm.vehicle_id,
    driver_id: orderForm.driver_id,
    driver_field: orderForm.driver_field,
    note: orderForm.note,
  })

  pendingSubmitRequestUid.value = frontendRequestUid
  await executeSubmit(frontendRequestUid, true)
}

function resetForm() {
  closeVehicleConflictConfirm()
  pendingSubmitRequestUid.value = null
  orderStore.resetDraft()
  customerAutocompleteRef.value?.clearInput()
  orderForm.commitment_date = ''
  orderForm.payment_term_id = null
  orderForm.store_id = null
  orderForm.vehicle_id = null
  orderForm.driver_id = null
  orderForm.driver_field = null
  orderForm.note = ''
}
</script>
