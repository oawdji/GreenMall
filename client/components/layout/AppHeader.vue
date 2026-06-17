<template>
  <header class="sticky top-0 z-50 bg-white shadow-nav">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center h-16 gap-4">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 flex-shrink-0">
          <span class="text-2xl">🌿</span>
          <span class="text-lg font-bold text-green-500 hidden sm:block tracking-tight">
            GreenMall
          </span>
        </NuxtLink>

        <!-- 分类按钮 -->
        <div class="relative" @mouseenter="showMegaMenu = true" @mouseleave="showMegaMenu = false">
          <button
            class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span class="hidden sm:inline">分类</span>
          </button>

          <!-- Mega Menu 下拉面板 -->
          <Transition name="mega">
            <div
              v-if="showMegaMenu"
              class="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-mega border border-gray-100 p-6 min-w-[560px] z-50"
            >
              <div v-if="categoryLoading" class="text-center py-8 text-gray-400 text-sm">
                加载中...
              </div>
              <div v-else class="grid grid-cols-4 gap-x-8 gap-y-4">
                <div
                  v-for="cat in categories"
                  :key="cat.id"
                  class="min-w-0"
                >
                  <NuxtLink
                    :to="`/products?categoryId=${cat.id}`"
                    class="block text-sm font-semibold text-gray-800 hover:text-green-500 transition-colors mb-2"
                    @click="showMegaMenu = false"
                  >
                    {{ cat.icon }} {{ cat.name }}
                  </NuxtLink>
                  <div v-if="cat.children?.length" class="space-y-1">
                    <NuxtLink
                      v-for="child in cat.children"
                      :key="child.id"
                      :to="`/products?categoryId=${child.id}`"
                      class="block text-xs text-gray-500 hover:text-green-500 transition-colors leading-relaxed"
                      @click="showMegaMenu = false"
                    >
                      {{ child.name }}
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- 搜索框（居中） -->
        <div class="flex-1 flex justify-center">
          <form class="w-full max-w-[480px]" @submit.prevent="handleSearch">
            <div class="relative">
              <input
                v-model.trim="searchQuery"
                type="text"
                placeholder="搜索商品、品牌、分类..."
                class="w-full rounded-lg border-2 border-gray-200 bg-gray-50 pl-4 pr-10 py-2 text-sm
                       focus:border-green-500 focus:ring-0 focus:bg-white
                       transition-all outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-500 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        <!-- 右侧图标区 -->
        <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <!-- 购物车 -->
          <NuxtLink
            to="/cart"
            class="relative rounded-lg p-2 text-gray-600 hover:text-green-500 hover:bg-green-50 transition-all"
            aria-label="购物车"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <span
              v-if="cartCount > 0"
              class="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-green-500 px-1 text-xs font-bold text-white shadow-sm"
            >
              {{ cartCount > 99 ? '99+' : cartCount }}
            </span>
          </NuxtLink>

          <!-- 用户区 -->
          <template v-if="auth.isLoggedIn">
            <div class="relative" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
              <button class="flex items-center gap-1 rounded-lg p-2 text-gray-600 hover:text-green-500 hover:bg-green-50 transition-all">
                <div class="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center ring-2 ring-green-100">
                  <span class="text-green-600 font-semibold text-xs">
                    {{ auth.username?.charAt(0)?.toUpperCase() }}
                  </span>
                </div>
              </button>

              <!-- 下拉菜单 -->
              <Transition name="dropdown">
                <div
                  v-if="showDropdown"
                  class="absolute right-0 top-full mt-1 w-44 rounded-xl bg-white shadow-mega border border-gray-100 py-1.5"
                >
                  <div class="px-4 py-2 border-b border-gray-50">
                    <div class="text-sm font-medium text-gray-900 truncate">{{ auth.username }}</div>
                    <div class="text-xs text-gray-400">欢迎回来</div>
                  </div>
                  <NuxtLink to="/user" class="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-green-500 transition-colors">
                    👤 个人中心
                  </NuxtLink>
                  <NuxtLink to="/orders" class="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-green-500 transition-colors">
                    📦 我的订单
                  </NuxtLink>
                  <NuxtLink to="/user/favorites" class="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-green-500 transition-colors">
                    ❤️ 我的收藏
                  </NuxtLink>
                  <NuxtLink to="/user/coupons" class="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-green-500 transition-colors">
                    🎫 我的优惠券
                  </NuxtLink>
                  <div v-if="auth.isAdmin" class="border-t border-gray-50 mt-1 pt-1">
                    <NuxtLink to="/admin" class="block px-4 py-2 text-sm text-green-600 font-medium hover:bg-green-50 transition-colors">
                      ⚙️ 后台管理
                    </NuxtLink>
                  </div>
                  <div class="border-t border-gray-50 mt-1 pt-1">
                    <button class="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-50 transition-colors" @click="auth.logout()">
                      退出登录
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </template>

          <!-- 未登录 -->
          <template v-else>
            <NuxtLink to="/auth/login" class="text-sm font-medium text-gray-600 hover:text-green-500 transition-colors px-3 py-2">
              登录
            </NuxtLink>
            <NuxtLink to="/auth/register" class="btn-primary !py-1.5 !px-4 text-sm !rounded-lg">
              注册
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { Category } from '~/types/api'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()

const searchQuery = ref('')
const showDropdown = ref(false)
const showMegaMenu = ref(false)

// 分类数据
const categories = ref<Category[]>([])
const categoryLoading = ref(false)
let categoriesLoaded = false

// 购物车数量
const cartCount = computed(() => cart.totalCount)

// 登录后拉取购物车
watch(
  () => auth.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) cart.fetchCart()
  },
  { immediate: true },
)

// 鼠标悬停分类按钮时加载分类数据（仅首次）
watch(showMegaMenu, async (show) => {
  if (show && !categoriesLoaded) {
    categoryLoading.value = true
    try {
      const { get } = useApi()
      const data = await get<Category[]>('/categories')
      categories.value = data || []
      categoriesLoaded = true
    } catch {
      // 分类加载失败，静默处理
    } finally {
      categoryLoading.value = false
    }
  }
})

function handleSearch() {
  if (searchQuery.value) {
    router.push({ path: '/products', query: { keyword: searchQuery.value } })
    searchQuery.value = ''
  }
}
</script>

<style scoped>
.mega-enter-active,
.mega-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.mega-enter-from,
.mega-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
