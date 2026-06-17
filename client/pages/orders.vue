<template>
  <div class="container-page">
    <!-- 面包屑 -->
    <nav class="text-sm text-gray-500 mb-6">
      <NuxtLink to="/" class="hover:text-primary-600 transition-colors">首页</NuxtLink>
      <span class="mx-2">/</span>
      <span class="text-gray-900">我的订单</span>
    </nav>

    <h1 class="text-2xl font-bold text-gray-900 mb-6">我的订单</h1>

    <!-- 状态筛选 Tab -->
    <div class="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 mb-6 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
          activeTab === tab.value
            ? 'bg-primary-600 text-white'
            : 'text-gray-600 hover:bg-gray-100',
        ]"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 加载 -->
    <div v-if="pending" class="space-y-3">
      <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/2 mb-3" />
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div class="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="orders.length === 0" class="text-center py-20">
      <span class="text-5xl">📋</span>
      <p class="text-gray-500 mt-4">{{ activeTab ? '没有该状态的订单' : '还没有任何订单' }}</p>
      <AppButton v-if="!activeTab" class="mt-4" @click="navigateTo('/products')">去购物</AppButton>
    </div>

    <!-- 订单列表 -->
    <div v-else class="space-y-4">
      <div
        v-for="order in orders"
        :key="order.id"
        class="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow"
      >
        <!-- 订单头部 -->
        <div class="flex items-center justify-between px-5 py-3 bg-gray-50/50 border-b border-gray-100">
          <div class="flex items-center gap-3 text-sm">
            <span class="text-gray-500">订单号：</span>
            <span class="text-gray-900 font-mono">{{ order.orderNo }}</span>
            <span class="text-gray-300">|</span>
            <span>{{ formatDate(order.createdAt) }}</span>
          </div>
          <span
            :class="[
              'rounded-full px-3 py-1 text-xs font-medium',
              OrderStatusColorMap[order.status],
            ]"
          >
            {{ OrderStatusMap[order.status] }}
          </span>
        </div>

        <!-- 商品列表 -->
        <div class="px-5 py-3 space-y-2">
          <div
            v-for="item in order.orderItems"
            :key="item.id"
            class="flex items-center gap-3"
          >
            <div class="w-14 h-14 flex-shrink-0 rounded-lg bg-gray-50 overflow-hidden border border-gray-100">
              <img
                v-if="item.productImage"
                :src="item.productImage"
                :alt="item.productName"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900 line-clamp-1">{{ item.productName }}</p>
              <p class="text-xs text-gray-500 mt-0.5">×{{ item.quantity }}</p>
            </div>
            <p class="text-sm font-medium text-gray-900">¥{{ Number(item.amount).toFixed(2) }}</p>
          </div>
        </div>

        <!-- 订单底部 -->
        <div class="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <div class="text-sm">
            <span class="text-gray-500">共 {{ getTotalQuantity(order) }} 件，实付 </span>
            <span class="text-red-500 font-semibold">¥{{ Number(order.payAmount).toFixed(2) }}</span>
            <span v-if="order.couponDiscount > 0" class="text-green-600 ml-2">
              （已优惠 ¥{{ Number(order.couponDiscount).toFixed(2) }}）
            </span>
          </div>
          <div class="flex items-center gap-2">
            <NuxtLink
              :to="`/orders/${order.id}`"
              class="text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              查看详情
            </NuxtLink>
            <AppButton
              v-if="order.status === 'pending_payment'"
              size="sm"
              @click="handlePay(order.id)"
            >
              立即付款
            </AppButton>
            <AppButton
              v-if="order.status === 'pending_payment'"
              size="sm"
              variant="ghost"
              @click="handleCancel(order.id)"
            >
              取消订单
            </AppButton>
            <AppButton
              v-if="order.status === 'shipped'"
              size="sm"
              @click="handleConfirm(order.id)"
            >
              确认收货
            </AppButton>
          </div>
        </div>
      </div>
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
import type { Order, PaginatedData } from '~/types/api'
import { OrderStatusMap, OrderStatusColorMap } from '~/types/api'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const toast = useToast()

const tabs = [
  { label: '全部', value: '' },
  { label: '待付款', value: 'pending_payment' },
  { label: '待发货', value: 'paid' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
]

const activeTab = ref((route.query.status as string) || '')
const currentPage = ref(route.query.page ? Number(route.query.page) : 1)
const pageSize = 10

const { data: orderData, pending, refresh } = await useAsyncData(
  'orders-list',
  () => {
    const params: Record<string, unknown> = { page: currentPage.value, pageSize }
    if (activeTab.value) params.status = activeTab.value
    return api.get<PaginatedData<Order>>('/orders', params)
  },
  { watch: [() => route.query] },
)

const orders = computed(() => (orderData.value as PaginatedData<Order> | null)?.list || [])
const total = computed(() => (orderData.value as PaginatedData<Order> | null)?.total || 0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

function switchTab(status: string) {
  activeTab.value = status
  currentPage.value = 1
  router.push({ query: { ...(status ? { status } : {}), page: 1 } })
}

function handlePageChange(page: number) {
  currentPage.value = page
  router.push({ query: { ...route.query, page } })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function getTotalQuantity(order: Order): number {
  return order.orderItems.reduce((sum, item) => sum + item.quantity, 0)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function handlePay(orderId: number) {
  try {
    await api.patch(`/orders/${orderId}/pay`)
    toast.success('支付成功')
    refresh()
  } catch (err: unknown) {
    toast.error((err as Error).message || '支付失败')
  }
}

async function handleCancel(orderId: number) {
  if (!confirm('确定要取消该订单吗？')) return
  try {
    await api.patch(`/orders/${orderId}/cancel`)
    toast.success('订单已取消')
    refresh()
  } catch (err: unknown) {
    toast.error((err as Error).message || '操作失败')
  }
}

async function handleConfirm(orderId: number) {
  if (!confirm('确认已收到商品？')) return
  try {
    const api = useApi()
    await api.patch(`/admin/orders/${orderId}/complete`)
    toast.success('已确认收货')
    refresh()
  } catch (err: unknown) {
    toast.error((err as Error).message || '操作失败')
  }
}
</script>
