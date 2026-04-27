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

      <!-- Main Grid: Order Form + Product Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Order Form -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-md p-6 sticky top-32 space-y-6">
            <h2 class="text-lg font-semibold text-gray-900">Detail Order</h2>

            <form @submit.prevent="submitOrder" class="space-y-4">
              <!-- Customer -->
              <div>
                <label for="customer" class="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Customer *
                </label>
                <div class="relative">
                  <input
                    v-model="customerSearch"
                    @input="searchCustomers"
                    @focus="showCustomerDropdown = true"
                    @blur="hideCustomerDropdown"
                    type="text"
                    placeholder="Cari customer..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg
                    v-if="!orderStore.draft.customer"
                    class="absolute right-3 top-2.5 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                <!-- Dropdown Results -->
                <div
                  v-if="showCustomerDropdown && (customers.length > 0 || customerSearch)"
                  class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto"
                >
                  <div v-if="customers.length === 0" class="p-4 text-gray-600 text-sm">
                    Tidak ada customer ditemukan
                  </div>
                  <button
                    v-for="customer in customers"
                    :key="customer.customer_id"
                    @click="selectCustomer(customer)"
                    type="button"
                    class="w-full text-left px-4 py-3 hover:bg-blue-50 transition border-b border-gray-100 last:border-b-0"
                  >
                    <p class="font-medium text-gray-900">{{ customer.name }}</p>
                    <p class="text-xs text-gray-600">
                      {{ customer.ref }} • {{ customer.shipping_wilayah_name }}
                    </p>
                  </button>
                </div>

                <!-- Selected Customer -->
                <div
                  v-if="orderStore.draft.customer"
                  class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <p class="font-medium text-blue-900">{{ orderStore.draft.customer.name }}</p>
                  <p class="text-xs text-blue-700">{{ orderStore.draft.customer.ref }}</p>
                  <button
                    @click="orderStore.setCustomer(null)"
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

              <!-- Team Sales -->
              <div>
                <label for="team" class="block text-sm font-medium text-gray-700 mb-2">
                  Team Sales *
                </label>
                <select
                  v-model.number="orderForm.team_id"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="" disabled>Pilih team sales</option>
                  <option value="1">Team A</option>
                  <option value="2">Team B</option>
                  <option value="3">Team C</option>
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

              <!-- Sale Order Type -->
              <div>
                <label for="type" class="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Order
                </label>
                <select
                  v-model="orderForm.sale_order_type"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="reguler">Reguler</option>
                  <option value="kering">Kering</option>
                  <option value="partus">Partus</option>
                  <option value="silase">Silase</option>
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

              <!-- Summary -->
              <div class="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Total Items:</span>
                  <span class="font-semibold text-gray-900">{{ orderStore.totalItems }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Produk Berbeda:</span>
                  <span class="font-semibold text-gray-900">
                    {{
                      Array.from(orderStore.draft.items.values()).filter((p) => p.quantity > 0)
                        .length
                    }}
                  </span>
                </div>
                <div class="border-t border-gray-300 pt-2 flex justify-between">
                  <span class="text-gray-700 font-medium">Total Harga:</span>
                  <span class="font-bold text-blue-600">{{
                    formatPrice(orderStore.totalAmount)
                  }}</span>
                </div>
              </div>

              <!-- Error Message -->
              <div
                v-if="orderStore.submitError"
                class="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p class="text-sm text-red-800">{{ orderStore.submitError }}</p>
              </div>

              <!-- Submit Button -->
              <button
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

              <!-- Clear Button -->
              <button
                @click="resetForm"
                type="button"
                class="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Reset Form
              </button>
            </form>
          </div>
        </div>

        <!-- Right: Product Grid -->
        <div class="lg:col-span-2">
          <ProductGrid />
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Layout from '@/components/Layout.vue'
import ProductGrid from '@/components/ProductGrid.vue'
import { useOrderStore } from '@/stores/orderStore'
import customerService from '@/services/customerService'
import productService from '@/services/productService'
import masterDataService from '@/services/masterDataService'
import type { Customer, Store, Vehicle } from '@/types'
import { notifyError, notifySuccess, notifyWarning } from '@/utils/notify'

const router = useRouter()
const orderStore = useOrderStore()

const customerSearch = ref('')
const customers = ref<Customer[]>([])
const showCustomerDropdown = ref(false)
const stores = ref<Store[]>([])
const vehicles = ref<Vehicle[]>([])
const loadingMasterData = ref(false)

const orderForm = reactive({
  commitment_date: '',
  payment_term_id: null as number | null,
  team_id: null as number | null,
  store_id: null as number | null,
  vehicle_id: null as number | null,
  sale_order_type: 'reguler' as const,
  note: '',
})

onMounted(async () => {
  // Set default commitment date to tomorrow at 10:00
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)
  orderForm.commitment_date = tomorrow.toISOString().slice(0, 16)

  await loadMasterData()
})

async function loadMasterData() {
  loadingMasterData.value = true
  try {
    const [storesList, vehiclesList] = await Promise.all([
      masterDataService.listStores(),
      masterDataService.listVehicles(),
    ])

    stores.value = storesList
    vehicles.value = vehiclesList

    if (!storesList.length || !vehiclesList.length) {
      notifyWarning(
        'Master data belum lengkap',
        'Daftar toko atau kendaraan kosong. Pastikan master data Odoo sudah tersedia.',
      )
    }
  } catch (error) {
    console.error('Failed to load master data:', error)
    notifyError(
      'Gagal memuat master data',
      'Tidak dapat mengambil data toko/kendaraan dari backend Odoo.',
    )
  } finally {
    loadingMasterData.value = false
  }
}

async function searchCustomers() {
  if (customerSearch.value.length < 2) {
    customers.value = []
    return
  }

  try {
    customers.value = await customerService.searchCustomers(customerSearch.value, 10)
  } catch (error) {
    console.error('Customer search failed:', error)
    customers.value = []
    notifyError('Gagal mencari customer', 'Silakan cek koneksi ke backend lalu coba lagi.')
  }
}

function selectCustomer(customer: Customer) {
  orderStore.setCustomer(customer)
  customerSearch.value = customer.name
  orderForm.payment_term_id = customer.payment_term_id || orderForm.payment_term_id
  showCustomerDropdown.value = false
}

function hideCustomerDropdown() {
  setTimeout(() => {
    showCustomerDropdown.value = false
  }, 200)
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
    !orderForm.team_id ||
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
    team_id: orderForm.team_id,
    store_id: orderForm.store_id,
    vehicle_id: orderForm.vehicle_id,
    sale_order_type: orderForm.sale_order_type,
    note: orderForm.note,
    business_category_id: 2, // SUSU OLAHAN
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
    notifyError('Gagal membuat draft order', orderStore.submitError || 'Terjadi kesalahan saat submit.')
  }
}

function resetForm() {
  orderStore.resetDraft()
  customerSearch.value = ''
  customers.value = []
  orderForm.commitment_date = ''
  orderForm.payment_term_id = null
  orderForm.team_id = null
  orderForm.store_id = null
  orderForm.vehicle_id = null
  orderForm.sale_order_type = 'reguler'
  orderForm.note = ''
}
</script>
