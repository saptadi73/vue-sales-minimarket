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

      <!-- Empty State -->
      <div class="bg-white rounded-lg shadow p-12 text-center">
        <svg
          class="w-16 h-16 mx-auto mb-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Belum Ada Sales Order</h3>
        <p class="text-gray-600 mb-6">
          Anda belum membuat sales order apapun. Mulai dengan klik tombol di atas untuk membuat
          order baru.
        </p>
        <router-link
          to="/orders/create"
          class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Buat Order Pertama Anda
        </router-link>
      </div>

      <!-- Info -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-blue-900 mb-3">💡 Informasi</h3>
        <p class="text-blue-800 text-sm">
          Fitur melihat detail dan tracking order akan segera ditambahkan. Untuk saat ini, Anda
          dapat membuat orders dan melihatnya di Odoo Sales Order.
        </p>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import Layout from '@/components/Layout.vue'
</script>
