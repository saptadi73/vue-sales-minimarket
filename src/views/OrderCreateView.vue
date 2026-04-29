<template>
  <Layout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Buat Sales Order</h1>
          <p class="text-gray-600 mt-1">Masukkan data order dan pilih produk yang ingin dijual</p>
        </div>
      </div>

      <!-- Main Grid: Product + Form + Summary -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Product Grid (mobile first) -->
        <div class="order-1 lg:order-2 lg:col-span-6">
          <ProductGrid />
        </div>

        <!-- Detail Form -->
        <div class="order-2 lg:order-1 lg:col-span-3">
          <div class="bg-white rounded-lg shadow-md p-6 lg:sticky lg:top-32 space-y-6">
            <h2 class="text-lg font-semibold text-gray-900">Detail Order</h2>

            <form id="order-form" @submit.prevent="submitOrder" class="space-y-4">
              <!-- Customer -->
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

                <!-- Selected Customer -->
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

              <!-- Commitment Date -->
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
              </div>

              <!-- Payment Term -->
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
                  <option value="1">Cash (COD)</option>
                  <option value="2">7 Hari</option>
                  <option value="3">14 Hari</option>
                  <option value="4">30 Hari</option>
                </select>
              </div>

              <!-- Store -->
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

              <!-- Vehicle -->
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

              <!-- Note -->
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

        <!-- Summary & Actions -->
        <div class="order-3 lg:order-3 lg:col-span-3">
          <div class="bg-white rounded-lg shadow-md p-6 lg:sticky lg:top-32 space-y-4">
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
import type { Customer, CustomerSearchItem, Store, Vehicle } from '@/types'
import { notifyError, notifySuccess, notifyWarning } from '@/utils/notify'

const router = useRouter()
const orderStore = useOrderStore()

const customerAutocompleteRef = ref<InstanceType<typeof CustomerAutocomplete> | null>(null)
const stores = ref<Store[]>([])
const vehicles = ref<Vehicle[]>([])
const loadingMasterData = ref(false)
const totalDistinctProducts = computed(
  () => Array.from(orderStore.draft.items.values()).filter((p) => p.quantity > 0).length,
)

const orderForm = reactive({
  commitment_date: '',
  payment_term_id: null as number | null,
  store_id: null as number | null,
  vehicle_id: null as number | null,
  note: '',
})

function formatLocalDateTimeForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
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
    const [storesResult, vehiclesResult] = await Promise.allSettled([
      masterDataService.listStores(),
      masterDataService.listVehicles(),
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

    if (!stores.value.length || !vehicles.value.length) {
      notifyWarning(
        'Master data belum lengkap',
        'Daftar toko atau kendaraan kosong. Pastikan master data Odoo sudah tersedia.',
      )
    }
  } catch (error) {
    console.error('Failed to load master data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    notifyError(
      'Gagal memuat master data',
      `Tidak dapat mengambil data toko/kendaraan dari backend Odoo. Detail: ${errorMessage}`,
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

  // Update order metadata
  orderStore.setOrderMetadata({
    commitment_date: orderForm.commitment_date,
    payment_term_id: orderForm.payment_term_id,
    store_id: orderForm.store_id,
    vehicle_id: orderForm.vehicle_id,
    note: orderForm.note,
  })

  // Submit order
  const success = await orderStore.submitOrder(true) // isSusuOlahan = true

  if (success) {
    notifySuccess('Draft order berhasil dibuat', 'Data order sudah dikirim ke Odoo.')
    // Show success and redirect
    setTimeout(() => {
      router.push('/orders')
    }, 1500)
  } else {
    notifyError(
      'Gagal membuat draft order',
      orderStore.submitError || 'Terjadi kesalahan saat submit.',
    )
  }
}

function resetForm() {
  orderStore.resetDraft()
  customerAutocompleteRef.value?.clearInput()
  orderForm.commitment_date = ''
  orderForm.payment_term_id = null
  orderForm.store_id = null
  orderForm.vehicle_id = null
  orderForm.note = ''
}
</script>
