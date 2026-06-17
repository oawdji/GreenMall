/**
 * 管理员中间件 — 检查当前用户是否为 admin
 *
 * 非 admin 用户跳转到 403 页面或首页
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // 先确保已登录
  await authStore.init()

  if (!authStore.isLoggedIn) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
  }

  if (!authStore.isAdmin) {
    // 非管理员，跳转到首页并显示提示
    return navigateTo('/')
  }
})
