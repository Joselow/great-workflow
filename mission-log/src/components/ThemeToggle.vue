

<script setup lang="ts">
import { onMounted, ref } from 'vue'

type ThemeSetting = 'light' | 'dark' | 'system'
const THEME_KEY = 'theme' as const

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

onMounted(() => {    
    document.documentElement.classList.toggle("dark",
        localStorage.theme === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
});
</script>

<template>
  <div
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