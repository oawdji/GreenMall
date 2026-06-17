<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">商品管理</h2>
      <AppButton size="sm" @click="openCreate">新增商品</AppButton>
    </div>

    <!-- 搜索 -->
    <div class="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex items-center gap-3">
      <input
        v-model.trim="keyword"
        class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
        placeholder="搜索商品名称..."
        @keyup.enter="handleSearch"
      />
      <AppButton size="sm" variant="secondary" @click="handleSearch">搜索</AppButton>
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-left text-gray-600">
              <th class="px-5 py-3 font-medium">ID</th>
              <th class="px-5 py-3 font-medium">商品</th>
              <th class="px-5 py-3 font-medium">价格</th>
              <th class="px-5 py-3 font-medium">库存</th>
              <th class="px-5 py-3 font-medium">销量</th>
              <th class="px-5 py-3 font-medium">状态</th>
              <th class="px-5 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="pending">
              <td colspan="7" class="px-5 py-8 text-center text-gray-400">加载中...</td>
            </tr>
            <tr v-else-if="products.length === 0">
              <td colspan="7" class="px-5 py-8 text-center text-gray-400">暂无商品</td>
            </tr>
            <tr
              v-for="p in products"
              v-else
              :key="p.id"
              class="hover:bg-gray-50/50 transition-colors"
            >
              <td class="px-5 py-3 text-gray-500">{{ p.id }}</td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0">
                    <img
                      v-if="p.coverImage"
                      :src="p.coverImage"
                      :alt="p.name"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center text-gray-300 text-xs">无图</div>
                  </div>
                  <span class="font-medium text-gray-900 line-clamp-1 max-w-[200px]">{{ p.name }}</span>
                </div>
              </td>
              <td class="px-5 py-3 font-medium text-red-500">¥{{ Number(p.price).toFixed(2) }}</td>
              <td class="px-5 py-3 text-gray-600">{{ p.stock }}</td>
              <td class="px-5 py-3 text-gray-600">{{ (p as Record<string, unknown>).salesCount ?? 0 }}</td>
              <td class="px-5 py-3">
                <span
                  :class="[
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    p.status === 'on'
                      ? 'bg-green-100 text-green-700'
                      : p.status === 'off'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600',
                  ]"
                >
                  {{ p.status === 'on' ? '上架' : p.status === 'off' ? '下架' : '草稿' }}
                </span>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-2">
                  <button class="text-sm text-primary-600 hover:text-primary-700" @click="openEdit(p)">编辑</button>
                  <button
                    class="text-sm"
                    :class="p.status === 'on' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'"
                    @click="toggleStatus(p)"
                  >
                    {{ p.status === 'on' ? '下架' : '上架' }}
                  </button>
                  <button class="text-sm text-red-500 hover:text-red-600" @click="handleDelete(p)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 分页 -->
    <div class="mt-6">
      <AppPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @change="handlePageChange"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <AppModal
      v-model="showForm"
      :title="editingProduct ? '编辑商品' : '新增商品'"
      size="lg"
      @update:model-value="!showForm && resetForm()"
    >
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm text-gray-700 mb-1">商品名称 <span class="text-red-500">*</span></label>
          <input
            v-model="form.name"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            required
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">价格 <span class="text-red-500">*</span></label>
            <input
              v-model.number="form.price"
              type="number"
              step="0.01"
              min="0"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              required
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">库存 <span class="text-red-500">*</span></label>
            <input
              v-model.number="form.stock"
              type="number"
              min="0"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              required
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">分类</label>
            <select
              v-model.number="form.categoryId"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            >
              <option :value="undefined">无分类</option>
              <option v-for="cat in flatCategories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">状态</label>
            <select
              v-model="form.status"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            >
              <option value="draft">草稿</option>
              <option value="on">上架</option>
              <option value="off">下架</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm text-gray-700 mb-1">主图 URL</label>
          <input
            v-model="form.coverImage"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            placeholder="https://..."
          />
        </div>
        <div>
          <label class="block text-sm text-gray-700 mb-1">商品描述</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none"
          />
        </div>
        <div class="flex items-center gap-2">
          <input v-model="form.isFeatured" type="checkbox" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          <span class="text-sm text-gray-700">设为推荐商品</span>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <AppButton variant="secondary" type="button" @click="showForm = false">取消</AppButton>
          <AppButton type="submit" :loading="saving">{{ editingProduct ? '更新' : '创建' }}</AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { Product, Category, PaginatedData, CreateProductData, ProductListItem } from '~/types/api'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const api = useApi()
