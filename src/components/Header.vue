<template>
  <header class="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-40">
    <div class="container mx-auto px-4 py-4 flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center overflow-hidden">
          <img :src="appIcon" alt="Sales Minimarket" class="w-full h-full object-contain" />
        </div>
        <div>
          <h1 class="text-xl font-bold">Sales Minimarket</h1>
          <p class="text-xs text-blue-100">Susu Olahan</p>
        </div>
      </div>

      <!-- User Info & Actions -->
      <div class="flex items-center gap-4">
        <div v-if="authStore.user" class="text-right hidden sm:block">
          <p class="font-medium text-sm">{{ authStore.user.name }}</p>
          <p class="text-xs text-blue-100">{{ authStore.user.company_name }}</p>
        </div>

        <button @click="toggleMenu" class="p-2 hover:bg-blue-500 rounded-lg transition">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div
        v-if="showMenu"
        @click="showMenu = false"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      />
    </div>

    <!-- Mobile Menu Content -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <div
        v-show="showMenu"
        class="fixed top-0 left-0 w-64 h-screen bg-blue-800 text-white p-4 z-50 lg:hidden overflow-y-auto"
      >
        <div class="mb-6">
          <button @click="showMenu = false" class="p-2 hover:bg-blue-700 rounded-lg float-right">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav class="space-y-2 clear-both">
          <router-link
            to="/"
            @click="showMenu = false"
            class="block px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Dashboard
          </router-link>
          <router-link
            to="/orders/create"
            @click="showMenu = false"
            class="block px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Buat Order
          </router-link>
          <router-link
            to="/orders"
            @click="showMenu = false"
            class="block px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Daftar Order
          </router-link>
          <router-link
            to="/reports"
            @click="showMenu = false"
            class="block px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Report
          </router-link>
        </nav>

        <div class="mt-8 pt-4 border-t border-blue-700">
          <button
            @click="logout"
            class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-left"
          >
            Logout
          </button>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import appIcon from '@/assets/icon/icon_minimarket2.png'

const authStore = useAuthStore()
const router = useRouter()
const showMenu = ref(false)

function toggleMenu() {
  showMenu.value = !showMenu.value
}

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>
