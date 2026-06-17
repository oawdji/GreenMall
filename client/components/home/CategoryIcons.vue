<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 py-6 px-4">
    <div class="flex items-center justify-between">
      <NuxtLink
        v-for="cat in categories"
        :key="cat.id"
        :to="`/products?categoryId=${cat.id}`"
        class="flex flex-col items-center gap-2 group min-w-0 flex-1"
      >
        <div class="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-2xl
                    group-hover:bg-green-100 group-hover:scale-110 transition-all duration-200">
          {{ cat.icon || '📦' }}
        </div>
        <span class="text-xs text-gray-600 group-hover:text-green-600 font-medium transition-colors text-center">
          {{ cat.name }}
        </span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/types/api'

const props = defineProps<{
  categories: Category[]
}>()
</script>
