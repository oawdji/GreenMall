<template>
  <div class="container-page">
    <!-- 面包屑 -->
    <nav class="text-sm text-gray-500 mb-6">
      <NuxtLink to="/" class="hover:text-primary-600 transition-colors">首页</NuxtLink>
      <span class="mx-2">/</span>
      <NuxtLink to="/user" class="hover:text-primary-600 transition-colors">个人中心</NuxtLink>
      <span class="mx-2">/</span>
      <span class="text-gray-900">我的收藏</span>
    </nav>

    <h1 class="text-2xl font-bold text-gray-900 mb-6">我的收藏</h1>

    <!-- 加载 -->
    <div v-if="pending" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      <div v-for="i in 8" :key="i" class="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
        <div class="aspect-square bg-gray-200" />
        <div class="p-4 space-y-2">
          <div class="h-3 bg-gray-200 rounded w-1/2" />
          <div class="h-4 bg-gray-200 rounded" />
          <div class="h-5 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="favorites.length === 0" class="text-center py-20">
      <span class="text-5xl">❤️</span>
      <p class="text-gray-500 mt-4">还没有收藏任何商品</p>
      <AppButton class="mt-4" @click="navigateTo('/products')">去逛逛</AppButton>
    </div>

    <!-- 收藏网格 -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      <ProductCard
        v-for="fav in favorites"
        :key="fav.id"
        :product="fav.product"
      >
        <button
          class="mt-3 text-sm text-red-400 hover:text-red-600 transition-colors"
          @click.stop="handleUnlike(fav)"
        >
          取消收藏
        </button>
      </ProductCard>
    </div>

    <!-- 分页 -->
    <div class="mt-8">
      <AppPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product, PaginatedData } from '~/types/api'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const toast = useToast()

const currentPage = ref(route.query.page ? Number(route.query.page) : 1)
const pageSize = 20

interface FavoriteItem {
  id: number
  product: Product
}

const {
  data: favData,
  pending,
  refresh,
} = await useAsyncData(
  'favorites-list',
  () => api.get<PaginatedData<FavoriteItem>>('/favorites', { page: currentPage.value, pageSize }),
  { watch: [() => route.query] },
)

const favorites = computed(() => (favData.value as PaginatedData<FavoriteItem> | null)?.list || [])
const total = computed(() => (favData.value as PaginatedData<FavoriteItem> | null)?.total || 0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

function handlePageChange(page: number) {
  currentPage.value = page
  router.push({ query: { ...route.query, page } })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleUnlike(fav: FavoriteItem) {
  try {
    await api.delete(`/favorites/${fav.id}`)
    toast.success('已取消收藏')
    refresh()
  } catch (err: unknown) {
    toast.error((err as Error).message || '操作失败')
  }
}
</script>
