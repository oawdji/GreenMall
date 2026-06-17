<template>
  <div>
    <h2 class="text-xl font-bold text-gray-900 mb-6">用户管理</h2>

    <!-- 搜索 -->
    <div class="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex items-center gap-3">
      <input
        v-model.trim="keyword"
        class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
        placeholder="搜索用户名、昵称、邮箱..."
        @keyup.enter="handleSearch"
      />
      <AppButton size="sm" variant="secondary" @click="handleSearch">搜索</AppButton>
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-left text-gray-600">
              <th class="px-5 py-3 font-medium">ID</th>
              <th class="px-5 py-3 font-medium">用户名</th>
              <th class="px-5 py-3 font-medium">昵称</th>
              <th class="px-5 py-3 font-medium">邮箱</th>
              <th class="px-5 py-3 font-medium">角色</th>
              <th class="px-5 py-3 font-medium">状态</th>
              <th class="px-5 py-3 font-medium">注册时间</th>
              <th class="px-5 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="pending">
              <td colspan="8" class="px-5 py-8 text-center text-gray-400">加载中...</td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="8" class="px-5 py-8 text-center text-gray-400">暂无用户</td>
            </tr>
            <tr
              v-for="u in users"
              v-else
              :key="u.id"
              class="hover:bg-gray-50/50 transition-colors"
            >
              <td class="px-5 py-3 text-gray-500">{{ u.id }}</td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-2">
                  <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-medium">
                    {{ u.username?.charAt(0)?.toUpperCase() }}
                  </div>
                  <span class="font-medium text-gray-900">{{ u.username }}</span>
                </div>
              </td>
              <td class="px-5 py-3 text-gray-600">{{ u.nickname || '-' }}</td>
              <td class="px-5 py-3 text-gray-600 text-xs">{{ u.email || '-' }}</td>
              <td class="px-5 py-3">
                <span
                  :class="[
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    u.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700',
                  ]"
                >
                  {{ u.role === 'admin' ? '管理员' : '用户' }}
                </span>
              </td>
              <td class="px-5 py-3">
                <span
                  :class="[
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                  ]"
                >
                  {{ u.isActive ? '正常' : '禁用' }}
                </span>
              </td>
              <td class="px-5 py-3 text-gray-500 text-xs">{{ formatDate(u.createdAt) }}</td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-2">
                  <button class="text-sm text-primary-600 hover:text-primary-700" @click="openDetail(u)">详情</button>
                  <button
                    :class="[
                      'text-sm',
                      u.isActive
                        ? 'text-orange-600 hover:text-orange-700'
                        : 'text-green-600 hover:text-green-700',
                    ]"
                    @click="handleToggleActive(u)"
                  >
                    {{ u.isActive ? '禁用' : '启用' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 分页 -->
    <div class="mt-6">
      <AppPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @change="handlePageChange"
      />
    </div>

    <!-- 用户详情弹窗 -->
    <AppModal v-model="showDetail" title="用户详情" size="md">
      <template v-if="detailUser">
        <div class="space-y-4">
          <div class="flex items-center gap-4 mb-6">
            <div class="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-bold">
              {{ detailUser.username?.charAt(0)?.toUpperCase() }}
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ detailUser.nickname || detailUser.username }}</h3>
              <p class="text-sm text-gray-500">@{{ detailUser.username }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500 block">用户 ID</span>
              <span class="text-gray-900">{{ detailUser.id }}</span>
            </div>
            <div>
              <span class="text-gray-500 block">角色</span>
              <span
                :class="[
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  detailUser.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700',
                ]"
              >
                {{ detailUser.role === 'admin' ? '管理员' : '普通用户' }}
              </span>
            </div>
            <div>
              <span class="text-gray-500 block">邮箱</span>
              <span class="text-gray-900">{{ detailUser.email || '-' }}</span>
            </div>
            <div>
              <span class="text-gray-500 block">手机号</span>
              <span class="text-gray-900">{{ detailUser.phone || '-' }}</span>
            </div>
            <div>
              <span class="text-gray-500 block">账号状态</span>
              <span :class="detailUser.isActive ? 'text-green-600' : 'text-red-600'">
                {{ detailUser.isActive ? '正常' : '已禁用' }}
              </span>
            </div>
            <div>
              <span class="text-gray-500 block">注册时间</span>
              <span class="text-gray-900">{{ formatFullDate(detailUser.createdAt) }}</span>
            </div>
            <div>
              <span class="text-gray-500 block">更新时间</span>
              <span class="text-gray-900">{{ formatFullDate(detailUser.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { User, PaginatedData } from '~/types/api'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const api = useApi()
const toast = useToast()

const keyword = ref('')
const currentPage = ref(1)
const pageSize = 15
const showDetail = ref(false)
const detailUser = ref<User | null>(null)

// 注意：后端目前没有用户管理 API，此页面作为 UI 框架先行搭建
// 当前通过 auth/profile 类似逻辑推断，实际需后端添加 /admin/users 端点
const { data: userData, pending, refresh } = await useAsyncData(
  'admin-users',
  async () => {
    // 尝试从后台接口获取，如果失败则返回空列表
    try {
      return await api.get<PaginatedData<User>>('/admin/users', {
        page: currentPage.value,
        pageSize,
        ...(keyword.value ? { keyword: keyword.value } : {}),
      })
    } catch {
      // 后端用户管理 API 尚未实现，返回空数组
      return { list: [], total: 0 } as PaginatedData<User>
    }
  },
)

const users = computed(() => (userData.value as PaginatedData<User> | null)?.list || [])
const total = computed(() => (userData.value as PaginatedData<User> | null)?.total || 0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

function handleSearch() {
  currentPage.value = 1
  refresh()
}

function handlePageChange(page: number) {
  currentPage.value = page
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('zh-CN')
}

function openDetail(user: User) {
  detailUser.value = user
  showDetail.value = true
}

async function handleToggleActive(user: User) {
  const action = user.isActive ? '禁用' : '启用'
  if (!confirm(`确定要${action}用户「${user.username}」吗？`)) return
  try {
    await api.patch(`/admin/users/${user.id}/status`, { isActive: !user.isActive })
    toast.success(`用户已${action}`)
    refresh()
  } catch {
    // 后端 API 未实现时，提示用户
    toast.error('该功能需要后端添加用户管理 API')
  }
}
</script>
