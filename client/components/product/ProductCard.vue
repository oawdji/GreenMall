<template>
  <div class="group bg-white rounded-card border border-gray-100 overflow-hidden shadow-card card-hover">
    <!-- 商品图片 -->
    <NuxtLink :to="`/products/${product.id}`" class="block relative aspect-[4/3] bg-gray-50 overflow-hidden">
      <img
        v-if="product.coverImage"
        :src="product.coverImage"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
        <svg class="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <!-- Featured 角标 -->
      <span
        v-if="product.isFeatured"
        class="absolute top-2 left-2 rounded-full bg-green-500 px-2 py-0.5 text-xs text-white font-medium shadow-sm"
      >
        ⭐ 精选
      </span>

      <!-- 销量角标 -->
      <span
        v-else-if="product.salesCount > 1000"
        class="absolute top-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white"
      >
        已售 {{ formatCount(product.salesCount) }}
      </span>
    </NuxtLink>

    <!-- 商品信息 -->
    <div class="p-3">
      <!-- 分类标签 -->
      <p v-if="product.category?.name" class="text-[11px] text-gray-400 mb-1">
        {{ product.category.name }}
      </p>

      <!-- 名称 -->
      <NuxtLink
        :to="`/products/${product.id}`"
        class="block text-xs font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-green-500 transition-colors mb-2"
      >
        {{ product.name }}
      </NuxtLink>

      <!-- 价格 -->
      <div class="flex items-baseline gap-1.5">
        <span class="text-[15px] font-bold text-green-500">¥{{ formatPrice(product.price) }}</span>
        <span v-if="product.salesCount > 0" class="text-[10px] text-gray-400">
          已售 {{ formatCount(product.salesCount) }}
        </span>
      </div>

      <!-- 库存提示 -->
      <p v-if="product.stock <= 10 && product.stock > 0" class="text-[11px] text-orange-500 mt-1">
        仅剩 {{ product.stock }} 件
      </p>
      <p v-else-if="product.stock === 0" class="text-[11px] text-gray-400 mt-1">
        暂时缺货
      </p>

      <!-- 额外内容 slot -->
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/api'

defineProps<{
  product: Pick<Product, 'id' | 'name' | 'price' | 'stock' | 'coverImage' | 'salesCount' | 'isFeatured'> & {
    category?: { id: number; name: string } | null
  }
}>()

function formatCount(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

function formatPrice(price: number | string): string {
  return Number(price).toFixed(2)
}
</script>
