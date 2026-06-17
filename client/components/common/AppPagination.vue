<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-1">
    <!-- 上一页 -->
    <button
      :disabled="currentPage <= 1"
      class="flex items-center justify-center h-9 w-9 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      @click="$emit('change', currentPage - 1)"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <!-- 页码按钮 -->
    <template v-for="page in visiblePages" :key="page">
      <span v-if="page === '...'" class="px-1 text-gray-400">...</span>
      <button
        v-else
        :class="[
          'h-9 min-w-[36px] rounded-lg text-sm font-medium transition-colors',
          page === currentPage
            ? 'bg-primary-600 text-white'
            : 'text-gray-600 hover:bg-gray-100',
        ]"
        @click="$emit('change', page)"
      >
        {{ page }}
      </button>
    </template>

    <!-- 下一页 -->
    <button
      :disabled="currentPage >= totalPages"
      class="flex items-center justify-center h-9 w-9 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      @click="$emit('change', currentPage + 1)"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

defineEmits<{
  (e: 'change', page: number): void
}>()

// 计算可见页码（最多显示 7 个）
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = props.totalPages
  const current = props.currentPage

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')

    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)

    if (current < total - 2) pages.push('...')
    pages.push(total)
  }

  return pages
})
</script>
