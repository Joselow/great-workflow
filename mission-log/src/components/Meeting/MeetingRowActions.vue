<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'


const root = ref<HTMLElement | null>(null)
const menuOpen = ref(false)
const menuStyle = ref({ top: '0px', left: '0px' })

const closeMenu = () => {
  menuOpen.value = false
  document.removeEventListener('pointerdown', onPointerDown)
}

const onPointerDown = (event: PointerEvent) => {
  const target = event.target
  if (target instanceof Node && root.value?.contains(target)) return
  closeMenu()
}

const openMenu = (event: MouseEvent) => {
  const button = event.currentTarget
  if (!(button instanceof HTMLElement)) return

  const rect = button.getBoundingClientRect()
  const menuWidth = 148
  const menuHeight = 40
  const left = Math.min(
    Math.max(8, rect.right - menuWidth),
    window.innerWidth - menuWidth - 8,
  )
  const openUp = window.innerHeight - rect.bottom < menuHeight + 12
  const top = openUp ? rect.top - menuHeight - 4 : rect.bottom + 4

  menuStyle.value = { top: `${top}px`, left: `${left}px` }
  menuOpen.value = true
  document.addEventListener('pointerdown', onPointerDown)
}

const toggleMenu = (event: MouseEvent) => {
  if (menuOpen.value) {
    closeMenu()
    return
  }
  openMenu(event)
}


onBeforeUnmount(closeMenu)
</script>

<template>
  <div
    ref="root"
    @click.stop
  >
    <button
      type="button"
      class="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-md border border-black/10 text-gray-600 hover:bg-black/5 dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/10"
      aria-label="Acciones"
      aria-haspopup="menu"
      :aria-expanded="menuOpen"
      @click="toggleMenu"
    >
      <span class="material-symbols-outlined text-[18px]">more_vert</span>
    </button>

    <div
      v-if="menuOpen"
      class="fixed z-30 w-36 rounded-lg border border-black/10 bg-white py-1 dark:border-white/15 dark:bg-neutral-900"
      :style="menuStyle"
      role="menu"
    >
     <slot />
    </div>
  </div>
</template>
