<template>
  <div class="container-page">
    <!-- 面包屑 -->
    <nav class="text-sm text-gray-500 mb-6">
      <NuxtLink to="/" class="hover:text-primary-600 transition-colors">首页</NuxtLink>
      <span class="mx-2">/</span>
      <span class="text-gray-900">商品列表</span>
    </nav>

    <div class="flex gap-6">
      <!-- 左侧筛选栏 -->
      <aside class="hidden lg:block w-60 flex-shrink-0">
        <ProductFilter
          :categories="categories"
          :active-category-id="filters.categoryId"
          :active-sort="filters.sort"
          :keyword="filters.keyword"
          @filter="handleFilter"
        />
      </aside>

      <!-- 右侧商品区 -->
      <div class="flex-1 min-w-0">
        <!-- 移动端筛选按钮 -->
        <div class="lg:hidden mb-4 flex gap-2">
          <button
            class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            @click="showMobileFilter = true"
          >
            筛选与排序
          </button>
        </div>

        <!-- 当前筛选状态 -->
        <div v-if="filters.keyword || filters.categoryId" class="mb-4 flex items-center gap-2 flex-wrap">
          <span class="text-sm text-gray-500">当前筛选：</span>
          <span
            v-if="filters.keyword"
            class="inline-flex items-center gap-1 rounded-full bg-primary-50 text-primary-700 px-3 py-1 text-xs font-medium"
          >
            "{{ filters.keyword }}"
            <button class="hover:text-red-500" @click="clearKeyword">×</button>
          </span>
          <span
            v-if="filters.categoryId"
            class="inline-flex items-center gap-1 rounded-full bg-primary-50 text-primary-700 px-3 py-1 text-xs font-medium"
          >
            {{ selectedCategoryName }}
            <button class="hover:text-red-500" @click="clearCategory">×</button>
          </span>
        </div>

        <!-- 商品数量 -->
        <p class="text-sm text-gray-500 mb-4">
          共 <span class="font-medium text-gray-900">{{ total }}</span> 件商品
        </p>

        <!-- 加载状态 -->
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

        <!-- 商品网格 -->
        <div v-else-if="products.length > 0" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />
        </div>

        <!-- 空状态 -->
        <div v-else class="text-center py-20">
          <span class="text-5xl">🔍</span>
          <p class="text-gray-500 mt-4">没有找到匹配的商品</p>
          <p class="text-sm text-gray-400 mt-1">试试更换搜索关键词或筛选条件</p>
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
    </div>

    <!-- 移动端筛选抽屉 -->
    <AppModal v-model="showMobileFilter" title="筛选与排序" size="sm">
      <ProductFilter
        :categories="categories"
        :active-category-id="filters.categoryId"
        :active-sort="filters.sort"
        :keyword="filters.keyword"
        @filter="handleFilter; showMobileFilter = false"
      />
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { Category, Product, ProductApiParams, PaginatedData } from '~/types/api'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const router = useRouter()
const api = useApi()

// 分类数据
const { data: categoryData } = await useAsyncData('categories-tree', () =>
  api.get<Category[]>('/categories/tree'),
)
const categories = computed(() => categoryData.value || [])

// 筛选状态（从 URL query 初始化）
const filters = reactive({
  keyword: (route.query.keyword as string) || '',
  categoryId: route.query.categoryId ? Number(route.query.categoryId) : null,
  sort: (route.query.sort as string) || 'default',
})

const currentPage = ref(route.query.page ? Number(route.query.page) : 1)
const pageSize = 20

// 获取商品列表
const { data: productData, pending } = await useAsyncData(
  'products-list',
  () => {
    const params: ProductApiParams = {
      page: currentPage.value,
      limit: pageSize,
    }
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.categoryId) params.categoryId = filters.categoryId

    // 排序
    if (filters.sort !== 'default') {
      switch (filters.sort) {
        case 'price_asc': params.sortBy = 'price'; params.sortOrder = 'ASC'; break
        case 'price_desc': params.sortBy = 'price'; params.sortOrder = 'DESC'; break
        case 'sales': params.sortBy = 'salesCount'; params.sortOrder = 'DESC'; break
        case 'newest': params.sortBy = 'createdAt'; params.sortOrder = 'DESC'; break
      }
    }

    return api.get<PaginatedData<Product>>('/products', params)
  },
  { watch: [() => route.query] },
)

const products = computed(() => (productData.value as PaginatedData<Product> | null)?.list || [])
const total = computed(() => (productData.value as PaginatedData<Product> | null)?.total || 0)
const totalPages = computed(() => Math.ceil(total.value / pageSize))

// 当前选中分类名称
const selectedCategoryName = computed(() => {
  if (!filters.categoryId || !categories.value.length) return ''
  for (const cat of categories.value) {
    if (cat.id === filters.categoryId) return cat.name
    for (const child of cat.children || []) {
      if (child.id === filters.categoryId) return child.name
    }
  }
  return ''
})

const showMobileFilter = ref(false)

// 筛选变更
function handleFilter(filter: { keyword: string; categoryId: number | null; sortBy: string; sortOrder: string }) {
  const query: Record<string, unknown> = {}
  if (filter.keyword) query.keyword = filter.keyword
  if (filter.categoryId) query.categoryId = filter.categoryId
  if (filters.sort !== 'default') query.sort = filters.sort
  query.page = 1

  // 更新本地状态
  filters.keyword = filter.keyword
  filters.categoryId = filter.categoryId
  currentPage.value = 1

  router.push({ query })
}

function clearKeyword() {
  filters.keyword = ''
  handleFilter({ keyword: '', categoryId: filters.categoryId, sortBy: '', sortOrder: '' })
}

function clearCategory() {
  filters.categoryId = null
  handleFilter({ keyword: filters.keyword, categoryId: null, sortBy: '', sortOrder: '' })
}

function handlePageChange(page: number) {
  currentPage.value = page
  router.push({ query: { ...route.query, page } })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
