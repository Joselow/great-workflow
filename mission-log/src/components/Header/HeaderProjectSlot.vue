<script setup lang="ts">
import { useRoute } from 'vue-router'

import { projectStore } from '@/store/projectStore'
import { useProject } from '@/composables/useProject'

const route = useRoute()
const { activeProject } = projectStore

const { showProjectsDrawer } = useProject()

const handleClick = () => {
  showProjectsDrawer(route.fullPath)
}
</script>

<template>
  <button
    type="button"
    class="cursor-pointer transition-all hover:opacity-90"
    @click="handleClick"
  >
    <span
      v-if="activeProject"
      class="inline-flex items-center gap-2 max-w-[14rem] sm:max-w-xs px-4 py-1.5 rounded-lg text-sm font-semibold border shadow-sm truncate"
      :style="{
        backgroundColor: activeProject.color,
        borderColor: `${activeProject.color}99`,
        color: '#1f2937',
      }"
    >
      <span
        class="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
        :style="{ backgroundColor: activeProject.color }"
      />
      <span class="truncate">{{ activeProject.name }}</span>
    </span>

    <span
      v-else
      class="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-orange dark:hover:text-brand-orange underline-offset-4 hover:underline"
    >
      Seleccionar o crear proyecto
    </span>
  </button>
</template>
