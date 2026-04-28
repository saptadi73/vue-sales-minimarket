<template>
  <div class="relative">
    <input
      v-model="keyword"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @keydown.down.prevent="onArrowDown"
      @keydown.up.prevent="onArrowUp"
      @keydown.enter.prevent="onEnter"
      @keydown.esc.prevent="onEscape"
      type="text"
      placeholder="Ketik nama customer, kode, atau QR ref..."
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />

    <svg
      class="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>

    <div
      v-if="showDropdown"
      ref="dropdownRef"
      class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto"
    >
      <div v-if="isLoading" class="p-3 text-sm text-gray-600">Mencari customer...</div>
      <div v-else-if="keyword.trim().length < minChars" class="p-3 text-sm text-gray-600">
        Ketik minimal {{ minChars }} karakter
      </div>
      <div v-else-if="options.length === 0" class="p-3 text-sm text-gray-600">
        Tidak ada customer ditemukan
      </div>
      <button
        v-for="(option, index) in options"
        :key="option.id"
        :ref="(el) => setOptionRef(el, index)"
        @mouseenter="onMouseEnterOption(index)"
        @mousedown.prevent="selectOption(option)"
        type="button"
        :class="[
          'w-full text-left px-4 py-3 transition border-b border-gray-100 last:border-b-0',
          activeIndex === index ? 'bg-blue-50' : 'hover:bg-blue-50',
        ]"
      >
        <p class="font-medium text-gray-900">{{ option.name || option.text || '-' }}</p>
        <p class="text-xs text-gray-600">{{ option.text || option.ref || 'Tanpa kode' }}</p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import customerService from '@/services/customerService'
import type { CustomerSearchItem } from '@/types'

const props = withDefaults(
  defineProps<{
    minChars?: number
    limit?: number
  }>(),
  {
    minChars: 1,
    limit: 20,
  },
)

const emit = defineEmits<{
  select: [option: CustomerSearchItem]
  error: [message: string]
}>()

const keyword = ref('')
const options = ref<CustomerSearchItem[]>([])
const isLoading = ref(false)
const showDropdown = ref(false)
const activeIndex = ref(-1)
const dropdownRef = ref<HTMLElement | null>(null)
const optionRefs = ref<Array<HTMLElement | null>>([])
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function setOptionRef(el: Element | ComponentPublicInstance | null, index: number) {
  optionRefs.value[index] = el instanceof HTMLElement ? el : null
}

function onMouseEnterOption(index: number) {
  activeIndex.value = index
}

function scrollActiveIntoView() {
  const target = optionRefs.value[activeIndex.value]
  const container = dropdownRef.value

  if (!target || !container) {
    return
  }

  const targetTop = target.offsetTop
  const targetBottom = targetTop + target.offsetHeight
  const viewTop = container.scrollTop
  const viewBottom = viewTop + container.clientHeight

  if (targetTop < viewTop) {
    container.scrollTop = targetTop
    return
  }

  if (targetBottom > viewBottom) {
    container.scrollTop = targetBottom - container.clientHeight
  }
}

async function runSearch() {
  const query = keyword.value.trim()
  if (query.length < props.minChars) {
    options.value = []
    activeIndex.value = -1
    return
  }

  isLoading.value = true
  try {
    options.value = await customerService.searchCustomerAutocomplete({
      query,
      limit: props.limit,
      min_chars: props.minChars,
    })
    activeIndex.value = options.value.length > 0 ? 0 : -1
    await nextTick()
    scrollActiveIntoView()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    options.value = []
    activeIndex.value = -1
    emit('error', errorMessage)
  } finally {
    isLoading.value = false
  }
}

function onInput() {
  showDropdown.value = true

  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    runSearch()
  }, 250)
}

function onFocus() {
  showDropdown.value = true
}

function onBlur() {
  setTimeout(() => {
    showDropdown.value = false
  }, 150)
}

function onArrowDown() {
  if (!showDropdown.value) {
    showDropdown.value = true
  }

  if (options.value.length === 0) {
    return
  }

  if (activeIndex.value < options.value.length - 1) {
    activeIndex.value += 1
  } else {
    activeIndex.value = 0
  }

  scrollActiveIntoView()
}

function onArrowUp() {
  if (!showDropdown.value) {
    showDropdown.value = true
  }

  if (options.value.length === 0) {
    return
  }

  if (activeIndex.value > 0) {
    activeIndex.value -= 1
  } else {
    activeIndex.value = options.value.length - 1
  }

  scrollActiveIntoView()
}

function onEnter() {
  if (!showDropdown.value || options.value.length === 0) {
    return
  }

  const picked = options.value[activeIndex.value] || options.value[0]
  if (picked) {
    selectOption(picked)
  }
}

function onEscape() {
  showDropdown.value = false
}

function selectOption(option: CustomerSearchItem) {
  keyword.value = option.name || option.text || ''
  showDropdown.value = false
  activeIndex.value = -1
  emit('select', option)
}

function clearInput() {
  keyword.value = ''
  options.value = []
  optionRefs.value = []
  showDropdown.value = false
  activeIndex.value = -1
}

defineExpose({ clearInput })
</script>
