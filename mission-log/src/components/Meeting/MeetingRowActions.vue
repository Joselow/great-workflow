<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue'

const root = ref<HTMLElement | null>(null)
const menuEl = ref<HTMLElement | null>(null)
const menuOpen = ref(false)
const menuStyle = ref<Record<string, string>>({ top: '0px', left: '0px' })

const closeMenu = () => {
  menuOpen.value = false
  document.removeEventListener('pointerdown', onPointerDown)
}

const onPointerDown = (event: PointerEvent) => {
  const target = event.target
  if (target instanceof Node && root.value?.contains(target)) return
  closeMenu()
}

const placeMenu = (button: HTMLElement) => {
  const menu = menuEl.value
  if (!menu) return

  const rect = button.getBoundingClientRect()
  const margin = 8
  const gap = 4
  const maxHeight = 240
  const minWidth = 144
  const maxWidth = 288

  const width = Math.min(Math.max(menu.offsetWidth, minWidth), maxWidth, window.innerWidth - margin * 2)
  const fullHeight = menu.scrollHeight
  const below = window.innerHeight - rect.bottom - margin
  const above = rect.top - margin
  const needed = Math.min(fullHeight, maxHeight)
  const openUp = below < needed + gap && above > below
  const space = Math.max(openUp ? above - gap : below - gap, 40)
  const height = Math.min(needed, space)
  const left = Math.min(Math.max(margin, rect.right - width), window.innerWidth - width - margin)
  const top = openUp ? rect.top - height - gap : rect.bottom + gap

  menuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    maxHeight: `${height}px`,
  }
}

const openMenu = async (event: MouseEvent) => {
  const button = event.currentTarget
  if (!(button instanceof HTMLElement)) return

  const rect = button.getBoundingClientRect()
  menuStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${Math.max(8, rect.right - 144)}px`,
    width: 'max-content',
    maxWidth: '288px',
    maxHeight: 'none',
  }
  menuOpen.value = true
  document.addEventListener('pointerdown', onPointerDown)
  await nextTick()
  placeMenu(button)
}

const toggleMenu = (event: MouseEvent) => {
  if (menuOpen.value) {
    closeMenu()
    return
  }

  void openMenu(event)
}

onBeforeUnmount(closeMenu)
</script>

<template>
  <div
    ref="root"
    @click.stop
    @dblclick.stop
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
      ref="menuEl"
      class="pretty-scroll fixed z-30 overflow-y-auto rounded-lg border border-black/10 bg-white py-1 shadow-lg dark:border-white/15 dark:bg-neutral-900"
      :style="menuStyle"
      role="menu"
      @click="closeMenu"
    >
      <slot />
    </div>
  </div>
</template>
