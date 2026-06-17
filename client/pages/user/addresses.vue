<template>
  <div class="container-page">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">收货地址</h1>
      <AppButton size="sm" @click="showForm = true">
        新增地址
      </AppButton>
    </div>

    <!-- 地址列表 -->
    <div v-if="addresses.length > 0" class="space-y-3">
      <div
        v-for="addr in addresses"
        :key="addr.id"
        :class="[
          'bg-white rounded-xl border p-5 transition-colors',
          addr.isDefault ? 'border-primary-300 bg-primary-50/30' : 'border-gray-100',
        ]"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
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
          <div class="flex items-center gap-2 ml-4">
            <button
              class="text-sm text-gray-400 hover:text-primary-600 transition-colors"
              @click="editAddress(addr)"
            >
              编辑
            </button>
            <button
              v-if="!addr.isDefault"
              class="text-sm text-gray-400 hover:text-red-500 transition-colors"
              @click="deleteAddress(addr.id)"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-16">
      <span class="text-5xl">📍</span>
      <p class="text-gray-500 mt-4">还没有收货地址</p>
      <AppButton class="mt-4" @click="showForm = true">添加第一个地址</AppButton>
    </div>

    <!-- 新增/编辑弹窗 -->
    <AppModal
      v-model="showForm"
      :title="editingId ? '编辑地址' : '新增地址'"
      @update:model-value="!showForm && resetForm()"
    >
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">收货人 <span class="text-red-500">*</span></label>
            <input
              v-model.trim="form.receiverName"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              required
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">手机号 <span class="text-red-500">*</span></label>
            <input
              v-model.trim="form.phone"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              required
            />
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">省份</label>
            <input v-model.trim="form.province" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">城市</label>
            <input v-model.trim="form.city" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">区/县</label>
            <input v-model.trim="form.district" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
          </div>
        </div>
        <div>
          <label class="block text-sm text-gray-700 mb-1">详细地址 <span class="text-red-500">*</span></label>
          <input
            v-model.trim="form.detail"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            placeholder="街道、门牌号等"
            required
          />
        </div>
        <div class="flex items-center gap-2">
          <input v-model="form.isDefault" type="checkbox" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          <span class="text-sm text-gray-700 cursor-pointer">设为默认地址</span>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <AppButton variant="secondary" type="button" @click="showForm = false">取消</AppButton>
          <AppButton type="submit" :loading="saving">保存</AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const toast = useToast()

// 临时：本地 mock 数据，等待后端地址 API 实现
interface AddressItem {
  id: number
  receiverName: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

const addresses = ref<AddressItem[]>([
  {
    id: 1,
    receiverName: '张三',
    phone: '13800138000',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detail: '科技园路 100 号 3 栋 501',
    isDefault: true,
  },
])

const showForm = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)

const defaultForm = () => ({
  receiverName: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false,
})

const form = reactive<{
  receiverName: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}>(defaultForm())

function editAddress(addr: AddressItem) {
  editingId.value = addr.id
  Object.assign(form, addr)
  showForm.value = true
}

function deleteAddress(id: number) {
  if (!confirm('确定要删除这个地址吗？')) return
  addresses.value = addresses.value.filter((a) => a.id !== id)
  toast.success('地址已删除')
}

async function handleSubmit() {
  if (!form.receiverName || !form.phone || !form.detail) {
    toast.error('请填写必填字段')
    return
  }
  saving.value = true

  // 模拟异步保存
  await new Promise((r) => setTimeout(r, 300))

  if (editingId.value) {
    const idx = addresses.value.findIndex((a) => a.id === editingId.value)
    if (idx !== -1) {
      Object.assign(addresses.value[idx], { ...form })
    }
    toast.success('地址已更新')
  } else {
    const newAddr: AddressItem = {
      ...form,
      id: Date.now(),
      receiverName: form.receiverName,
    }
    if (newAddr.isDefault) {
      addresses.value.forEach((a) => (a.isDefault = false))
    }
    addresses.value.push(newAddr)
    toast.success('地址已添加')
  }

  resetForm()
  saving.value = false
}

function resetForm() {
  editingId.value = null
  Object.assign(form, defaultForm())
  showForm.value = false
}
</script>
