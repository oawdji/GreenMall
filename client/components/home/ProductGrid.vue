<template>
  <section>
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <h2 class="text-xl font-bold text-gray-900">{{ title }}</h2>
        <span v-if="subtitle" class="text-sm text-gray-400">{{ subtitle }}</span>
      </div>
      <NuxtLink
        v-if="moreLink"
        :to="moreLink"
        class="flex items-center gap-1 text-sm text-gray-400 hover:text-green-500 transition-colors"
      >
        查看更多
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>
    </div>

    <div :class="gridClass">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProductListItem } from '~/types/api'

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  products: ProductListItem[]
  moreLink?: string
  columns?: number
}>(), {
  columns: 4,
})

const gridClass = computed(() => {
  const cols = {
    3: 'grid grid-cols-2 md:grid-cols-3 gap-4',
    4: 'grid grid-cols-2 md:grid-cols-4 gap-4',
    5: 'grid grid-cols-2 md:grid-cols-5 gap-4',
  }
  return cols[props.columns as keyof typeof cols] || cols[4]
})
</script>
