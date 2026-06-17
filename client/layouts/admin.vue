<template>
  <div class="min-h-screen flex bg-gray-100">
    <!-- 侧边栏 -->
    <aside class="fixed left-0 top-0 bottom-0 w-60 bg-gray-900 text-white flex flex-col z-30">
      <!-- Logo -->
      <NuxtLink to="/admin" class="flex items-center gap-3 px-5 py-4 border-b border-gray-800">
        <div class="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center">
          <span class="text-white font-bold text-sm">GM</span>
        </div>
        <span class="font-semibold">后台管理</span>
      </NuxtLink>

      <!-- 导航 -->
      <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          active-class="bg-gray-800 text-white"
        >
          <span class="text-lg">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- 底部：返回前台 -->
      <div class="border-t border-gray-800 p-3">
        <NuxtLink
          to="/"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回前台
        </NuxtLink>
      </div>
    </aside>

    <!-- 右侧内容区 -->
    <div class="flex-1 ml-60">
      <!-- 顶栏 -->
      <header class="sticky top-0 z-20 bg-white shadow-sm h-16 flex items-center justify-between px-6">
        <h1 class="text-lg font-semibold text-gray-800">{{ pageTitle }}</h1>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500">{{ auth.username }}</span>
          <button
            class="text-sm text-gray-400 hover:text-red-500 transition-colors"
            @click="auth.logout()"
          >
            退出
          </button>
        </div>
      </header>

      <!-- 主内容 -->
      <main class="p-6">
        <slot />
      </main>
    </div>

    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()
await auth.init()

const route = useRoute()

const navItems = [
  { to: '/admin', icon: '📊', label: '仪表盘' },
  { to: '/admin/products', icon: '📦', label: '商品管理' },
  { to: '/admin/categories', icon: '📂', label: '分类管理' },
  { to: '/admin/orders', icon: '📋', label: '订单管理' },
  { to: '/admin/users', icon: '👥', label: '用户管理' },
  { to: '/admin/coupons', icon: '🎫', label: '优惠券管理' },
]

const pageTitle = computed(() => {
  const item = navItems.find((n) => n.to === route.path)
  return item?.label || '后台管理'
})
</script>
