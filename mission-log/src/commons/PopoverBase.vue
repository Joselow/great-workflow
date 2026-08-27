<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const open = defineModel<boolean>({ default: false })

const root = ref<HTMLElement | null>(null)

const toggle = () => {
  open.value = !open.value
}

const close = () => {
  open.value = false
}

const onPointerDown = (event: MouseEvent) => {
  if (!open.value || !root.value) return
  if (!root.value.contains(event.target as Node)) {
    close()
  }
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('mousedown', onPointerDown)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="root" class="relative inline-flex">
    <slot name="trigger" :toggle="toggle" :open="open" />

    <div
      v-if="open"
      class="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 z-50
        min-w-[11.5rem] rounded-xl px-3 py-2.5 shadow-lg
        bg-white dark:bg-[#2b2b2b]
        border border-black/10 dark:border-white/10
        text-gray-800 dark:text-white"
    >
      <span
        class="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2
          border-8 border-transparent
          border-r-white dark:border-r-[#2b2b2b]"
      />
      <slot :close="close" />
    </div>
  </div>
</template>
