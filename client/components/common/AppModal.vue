<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeOnOverlay && $emit('update:modelValue', false)"
      >
        <!-- 遮罩层 -->
        <div class="fixed inset-0 bg-black/40 transition-opacity" />

        <!-- 弹窗内容 -->
        <div
          :class="[
            'relative z-10 w-full rounded-xl bg-white shadow-xl',
            sizeClasses[size],
          ]"
        >
          <!-- 标题栏 -->
          <div v-if="title || showClose" class="flex items-center justify-between border-b px-6 py-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
            <button
              v-if="showClose"
              class="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              @click="$emit('update:modelValue', false)"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 内容区 -->
          <div :class="bodyClass">
            <slot />
          </div>

          <!-- 底部操作区 -->
          <div v-if="$slots.footer" class="flex items-center justify-end gap-3 border-t px-6 py-4">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    size?: 'sm' | 'md' | 'lg'
    showClose?: boolean
    closeOnOverlay?: boolean
    bodyClass?: string
  }>(),
  {
    size: 'md',
    showClose: true,
    closeOnOverlay: true,
    bodyClass: 'px-6 py-4',
  },
)

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
