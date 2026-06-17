<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">优惠券管理</h2>
      <AppButton size="sm" @click="openCreate">新增优惠券</AppButton>
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-left text-gray-600">
              <th class="px-5 py-3 font-medium">ID</th>
              <th class="px-5 py-3 font-medium">名称</th>
              <th class="px-5 py-3 font-medium">类型</th>
              <th class="px-5 py-3 font-medium">优惠内容</th>
              <th class="px-5 py-3 font-medium">库存</th>
              <th class="px-5 py-3 font-medium">有效期</th>
              <th class="px-5 py-3 font-medium">状态</th>
              <th class="px-5 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="pending">
              <td colspan="8" class="px-5 py-8 text-center text-gray-400">加载中...</td>
            </tr>
            <tr v-else-if="coupons.length === 0">
              <td colspan="8" class="px-5 py-8 text-center text-gray-400">暂无优惠券</td>
            </tr>
            <tr
              v-for="c in coupons"
              v-else
              :key="c.id"
              class="hover:bg-gray-50/50 transition-colors"
            >
              <td class="px-5 py-3 text-gray-500">{{ c.id }}</td>
              <td class="px-5 py-3 font-medium text-gray-900">{{ c.name }}</td>
              <td class="px-5 py-3">
                <span
                  :class="[
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    c.type === 'fixed' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700',
                  ]"
                >
                  {{ c.type === 'fixed' ? '满减券' : '折扣券' }}
                </span>
              </td>
              <td class="px-5 py-3 text-gray-600">
                <template v-if="c.type === 'fixed'">
                  满{{ c.minAmount > 0 ? `¥${c.minAmount}` : '任意' }}减 ¥{{ c.discountValue }}
                </template>
                <template v-else>
                  {{ c.discountValue }}折
                  <span v-if="c.maxDiscount" class="text-xs">（最高 ¥{{ c.maxDiscount }}）</span>
                </template>
              </td>
              <td class="px-5 py-3 text-gray-600">
                <span :class="{ 'text-red-500': c.remainingQuantity === 0 }">
                  {{ c.remainingQuantity }}
                </span>
                / {{ c.totalQuantity }}
              </td>
              <td class="px-5 py-3 text-gray-500 text-xs">
                <div v-if="c.startDate || c.endDate">
                  <span v-if="c.startDate">{{ formatDate(c.startDate) }}</span>
                  <span v-if="c.startDate && c.endDate"> ~ </span>
                  <span v-if="c.endDate">{{ formatDate(c.endDate) }}</span>
                </div>
                <span v-else>长期有效</span>
              </td>
              <td class="px-5 py-3">
                <span
                  :class="[
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500',
                  ]"
                >
                  {{ c.isActive ? '启用' : '禁用' }}
                </span>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-2">
                  <button class="text-sm text-primary-600 hover:text-primary-700" @click="openEdit(c)">编辑</button>
                  <button class="text-sm text-red-500 hover:text-red-600" @click="handleDelete(c)">删除</button>
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
      :title="editingCoupon ? '编辑优惠券' : '新增优惠券'"
      size="lg"
      @update:model-value="!showForm && resetForm()"
    >
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm text-gray-700 mb-1">优惠券名称 <span class="text-red-500">*</span></label>
          <input
            v-model="form.name"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            required
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">类型 <span class="text-red-500">*</span></label>
            <select
              v-model="form.type"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            >
              <option value="fixed">满减券</option>
              <option value="percent">折扣券</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">
              {{ form.type === 'fixed' ? '减免金额（元）' : '折扣率（如 8.5 表示 8.5 折）' }}
              <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="form.discountValue"
              type="number"
              step="0.01"
              min="0"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              required
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">最低消费金额（0=无门槛）</label>
            <input
              v-model.number="form.minAmount"
              type="number"
              step="0.01"
              min="0"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>
          <div v-if="form.type === 'percent'">
            <label class="block text-sm text-gray-700 mb-1">最高优惠金额（可选）</label>
            <input
              v-model.number="form.maxDiscount"
              type="number"
              step="0.01"
              min="0"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              placeholder="不限制"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">发放总量</label>
            <input
              v-model.number="form.totalQuantity"
              type="number"
              min="0"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">每人限领</label>
            <input
              v-model.number="form.perUserLimit"
              type="number"
              min="1"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">开始日期</label>
            <input
              v-model="form.startDate"
              type="date"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">结束日期</label>
            <input
              v-model="form.endDate"
              type="date"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <input v-model="form.isActive" type="checkbox" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          <span class="text-sm text-gray-700">立即启用</span>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <AppButton variant="secondary" type="button" @click="showForm = false">取消</AppButton>
          <AppButton type="submit" :loading="saving">{{ editingCoupon ? '更新' : '创建' }}</AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { Coupon, PaginatedData, CreateCouponData } from '~/types/api'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const api = useApi()
