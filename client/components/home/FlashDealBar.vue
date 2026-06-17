<template>
  <NuxtLink
    to="/products?sortBy=price&sortOrder=ASC"
    class="block bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4
           hover:bg-amber-100/70 transition-colors group"
  >
    <div class="flex items-center gap-6">
      <!-- 左侧标题 -->
      <div class="flex items-center gap-3 flex-shrink-0">
        <span class="text-2xl">⚡</span>
        <div>
          <div class="text-sm font-bold text-gray-800">限时特价</div>
          <div class="text-xs text-amber-600 font-medium">手慢无</div>
        </div>
      </div>

      <!-- 倒计时 -->
      <div class="flex items-center gap-2">
        <div class="text-xs text-gray-500">距结束</div>
        <div class="flex gap-1">
          <span class="bg-gray-900 text-white text-sm font-mono font-bold px-2 py-0.5 rounded">{{ hours[0] }}</span>
          <span class="bg-gray-900 text-white text-sm font-mono font-bold px-2 py-0.5 rounded">{{ hours[1] }}</span>
          <span class="text-gray-900 font-bold">:</span>
          <span class="bg-gray-900 text-white text-sm font-mono font-bold px-2 py-0.5 rounded">{{ minutes[0] }}</span>
          <span class="bg-gray-900 text-white text-sm font-mono font-bold px-2 py-0.5 rounded">{{ minutes[1] }}</span>
          <span class="text-gray-900 font-bold">:</span>
          <span class="bg-gray-900 text-white text-sm font-mono font-bold px-2 py-0.5 rounded">{{ seconds[0] }}</span>
          <span class="bg-gray-900 text-white text-sm font-mono font-bold px-2 py-0.5 rounded">{{ seconds[1] }}</span>
        </div>
      </div>

      <!-- 右侧标语 -->
      <div class="ml-auto flex items-center gap-2 text-sm text-amber-700 font-medium">
        <span>全场低至5折</span>
        <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
// 倒计时：距今天结束
const hours = ref('00')
const minutes = ref('00')
const seconds = ref('00')
let timer: ReturnType<typeof setInterval> | null = null

function updateCountdown() {
  const now = new Date()
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)
  const diff = Math.max(0, endOfDay.getTime() - now.getTime())
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  hours.value = String(h).padStart(2, '0')
  minutes.value = String(m).padStart(2, '0')
  seconds.value = String(s).padStart(2, '0')
}

onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
