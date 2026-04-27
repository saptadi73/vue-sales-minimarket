<template>
  <div class="space-y-4">
    <!-- Search & Filter -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari produk (nama/kode/barcode)..."
            @input="debouncedSearch"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          @click="refresh"
          :disabled="isLoading"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          <span v-if="isLoading" class="flex items-center gap-2">
            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Loading...
          </span>
          <span v-else>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Products Grid -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-100 border-b border-gray-300">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-700">Kode</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-700">Produk</th>
              <th class="px-4 py-3 text-center font-semibold text-gray-700">UoM</th>
              <th class="px-4 py-3 text-right font-semibold text-gray-700">Harga</th>
              <th class="px-4 py-3 text-center font-semibold text-gray-700">Qty</th>
              <th class="px-4 py-3 text-right font-semibold text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="product in products"
              :key="product.product_id"
              class="hover:bg-blue-50 transition"
            >
              <td class="px-4 py-3">
                <span class="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {{ product.default_code }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div>
                  <p class="font-medium text-gray-900">{{ product.name }}</p>
                  <p v-if="product.category_name" class="text-xs text-gray-500">
                    {{ product.category_name }}
                  </p>
                </div>
              </td>
              <td class="px-4 py-3 text-center text-gray-600">{{ product.uom_name }}</td>
              <td class="px-4 py-3 text-right font-semibold text-gray-900">
                {{ formatPrice(product.list_price) }}
              </td>
              <td class="px-4 py-3">
                <input
                  :value="getProductQuantity(product.product_id)"
                  @input="
                    (e) =>
                      updateQuantity(product, parseInt((e.target as HTMLInputElement).value) || 0)
                  "
                  type="number"
                  min="0"
                  step="1"
                  class="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </td>
              <td class="px-4 py-3 text-right font-semibold text-blue-600">
                {{
                  formatPrice(product.list_price * (getProductQuantity(product.product_id) || 0))
                }}
              </td>
            </tr>
            <tr v-if="products.length === 0" class="hover:bg-gray-50">
              <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                <svg
                  class="w-12 h-12 mx-auto mb-2 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                Tidak ada produk
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Summary -->
      <div
        class="bg-gray-50 border-t border-gray-200 px-4 py-4 grid grid-cols-3 gap-4 md:flex md:justify-end md:gap-8"
      >
        <div class="text-center md:text-right">
          <p class="text-xs text-gray-600">Total Items</p>
          <p class="text-lg md:text-xl font-bold text-gray-900">{{ totalItems }}</p>
        </div>
        <div class="text-center md:text-right">
          <p class="text-xs text-gray-600">Total Produk Berbeda</p>
          <p class="text-lg md:text-xl font-bold text-gray-900">{{ totalProducts }}</p>
        </div>
        <div class="text-center md:text-right">
          <p class="text-xs text-gray-600">Total Harga</p>
          <p class="text-lg md:text-xl font-bold text-blue-600">{{ formatPrice(totalAmount) }}</p>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalCount > limit"
      class="flex justify-between items-center bg-white p-4 rounded-lg shadow"
    >
      <p class="text-sm text-gray-600">
        Menampilkan {{ offset + 1 }} - {{ Math.min(offset + limit, totalCount) }} dari
        {{ totalCount }}
      </p>
      <div class="flex gap-2">
        <button
          @click="previousPage"
          :disabled="offset === 0"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          ← Sebelumnya
        </button>
        <button
          @click="nextPage"
          :disabled="offset + limit >= totalCount"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Selanjutnya →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import productService from '@/services/productService'
import { useOrderStore } from '@/stores/orderStore'
import type { Product } from '@/types'

const orderStore = useOrderStore()
const products = ref<Product[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const offset = ref(0)
const limit = ref(20)
const totalCount = ref(0)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const totalItems = computed(() => orderStore.totalItems)
const totalProducts = computed(
  () => Array.from(orderStore.draft.items.values()).filter((p) => p.quantity > 0).length,
)
const totalAmount = computed(() => orderStore.totalAmount)

function formatPrice(price: number): string {
  return productService.formatPrice(price)
}

function getProductQuantity(productId: number): number {
  const item = orderStore.draft.items.get(productId)
  return item?.quantity || 0
}

function updateQuantity(product: Product, quantity: number) {
  orderStore.setProductQuantity(product, quantity)
}

function debouncedSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  offset.value = 0
  searchTimeout = setTimeout(() => {
    loadProducts()
  }, 300)
}

async function loadProducts() {
  isLoading.value = true
  try {
    const response = await productService.getGridProducts({
      search: searchQuery.value,
      offset: offset.value,
      limit: limit.value,
      quantities: Object.fromEntries(
        Array.from(orderStore.draft.items.entries()).map(([id, item]) => [id, item.quantity]),
      ),
    })

    if (response?.status === 'success') {
      products.value = response.data.items
      totalCount.value = response.data.count
    }
  } catch (error) {
    console.error('Failed to load products:', error)
  } finally {
    isLoading.value = false
  }
}

function nextPage() {
  offset.value += limit.value
  loadProducts()
  window.scrollTo(0, 0)
}

function previousPage() {
  offset.value = Math.max(0, offset.value - limit.value)
  loadProducts()
  window.scrollTo(0, 0)
}

function refresh() {
  offset.value = 0
  loadProducts()
}

// Load initial products
loadProducts()
</script>
