<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div class="flex items-center gap-2 mb-5">
      <span class="text-xl">🏆</span>
      <h3 class="text-lg font-bold text-gray-900">热销排行</h3>
    </div>

    <div class="space-y-3">
      <div
        v-for="(product, index) in products"
        :key="product.id"
        class="flex items-center gap-3 group cursor-pointer"
        @click="navigateTo(`/products/${product.id}`)"
      >
        <!-- 排名 -->
        <div
          class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          :class="[
            index === 0 ? 'bg-yellow-100 text-yellow-700' :
            index === 1 ? 'bg-gray-100 text-gray-500' :
            index === 2 ? 'bg-orange-100 text-orange-600' :
            'bg-gray-50 text-gray-400'
          ]"
        >
          {{ index + 1 }}
        </div>

        <!-- 商品信息 -->
        <div class="flex-1 min-w-0">
          <div class="text-sm text-gray-800 font-medium truncate group-hover:text-green-500 transition-colors">
            {{ product.name }}
          </div>
          <div class="text-xs text-gray-400 mt-0.5">已售 {{ formatCount(product.salesCount) }}</div>
        </div>

        <!-- 价格 -->
        <div class="text-sm font-bold text-green-500 flex-shrink-0">
          {{ fmtPrice(product.price) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductListItem } from '~/types/api'

defineProps<{
  products: ProductListItem[]
}>()

function formatCount(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return String(count)
}

function fmtPrice(price: number | string): string {
  return Number(price).toFixed(2)
}
</script>
