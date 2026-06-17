<template>
  <div class="container-page">
    <!-- 面包屑 -->
    <nav class="text-sm text-gray-500 mb-6">
      <NuxtLink to="/" class="hover:text-primary-600 transition-colors">首页</NuxtLink>
      <span class="mx-2">/</span>
      <NuxtLink to="/user" class="hover:text-primary-600 transition-colors">个人中心</NuxtLink>
      <span class="mx-2">/</span>
      <span class="text-gray-900">我的优惠券</span>
    </nav>

    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">我的优惠券</h1>
      <AppButton size="sm" @click="showAvailable = true">领券中心</AppButton>
    </div>

    <!-- 状态 Tab -->
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
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 加载 -->
    <div v-if="pending" class="space-y-3">
      <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-3" />
        <div class="h-4 bg-gray-200 rounded w-1/2 mb-3" />
        <div class="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredCoupons.length === 0" class="text-center py-20">
      <span class="text-5xl">🎫</span>
      <p class="text-gray-500 mt-4">
        {{ activeTab === 'unused' ? '还没有可用的优惠券' : activeTab === 'used' ? '还没有已使用的优惠券' : '没有已过期的优惠券' }}
      </p>
      <AppButton v-if="activeTab === 'unused'" class="mt-4" @click="showAvailable = true">去领券</AppButton>
    </div>

    <!-- 优惠券列表 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="uc in filteredCoupons"
        :key="uc.id"
        :class="[
          'relative rounded-xl border-2 overflow-hidden transition-opacity',
          uc.status === 'used' || uc.status === 'expired'
            ? 'border-gray-200 opacity-60'
            : 'border-primary-200 hover:border-primary-400',
        ]"
      >
        <!-- 左侧金额 -->
        <div class="flex">
          <div
            :class="[
              'flex-shrink-0 w-28 flex flex-col items-center justify-center py-5',
              uc.status === 'unused'
                ? 'bg-primary-50 text-primary-700'
                : 'bg-gray-100 text-gray-500',
            ]"
          >
            <template v-if="uc.coupon.type === 'fixed'">
              <span class="text-3xl font-bold">¥{{ uc.coupon.discountValue }}</span>
            </template>
            <template v-else>
              <span class="text-3xl font-bold">{{ uc.coupon.discountValue }}</span>
              <span class="text-sm">折</span>
            </template>
            <span class="text-xs mt-1">
              满{{ uc.coupon.minAmount > 0 ? `¥${uc.coupon.minAmount}` : '任意' }}可用
            </span>
          </div>

          <!-- 右侧信息 -->
          <div class="flex-1 p-4 flex flex-col justify-between">
            <div>
              <h3 class="font-semibold text-gray-900">{{ uc.coupon.name }}</h3>
              <p v-if="uc.coupon.type === 'percent' && uc.coupon.maxDiscount" class="text-xs text-gray-500 mt-0.5">
                最高优惠 ¥{{ uc.coupon.maxDiscount }}
              </p>
            </div>
            <div class="text-xs text-gray-400 mt-2">
              <p v-if="uc.coupon.endDate">
                有效期至 {{ new Date(uc.coupon.endDate).toLocaleDateString('zh-CN') }}
              </p>
              <p v-else>长期有效</p>
            </div>
          </div>
        </div>

        <!-- 状态角标 -->
        <span
          v-if="uc.status === 'used'"
          class="absolute top-3 right-3 rounded bg-gray-200 text-gray-600 px-2 py-0.5 text-xs"
        >已使用</span>
        <span
          v-else-if="uc.status === 'expired'"
          class="absolute top-3 right-3 rounded bg-gray-200 text-gray-600 px-2 py-0.5 text-xs"
        >已过期</span>
      </div>
    </div>

    <!-- 领券中心弹窗 -->
    <AppModal v-model="showAvailable" title="领券中心" size="lg">
      <div v-if="availableLoading" class="text-center py-8 text-gray-500 text-sm">加载中...</div>
      <div v-else-if="availableList.length === 0" class="text-center py-8">
        <p class="text-gray-500 text-sm">暂无可领取的优惠券</p>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="c in availableList"
          :key="c.id"
          class="rounded-xl border border-primary-200 bg-primary-50/30 p-4 flex items-center justify-between"
        >
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900">{{ c.name }}</h4>
            <div class="text-sm text-gray-600 mt-1">
              <template v-if="c.type === 'fixed'">
                满{{ c.minAmount > 0 ? `¥${c.minAmount}` : '任意' }}减 ¥{{ c.discountValue }}
              </template>
              <template v-else>
                {{ c.discountValue }}折
                <span v-if="c.maxDiscount">（最高减 ¥{{ c.maxDiscount }}）</span>
              </template>
            </div>
            <p class="text-xs text-gray-400 mt-1">
              剩余 {{ c.remainingQuantity }}/{{ c.totalQuantity }}
              <span v-if="c.endDate" class="ml-2">
                有效期至 {{ new Date(c.endDate).toLocaleDateString('zh-CN') }}
              </span>
            </p>
          </div>
          <AppButton
            size="sm"
            :loading="claimingId === c.id"
            @click="handleClaim(c.id)"
          >
            立即领取
          </AppButton>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { Coupon, UserCoupon } from '~/types/api'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const api = useApi()
const toast = useToast()

const tabs = [
  { label: '未使用', value: 'unused' },
  { label: '已使用', value: 'used' },
  { label: '已过期', value: 'expired' },
]

const activeTab = ref('unused')
const showAvailable = ref(false)
const claimingId = ref<number | null>(null)

// 我的优惠券
const {
  data: myCoupons,
  pending,
  refresh,
} = await useAsyncData('my-coupons', async () => {
  try {
    const data = await api.get<UserCoupon[]>('/coupons/my')
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
})

const filteredCoupons = computed(() => {
  if (!myCoupons.value) return []
  return myCoupons.value.filter((uc) => uc.status === activeTab.value)
})

// 可领取的优惠券
const availableList = ref<Coupon[]>([])
const availableLoading = ref(false)

async function loadAvailable() {
  availableLoading.value = true
  try {
    availableList.value = await api.get<Coupon[]>('/coupons')
  } catch {
    availableList.value = []
  } finally {
    availableLoading.value = false
  }
}

// 监听弹窗打开
watch(showAvailable, (val) => {
  if (val) loadAvailable()
})

async function handleClaim(couponId: number) {
  claimingId.value = couponId
  try {
    await api.post(`/coupons/${couponId}/claim`)
    toast.success('领取成功')
    // 从列表中移除已领取的
    availableList.value = availableList.value.filter((c) => c.id !== couponId)
    refresh()
  } catch (err: unknown) {
    toast.error((err as Error).message || '领取失败')
  } finally {
    claimingId.value = null
  }
}
</script>