const toast = useToast()

const currentPage = ref(1)
const pageSize = 15
const showForm = ref(false)
const editingCoupon = ref<Coupon | null>(null)
const saving = ref(false)

const form = reactive<CreateCouponData>({
  name: '',
  type: 'fixed',
  minAmount: 0,
  discountValue: 0,
  maxDiscount: undefined,
  totalQuantity: 0,
  perUserLimit: 1,
  startDate: '',
  endDate: '',
  isActive: false,
})

const { data: couponData, pending, refresh } = await useAsyncData(
  'admin-coupons',
  () => api.get<PaginatedData<Coupon>>('/admin/coupons', {
    page: currentPage.value,
    pageSize,
  }),
)

const coupons = computed(() => (couponData.value as PaginatedData<Coupon> | null)?.list || [])
const total = computed(() => (couponData.value as PaginatedData<Coupon> | null)?.total || 0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

function handlePageChange(page: number) {
  currentPage.value = page
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function openCreate() {
  editingCoupon.value = null
  resetForm()
  showForm.value = true
}

function openEdit(coupon: Coupon) {
  editingCoupon.value = coupon
  Object.assign(form, {
    name: coupon.name,
    type: coupon.type,
    minAmount: coupon.minAmount,
    discountValue: coupon.discountValue,
    maxDiscount: coupon.maxDiscount ?? undefined,
    totalQuantity: coupon.totalQuantity,
    perUserLimit: coupon.perUserLimit,
    startDate: coupon.startDate?.split('T')[0] ?? '',
    endDate: coupon.endDate?.split('T')[0] ?? '',
    isActive: coupon.isActive,
  })
  showForm.value = true
}

function resetForm() {
  Object.assign(form, {
    name: '',
    type: 'fixed',
    minAmount: 0,
    discountValue: 0,
    maxDiscount: undefined,
    totalQuantity: 0,
    perUserLimit: 1,
    startDate: '',
    endDate: '',
    isActive: false,
  })
}

async function handleSubmit() {
  if (!form.name || form.discountValue <= 0) {
    toast.error('请填写优惠券名称和优惠内容')
    return
  }
  saving.value = true
  try {
    if (editingCoupon.value) {
      await api.put(`/admin/coupons/${editingCoupon.value.id}`, form)
      toast.success('优惠券已更新')
    } else {
      await api.post('/admin/coupons', form)
      toast.success('优惠券已创建')
    }
    showForm.value = false
    refresh()
  } catch (err: unknown) {
    toast.error((err as Error).message || '操作失败')
  } finally {
    saving.value = false
  }
}

async function handleDelete(coupon: Coupon) {
  if (!confirm(`确定要删除优惠券「${coupon.name}」吗？`)) return
  try {
    await api.delete(`/admin/coupons/${coupon.id}`)
    toast.success('优惠券已删除')
    refresh()
  } catch (err: unknown) {
    toast.error((err as Error).message || '删除失败')
  }
}
</script>
