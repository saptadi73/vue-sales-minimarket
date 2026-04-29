<template>
  <Layout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Daftar Sales Order</h1>
          <p class="text-gray-600 mt-1">Kelola semua sales order Anda</p>
        </div>
        <router-link
          to="/orders/create"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2 justify-center"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Buat Order Baru
        </router-link>
      </div>

      <!-- Filter Ringkas -->
      <div class="bg-white rounded-lg shadow p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
            <input
              v-model="filters.date_from"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
            <input
              v-model="filters.date_to"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div class="flex items-end">
            <button
              @click="loadOrders"
              :disabled="isLoading"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              <span v-if="isLoading">Memuat...</span>
              <span v-else>Muat Daftar Order</span>
            </button>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mt-3">
          <button
            @click="applyQuickFilter('today')"
            :disabled="isLoading"
            class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
          >
            Hari Ini
          </button>
          <button
            @click="applyQuickFilter('last7days')"
            :disabled="isLoading"
            class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
          >
            7 Hari
          </button>
          <button
            @click="applyQuickFilter('thisMonth')"
            :disabled="isLoading"
            class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
          >
            Bulan Ini
          </button>
          <button
            @click="applyQuickFilter('all')"
            :disabled="isLoading"
            class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
          >
            Semua
          </button>
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <p class="text-sm text-gray-600">
            Total Order:
            <span class="font-semibold text-gray-900">{{ totalOrders }}</span>
          </p>
          <p v-if="lastSourceLabel" class="text-xs text-gray-500">Sumber: {{ lastSourceLabel }}</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-100 border-b border-gray-300">
              <tr>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">No SO</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Tanggal</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Customer</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Toko</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Kendaraan</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Booking Fleet</th>
                <th class="px-4 py-3 text-right font-semibold text-gray-700">Total</th>
                <th class="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="!isLoading && orders.length === 0">
                <td colspan="8" class="px-4 py-10 text-center text-gray-500">
                  Belum ada Sales Order pada rentang tanggal ini.
                </td>
              </tr>
              <tr
                v-for="(order, idx) in orders"
                :key="orderKey(order, idx)"
                class="hover:bg-blue-50"
              >
                <td class="px-4 py-3 font-medium text-gray-900">{{ orderName(order) }}</td>
                <td class="px-4 py-3 text-gray-700">{{ formatDate(orderDate(order)) }}</td>
                <td class="px-4 py-3 text-gray-700">{{ orderCustomer(order) }}</td>
                <td class="px-4 py-3 text-gray-700">{{ order.store_name || '-' }}</td>
                <td class="px-4 py-3 text-gray-700">{{ order.vehicle_name || '-' }}</td>
                <td class="px-4 py-3 text-gray-700">
                  <div>{{ order.fleet_booking_name || '-' }}</div>
                  <div v-if="order.fleet_driver_name" class="text-xs text-gray-500">
                    Driver: {{ order.fleet_driver_name }}
                  </div>
                </td>
                <td class="px-4 py-3 text-right font-semibold text-gray-900">
                  {{ formatPrice(orderAmount(order)) }}
                </td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="inline-flex px-2 py-1 rounded-full text-xs font-semibold"
                    :class="stateBadgeClass(order.state)"
                  >
                    {{ order.state || '-' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="loadError" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-sm text-red-700">
          {{ loadError }}
        </p>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import Layout from '@/components/Layout.vue'
import orderService from '@/services/orderService'
import productService from '@/services/productService'
import { notifyWarning } from '@/utils/notify'
import type { SalesOrderListItem } from '@/types'

const isLoading = ref(false)
const orders = ref<SalesOrderListItem[]>([])
const totalOrders = ref(0)
const loadError = ref('')
const lastSourceLabel = ref('')

const filters = reactive({
  date_from: getFirstDayOfMonthString(new Date()),
  date_to: getDateString(new Date()),
})

onMounted(async () => {
  await loadOrders()
})

async function loadOrders() {
  isLoading.value = true
  loadError.value = ''

  const params = {
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
    include_lines: false,
    include_accounting: true,
    limit: 100,
    offset: 0,
  }

  try {
    const susuOlahanRes = await orderService.getSusuOlahanOrders(params)
    if (isSuccessListResponse(susuOlahanRes)) {
      applyOrders(susuOlahanRes.data?.items || [], susuOlahanRes.data?.count, 'SUSU OLAHAN')
      return
    }

    const minimarketRes = await orderService.getMinimarketOrders(params)
    if (isSuccessListResponse(minimarketRes)) {
      applyOrders(minimarketRes.data?.items || [], minimarketRes.data?.count, 'MINIMARKET')
      return
    }

    const genericRes = await orderService.getOrders(params)
    if (isSuccessListResponse(genericRes)) {
      applyOrders(genericRes.data?.items || [], genericRes.data?.count, 'GENERIC')
      return
    }

    orders.value = []
    totalOrders.value = 0
    lastSourceLabel.value = '-'
    loadError.value =
      susuOlahanRes?.message ||
      minimarketRes?.message ||
      genericRes?.message ||
      'Tidak dapat memuat daftar Sales Order. Coba refresh atau login ulang.'
  } catch (error) {
    console.error('Failed to load sales orders:', error)
    orders.value = []
    totalOrders.value = 0
    lastSourceLabel.value = '-'
    loadError.value = 'Terjadi kesalahan saat memuat daftar Sales Order.'
  } finally {
    isLoading.value = false
  }
}

function isSuccessListResponse(response: unknown): response is {
  status: 'success'
  data?: { items?: SalesOrderListItem[]; count?: number }
} {
  return Boolean(
    response &&
    typeof response === 'object' &&
    'status' in response &&
    (response as any).status === 'success',
  )
}

function applyOrders(items: SalesOrderListItem[], count: number | undefined, source: string) {
  orders.value = items
  totalOrders.value = count ?? items.length
  lastSourceLabel.value = source

  if (!items.length) {
    notifyWarning(
      'Daftar order kosong',
      'Tidak ada Sales Order pada filter saat ini. Coba ubah rentang tanggal.',
    )
  }
}

function orderKey(order: SalesOrderListItem, index: number): string {
  return String(order.order_id || order.sale_order_id || order.id || `${orderName(order)}-${index}`)
}

function orderName(order: SalesOrderListItem): string {
  return order.order_number || order.sale_order_name || order.name || '-'
}

function orderDate(order: SalesOrderListItem): string {
  return order.date_order || order.create_date || order.commitment_date || ''
}

function orderCustomer(order: SalesOrderListItem): string {
  return order.partner_name || order.customer_name || '-'
}

function orderAmount(order: SalesOrderListItem): number {
  return order.amount_total || order.total_amount || 0
}

function getDateString(date: Date): string {
  const isoString = date.toISOString()
  return isoString.split('T')[0] || ''
}

function getFirstDayOfMonthString(date: Date): string {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  return getDateString(firstDay)
}

async function applyQuickFilter(filter: 'today' | 'last7days' | 'thisMonth' | 'all') {
  const now = new Date()

  if (filter === 'today') {
    const today = getDateString(now)
    filters.date_from = today
    filters.date_to = today
  } else if (filter === 'last7days') {
    const last7 = new Date(now)
    last7.setDate(now.getDate() - 6)
    filters.date_from = getDateString(last7)
    filters.date_to = getDateString(now)
  } else if (filter === 'thisMonth') {
    filters.date_from = getFirstDayOfMonthString(now)
    filters.date_to = getDateString(now)
  } else {
    filters.date_from = ''
    filters.date_to = ''
  }

  await loadOrders()
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatPrice(price: number): string {
  return productService.formatPrice(price)
}

function stateBadgeClass(state?: string): string {
  const key = (state || '').toLowerCase()
  if (['sale', 'done', 'confirmed'].includes(key)) {
    return 'bg-green-100 text-green-700'
  }
  if (['cancel', 'cancelled'].includes(key)) {
    return 'bg-red-100 text-red-700'
  }
  if (['draft', 'sent'].includes(key)) {
    return 'bg-yellow-100 text-yellow-700'
  }
  return 'bg-gray-100 text-gray-700'
}
</script>
