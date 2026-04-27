<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center p-4"
  >
    <!-- Animated Background Elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute top-20 left-10 w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
      />
      <div
        class="absolute top-40 right-10 w-40 h-40 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
      />
      <div
        class="absolute -bottom-8 left-20 w-40 h-40 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
      />
    </div>

    <div class="relative w-full max-w-md">
      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-white text-center">
          <div
            class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <span class="text-3xl font-bold text-blue-600">SM</span>
          </div>
          <h1 class="text-2xl font-bold mb-2">Sales Minimarket</h1>
          <p class="text-blue-100">Susu Olahan Management System</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="p-8 space-y-6">
          <!-- Odoo URL -->
          <div>
            <label for="odoo-url" class="block text-sm font-medium text-gray-700 mb-2">
              Odoo URL
            </label>
            <input
              id="odoo-url"
              v-model="form.odooUrl"
              type="text"
              placeholder="e.g., localhost:8069 atau https://odoo.example.com"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <p class="text-xs text-gray-500 mt-1">URL server Odoo Anda (contoh: localhost:8069)</p>
            <div v-if="urlError" class="text-xs text-red-600 mt-1">{{ urlError }}</div>
          </div>

          <!-- Database -->
          <div>
            <label for="database" class="block text-sm font-medium text-gray-700 mb-2">
              Database
            </label>
            <input
              id="database"
              v-model="form.db"
              type="text"
              placeholder="e.g., odoo_production"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <p class="text-xs text-gray-500 mt-1">Nama database Odoo Anda</p>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email / Username
            </label>
            <input
              id="email"
              v-model="form.login"
              type="text"
              placeholder="user@example.com"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <!-- Error Message -->
          <div v-if="authStore.error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-800 flex items-start gap-2">
              <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>{{ authStore.error }}</span>
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-70 transition duration-300"
          >
            <span v-if="authStore.isLoading" class="flex items-center justify-center gap-2">
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
              Logging in...
            </span>
            <span v-else>Login</span>
          </button>

          <!-- Info -->
          <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p class="text-xs text-blue-800">
              <strong>Demo:</strong> Gunakan kredensial akun Odoo Anda untuk login.
            </p>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <p class="text-center text-white text-sm mt-6 opacity-90">Sales Minimarket System v1.0</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { validateApiUrl, getApiBaseUrl } from '@/utils/apiUrl'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  login: '',
  password: '',
  db: '',
  odooUrl: '',
})

const urlError = ref<string>('')

onMounted(() => {
  // If already logged in, redirect to dashboard
  if (authStore.isAuthenticated) {
    router.push('/')
  }

  // Load URL dari localStorage (jika user sudah pernah login)
  const savedUrl = localStorage.getItem('apiBaseUrl')
  if (savedUrl) {
    form.value.odooUrl = savedUrl
  }
})

async function handleLogin() {
  authStore.clearError()
  urlError.value = ''

  // Validate URL jika diisi
  if (form.value.odooUrl.trim()) {
    const validation = validateApiUrl(form.value.odooUrl)
    if (!validation.valid) {
      urlError.value = validation.error || 'URL tidak valid'
      return
    }
  }

  const success = await authStore.login(
    form.value.login,
    form.value.password,
    form.value.db,
    form.value.odooUrl || undefined,
  )

  if (success) {
    router.push('/')
  }
}
</script>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.3;
  }
}

.animate-pulse {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
