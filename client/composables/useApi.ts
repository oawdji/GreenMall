/**
 * API 请求封装
 *
 * 基于 Nuxt $fetch，自动处理：
 * - 拼接 baseURL
 * - 注入 JWT token（从 cookie 读取）
 * - 统一错误处理与友好中文提示
 * - 从 ApiResponse 中自动解包 data 字段
 */

import type { ApiResponse } from '~/types/api'
import { useAuthStore } from '~/stores/auth'

/** $fetch 原生 opts 类型（Nuxt 导出的公开契约） */
type FetchOptions = Parameters<typeof $fetch>[1]

/** 基本请求方法 */
async function request<T>(
  url: string,
  options?: FetchOptions,
): Promise<T> {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string

  // 从 auth store 获取 token（如果已登录）
  let token: string | undefined
  try {
    const authStore = useAuthStore()
    token = authStore.token
  } catch {
    // store 尚未初始化（SSR 场景或首次加载），从 cookie 读取
    const cookie = useCookie<string | null>('auth_token', { default: () => null })
    token = cookie.value ?? undefined
  }

  try {
    const response = await $fetch<ApiResponse<T>>(url, {
      baseURL,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    })

    // 检查业务状态码
    if (response.code && response.code !== 200 && response.code !== 201) {
      throw new Error(response.message || '请求失败')
    }

    return response.data as T
  } catch (error: unknown) {
    // 已是我们抛出的业务错误，直接再抛出
    if (error instanceof Error && !(error as { response?: unknown }).response) {
      // 不是网络错误，是业务错误
      throw error
    }

    // $fetch 网络/HTTP 错误
    const fetchError = error as { status?: number; message?: string; response?: { status?: number } }
    const status = fetchError.status ?? fetchError.response?.status ?? 0

    const errorMessages: Record<number, string> = {
      400: '请求参数有误',
      401: '请先登录',
      403: '没有权限执行此操作',
      404: '请求的资源不存在',
      409: '数据冲突，请检查后重试',
      422: '请求参数校验失败',
      500: '服务器内部错误，请稍后重试',
    }

    throw new Error(
      errorMessages[status] || fetchError.message || '网络请求失败，请检查网络连接',
    )
  }
}

/** 对外暴露的请求方法集合 */
export function useApi() {
  return {
    get<T>(url: string, params?: Record<string, unknown>, options?: FetchOptions) {
      const query = params ? new URLSearchParams() : undefined
      if (query && params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            query.append(key, String(value))
          }
        })
      }
      const queryString = query?.toString()
      const fullUrl = queryString ? `${url}?${queryString}` : url
      return request<T>(fullUrl, { method: 'GET', ...options })
    },

    post<T>(url: string, body?: unknown, options?: FetchOptions) {
      return request<T>(url, { method: 'POST', body, ...options })
    },

    put<T>(url: string, body?: unknown, options?: FetchOptions) {
      return request<T>(url, { method: 'PUT', body, ...options })
    },

    patch<T>(url: string, body?: unknown, options?: FetchOptions) {
      return request<T>(url, { method: 'PATCH', body, ...options })
    },

    delete<T>(url: string, options?: FetchOptions) {
      return request<T>(url, { method: 'DELETE', ...options })
    },
  }
}
