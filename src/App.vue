<script setup lang="ts">
import { onMounted } from 'vue'
import Toast from '@/components/Toast.vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initializeAuth()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <router-view />
    <Toast ref="toast" />
  </div>
</template>

<style scoped></style>
