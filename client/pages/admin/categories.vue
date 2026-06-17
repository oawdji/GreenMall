<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">分类管理</h2>
      <AppButton size="sm" @click="openCreate(null)">新增分类</AppButton>
    </div>

    <!-- 加载 -->
    <div v-if="pending" class="text-center py-10 text-gray-500">加载中...</div>

    <!-- 分类树 -->
    <div v-else class="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-left text-gray-600">
              <th class="px-5 py-3 font-medium w-16">ID</th>
              <th class="px-5 py-3 font-medium">名称</th>
              <th class="px-5 py-3 font-medium">排序</th>
              <th class="px-5 py-3 font-medium">状态</th>
              <th class="px-5 py-3 font-medium">描述</th>
              <th class="px-5 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="flatList.length === 0">
              <td colspan="6" class="px-5 py-8 text-center text-gray-400">暂无分类</td>
            </tr>
            <tr
              v-for="cat in flatList"
              :key="cat.id"
              class="hover:bg-gray-50/50 transition-colors"
            >
              <td class="px-5 py-3 text-gray-500">{{ cat.id }}</td>
              <td class="px-5 py-3">
                <span class="font-medium text-gray-900">{{ '　'.repeat(cat.depth) }}{{ cat.name }}</span>
              </td>
              <td class="px-5 py-3 text-gray-600">{{ cat.sort }}</td>
              <td class="px-5 py-3">
                <span
                  :class="[
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500',
                  ]"
                >
                  {{ cat.isActive ? '启用' : '禁用' }}
                </span>
              </td>
              <td class="px-5 py-3 text-gray-500 max-w-[150px] line-clamp-1">{{ cat.description || '-' }}</td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-2">
                  <button class="text-sm text-primary-600 hover:text-primary-700" @click="openEdit(cat)">编辑</button>
                  <button
                    v-if="!cat.depth"
                    class="text-sm text-gray-600 hover:text-gray-700"
                    @click="openCreate(cat.id)"
                  >
                    添加子分类
                  </button>
                  <button class="text-sm text-red-500 hover:text-red-600" @click="handleDelete(cat)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <AppModal
      v-model="showForm"
      :title="isSubCategory ? '添加子分类' : editingCategory ? '编辑分类' : '新增分类'"
      size="md"
      @update:model-value="!showForm && resetForm()"
    >
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm text-gray-700 mb-1">分类名称 <span class="text-red-500">*</span></label>
          <input
            v-model="form.name"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            required
          />
        </div>
        <div v-if="!editingCategory">
          <label class="block text-sm text-gray-700 mb-1">父分类</label>
          <select
            v-model.number="form.parentId"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
          >
            <option :value="null">无（顶级分类）</option>
            <option v-for="cat in topLevelCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">排序值</label>
            <input
              v-model.number="form.sort"
              type="number"
              min="0"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">状态</label>
            <select
              v-model="form.isActive"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            >
              <option :value="true">启用</option>
              <option :value="false">禁用</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm text-gray-700 mb-1">图标</label>
          <input
            v-model="form.icon"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            placeholder="可选图标标识"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-700 mb-1">图片 URL</label>
          <input
            v-model="form.image"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            placeholder="https://..."
          />
        </div>
        <div>
          <label class="block text-sm text-gray-700 mb-1">描述</label>
          <textarea
            v-model="form.description"
            rows="2"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none"
          />
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <AppButton variant="secondary" type="button" @click="showForm = false">取消</AppButton>
          <AppButton type="submit" :loading="saving">{{ editingCategory ? '更新' : '创建' }}</AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { Category, CreateCategoryData } from '~/types/api'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const api = useApi()
const toast = useToast()

const showForm = ref(false)
const editingCategory = ref<Category | null>(null)
const isSubCategory = ref(false)
const saving = ref(false)

const form = reactive<CreateCategoryData>({
  name: '',
  icon: '',
  image: '',
  sort: 0,
  isActive: true,
  description: '',
  parentId: null,
})

// 获取分类
const {
  data: categories,
  pending,
  refresh,
} = await useAsyncData('admin-categories', () =>
  api.get<Category[]>('/categories/admin/all'),
)

// 扁平化列表（用于展示）
interface FlatCategory extends Category {
  depth: number
}

const flatList = computed<FlatCategory[]>(() => {
  const result: FlatCategory[] = []
  function walk(list: Category[], depth: number) {
    for (const c of list) {
      result.push({ ...c, depth })
      if (c.children?.length) walk(c.children, depth + 1)
    }
  }
  if (categories.value) walk(categories.value, 0)
  return result
})

const topLevelCategories = computed(() =>
  flatList.value.filter((c) => !c.parent && c.isActive),
)

function openCreate(parentId: number | null) {
  editingCategory.value = null
  isSubCategory.value = parentId !== null
  resetForm()
  form.parentId = parentId
  showForm.value = true
}

function openEdit(cat: FlatCategory) {
  editingCategory.value = cat
  Object.assign(form, {
    name: cat.name,
    icon: cat.icon || '',
    image: cat.image || '',
    sort: cat.sort,
    isActive: cat.isActive,
    description: cat.description || '',
    parentId: cat.parent?.id ?? null,
  })
  showForm.value = true
}

function resetForm() {
  Object.assign(form, {
    name: '',
    icon: '',
    image: '',
    sort: 0,
    isActive: true,
    description: '',
    parentId: null,
  })
}

async function handleSubmit() {
  if (!form.name) {
    toast.error('请填写分类名称')
    return
  }
  saving.value = true
  try {
    if (editingCategory.value) {
      await api.put(`/categories/${editingCategory.value.id}`, form)
      toast.success('分类已更新')
    } else {
      await api.post('/categories', form)
      toast.success('分类已创建')
    }
    showForm.value = false
    refresh()
  } catch (err: unknown) {
    toast.error((err as Error).message || '操作失败')
  } finally {
    saving.value = false
  }
}

async function handleDelete(cat: FlatCategory) {
  if (!confirm(`确定要删除分类「${cat.name}」吗？${cat.children?.length ? '其子分类将上移为顶级分类。' : ''}`)) return
  try {
    await api.delete(`/categories/${cat.id}`)
    toast.success('分类已删除')
    refresh()
  } catch (err: unknown) {
    toast.error((err as Error).message || '删除失败')
  }
}
</script>
