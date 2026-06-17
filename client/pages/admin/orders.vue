<template>
  <div>
    <h2 class="text-xl font-bold text-gray-900 mb-6">订单管理</h2>

    <!-- 状态筛选 -->
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

    <!-- 表格 -->
    <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-left text-gray-600">
              <th class="px-5 py-3 font-medium">订单号</th>
              <th class="px-5 py-3 font-medium">用户</th>
              <th class="px-5 py-3 font-medium">收货人</th>
              <th class="px-5 py-3 font-medium">金额</th>
              <th class="px-5 py-3 font-medium">状态</th>
              <th class="px-5 py-3 font-medium">时间</th>
              <th class="px-5 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="pending">
              <td colspan="7" class="px-5 py-8 text-center text-gray-400">加载中...</td>
            </tr>
            <tr v-else-if="orders.length === 0">
              <td colspan="7" class="px-5 py-8 text-center text-gray-400">暂无订单</td>
            </tr>
            <tr
              v-for="order in orders"
              v-else
              :key="order.id"
              class="hover:bg-gray-50/50 transition-colors"
            >
              <td class="px-5 py-3 font-mono text-gray-900 text-xs">{{ order.orderNo }}</td>
              <td class="px-5 py-3 text-gray-600">{{ order.user?.nickname || order.user?.username || '-' }}</td>
              <td class="px-5 py-3 text-gray-600">{{ order.receiverName }}</td>
              <td class="px-5 py-3">
                <span class="font-medium text-red-500">¥{{ Number(order.payAmount).toFixed(2) }}</span>
                <span v-if="order.couponDiscount > 0" class="text-green-600 text-xs ml-1">(优¥{{ Number(order.couponDiscount).toFixed(2) }})</span>
              </td>
              <td class="px-5 py-3">
                <span :class="['rounded-full px-2 py-0.5 text-xs font-medium', OrderStatusColorMap[order.status]]">
                  {{ OrderStatusMap[order.status] }}
                </span>
              </td>
              <td class="px-5 py-3 text-gray-500 text-xs">{{ formatDate(order.createdAt) }}</td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-2 flex-wrap">
                  <!-- 查看详情 -->
                  <button class="text-sm text-primary-600 hover:text-primary-700" @click="openDetail(order)">详情</button>
                  <!-- 发货 -->
                  <button
                    v-if="order.status === 'paid'"
                    class="text-sm text-blue-600 hover:text-blue-700"
                    @click="handleShip(order)"
                  >
                    发货
                  </button>
                  <!-- 完成 -->
                  <button
                    v-if="order.status === 'shipped'"
                    class="text-sm text-green-600 hover:text-green-700"
                    @click="handleComplete(order)"
                  >
                    确认完成
                  </button>
                  <!-- 手动改状态 -->
                  <select
                    v-if="order.status !== 'completed' && order.status !== 'cancelled'"
                    class="text-xs border border-gray-200 rounded px-1 py-0.5 outline-none"
                    @change="(e: Event) => handleChangeStatus(order, (e.target as HTMLSelectElement).value)"
                  >
                    <option value="">改状态</option>
                    <option v-if="order.status !== 'pending_payment'" value="pending_payment">待付款</option>
                    <option v-if="order.status !== 'paid'" value="paid">待发货</option>
                    <option v-if="order.status !== 'shipped'" value="shipped">已发货</option>
                    <option v-if="order.status !== 'completed'" value="completed">已完成</option>
                    <option value="cancelled">已取消</option>
                  </select>
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

    <!-- 订单详情弹窗 -->
    <AppModal v-model="showDetail" title="订单详情" size="lg">
      <template v-if="detailOrder">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">订单号：</span>
              <span class="text-gray-900 font-mono">{{ detailOrder.orderNo }}</span>
            </div>
            <div>
              <span class="text-gray-500">状态：</span>
              <span :class="['rounded-full px-2 py-0.5 text-xs font-medium', OrderStatusColorMap[detailOrder.status]]">
                {{ OrderStatusMap[detailOrder.status] }}
              </span>
            </div>
            <div>
              <span class="text-gray-500">收货人：</span>
              <span class="text-gray-900">{{ detailOrder.receiverName }}</span>
            </div>
            <div>
              <span class="text-gray-500">电话：</span>
              <span class="text-gray-900">{{ detailOrder.receiverPhone }}</span>
            </div>
            <div class="col-span-2">
              <span class="text-gray-500">地址：</span>
              <span class="text-gray-900">{{ detailOrder.receiverAddress }}</span>
            </div>
            <div class="col-span-2" v-if="detailOrder.remark">
              <span class="text-gray-500">备注：</span>
              <span class="text-gray-900">{{ detailOrder.remark }}</span>
            </div>
          </div>

          <hr class="border-gray-100" />

          <!-- 商品明细 -->
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-2">商品明细</h4>
            <div class="space-y-2">
              <div v-for="item in detailOrder.orderItems" :key="item.id" class="flex items-center justify-between text-sm">
                <span class="text-gray-700">{{ item.productName }} ×{{ item.quantity }}</span>
                <span class="text-gray-900 font-medium">¥{{ Number(item.amount).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <hr class="border-gray-100" />

          <div class="text-sm space-y-1">
            <div class="flex justify-between">
              <span class="text-gray-500">商品总额</span>
              <span>¥{{ Number(detailOrder.totalAmount).toFixed(2) }}</span>
            </div>
            <div v-if="detailOrder.couponDiscount > 0" class="flex justify-between text-green-600">
              <span>优惠券</span>
              <span>-¥{{ Number(detailOrder.couponDiscount).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between font-semibold text-base pt-1 border-t border-gray-100">
              <span>实付</span>
              <span class="text-red-500">¥{{ Number(detailOrder.payAmount).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { Order, PaginatedData } from '~/types/api'
import { OrderStatusMap, OrderStatusColorMap } from '~/types/api'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

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

const activeTab = ref('')
const currentPage = ref(1)
const pageSize = 15
const showDetail = ref(false)
const detailOrder = ref<Order | null>(null)

const { data: orderData, pending, refresh } = await useAsyncData(
  'admin-orders',
  () => {
    const params: Record<string, unknown> = { page: currentPage.value, pageSize }
    if (activeTab.value) params.status = activeTab.value
    return api.get<PaginatedData<Order>>('/admin/orders', params)
  },
)

const orders = computed(() => (orderData.value as PaginatedData<Order> | null)?.list || [])
const total = computed(() => (orderData.value as PaginatedData<Order> | null)?.total || 0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

function switchTab(status: string) {
  activeTab.value = status
  currentPage.value = 1
}

function handlePageChange(page: number) {
  currentPage.value = page
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function openDetail(order: Order) {
  try {
    detailOrder.value = await api.get<Order>(`/admin/orders/${order.id}`)
    showDetail.value = true
  } catch (err: unknown) {
    toast.error((err as Error).message || '加载详情失败')
  }
}

async function handleShip(order: Order) {
  if (!confirm(`确定将订单 ${order.orderNo} 标记为已发货？`)) return
  try {
    await api.patch(`/admin/orders/${order.id}/ship`)
    toast.success('已发货')
    refresh()
  } catch (err: unknown) {
    toast.error((err as Error).message || '操作失败')
  }
}

async function handleComplete(order: Order) {
  if (!confirm(`确定将订单 ${order.orderNo} 标记为已完成？`)) return
  try {
    await api.patch(`/admin/orders/${order.id}/complete`)
    toast.success('已完成')
    refresh()
  } catch (err: unknown) {
    toast.error((err as Error).message || '操作失败')
  }
}

async function handleChangeStatus(order: Order, newStatus: string) {
  if (!newStatus) return
  if (!confirm(`确定将订单 ${order.orderNo} 状态修改为「${OrderStatusMap[newStatus as keyof typeof OrderStatusMap]}」？`)) return
  try {
    await api.patch(`/admin/orders/${order.id}/status`, { status: newStatus })
    toast.success('状态已更新')
    refresh()
  } catch (err: unknown) {
    toast.error((err as Error).message || '操作失败')
  }
}
</script>
