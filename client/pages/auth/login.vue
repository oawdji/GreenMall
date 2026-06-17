<template>
  <div class="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">欢迎回来</h1>
        <p class="text-gray-500 mt-2">登录您的 GreenMall 账号</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <!-- 错误提示 -->
        <div
          v-if="errorMsg"
          class="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {{ errorMsg }}
        </div>

        <form class="space-y-5" @submit.prevent="handleLogin">
          <!-- 用户名 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              用户名
            </label>
            <input
              v-model.trim="form.username"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
              placeholder="请输入用户名"
              required
            />
          </div>

          <!-- 密码 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              密码
            </label>
            <input
              v-model="form.password"
              type="password"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
              placeholder="请输入密码"
              required
            />
          </div>

          <!-- 提交 -->
          <AppButton
            type="submit"
            block
            size="lg"
            :loading="loading"
          >
            登 录
          </AppButton>
        </form>

        <!-- 去注册 -->
        <p class="mt-6 text-center text-sm text-gray-500">
          还没有账号？
          <NuxtLink
            to="/auth/register"
            class="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            立即注册
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
const route = useRoute()
const toast = useToast()

const form = reactive({
  username: '',
  password: '',
})

const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''

  if (!form.username || !form.password) {
    errorMsg.value = '请填写用户名和密码'
    return
  }

  loading.value = true
  try {
    await authStore.login(form.username, form.password)
    toast.success('登录成功')

    // 跳转到来源页或首页
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (err: unknown) {
    errorMsg.value = (err as Error).message || '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>
