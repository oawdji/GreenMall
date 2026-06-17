/**
 * Toast 通知系统
 *
 * 全局响应式 toast，自动消失
 * 在 app.vue 中挂载 ToastContainer 即可使用
 */

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration: number
}

const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
  function addToast(
    message: string,
    type: Toast['type'] = 'info',
    duration: number = 3000,
  ) {
    const id = nextId++
    toasts.value.push({ id, message, type, duration })

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  function removeToast(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const success = (msg: string) => addToast(msg, 'success')
  const error = (msg: string) => addToast(msg, 'error', 5000)
  const warning = (msg: string) => addToast(msg, 'warning', 4000)
  const info = (msg: string) => addToast(msg, 'info')

  return {
    toasts: readonly(toasts),
    success,
    error,
    warning,
    info,
    removeToast,
  }
}
