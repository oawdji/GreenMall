<template>
  <div class="container-page">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">个人中心</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左侧：用户信息卡片 -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <div class="mx-auto h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center mb-4">
            <span class="text-primary-700 font-bold text-2xl">
              {{ auth.username?.charAt(0)?.toUpperCase() }}
            </span>
          </div>
          <h2 class="text-lg font-semibold text-gray-900">{{ auth.user?.nickname || auth.username }}</h2>
          <p class="text-sm text-gray-500 mt-1">@{{ auth.username }}</p>
          <span
            :class="[
              'inline-block mt-3 rounded-full px-3 py-0.5 text-xs font-medium',
              auth.isAdmin
                ? 'bg-purple-100 text-purple-700'
                : 'bg-green-100 text-green-700',
            ]"
          >
            {{ auth.isAdmin ? '管理员' : '普通用户' }}
          </span>
        </div>

        <!-- 快捷入口 -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 mt-4 overflow-hidden">
          <NuxtLink
            v-for="link in quickLinks"
            :key="link.to"
            :to="link.to"
            class="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
          >
            <div class="flex items-center gap-3">
              <span class="text-lg">{{ link.icon }}</span>
              <span class="text-sm text-gray-700">{{ link.label }}</span>
            </div>
            <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
      </div>

      <!-- 右侧：信息详情 -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-5">个人信息</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-500 mb-1">用户名</label>
              <p class="text-sm text-gray-900">{{ auth.user?.username || '-' }}</p>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">昵称</label>
              <p class="text-sm text-gray-900">{{ auth.user?.nickname || '-' }}</p>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">邮箱</label>
              <p class="text-sm text-gray-900">{{ auth.user?.email || '-' }}</p>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">手机号</label>
              <p class="text-sm text-gray-900">{{ auth.user?.phone || '-' }}</p>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">注册时间</label>
              <p class="text-sm text-gray-900">
                {{ auth.user?.createdAt ? new Date(auth.user.createdAt).toLocaleDateString('zh-CN') : '-' }}
              </p>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">角色</label>
              <p class="text-sm text-gray-900">{{ auth.isAdmin ? '管理员' : '普通用户' }}</p>
            </div>
          </div>

          <div class="mt-6 pt-5 border-t border-gray-100">
            <p class="text-xs text-gray-400">
              编辑个人信息功能请访问后台管理，或等待后续更新。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const auth = useAuthStore()

const quickLinks = [
  { to: '/orders', icon: '📋', label: '我的订单' },
  { to: '/user/favorites', icon: '❤️', label: '我的收藏' },
  { to: '/user/coupons', icon: '🎫', label: '我的优惠券' },
  { to: '/user/addresses', icon: '📍', label: '收货地址' },
]
</script>
