/**
 * 购物车状态管理
 *
 * 管理购物车商品列表、数量、选中状态
 * 所有数据以服务端为准，每次操作后重新拉取
 */

import { defineStore } from 'pinia'
import type { CartItem } from '~/types/api'

export const useCartStore = defineStore('cart', () => {
  // ---- state ----
  const items = ref<CartItem[]>([])
  const loading = ref(false)
  const initialized = ref(false)

  // ---- getters ----
  const totalCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  const selectedItems = computed(() => items.value.filter((item) => item.selected))

  const selectedCount = computed(() =>
    selectedItems.value.reduce((sum, item) => sum + item.quantity, 0),
  )

  const selectedTotalAmount = computed(() =>
    selectedItems.value.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    ),
  )

  const isAllSelected = computed(
    () => items.value.length > 0 && items.value.every((item) => item.selected),
  )

  /** 是否有商品被选中（用于判断是否可以结算） */
  const canCheckout = computed(() => selectedItems.value.length > 0)

  // ---- actions ----

  /** 从服务端获取购物车列表 */
  async function fetchCart() {
    loading.value = true
    try {
      const { useApi } = await import('~/composables/useApi')
      const api = useApi()
      items.value = await api.get<CartItem[]>('/cart')
    } catch {
      items.value = []
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  /** 添加商品到购物车 */
  async function addItem(productId: number, quantity: number = 1) {
    const { useApi } = await import('~/composables/useApi')
    const api = useApi()
    await api.post('/cart', { productId, quantity })
    await fetchCart()
  }

  /** 更新购物车项数量 */
  async function updateQuantity(cartItemId: number, quantity: number) {
    if (quantity < 1) return
    const { useApi } = await import('~/composables/useApi')
    const api = useApi()
    await api.patch(`/cart/${cartItemId}`, { quantity })
    // 乐观更新
    const item = items.value.find((i) => i.id === cartItemId)
    if (item) item.quantity = quantity
    await fetchCart()
  }

  /** 删除购物车项 */
  async function removeItem(cartItemId: number) {
    const { useApi } = await import('~/composables/useApi')
    const api = useApi()
    await api.delete(`/cart/${cartItemId}`)
    items.value = items.value.filter((i) => i.id !== cartItemId)
  }

  /** 清空购物车 */
  async function clearCart() {
    const { useApi } = await import('~/composables/useApi')
    const api = useApi()
    await api.delete('/cart')
    items.value = []
  }

  /** 切换单个商品的选中状态 */
  async function toggleSelect(cartItemId: number) {
    const item = items.value.find((i) => i.id === cartItemId)
    if (!item) return
    const newSelected = !item.selected
    const { useApi } = await import('~/composables/useApi')
    const api = useApi()
    await api.patch(`/cart/${cartItemId}`, { selected: newSelected })
    item.selected = newSelected
  }

  /** 全选/取消全选 */
  async function toggleSelectAll() {
    const newSelected = !isAllSelected.value
    const { useApi } = await import('~/composables/useApi')
    const api = useApi()
    // 逐个更新（后端可能不支持批量，逐个调用）
    await Promise.all(
      items.value.map((item) =>
        api.patch(`/cart/${item.id}`, { selected: newSelected }),
      ),
    )
    items.value.forEach((item) => (item.selected = newSelected))
  }

  return {
    // state
    items,
    loading,
    initialized,
    // getters
    totalCount,
    selectedItems,
    selectedCount,
    selectedTotalAmount,
    isAllSelected,
    canCheckout,
    // actions
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    toggleSelect,
    toggleSelectAll,
  }
})
