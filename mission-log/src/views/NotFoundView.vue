<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { getAuthToken } from '@/utils/cookies'

const isAuthenticated = Boolean(getAuthToken())
</script>

<template>
  <div class="min-h-screen w-full flex flex-col items-center justify-center px-6 bg-white dark:bg-zinc-950">
    <p class="text-7xl md:text-8xl font-bold tracking-tight select-none">
      <span class="text-brand-cyan">4</span>
      <span class="text-brand-orange">0</span>
      <span class="text-brand-pink">4</span>
    </p>

    <h1 class="mt-4 text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">
      Página no encontrada
    </h1>
    <p class="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
      La ruta que buscas no existe o ya no está disponible.
    </p>

    <RouterLink
      :to="{ name: isAuthenticated ? 'home' : 'login' }"
      class="mt-8 rounded-lg bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white transition-[filter] hover:brightness-95 active:brightness-90"
    >
      {{ isAuthenticated ? 'Volver al inicio' : 'Ir al inicio de sesión' }}
    </RouterLink>
  </div>
</template>
