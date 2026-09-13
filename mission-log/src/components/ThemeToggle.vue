

<script setup lang="ts">
import { onMounted, ref } from 'vue'

type ThemeSetting = 'light' | 'dark' | 'system'
const THEME_KEY = 'theme' as const

const props = withDefaults(defineProps<{
  single?: boolean
}>(), {
  single: false,
})

const currentTheme = ref<ThemeSetting>('system')

const applySystemTheme = () => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

  currentTheme.value = prefersDark ? 'dark' : 'light'

  document.documentElement.classList.toggle("dark", prefersDark)
}

const setTheme = (newTheme: ThemeSetting) => {
  currentTheme.value = newTheme

  if (newTheme === 'system') {
    applySystemTheme()
    return
  }

  const root = document.documentElement

  if (newTheme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  localStorage.setItem(THEME_KEY, newTheme)
}

const toggleTheme = () => {
  setTheme(currentTheme.value === 'dark' ? 'light' : 'dark')
}

onMounted(() => {
    const stored = localStorage.getItem(THEME_KEY)
    const isDark =
        stored === 'dark' ||
        (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)

    currentTheme.value = isDark ? 'dark' : 'light'
    document.documentElement.classList.toggle('dark', isDark)
});
</script>

<template>
  <button
    v-if="props.single"
    type="button"
    class="cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/80 text-sm shadow-sm dark:border-white/15 dark:bg-white/10 dark:text-white"
    :title="currentTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'"
    @click="toggleTheme"
  >
    {{ currentTheme === 'dark' ? '☀️' : '🌙' }}
  </button>

  <div
    v-else
    class="inline-flex overflow-hidden rounded-full border border-black/5 bg-white/70 text-xs shadow-sm
            dark:border-white/10 dark:bg-white/5"
  >
    <button
      type="button"
      class="cursor-pointer px-3 py-1 transition-colors dark:text-white"
      :class="{ 'bg-amber-100 dark:bg-amber-950/40': currentTheme === 'light' }"
      @click="setTheme('light')"
      >
      ☀️
    </button>

    <button
      type="button"
      class="cursor-pointer px-3 py-1 transition-colors dark:text-white"
      :class="{ 'bg-violet-100 dark:bg-violet-950/40': currentTheme === 'dark' }"
      @click="setTheme('dark')"
      >
      🌙
    </button>
  </div>
</template>