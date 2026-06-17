<template>
  <div class="bg-white rounded-2xl border border-gray-100 p-5">
    <!-- 搜索框 -->
    <div class="mb-5">
      <div class="relative">
        <input
          v-model="localKeyword"
          type="text"
          placeholder="搜索商品..."
          class="w-full rounded-lg border border-gray-300 bg-gray-50 pl-4 pr-10 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:bg-white transition-colors outline-none"
          @keyup.enter="emitFilter"
        />
        <button class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600" @click="emitFilter">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 分类筛选 -->
    <div class="mb-5">
      <h4 class="text-sm font-semibold text-gray-900 mb-3">商品分类</h4>
      <div class="space-y-1">
        <button
          :class="[
            'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
            !activeCategoryId
              ? 'bg-primary-50 text-primary-700 font-medium'
              : 'text-gray-600 hover:bg-gray-50',
          ]"
          @click="selectCategory(null)"
        >
          全部分类
        </button>
        <template v-for="cat in categories" :key="cat.id">
          <button
            :class="[
              'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
              activeCategoryId === cat.id
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50',
            ]"
            @click="selectCategory(cat.id)"
          >
            {{ cat.name }}
          </button>
          <!-- 二级分类 -->
          <button
            v-for="child in cat.children"
            :key="child.id"
            :class="[
              'w-full text-left pl-7 pr-3 py-2 rounded-lg text-sm transition-colors',
              activeCategoryId === child.id
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-gray-500 hover:bg-gray-50',
            ]"
            @click="selectCategory(child.id)"
          >
            {{ child.name }}
          </button>
        </template>
      </div>
    </div>

    <!-- 排序 -->
    <div>
      <h4 class="text-sm font-semibold text-gray-900 mb-3">排序方式</h4>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="opt in sortOptions"
          :key="opt.value"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            activeSort === opt.value
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          ]"
          @click="selectSort(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/types/api'

const props = defineProps<{
  categories: Category[]
  activeCategoryId: number | null
  activeSort: string
  keyword: string
}>()

const emit = defineEmits<{
  (e: 'filter', filter: { keyword: string; categoryId: number | null; sortBy: string; sortOrder: string }): void
}>()

const localKeyword = ref(props.keyword)

const sortOptions = [
  { label: '默认', value: 'default' },
  { label: '价格从低到高', value: 'price_asc' },
  { label: '价格从高到低', value: 'price_desc' },
  { label: '销量优先', value: 'sales' },
  { label: '最新上架', value: 'newest' },
]

function selectCategory(id: number | null) {
  emit('filter', {
    keyword: localKeyword.value,
    categoryId: id,
    sortBy: getSortBy(props.activeSort),
    sortOrder: getSortOrder(props.activeSort),
  })
}

function selectSort(value: string) {
  emit('filter', {
    keyword: localKeyword.value,
    categoryId: props.activeCategoryId,
    sortBy: getSortBy(value),
    sortOrder: getSortOrder(value),
  })
}

function emitFilter() {
  emit('filter', {
    keyword: localKeyword.value,
    categoryId: props.activeCategoryId,
    sortBy: getSortBy(props.activeSort),
    sortOrder: getSortOrder(props.activeSort),
  })
}

// 将前端排序 key 转换为后端参数
function getSortBy(sort: string): string {
  switch (sort) {
    case 'price_asc': return 'price'
    case 'price_desc': return 'price'
    case 'sales': return 'salesCount'
    case 'newest': return 'createdAt'
    default: return 'createdAt'
  }
}

function getSortOrder(sort: string): string {
  switch (sort) {
    case 'price_asc': return 'ASC'
    case 'price_desc': return 'DESC'
    case 'sales': return 'DESC'
    case 'newest': return 'DESC'
    default: return 'DESC'
  }
}
</script>
