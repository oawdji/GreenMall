<template>
  <div class="container-page">
    <!-- 面包屑 -->
    <nav class="text-sm text-gray-500 mb-6">
      <NuxtLink to="/" class="hover:text-primary-600 transition-colors">首页</NuxtLink>
      <span class="mx-2">/</span>
      <NuxtLink to="/cart" class="hover:text-primary-600 transition-colors">购物车</NuxtLink>
      <span class="mx-2">/</span>
      <span class="text-gray-900">确认订单</span>
    </nav>

    <h1 class="text-2xl font-bold text-gray-900 mb-6">确认订单</h1>

    <!-- 空状态检查 -->
    <div v-if="cart.selectedItems.length === 0" class="text-center py-20">
      <span class="text-5xl">📦</span>
      <p class="text-gray-500 mt-4">没有选中任何商品</p>
      <AppButton class="mt-4" @click="navigateTo('/cart')">返回购物车</AppButton>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧：地址 + 商品 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 收货地址 -->
          <section class="bg-white rounded-2xl border border-gray-100 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900">收货地址</h2>
              <button
                class="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                @click="showAddressForm = true"
              >
                {{ addresses.length > 0 ? '管理地址' : '新增地址' }}
              </button>
            </div>

            <!-- 地址选择 -->
            <div v-if="addresses.length > 0" class="space-y-2">
              <label
                v-for="addr in addresses"
                :key="addr.id"
                :class="[
                  'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors',
                  selectedAddressId === addr.id
                    ? 'border-primary-500 bg-primary-50/50'
                    : 'border-gray-200 hover:border-gray-300',
                ]"
              >
                <input
                  v-model="selectedAddressId"
                  type="radio"
                  :value="addr.id"
                  class="mt-0.5 text-primary-600 focus:ring-primary-500"
                />
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-medium text-gray-900">{{ addr.receiverName }}</span>
                    <span class="text-sm text-gray-500">{{ addr.phone }}</span>
                    <span
                      v-if="addr.isDefault"
                      class="rounded-full bg-primary-100 text-primary-700 px-2 py-0.5 text-xs font-medium"
                    >
                      默认
                    </span>
                  </div>
                  <p class="text-sm text-gray-600">
                    {{ addr.province }}{{ addr.city }}{{ addr.district }} {{ addr.detail }}
                  </p>
                </div>
              </label>
            </div>

            <!-- 无地址 -->
            <div v-else class="text-center py-8">
              <p class="text-sm text-gray-500">还没有收货地址，请添加</p>
              <AppButton size="sm" class="mt-3" @click="showAddressForm = true">新增地址</AppButton>
            </div>
          </section>

          <!-- 订单备注 -->
          <section class="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">订单备注</h2>
            <textarea
              v-model="remark"
              rows="2"
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none"
              placeholder="选填：如有特殊要求请在此备注"
              maxlength="200"
            />
          </section>

          <!-- 商品明细 -->
          <section class="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">商品明细</h2>
            <div class="space-y-3">
              <div
                v-for="item in cart.selectedItems"
                :key="item.id"
                class="flex items-center gap-4"
              >
                <div class="w-16 h-16 flex-shrink-0 rounded-lg bg-gray-50 overflow-hidden border border-gray-100">
                  <img
                    v-if="item.product.coverImage"
                    :src="item.product.coverImage"
                    :alt="item.product.name"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 line-clamp-1">{{ item.product.name }}</p>
                  <p class="text-sm text-gray-500 mt-0.5">× {{ item.quantity }}</p>
                </div>
                <p class="text-sm font-semibold text-red-500">¥{{ (item.product.price * item.quantity).toFixed(2) }}</p>
              </div>
            </div>
          </section>
        </div>

        <!-- 右侧：结算卡片 -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">费用明细</h3>

            <div class="space-y-3 text-sm">
              <div class="flex justify-between text-gray-600">
                <span>商品总额（{{ cart.selectedCount }} 件）</span>
                <span>¥{{ cart.selectedTotalAmount.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>运费</span>
                <span class="text-green-600">免运费</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>优惠券</span>
                <span v-if="selectedCoupon" class="text-green-600">
                  -¥{{ couponDiscountAmount.toFixed(2) }}
                </span>
                <span v-else class="text-gray-400">未使用</span>
              </div>
              <hr class="border-gray-100" />
              <div class="flex justify-between text-lg font-semibold">
                <span class="text-gray-900">实付金额</span>
                <span class="text-red-500">¥{{ finalAmount.toFixed(2) }}</span>
              </div>
            </div>

            <!-- 优惠券选择 -->
            <div v-if="availableCoupons.length > 0" class="pt-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">选择优惠券</label>
              <select
                v-model="selectedCouponId"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              >
                <option :value="null">不使用优惠券</option>
                <option
                  v-for="uc in availableCoupons"
                  :key="uc.id"
                  :value="uc.id"
                >
                  {{ formatCouponLabel(uc) }}
                </option>
              </select>
            </div>

            <AppButton
              block
              size="lg"
              :disabled="!selectedAddressId || submitting"
              :loading="submitting"
              @click="handleSubmitOrder"
            >
              提交订单
            </AppButton>
          </div>
        </div>
      </div>
    </template>

    <!-- 地址表单弹窗 -->
    <AppModal
      v-model="showAddressForm"
      :title="editingAddressId ? '编辑地址' : '新增地址'"
      size="lg"
    >
      <form class="space-y-4" @submit.prevent="handleSaveAddress">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">收货人 <span class="text-red-500">*</span></label>
            <input
              v-model.trim="addressForm.receiverName"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              required
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">手机号 <span class="text-red-500">*</span></label>
            <input
              v-model.trim="addressForm.phone"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              required
            />
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">省份</label>
            <input v-model.trim="addressForm.province" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">城市</label>
            <input v-model.trim="addressForm.city" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">区/县</label>
            <input v-model.trim="addressForm.district" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
          </div>
        </div>
        <div>
          <label class="block text-sm text-gray-700 mb-1">详细地址 <span class="text-red-500">*</span></label>
          <input
            v-model.trim="addressForm.detail"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            placeholder="街道、门牌号等"
            required
          />
        </div>
        <div class="flex items-center gap-2">
          <input v-model="addressForm.isDefault" type="checkbox" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          <span class="text-sm text-gray-700">设为默认地址</span>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <AppButton variant="secondary" type="button" @click="showAddressForm = false">取消</AppButton>
          <AppButton type="submit">保存</AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { Address, UserCoupon } from '~/types/api'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const cart = useCartStore()
const toast = useToast()
const router = useRouter()

// 确保购物车已加载
if (!cart.initialized) {
  await cart.fetchCart()
}

// 跳转回购物车如果没有选中商品（客户端检查）
if (import.meta.client && cart.selectedItems.length === 0) {
  // 不强制跳转，显示空状态
}

// ---- 收货地址（本地存储，待后端 API 对接） ----
const addresses = ref<Address[]>([])
const selectedAddressId = ref<number | null>(null)
const showAddressForm = ref(false)
const editingAddressId = ref<number | null>(null)

const addressForm = reactive({
  receiverName: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false,
})

// 从 localStorage 恢复地址
function loadAddresses() {
  try {
    const saved = localStorage.getItem('gm_addresses')
    if (saved) {
      addresses.value = JSON.parse(saved)
      const defaultAddr = addresses.value.find((a) => a.isDefault)
      if (defaultAddr) {
        selectedAddressId.value = defaultAddr.id
      } else if (addresses.value.length > 0) {
        selectedAddressId.value = addresses.value[0].id
      }
    }
  } catch {
    // ignore
  }
}

function saveAddresses() {
  localStorage.setItem('gm_addresses', JSON.stringify(addresses.value))
}

function handleSaveAddress() {
  if (!addressForm.receiverName || !addressForm.phone || !addressForm.detail) {
    toast.error('请填写必填字段')
    return
  }

  if (editingAddressId.value) {
    const idx = addresses.value.findIndex((a) => a.id === editingAddressId.value)
    if (idx !== -1) {
      addresses.value[idx] = { ...addressForm, id: editingAddressId.value! }
    }
    toast.success('地址已更新')
  } else {
    if (addressForm.isDefault) {
      addresses.value.forEach((a) => (a.isDefault = false))
    }
    addresses.value.push({ ...addressForm, id: Date.now() })
    toast.success('地址已添加')
  }

  saveAddresses()
  if (!selectedAddressId.value) {
    selectedAddressId.value = addresses.value[addresses.value.length - 1]?.id ?? null
  }
  resetAddressForm()
}

function resetAddressForm() {
  editingAddressId.value = null
  Object.assign(addressForm, {
    receiverName: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false,
  })
  showAddressForm.value = false
}

loadAddresses()

// ---- 备注 ----
const remark = ref('')

// ---- 优惠券 ----
const availableCoupons = ref<UserCoupon[]>([])
const selectedCouponId = ref<number | null>(null)

const selectedCoupon = computed(() =>
  availableCoupons.value.find((uc) => uc.id === selectedCouponId.value) ?? null,
)

const couponDiscountAmount = computed(() => {
  const uc = selectedCoupon.value
  if (!uc) return 0
  const total = cart.selectedTotalAmount
  const c = uc.coupon
  if (c.type === 'fixed') {
    return Math.min(c.discountValue, total)
  } else {
    let discount = total * (c.discountValue / 100)
    if (c.maxDiscount) {
      discount = Math.min(discount, c.maxDiscount)
    }
    return Math.min(discount, total)
  }
})

const finalAmount = computed(() => {
  return Math.max(0, cart.selectedTotalAmount - couponDiscountAmount.value)
})

function formatCouponLabel(uc: UserCoupon): string {
  const c = uc.coupon
  if (c.type === 'fixed') {
    return `${c.name}（满${c.minAmount}减${c.discountValue}）`
  } else {
    const maxStr = c.maxDiscount ? `最高减${c.maxDiscount}` : ''
    return `${c.name}（${c.discountValue}折${maxStr}）`
  }
}

// 加载可用优惠券
async function loadCoupons() {
  try {
    const api = useApi()
    const data = await api.get<{ list: UserCoupon[] } | UserCoupon[]>('/coupons/my')
    const list = Array.isArray(data) ? data : (data as { list: UserCoupon[] }).list ?? data
    availableCoupons.value = (list as UserCoupon[]).filter(
      (uc) => uc.status === 'unused' && uc.coupon.isActive,
    )
  } catch {
    // 优惠券加载非关键
  }
}

await loadCoupons()

// ---- 提交订单 ----
const submitting = ref(false)

async function handleSubmitOrder() {
  const selectedAddr = addresses.value.find((a) => a.id === selectedAddressId.value)
  if (!selectedAddr) {
    toast.error('请选择收货地址')
    return
  }

  submitting.value = true
  try {
    const api = useApi()
    const body: Record<string, unknown> = {
      receiverName: selectedAddr.receiverName,
      receiverPhone: selectedAddr.phone,
      receiverAddress: `${selectedAddr.province}${selectedAddr.city}${selectedAddr.district} ${selectedAddr.detail}`,
      remark: remark.value || undefined,
    }
    if (selectedCouponId.value) {
      body.userCouponId = selectedCouponId.value
    }

    const order = await api.post<{ id: number; orderNo: string }>('/orders', body)
    toast.success('下单成功！')
    // 下单成功后清空购物车并跳转
    await cart.fetchCart()
    router.push(`/orders/${order.id}`)
  } catch (err: unknown) {
    toast.error((err as Error).message || '下单失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>
