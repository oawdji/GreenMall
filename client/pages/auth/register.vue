<template>
  <div class="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">创建账号</h1>
        <p class="text-gray-500 mt-2">注册 GreenMall，开启品质生活</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <!-- 错误提示 -->
        <div
          v-if="errorMsg"
          class="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {{ errorMsg }}
        </div>

        <form class="space-y-4" @submit.prevent="handleRegister">
          <!-- 用户名 * -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              用户名 <span class="text-red-500">*</span>
            </label>
            <input
              v-model.trim="form.username"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
              placeholder="3-20 个字符，字母/数字/下划线"
              required
            />
          </div>

          <!-- 密码 * -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              密码 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.password"
              type="password"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
              placeholder="至少 6 个字符"
              required
            />
          </div>

          <!-- 昵称 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              昵称
            </label>
            <input
              v-model.trim="form.nickname"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
              placeholder="选填，用于展示"
            />
          </div>

          <!-- 邮箱 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              邮箱
            </label>
            <input
              v-model.trim="form.email"
              type="email"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
              placeholder="选填"
            />
          </div>

          <!-- 手机号 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              手机号
            </label>
            <input
              v-model.trim="form.phone"
              type="tel"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
              placeholder="选填"
            />
          </div>

          <!-- 提交 -->
          <AppButton
            type="submit"
            block
            size="lg"
            :loading="loading"
          >
            注 册
          </AppButton>
        </form>

        <!-- 去登录 -->
        <p class="mt-6 text-center text-sm text-gray-500">
          已有账号？
          <NuxtLink
            to="/auth/login"
            class="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            立即登录
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const form = reactive({
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
})

const loading = ref(false)
const errorMsg = ref('')

async function handleRegister() {
  errorMsg.value = ''

  if (!form.username || !form.password) {
    errorMsg.value = '请填写用户名和密码'
    return
  }

  if (form.username.length < 3) {
    errorMsg.value = '用户名至少 3 个字符'
    return
  }

  if (form.password.length < 6) {
    errorMsg.value = '密码至少 6 个字符'
    return
  }

  loading.value = true
  try {
    await authStore.register({
      username: form.username,
      password: form.password,
      nickname: form.nickname || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
    })
    toast.success('注册成功')
    router.push('/')
  } catch (err: unknown) {
    errorMsg.value = (err as Error).message || '注册失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>
