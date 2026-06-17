<template>
  <div>
    <h2 class="text-xl font-bold text-gray-900 mb-6">仪表盘</h2>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-xl border border-gray-100 p-5">
        <div class="flex items-center gap-3">
          <div class="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-2xl">📦</div>
          <div>
            <p class="text-sm text-gray-500">商品总数</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalProducts }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-5">
        <div class="flex items-center gap-3">
          <div class="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-2xl">📋</div>
          <div>
            <p class="text-sm text-gray-500">订单总数</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalOrders }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-5">
        <div class="flex items-center gap-3">
          <div class="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center text-2xl">👥</div>
          <div>
            <p class="text-sm text-gray-500">用户总数</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalUsers }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-5">
        <div class="flex items-center gap-3">
          <div class="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center text-2xl">💰</div>
          <div>
            <p class="text-sm text-gray-500">今日营收</p>
            <p class="text-2xl font-bold text-red-500">¥{{ Number(stats.todayRevenue).toFixed(2) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近订单 -->
    <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="font-semibold text-gray-900">最近订单</h3>
        <NuxtLink to="/admin/orders" class="text-sm text-primary-600 hover:text-primary-700">查看全部 →</NuxtLink>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-left text-gray-600">
              <th class="px-6 py-3 font-medium">订单号</th>
              <th class="px-6 py-3 font-medium">用户</th>
              <th class="px-6 py-3 font-medium">金额</th>
              <th class="px-6 py-3 font-medium">状态</th>
              <th class="px-6 py-3 font-medium">时间</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="recentOrders.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-gray-400">暂无订单</td>
            </tr>
            <tr
              v-for="order in recentOrders"
              :key="order.id"
              class="hover:bg-gray-50/50 transition-colors"
            >
              <td class="px-6 py-3 font-mono text-gray-900">{{ order.orderNo }}</td>
              <td class="px-6 py-3 text-gray-600">{{ order.user?.nickname || order.user?.username || '-' }}</td>
              <td class="px-6 py-3 font-medium text-red-500">¥{{ Number(order.payAmount).toFixed(2) }}</td>
              <td class="px-6 py-3">
                <span :class="['rounded-full px-2 py-0.5 text-xs font-medium', OrderStatusColorMap[order.status]]">
                  {{ OrderStatusMap[order.status] }}
                </span>
              </td>
              <td class="px-6 py-3 text-gray-500">{{ formatDate(order.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Order, DashboardData } from '~/types/api'
import { OrderStatusMap, OrderStatusColorMap } from '~/types/api'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const api = useApi()

const stats = ref({
  totalProducts: 0,
  totalOrders: 0,
  totalUsers: 0,
  todayRevenue: 0,
})

const recentOrders = ref<Order[]>([])

try {
  const data = await api.get<DashboardData>('/admin/dashboard')
  stats.value = data.stats
  recentOrders.value = data.recentOrders || []
} catch {
  // 仪表盘加载失败
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
