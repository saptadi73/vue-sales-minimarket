<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <!-- Sidebar -->
    <aside
      class="hidden lg:flex flex-col w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white shadow-xl"
    >
      <!-- Logo -->
      <div class="p-6 flex items-center gap-3 border-b border-blue-700">
        <div class="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center overflow-hidden">
          <img :src="appIcon" alt="Sales Minimarket" class="w-full h-full object-contain" />
        </div>
        <div>
          <h1 class="font-bold text-lg">Sales</h1>
          <p class="text-xs text-blue-200">Minimarket</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-4 space-y-2">
        <router-link
          to="/"
          class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition"
          active-class="bg-blue-600 font-semibold"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 16l4-4m0 0l4 4m-4-4V5"
            />
          </svg>
          <span>Dashboard</span>
        </router-link>

        <router-link
          to="/orders/create"
          class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition"
          active-class="bg-blue-600 font-semibold"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Buat Order</span>
        </router-link>

        <router-link
          to="/orders"
          class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition"
          active-class="bg-blue-600 font-semibold"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Daftar Order</span>
        </router-link>

        <router-link
          to="/reports"
          class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition"
          active-class="bg-blue-600 font-semibold"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span>Report</span>
        </router-link>
      </nav>

      <!-- User & Logout -->
      <div class="p-4 border-t border-blue-700 space-y-2">
        <div v-if="authStore.user" class="px-4 py-2 bg-blue-700/50 rounded-lg">
          <p class="font-medium text-sm truncate">{{ authStore.user.name }}</p>
          <p class="text-xs text-blue-200 truncate">{{ authStore.user.email }}</p>
        </div>
        <button
          @click="logout"
          class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main class="flex-1 overflow-y-auto">
        <div class="container mx-auto p-4 md:p-6">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from './Header.vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import appIcon from '@/assets/icon/icon_minimarket2.png'

const authStore = useAuthStore()
const router = useRouter()

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>
