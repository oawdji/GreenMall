<template>
  <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 via-green-100 to-green-200 group/banner">
    <div class="relative h-[320px]">
      <!-- 轮播内容 -->
      <div
        v-for="(slide, index) in slides"
        :key="index"
        class="absolute inset-0 transition-all duration-500 ease-in-out flex items-center"
        :class="index === current ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-full pointer-events-none'"
      >
        <div class="flex items-center justify-between w-full px-12 sm:px-16 lg:px-20">
          <div class="flex-1 max-w-lg">
            <div class="inline-block bg-white/80 backdrop-blur-sm text-green-600 text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide">
              {{ slide.tag }}
            </div>
            <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3">
              {{ slide.title }}
            </h2>
            <p class="text-base text-gray-600 mb-6">
              {{ slide.subtitle }}
            </p>
            <NuxtLink
              :to="slide.link"
              class="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-2.5 rounded-lg font-medium
                     hover:bg-green-600 transition-all shadow-sm hover:shadow-md"
            >
              {{ slide.cta }}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
          </div>
          <div class="hidden md:flex items-center justify-center w-64 h-64 bg-white/50 backdrop-blur-sm rounded-3xl shadow-sm">
            <span class="text-7xl select-none">{{ slide.emoji }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 左右箭头 (hover 时显示) -->
    <button
      class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm hover:shadow-md
             flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition-opacity"
      @click="prev"
    >
      <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <button
      class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm hover:shadow-md
             flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition-opacity"
      @click="next"
    >
      <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <!-- 指示器 -->
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
      <button
        v-for="(_, index) in slides"
        :key="index"
        class="rounded-full transition-all duration-300"
        :class="index === current ? 'w-8 h-2.5 bg-green-500' : 'w-2.5 h-2.5 bg-green-300 hover:bg-green-400'"
        @click="goTo(index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const slides = [
  {
    tag: '限时特惠',
    title: '618 年中大促',
    subtitle: '全场低至5折 · 精选好物限时抢 · 错过再等半年',
    cta: '立即抢购',
    emoji: '🛍️',
    link: '/products?sortBy=salesCount&sortOrder=DESC',
  },
  {
    tag: '新品首发',
    title: '潮流新品 首发上线',
    subtitle: '最新数码装备、时尚单品抢先购 · 限时12期免息分期',
    cta: '探索新品',
    emoji: '✨',
    link: '/products?sortBy=createdAt&sortOrder=DESC',
  },
  {
    tag: '会员专区',
    title: '会员权益 全面升级',
    subtitle: '积分翻倍 · 专属折扣 · 优先发货 · 生日好礼',
    cta: '了解权益',
    emoji: '👑',
    link: '/user',
  },
]

const current = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function next() {
  current.value = (current.value + 1) % slides.length
}

function prev() {
  current.value = (current.value - 1 + slides.length) % slides.length
}

function goTo(index: number) {
  current.value = index
}

function startAutoPlay() {
  stopAutoPlay()
  timer = setInterval(next, 4000)
}

function stopAutoPlay() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => startAutoPlay())
onUnmounted(() => stopAutoPlay())
</script>
