/**
 * 认证中间件 — 检查用户是否登录
 *
 * 未登录时重定向到登录页，登录成功后返回原页面
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // 初始化（从 cookie 恢复 token）
  await authStore.init()

  if (!authStore.isLoggedIn) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
  }
})
