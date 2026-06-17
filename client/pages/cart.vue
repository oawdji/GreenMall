<template>
  <div class="container-page">
    <!-- 面包屑 -->
    <nav class="text-sm text-gray-500 mb-6">
      <NuxtLink to="/" class="hover:text-primary-600 transition-colors">首页</NuxtLink>
      <span class="mx-2">/</span>
      <span class="text-gray-900">购物车</span>
    </nav>

    <h1 class="text-2xl font-bold text-gray-900 mb-6">
      购物车
      <span v-if="cart.totalCount > 0" class="text-base font-normal text-gray-500 ml-2">
        （{{ cart.totalCount }} 件商品）
      </span>
    </h1>

    <!-- 加载状态 -->
    <div v-if="cart.loading && !cart.initialized" class="space-y-4">
      <div v-for="i in 4" :key="i" class="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
        <div class="flex gap-4">
          <div class="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
          <div class="flex-1 space-y-3">
            <div class="h-4 bg-gray-200 rounded w-3/4" />
            <div class="h-4 bg-gray-200 rounded w-1/4" />
            <div class="h-6 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="cart.items.length === 0" class="text-center py-20">
      <span class="text-6xl">🛒</span>
      <p class="text-gray-500 mt-4 text-lg">购物车还是空的</p>
      <p class="text-sm text-gray-400 mt-1">去逛逛，发现心仪的商品吧</p>
      <AppButton class="mt-6" @click="navigateTo('/products')">去购物</AppButton>
    </div>

    <!-- 购物车列表 -->
    <template v-else>
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- 左侧：商品列表 -->
        <div class="flex-1 space-y-3">
          <!-- 全选栏 -->
          <div class="bg-white rounded-xl border border-gray-100 px-5 py-3 flex items-center gap-3">
            <button
              class="flex items-center gap-2 text-sm"
              @click="cart.toggleSelectAll()"
            >
              <span
                :class="[
                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                  cart.isAllSelected
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'border-gray-300',
                ]"
              >
                <svg v-if="cart.isAllSelected" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </span>
              <span class="text-gray-700">全选</span>
            </button>
            <button
              class="ml-auto text-sm text-gray-400 hover:text-red-500 transition-colors"
              @click="handleClearCart"
            >
              清空购物车
            </button>
          </div>

          <!-- 商品卡片 -->
          <div
            v-for="item in cart.items"
            :key="item.id"
            class="bg-white rounded-xl border border-gray-100 p-5 transition-shadow hover:shadow-sm"
          >
            <div class="flex items-start gap-4">
              <!-- 选中框 -->
              <button
                class="mt-6 flex-shrink-0"
                @click="cart.toggleSelect(item.id)"
              >
                <span
                  :class="[
                    'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                    item.selected
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-gray-300',
                  ]"
                >
                  <svg v-if="item.selected" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </span>
              </button>

              <!-- 商品图片 -->
              <NuxtLink
                :to="`/products/${item.product.id}`"
                class="w-20 h-20 flex-shrink-0 rounded-lg bg-gray-50 overflow-hidden border border-gray-100"
              >
                <img
                  v-if="item.product.coverImage"
                  :src="item.product.coverImage"
                  :alt="item.product.name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </NuxtLink>

              <!-- 商品信息 -->
              <div class="flex-1 min-w-0">
                <NuxtLink
                  :to="`/products/${item.product.id}`"
                  class="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors"
                >
                  {{ item.product.name }}
                </NuxtLink>

                <p class="text-xl font-bold text-red-500 mt-2">¥{{ Number(item.product.price).toFixed(2) }}</p>

                <div class="mt-3 flex items-center justify-between">
                  <!-- 数量调节 -->
                  <div class="flex items-center border border-gray-300 rounded-lg">
                    <button
                      class="h-8 w-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30"
                      :disabled="item.quantity <= 1"
                      @click="cart.updateQuantity(item.id, item.quantity - 1)"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <span class="h-8 w-10 text-center text-sm leading-8 border-x border-gray-300 select-none">
                      {{ item.quantity }}
                    </span>
                    <button
                      class="h-8 w-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30"
                      :disabled="item.quantity >= item.product.stock"
                      @click="cart.updateQuantity(item.id, item.quantity + 1)"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  <!-- 删除 -->
                  <button
                    class="text-sm text-gray-400 hover:text-red-500 transition-colors"
                    @click="handleRemove(item.id)"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：结算栏 -->
        <div class="lg:w-80 flex-shrink-0">
          <div class="bg-white rounded-xl border border-gray-100 p-5 sticky top-24">
            <h3 class="text-sm font-semibold text-gray-900 mb-4">订单摘要</h3>

            <div class="space-y-3 text-sm">
              <div class="flex justify-between text-gray-600">
                <span>已选商品</span>
                <span>{{ cart.selectedCount }} 件</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>商品金额</span>
                <span>¥{{ cart.selectedTotalAmount.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>运费</span>
                <span class="text-green-600">免运费</span>
              </div>
              <hr class="border-gray-100" />
              <div class="flex justify-between text-base font-semibold text-gray-900">
                <span>合计</span>
                <span class="text-red-500">¥{{ cart.selectedTotalAmount.toFixed(2) }}</span>
              </div>
            </div>

            <AppButton
              class="mt-5"
              block
              size="lg"
              :disabled="!cart.canCheckout"
              @click="goCheckout"
            >
              {{ cart.canCheckout ? `去结算（${cart.selectedCount} 件）` : '请选择商品' }}
            </AppButton>
          </div>
        </div>
      </div>
    </template>

    <!-- 删除确认弹窗 -->
    <AppModal v-model="showDeleteConfirm" title="确认删除" size="sm">
      <p class="text-sm text-gray-600">确定要从购物车中移除该商品吗？</p>
      <template #footer>
        <AppButton variant="secondary" @click="showDeleteConfirm = false">取消</AppButton>
        <AppButton variant="danger" @click="confirmRemove">删除</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const cart = useCartStore()
const toast = useToast()
const router = useRouter()

await cart.fetchCart()

// 删除确认
const showDeleteConfirm = ref(false)
const pendingRemoveId = ref<number | null>(null)

function handleRemove(id: number) {
  pendingRemoveId.value = id
  showDeleteConfirm.value = true
}

async function confirmRemove() {
  if (pendingRemoveId.value === null) return
  try {
    await cart.removeItem(pendingRemoveId.value)
    toast.success('已移除')
  } catch (err: unknown) {
    toast.error((err as Error).message || '移除失败')
  } finally {
    showDeleteConfirm.value = false
    pendingRemoveId.value = null
  }
}

async function handleClearCart() {
  if (!confirm('确定要清空购物车吗？')) return
  try {
    await cart.clearCart()
    toast.success('购物车已清空')
  } catch (err: unknown) {
    toast.error((err as Error).message || '操作失败')
  }
}

function goCheckout() {
  router.push('/checkout')
}
</script>
