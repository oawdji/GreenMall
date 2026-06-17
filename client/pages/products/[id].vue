<template>
  <div class="container-page">
    <!-- 加载状态 -->
    <div v-if="pending" class="animate-pulse">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="aspect-square bg-gray-200 rounded-2xl" />
        <div class="space-y-4">
          <div class="h-6 bg-gray-200 rounded w-3/4" />
          <div class="h-8 bg-gray-200 rounded w-1/3" />
          <div class="h-4 bg-gray-200 rounded w-1/2" />
          <div class="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="text-center py-20">
      <span class="text-5xl">😵</span>
      <p class="text-gray-500 mt-4">商品加载失败</p>
      <AppButton class="mt-4" @click="refresh()">重新加载</AppButton>
    </div>

    <!-- 商品详情 -->
    <template v-else-if="product">
      <!-- 面包屑 -->
      <nav class="text-sm text-gray-500 mb-6">
        <NuxtLink to="/" class="hover:text-primary-600 transition-colors">首页</NuxtLink>
        <span class="mx-2">/</span>
        <NuxtLink
          v-if="product.category"
          :to="`/products?categoryId=${product.category.id}`"
          class="hover:text-primary-600 transition-colors"
        >
          {{ product.category.name }}
        </NuxtLink>
        <span v-else class="mx-2">/</span>
        <span v-if="product.category" class="mx-2">/</span>
        <span class="text-gray-900 truncate">{{ product.name }}</span>
      </nav>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <!-- 左侧：图片区 -->
        <div>
          <!-- 主图 -->
          <div class="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 mb-4">
            <img
              v-if="currentImage"
              :src="currentImage"
              :alt="product.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
              <svg class="h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <!-- 缩略图列表 -->
          <div v-if="product.images && product.images.length > 0" class="flex gap-2 overflow-x-auto pb-2">
            <button
              v-for="img in product.images"
              :key="img.id"
              :class="[
                'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors',
                currentImage === img.url
                  ? 'border-primary-500'
                  : 'border-gray-200 hover:border-gray-300',
              ]"
              @click="currentImage = img.url"
            >
              <img :src="img.url" :alt="`${product.name} 图片`" class="w-full h-full object-cover" loading="lazy" />
            </button>
          </div>
        </div>

        <!-- 右侧：商品信息 -->
        <div>
          <!-- 名称 -->
          <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ product.name }}</h1>

          <!-- 副标签：分类 + 销量 -->
          <div class="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span v-if="product.category">分类：{{ product.category.name }}</span>
            <span>已售 {{ product.salesCount }}</span>
            <span>库存 {{ product.stock }}</span>
          </div>

          <!-- 价格 -->
          <div class="bg-red-50 rounded-xl p-4 mb-6">
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-bold text-red-500">¥{{ Number(product.price).toFixed(2) }}</span>
            </div>
          </div>

          <!-- 库存状态 -->
          <div class="mb-6">
            <span
              :class="[
                'inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium',
                product.stock > 10
                  ? 'bg-green-50 text-green-700'
                  : product.stock > 0
                    ? 'bg-orange-50 text-orange-700'
                    : 'bg-gray-100 text-gray-500',
              ]"
            >
              <span
                :class="[
                  'w-1.5 h-1.5 rounded-full',
                  product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-orange-500' : 'bg-gray-400',
                ]"
              />
              {{ product.stock > 10 ? '有货' : product.stock > 0 ? `仅剩 ${product.stock} 件` : '暂时缺货' }}
            </span>
          </div>

          <!-- 购买操作 -->
          <div class="flex items-center gap-4 mb-6">
            <!-- 数量选择 -->
            <div class="flex items-center border border-gray-300 rounded-lg">
              <button
                class="h-10 w-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30"
                :disabled="quantity <= 1"
                @click="quantity--"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
              <input
                v-model.number="quantity"
                class="h-10 w-14 text-center text-sm border-x border-gray-300 outline-none"
                type="number"
                min="1"
                :max="product.stock"
              />
              <button
                class="h-10 w-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30"
                :disabled="quantity >= product.stock"
                @click="quantity++"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <!-- 加入购物车 -->
            <AppButton
              size="lg"
              :disabled="product.stock <= 0"
              :loading="addingToCart"
              @click="handleAddToCart"
            >
              加入购物车
            </AppButton>

            <!-- 收藏按钮 -->
            <button
              class="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
              :class="{ 'text-red-500 border-red-300 bg-red-50': isFavorited }"
              @click="toggleFavorite"
            >
              <svg class="h-5 w-5" :fill="isFavorited ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          <!-- 描述 -->
          <div class="border-t border-gray-100 pt-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">商品详情</h3>
            <div class="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {{ product.description || '暂无商品描述' }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/api'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const api = useApi()
const auth = useAuthStore()
const toast = useToast()

// 获取商品详情
const productId = computed(() => Number(route.params.id))

const {
  data: product,
  pending,
  error,
  refresh,
} = await useAsyncData(
  `product-${productId.value}`,
  () => api.get<Product>(`/products/${productId.value}`),
)

// 图片切换
const currentImage = ref<string>('')

// 当商品数据加载后设置默认主图
watchEffect(() => {
  if (product.value) {
    currentImage.value = product.value.coverImage || product.value.images?.[0]?.url || ''
  }
})

// 数量
const quantity = ref(1)

// 加入购物车
const addingToCart = ref(false)
async function handleAddToCart() {
  if (!auth.isLoggedIn) {
    toast.info('请先登录')
    navigateTo({ path: '/auth/login', query: { redirect: route.fullPath } })
    return
  }

  if (product.value && quantity.value > product.value.stock) {
    toast.error('库存不足')
    return
  }

  addingToCart.value = true
  try {
    await api.post('/cart', {
      productId: product.value?.id,
      quantity: quantity.value,
    })
    toast.success('已添加到购物车')
  } catch (err: unknown) {
    toast.error((err as Error).message || '添加失败')
  } finally {
    addingToCart.value = false
  }
}

// 收藏切换
const isFavorited = ref(false)
async function toggleFavorite() {
  if (!auth.isLoggedIn) {
    toast.info('请先登录')
    navigateTo({ path: '/auth/login', query: { redirect: route.fullPath } })
    return
  }

  try {
    if (isFavorited.value) {
      await api.delete(`/favorites/${product.value?.id}`)
      isFavorited.value = false
      toast.success('已取消收藏')
    } else {
      await api.post('/favorites', { productId: product.value?.id })
      isFavorited.value = true
      toast.success('已收藏')
    }
  } catch (err: unknown) {
    toast.error((err as Error).message || '操作失败')
  }
}
</script>
