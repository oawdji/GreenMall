<template>
  <div>
    <!-- 1. Banner 轮播 -->
    <section class="mb-8">
      <HeroBanner />
    </section>

    <!-- 2. 分类图标导航 -->
    <section class="mb-8">
      <CategoryIcons v-if="categories.length" :categories="categories" />
      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 py-12 text-center">
        <div class="text-gray-400 text-sm">分类加载中...</div>
      </div>
    </section>

    <!-- 3. 限时特价横条 -->
    <section class="mb-8">
      <FlashDealBar />
    </section>

    <!-- 4. 精选好物 -->
    <section class="mb-8">
      <ProductGrid
        title="✨ 精选好物"
        subtitle="为你精心挑选"
        :products="featuredProducts"
        more-link="/products?isFeatured=true"
      />
    </section>

    <!-- 5. 热销排行 + 新品上架 -->
    <section class="mb-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 热销排行 -->
        <div class="lg:col-span-1">
          <HotRanking :products="bestSellers" />
        </div>
        <!-- 新品上架 -->
        <div class="lg:col-span-2">
          <ProductGrid
            title="🆕 新品上架"
            subtitle="第一时间尝鲜"
            :products="newArrivals"
            :columns="3"
            more-link="/products?sortBy=createdAt&sortOrder=DESC"
          />
        </div>
      </div>
    </section>

    <!-- 6. 特色服务 -->
    <section class="mb-8">
      <ServiceBar />
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Category, ProductListItem } from '~/types/api'

definePageMeta({
  layout: 'default',
})

// ===== SSR 数据获取 =====
const { get } = useApi()

// 分类（启用的一级分类，取有子分类的前8个）
const { data: categories } = await useAsyncData('home-categories', async () => {
  try {
    const data = await get<Category[]>('/categories')
    return (data || []).filter((c: Category) => c.children?.length).slice(0, 8)
  } catch {
    return []
  }
}, { server: true })

// 精选商品 (8个)
const { data: featuredProducts } = await useAsyncData('home-featured', async () => {
  try {
    const res = await get<{ list: ProductListItem[] }>('/products', { isFeatured: 'true', limit: 8 })
    return res?.list || []
  } catch {
    return []
  }
}, { server: true })

// 热销商品 TOP 5
const { data: bestSellers } = await useAsyncData('home-bestsellers', async () => {
  try {
    const res = await get<{ list: ProductListItem[] }>('/products', { sortBy: 'salesCount', sortOrder: 'DESC', limit: 5 })
    return res?.list || []
  } catch {
    return []
  }
}, { server: true })

// 新品上架 (6个)
const { data: newArrivals } = await useAsyncData('home-newarrivals', async () => {
  try {
    const res = await get<{ list: ProductListItem[] }>('/products', { sortBy: 'createdAt', sortOrder: 'DESC', limit: 6 })
    return res?.list || []
  } catch {
    return []
  }
}, { server: true })
</script>
