

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
    class="inline-flex overflow-hidden rounded-full border border-gray-300 bg-white text-xs
            dark:border-gray-700 dark:bg-gray-800"
  >
    <button
      type="button"
      class="cursor-pointer px-3 py-1 dark:bg-gray-700 dark:text-white" 
      :class="{ 'bg-gray-200': currentTheme === 'light' }"
      @click="setTheme('light')"
      >
      ☀️ 
    </button>

    <button
      type="button"
      class="cursor-pointer px-3 py-1 dark:bg-gray-700 dark:text-white"
      :class="{ 'dark:bg-gray-900 ': currentTheme === 'dark' }"
      @click="setTheme('dark')"
      >
      🌙 
    </button>
  </div>
</template>