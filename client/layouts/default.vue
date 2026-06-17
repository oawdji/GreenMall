<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
// 前台默认布局 — 在页面加载时初始化认证状态
const auth = useAuthStore()
await auth.init()
</script>
