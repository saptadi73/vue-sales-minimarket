<template>
  <Layout>
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Report Pengiriman</h1>
        <p class="text-gray-600 mt-1">Analisis dan laporan penjualan Anda</p>
      </div>

      <!-- Filter Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <!-- Date From -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Dari Tanggal</label>
            <input
              v-model="filters.date_from"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p v-if="filters.date_from" class="mt-1 text-xs text-gray-500">
              {{ formatDateInputValue(filters.date_from) }}
            </p>
          </div>

          <!-- Date To -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Sampai Tanggal</label>
            <input
              v-model="filters.date_to"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p v-if="filters.date_to" class="mt-1 text-xs text-gray-500">
              {{ formatDateInputValue(filters.date_to) }}
            </p>
          </div>

          <!-- Store -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Toko</label>
            <select
              v-model.number="filters.store_id"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Toko</option>
              <option v-for="store in stores" :key="store.store_id" :value="store.store_id">
                {{ store.display_name || store.name }}
              </option>
            </select>
          </div>

          <!-- Vehicle -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Kendaraan</label>
            <select
              v-model.number="filters.vehicle_id"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Kendaraan</option>
              <option
                v-for="vehicle in vehicles"
                :key="vehicle.delivery_vehicle_id || vehicle.vehicle_id"
                :value="vehicle.delivery_vehicle_id || vehicle.vehicle_id"
              >
                {{ vehicle.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="loadReport"
            :disabled="isLoading"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            <span v-if="isLoading" class="flex items-center gap-2">
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
              Loading...
            </span>
            <span v-else>Tampilkan Report</span>
          </button>
          <button
            @click="refreshNow"
            :disabled="isLoading"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:bg-gray-100"
          >
            Refresh Sekarang
          </button>
          <button
            @click="exportReport"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            📥 Export Excel
          </button>
        </div>
        <p class="mt-3 text-xs text-gray-500">
          Terakhir sinkron: {{ lastSyncedAt ? formatSyncTime(lastSyncedAt) : '-' }}
        </p>
      </div>

      <!-- Summary Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 text-sm">Total Baris</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">{{ summary.total_orders || 0 }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 text-sm">Total Quantity</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">{{ summary.total_quantity || 0 }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 text-sm">Total Penjualan</p>
          <p class="text-3xl font-bold text-blue-600 mt-2">
            {{ formatPrice(summary.total_amount || 0) }}
          </p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 text-sm">Rata-rata per Order</p>
          <p class="text-3xl font-bold text-green-600 mt-2">
            {{
              formatPrice(
                summary.total_amount && summary.total_orders
                  ? summary.total_amount / summary.total_orders
                  : 0,
              )
            }}
          </p>
        </div>
      </div>

      <!-- Report Data -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-100 border-b border-gray-300">
              <tr>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Tanggal</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">No SO</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Customer</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Toko/Wilayah</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Kendaraan</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Produk</th>
                <th class="px-4 py-3 text-right font-semibold text-gray-700">Qty</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Satuan</th>
                <th class="px-4 py-3 text-right font-semibold text-gray-700">Harga</th>
                <th class="px-4 py-3 text-right font-semibold text-gray-700">Pajak</th>
                <th class="px-4 py-3 text-right font-semibold text-gray-700">Subtotal</th>
                <th class="px-4 py-3 text-right font-semibold text-gray-700">Total</th>
                <th class="px-4 py-3 text-center font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="reportData.length === 0" class="hover:bg-gray-50">
                <td colspan="13" class="px-4 py-8 text-center text-gray-500">
                  Tidak ada data. Silakan klik "Tampilkan Report" untuk melihat laporan.
                </td>
              </tr>
              <tr
                v-for="(item, index) in reportData"
                :key="index"
                class="hover:bg-blue-50 transition"
              >
                <td class="px-4 py-3 text-gray-900">
                  {{ formatDate(item.delivery_date || item.date_order) }}
                </td>
                <td class="px-4 py-3 font-medium text-gray-900">
                  {{ item.sale_order_name || '-' }}
                </td>
                <td class="px-4 py-3 text-gray-900">{{ item.customer_name || '-' }}</td>
                <td class="px-4 py-3 text-gray-900">{{ item.store_name || '-' }}</td>
                <td class="px-4 py-3 text-gray-900">{{ item.vehicle_name || '-' }}</td>
                <td class="px-4 py-3 text-gray-900 min-w-64">
                  <div class="font-medium">{{ item.product_name || '-' }}</div>
                  <div v-if="item.product_id" class="text-xs text-gray-500">
                    ID Produk: {{ item.product_id }}
                  </div>
                </td>
                <td class="px-4 py-3 text-right text-gray-900">
                  {{ formatQuantity(item.quantity) }}
                </td>
                <td class="px-4 py-3 text-gray-900">{{ item.uom_name || '-' }}</td>
                <td class="px-4 py-3 text-right text-gray-900">
                  {{ formatPrice(item.price_unit || 0) }}
                </td>
                <td class="px-4 py-3 text-right text-gray-900">
                  {{ formatPrice(item.tax_amount || 0) }}
                </td>
                <td class="px-4 py-3 text-right text-gray-900">
                  {{ formatPrice(item.price_subtotal || 0) }}
                </td>
                <td class="px-4 py-3 text-right font-semibold text-gray-900">
                  {{ formatPrice(item.price_total || 0) }}
                </td>
                <td class="px-4 py-3 text-center">
                  <router-link
                    v-if="isFirstItemOfOrder(item, index) && canEditFromReport(item)"
                    :to="`/orders/${item.sale_order_id}/edit`"
                    class="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition"
                  >
                    ✎ Edit
                  </router-link>
                  <span v-else class="text-xs text-gray-400">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Help Info -->
      <div class="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-purple-900 mb-3">📊 Fitur Report</h3>
        <ul class="space-y-2 text-sm text-purple-800">
          <li>✓ Filter laporan berdasarkan range tanggal</li>
          <li>✓ Filter per toko dan kendaraan pengiriman</li>
          <li>✓ Ringkasan statistik penjualan</li>
          <li>✓ Export data ke Excel untuk analisis lebih lanjut</li>
          <li>✓ Tracking pengiriman produk real-time</li>
        </ul>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import Layout from '@/components/Layout.vue'
import productService from '@/services/productService'
import deliveryReportService from '@/services/deliveryReportService'
import masterDataService from '@/services/masterDataService'
import type { DeliveryReportItem, Store, Vehicle } from '@/types'
import { notifyError, notifyInfo, notifyWarning } from '@/utils/notify'

const isLoading = ref(false)
const reportData = ref<DeliveryReportItem[]>([])
const stores = ref<Store[]>([])
const vehicles = ref<Vehicle[]>([])
const lastSyncedAt = ref<Date | null>(null)
const AUTO_REFRESH_COOLDOWN_MS = 10_000
let lastAutoRefreshAt = 0
const summary = reactive({
  total_orders: 0,
  total_quantity: 0,
  total_amount: 0,
})

const filters = reactive({
  date_from: getDateString(new Date(new Date().setDate(new Date().getDate() - 30))),
  date_to: getDateString(new Date()),
  store_id: null as number | null,
  vehicle_id: null as number | null,
})

onMounted(async () => {
  window.addEventListener('focus', handleWindowFocus)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  await Promise.all([loadMasterData(), loadReport()])
})

onUnmounted(() => {
  window.removeEventListener('focus', handleWindowFocus)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

async function loadMasterData() {
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
        'Filter toko/kendaraan kosong. Pastikan data master sudah ada di Odoo.',
      )
    }
  } catch (error) {
    console.error('Failed to load report master data:', error)
    stores.value = []
    vehicles.value = []
    notifyError('Gagal memuat master data', 'Tidak dapat mengambil daftar toko dan kendaraan.')
  }
}

function getDateString(date: Date): string {
  const isoString = date.toISOString()
  return isoString.split('T')[0] || ''
}

function formatDateInputValue(value: string): string {
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return value
  return `${day}/${month}/${year}`
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return '-'
  const normalizedDate = dateString.trim().replace(' ', 'T')
  const parsedDate = new Date(normalizedDate)
  if (Number.isNaN(parsedDate.getTime())) {
    return dateString
  }

  return parsedDate.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function formatPrice(price: number): string {
  return productService.formatPrice(price)
}

function formatQuantity(quantity: number | undefined): string {
  return quantity ? new Intl.NumberFormat('id-ID').format(quantity) : '0'
}

async function loadReport() {
  if (isLoading.value) {
    return
  }

  isLoading.value = true
  try {
    const response = await deliveryReportService.getReport({
      date_from: filters.date_from,
      date_to: filters.date_to,
      store_ids: filters.store_id ? [filters.store_id] : [],
      delivery_vehicle_ids: filters.vehicle_id ? [filters.vehicle_id] : [],
      limit: 200,
      offset: 0,
    })

    if (response?.status !== 'success') {
      reportData.value = []
      summary.total_orders = 0
      summary.total_quantity = 0
      summary.total_amount = 0
      notifyError('Gagal memuat report', 'Backend mengembalikan respons yang tidak valid.')
      return
    }

    reportData.value = response.data.items || []

    const apiSummary = response.data.summary
    summary.total_orders = apiSummary?.line_count ?? reportData.value.length
    summary.total_quantity =
      apiSummary?.quantity ?? reportData.value.reduce((sum, item) => sum + (item.quantity || 0), 0)
    summary.total_amount =
      apiSummary?.amount_total ??
      reportData.value.reduce((sum, item) => sum + (item.price_total || 0), 0)

    if (!reportData.value.length) {
      notifyInfo('Data report kosong', 'Tidak ada data untuk filter yang dipilih.')
    }

    lastSyncedAt.value = new Date()
  } catch (error) {
    console.error('Failed to load delivery report:', error)
    reportData.value = []
    summary.total_orders = 0
    summary.total_quantity = 0
    summary.total_amount = 0
    notifyError('Gagal memuat report', 'Terjadi masalah saat mengambil data dari backend Odoo.')
  } finally {
    isLoading.value = false
  }
}

async function refreshNow() {
  await loadReport()
}

function handleWindowFocus() {
  void triggerAutoRefreshIfDue()
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    void triggerAutoRefreshIfDue()
  }
}

async function triggerAutoRefreshIfDue() {
  const now = Date.now()
  if (now - lastAutoRefreshAt < AUTO_REFRESH_COOLDOWN_MS) {
    return
  }

  lastAutoRefreshAt = now
  await loadReport()
}

function formatSyncTime(value: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(value)
}

function exportReport() {
  if (!reportData.value.length) {
    notifyInfo('Belum ada data', 'Tidak ada data report untuk diekspor.')
    return
  }

  // Simple export to CSV
  const headers = [
    'Tanggal',
    'No SO',
    'Customer',
    'Toko/Wilayah',
    'Kendaraan',
    'Product ID',
    'Produk',
    'Qty',
    'Satuan',
    'Harga',
    'Pajak',
    'Subtotal',
    'Total',
  ]
  const rows = reportData.value.map((item) => [
    formatDate(item.delivery_date || item.date_order),
    item.sale_order_name,
    item.customer_name,
    item.store_name,
    item.vehicle_name,
    item.product_id,
    item.product_name,
    item.quantity,
    item.uom_name,
    item.price_unit,
    item.tax_amount,
    item.price_subtotal,
    item.price_total,
  ])

  let csv = headers.join(',') + '\n'
  rows.forEach((row) => {
    csv += row.map(escapeCsvValue).join(',') + '\n'
  })

  const link = document.createElement('a')
  link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
  link.download = `report-${filters.date_from}-to-${filters.date_to}.csv`
  link.click()
}

function escapeCsvValue(value: unknown): string {
  const stringValue = value == null ? '' : String(value)
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

function isFirstItemOfOrder(item: DeliveryReportItem, index: number): boolean {
  if (index === 0) return true
  const prevItem = reportData.value[index - 1]
  return !prevItem || item.sale_order_id !== prevItem.sale_order_id
}

function canEditFromReport(item: DeliveryReportItem): boolean {
  const state = (item.state || '').toLowerCase()
  return state === 'draft' || state === 'sent'
}
</script>
