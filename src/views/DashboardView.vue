<template>
  <Layout>
    <!-- Welcome Section -->
    <div class="mb-8">
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-8">
        <h2 class="text-3xl font-bold mb-2">Selamat Datang, {{ authStore.user?.name }}!</h2>
        <p class="text-blue-100 text-lg">
          {{ getGreeting() }} - Silakan mulai membuat sales order atau lihat laporan penjualan Anda.
        </p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <router-link
        to="/orders/create"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:scale-105 transition transform"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg
              class="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">Buat Order Baru</h3>
            <p class="text-sm text-gray-600">Mulai entry penjualan minimarket</p>
          </div>
        </div>
      </router-link>

      <router-link
        to="/orders"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:scale-105 transition transform"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg
              class="w-6 h-6 text-green-600"
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
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">Daftar Order</h3>
            <p class="text-sm text-gray-600">Lihat semua sales order Anda</p>
          </div>
        </div>
      </router-link>

      <router-link
        to="/reports"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:scale-105 transition transform"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg
              class="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">Report Pengiriman</h3>
            <p class="text-sm text-gray-600">Analisis penjualan dan pengiriman</p>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- Company Info -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Informasi Perusahaan</h3>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600">Nama:</span>
            <span class="font-medium text-gray-900">{{ authStore.user?.company_name }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">User ID:</span>
            <span class="font-medium text-gray-900">{{ authStore.user?.id }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Partner ID:</span>
            <span class="font-medium text-gray-900">{{ authStore.user?.partner_id }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Email:</span>
            <span class="font-medium text-gray-900 truncate">{{ authStore.user?.email }}</span>
          </div>
        </div>
      </div>

      <!-- Features -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Fitur Aplikasi</h3>
        <ul class="space-y-3">
          <li class="flex items-center gap-2 text-gray-700">
            <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span>Entry Sales Order Cepat dengan Grid Produk</span>
          </li>
          <li class="flex items-center gap-2 text-gray-700">
            <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span>Manajemen Pelanggan Minimarket</span>
          </li>
          <li class="flex items-center gap-2 text-gray-700">
            <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span>Perhitungan Ongkir Otomatis</span>
          </li>
          <li class="flex items-center gap-2 text-gray-700">
            <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span>Report & Analytics Lengkap</span>
          </li>
          <li class="flex items-center gap-2 text-gray-700">
            <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span>Responsive Design untuk Mobile & Desktop</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Help -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-blue-900 mb-3">📖 Panduan Penggunaan</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
        <div>
          <p class="font-medium mb-2">1. Buat Sales Order</p>
          <p>
            Klik "Buat Order Baru", pilih customer, atur tanggal pengiriman dan payment term,
            kemudian input quantity untuk setiap produk.
          </p>
        </div>
        <div>
          <p class="font-medium mb-2">2. Lihat Daftar Order</p>
          <p>
            Semua sales order yang sudah dibuat akan tampil di menu "Daftar Order" dengan status dan
            detail transaksi.
          </p>
        </div>
        <div>
          <p class="font-medium mb-2">3. Ongkir Otomatis</p>
          <p>
            Untuk kategori Susu Olahan, ongkir dihitung otomatis berdasarkan wilayah customer dan
            rule yang sudah di-setup.
          </p>
        </div>
        <div>
          <p class="font-medium mb-2">4. Lihat Report</p>
          <p>
            Menu Report menampilkan laporan pengiriman, analisis penjualan per periode, toko, atau
            kendaraan.
          </p>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import Layout from '@/components/Layout.vue'

const authStore = useAuthStore()

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Siang'
  if (hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}
</script>
