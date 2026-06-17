<template>
  <div class="container-page">
    <!-- 面包屑 -->
    <nav class="text-sm text-gray-500 mb-6">
      <NuxtLink to="/" class="hover:text-primary-600 transition-colors">首页</NuxtLink>
      <span class="mx-2">/</span>
      <NuxtLink to="/orders" class="hover:text-primary-600 transition-colors">我的订单</NuxtLink>
      <span class="mx-2">/</span>
      <span class="text-gray-900">订单详情</span>
    </nav>

    <!-- 加载 -->
    <div v-if="pending" class="animate-pulse space-y-6">
      <div class="bg-white rounded-xl border border-gray-100 p-6">
        <div class="h-5 bg-gray-200 rounded w-1/3 mb-3" />
        <div class="h-4 bg-gray-200 rounded w-1/2 mb-2" />
        <div class="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    </div>

    <!-- 错误 -->
    <div v-else-if="error" class="text-center py-20">
      <span class="text-5xl">😵</span>
      <p class="text-gray-500 mt-4">订单加载失败</p>
      <AppButton class="mt-4" @click="refresh()">重新加载</AppButton>
    </div>

    <template v-else-if="order">
      <!-- 订单状态横幅 -->
      <div
        :class="[
          'bg-white rounded-2xl border p-6 mb-6',
          order.status === 'cancelled' ? 'border-gray-200' : 'border-primary-200',
        ]"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-xl font-bold text-gray-900">订单号：{{ order.orderNo }}</h1>
              <span
                :class="[
                  'rounded-full px-3 py-1 text-sm font-medium',
                  OrderStatusColorMap[order.status],
                ]"
              >
                {{ OrderStatusMap[order.status] }}
              </span>
            </div>
            <p class="text-sm text-gray-500 mt-2">
              下单时间：{{ formatDate(order.createdAt) }}
              <span v-if="order.remark" class="ml-4">备注：{{ order.remark }}</span>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <AppButton
              v-if="order.status === 'pending_payment'"
              @click="handlePay"
            >
              立即付款
            </AppButton>
            <AppButton
              v-if="order.status === 'pending_payment'"
              variant="ghost"
              @click="handleCancel"
            >
              取消订单
            </AppButton>
            <AppButton
              v-if="order.status === 'shipped'"
              @click="handleConfirm"
            >
              确认收货
            </AppButton>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 收货信息 -->
          <section class="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-4">收货信息</h2>
            <div class="text-sm text-gray-700 space-y-1">
              <p><span class="text-gray-500">收货人：</span>{{ order.receiverName }}</p>
              <p><span class="text-gray-500">联系电话：</span>{{ order.receiverPhone }}</p>
              <p><span class="text-gray-500">收货地址：</span>{{ order.receiverAddress }}</p>
            </div>
          </section>

          <!-- 商品明细 -->
          <section class="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-4">商品明细</h2>
            <div class="space-y-3">
              <div
                v-for="item in order.orderItems"
                :key="item.id"
                class="flex items-center gap-4"
              >
                <div class="w-16 h-16 flex-shrink-0 rounded-lg bg-gray-50 overflow-hidden border border-gray-100">
                  <img
                    v-if="item.productImage"
                    :src="item.productImage"
                    :alt="item.productName"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 line-clamp-1">{{ item.productName }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">×{{ item.quantity }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold text-gray-900">¥{{ Number(item.amount).toFixed(2) }}</p>
                  <p class="text-xs text-gray-400">单价 ¥{{ Number(item.price).toFixed(2) }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- 右侧：费用明细 -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 space-y-3">
            <h3 class="text-base font-semibold text-gray-900">费用明细</h3>
            <div class="text-sm space-y-2">
              <div class="flex justify-between text-gray-600">
                <span>商品总额</span>
                <span>¥{{ Number(order.totalAmount).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>运费</span>
                <span>{{ order.freight > 0 ? `¥${Number(order.freight).toFixed(2)}` : '免运费' }}</span>
              </div>
              <div v-if="order.couponDiscount > 0" class="flex justify-between text-green-600">
                <span>优惠券</span>
                <span>-¥{{ Number(order.couponDiscount).toFixed(2) }}</span>
              </div>
              <hr class="border-gray-100" />
              <div class="flex justify-between text-base font-semibold">
                <span class="text-gray-900">实付金额</span>
                <span class="text-red-500">¥{{ Number(order.payAmount).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Order } from '~/types/api'
import { OrderStatusMap, OrderStatusColorMap } from '~/types/api'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const route = useRoute()
const api = useApi()
const toast = useToast()
const router = useRouter()

const orderId = computed(() => Number(route.params.id))

const {
  data: order,
  pending,
  error,
  refresh,
} = await useAsyncData(`order-${orderId.value}`, () =>
  api.get<Order>(`/orders/${orderId.value}`),
)

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function handlePay() {
  try {
    await api.patch(`/orders/${orderId.value}/pay`)
    toast.success('支付成功')
    refresh()
  } catch (err: unknown) {
    toast.error((err as Error).message || '支付失败')
  }
}

async function handleCancel() {
  if (!confirm('确定要取消该订单吗？')) return
  try {
    await api.patch(`/orders/${orderId.value}/cancel`)
    toast.success('订单已取消')
    refresh()
  } catch (err: unknown) {
    toast.error((err as Error).message || '操作失败')
  }
}

async function handleConfirm() {
  if (!confirm('确认已收到商品？')) return
  try {
    await api.patch(`/admin/orders/${orderId.value}/complete`)
    toast.success('已确认收货')
    refresh()
  } catch (err: unknown) {
    toast.error((err as Error).message || '操作失败')
  }
}
</script>
