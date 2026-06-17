/**
 * 认证状态管理
 *
 * 管理登录状态、用户信息、JWT token
 * Token 持久化到 Cookie，刷新页面自动恢复
 */

import { defineStore } from 'pinia'
import type { User, AuthData } from '~/types/api'

export const useAuthStore = defineStore('auth', () => {
  // ---- state ----
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isInitialized = ref(false)

  // ---- getters ----
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const username = computed(() => user.value?.username ?? '')

  // ---- actions ----
  /** 初始化：从 cookie 恢复登录状态 */
  async function init() {
    if (isInitialized.value) return

    const cookie = useCookie<string | null>('auth_token', { default: () => null })
    if (cookie.value) {
      token.value = cookie.value
      // 尝试获取用户信息
      try {
        const { useApi } = await import('~/composables/useApi')
        const api = useApi()
        const userData = await api.get<User>('/auth/profile')
        // 注意：profile 端点返回的用户可能没有 role 字段，需要用 JWT payload 推断
        // 如果返回的 role 为空，从 token payload 中解析
        if (!userData.role) {
          const payload = parseTokenPayload(cookie.value)
          userData.role = payload?.role || 'customer'
        }
        user.value = userData
      } catch {
        // token 过期或无效，清除
        clearAuth()
      }
    }
    isInitialized.value = true
  }

  /** 登录 */
  async function login(username: string, password: string) {
    const { useApi } = await import('~/composables/useApi')
    const api = useApi()
    const data = await api.post<AuthData>('/auth/login', { username, password })
    setAuth(data)
  }

  /** 注册 */
  async function register(form: {
    username: string
    password: string
    email?: string
    phone?: string
    nickname?: string
  }) {
    const { useApi } = await import('~/composables/useApi')
    const api = useApi()
    const data = await api.post<AuthData>('/auth/register', form)
    setAuth(data)
  }

  /** 登出 */
  function logout() {
    clearAuth()
    navigateTo('/')
  }

  /** 刷新用户信息 */
  async function fetchProfile() {
    if (!token.value) return
    const { useApi } = await import('~/composables/useApi')
    const api = useApi()
    const userData = await api.get<User>('/auth/profile')
    if (!userData.role) {
      const payload = parseTokenPayload(token.value)
      userData.role = payload?.role || 'customer'
    }
    user.value = userData
  }

  // ---- 内部工具 ----
  function setAuth(data: AuthData) {
    token.value = data.token
    user.value = data.user
    // 持久化到 cookie（7 天过期）
    const cookie = useCookie('auth_token', {
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    })
    cookie.value = data.token
  }

  function clearAuth() {
    token.value = null
    user.value = null
    const cookie = useCookie('auth_token')
    cookie.value = null
  }

  function parseTokenPayload(tokenStr: string): { role?: string } | null {
    try {
      const base64Url = tokenStr.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      )
      return JSON.parse(jsonPayload)
    } catch {
      return null
    }
  }

  return {
    // state
    user,
    token,
    isInitialized,
    // getters
    isLoggedIn,
    isAdmin,
    username,
    // actions
    init,
    login,
    register,
    logout,
    fetchProfile,
  }
})
