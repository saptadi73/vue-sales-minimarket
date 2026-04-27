<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
      <transition-group name="slide" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'px-4 py-3 rounded-lg shadow-lg animate-fade-in pointer-events-auto',
            {
              'bg-green-50 border border-green-200 text-green-800': notification.type === 'success',
              'bg-red-50 border border-red-200 text-red-800': notification.type === 'error',
              'bg-yellow-50 border border-yellow-200 text-yellow-800':
                notification.type === 'warning',
              'bg-blue-50 border border-blue-200 text-blue-800': notification.type === 'info',
            },
          ]"
        >
          <div class="flex items-start gap-3">
            <div class="shrink-0 mt-0.5">
              <svg
                v-if="notification.type === 'success'"
                class="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else-if="notification.type === 'error'"
                class="w-5 h-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else-if="notification.type === 'warning'"
                class="w-5 h-5 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-medium text-sm">{{ notification.title }}</p>
              <p v-if="notification.message" class="text-xs mt-1 opacity-90">
                {{ notification.message }}
              </p>
            </div>
            <button
              @click="removeNotification(notification.id)"
              class="shrink-0 opacity-70 hover:opacity-100 transition"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </transition-group>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { APP_NOTIFY_EVENT } from '@/utils/notify'
import type { AppNotificationDetail } from '@/utils/notify'

export interface Notification {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

const notifications = ref<Notification[]>([])
let nextId = 1

const addNotification = (
  type: Notification['type'],
  title: string,
  message?: string,
  duration: number = 5000,
) => {
  const id = nextId++
  const notification: Notification = {
    id,
    type,
    title,
    message,
    duration,
  }

  notifications.value.push(notification)

  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id)
    }, duration)
  }

  return id
}

const removeNotification = (id: number) => {
  notifications.value = notifications.value.filter((n) => n.id !== id)
}

function handleAppNotification(event: Event) {
  const customEvent = event as CustomEvent<AppNotificationDetail>
  const detail = customEvent.detail
  if (!detail) return

  addNotification(detail.type, detail.title, detail.message, detail.duration)
}

onMounted(() => {
  window.addEventListener(APP_NOTIFY_EVENT, handleAppNotification)
})

onBeforeUnmount(() => {
  window.removeEventListener(APP_NOTIFY_EVENT, handleAppNotification)
})

// Expose untuk digunakan dari script setup
defineExpose({
  addNotification,
  removeNotification,
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(30px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
</style>
