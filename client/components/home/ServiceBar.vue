<template>
  <div class="bg-green-50 border border-green-100 rounded-2xl px-8 py-8">
    <div class="flex items-center justify-between">
      <div
        v-for="item in services"
        :key="item.label"
        class="flex items-center gap-3"
      >
        <span class="text-2xl">{{ item.icon }}</span>
        <div>
          <div class="text-sm font-semibold text-gray-800">{{ item.label }}</div>
          <div class="text-xs text-gray-500">{{ item.desc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const services = [
  { icon: '🚚', label: '免费配送', desc: '满99元包邮' },
  { icon: '🔄', label: '7天退换', desc: '无理由退换货' },
  { icon: '🛡️', label: '正品保障', desc: '品质有保证' },
  { icon: '💬', label: '在线客服', desc: '全天候服务' },
]
</script>