const toast = useToast()

const keyword = ref('')
const currentPage = ref(1)
const pageSize = 15
const showForm = ref(false)
const editingProduct = ref<Product | null>(null)
const saving = ref(false)
const flatCategories = ref<{ id: number; name: string }[]>([])

const form = reactive<CreateProductData & { isFeatured: boolean }>({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  coverImage: '',
  categoryId: undefined,
  status: 'draft',
  isFeatured: false,
})

// 获取商品列表
const {
  data: productData,
  pending,
  refresh,
} = await useAsyncData('admin-products', () => {
  const params: Record<string, unknown> = { page: currentPage.value, limit: pageSize }
  if (keyword.value) params.keyword = keyword.value
  return api.get<PaginatedData<Product>>('/products/admin/list', params)
})

const products = computed(() => {
  const raw = (productData.value as PaginatedData<Product> | null)?.list || []
  return raw as (Product & { salesCount?: number })[]
})
const total = computed(() => (productData.value as PaginatedData<Product> | null)?.total || 0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

// 获取分类（用于下拉选择）
async function loadCategories() {
  try {
    const cats = await api.get<Category[]>('/categories/admin/all')
    const flat: { id: number; name: string }[] = []
    function flatten(list: Category[], prefix = '') {
      for (const c of list) {
        flat.push({ id: c.id, name: prefix + c.name })
        if (c.children?.length) flatten(c.children, prefix + '　')
      }
    }
    flatten(cats)
    flatCategories.value = flat
  } catch { /* ignore */ }
}
loadCategories()

function handleSearch() {
  currentPage.value = 1
  refresh()
}

function handlePageChange(page: number) {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openCreate() {
  editingProduct.value = null
  resetForm()
  showForm.value = true
}

function openEdit(product: Product) {
  editingProduct.value = product
  Object.assign(form, {
    name: product.name,
    description: product.description || '',
    price: product.price,
    stock: product.stock,
    coverImage: product.coverImage || '',
    categoryId: product.category?.id ?? undefined,
    status: product.status,
    isFeatured: product.isFeatured,
  })
  showForm.value = true
}

function resetForm() {
  Object.assign(form, {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    coverImage: '',
    categoryId: undefined,
    status: 'draft',
    isFeatured: false,
  })
}

async function handleSubmit() {
  if (!form.name || form.price <= 0) {
    toast.error('请填写商品名称和价格')
    return
  }
  saving.value = true
  try {
    if (editingProduct.value) {
      await api.put(`/products/${editingProduct.value.id}`, form)
      toast.success('商品已更新')
    } else {
      await api.post('/products', form)
      toast.success('商品已创建')
    }
    showForm.value = false
    refresh()
  } catch (err: unknown) {
    toast.error((err as Error).message || '操作失败')
  } finally {
    saving.value = false
  }
}

async function toggleStatus(product: Product) {
  const newStatus = product.status === 'on' ? 'off' : 'on'
  try {
    await api.patch(`/products/${product.id}/status`, { status: newStatus })
    toast.success(newStatus === 'on' ? '已上架' : '已下架')
    refresh()
  } catch (err: unknown) {
    toast.error((err as Error).message || '操作失败')
  }
}

async function handleDelete(product: Product) {
  if (!confirm(`确定要删除商品「${product.name}」吗？此操作不可撤销。`)) return
  try {
    await api.delete(`/products/${product.id}`)
    toast.success('商品已删除')
    refresh()
  } catch (err: unknown) {
    toast.error((err as Error).message || '删除失败')
  }
}
</script>
