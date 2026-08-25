<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { projectStore } from '@/store/projectStore'
import { useProjectSelected } from '@/composables/useProjectSelected'

import type { Project } from '@/interfaces/project'

// import { useProject } from '@/composables/useProject'
// import type { PartialProject, Project } from '@/interfaces/project'

const { setStoredActiveProject } = useProjectSelected()

const route = useRoute()
const router = useRouter()

const {
  drawerOpen,
  closeDrawer,
  startNewDraft,
  editDraft,
  projects,
  activeProject,
} = projectStore

const isProjectRoute = computed(
  () => route.name === 'newProject' || route.name === 'editProject'
)

const handleClose = () => {
  closeDrawer()
}

const handleCreateClick = () => {
  const draft = startNewDraft()
  projects.value.unshift(draft as unknown as Project)
  // saveDraft(draft as PartialProject)
  router.push({ name: 'newProject' })
}

const handleSelectProject = (project: Project) => {
  if (!project.id ) return

  editDraft(project)

  router.push({ name: 'editProject', params: { id: project.id } })
}

const isSelected = (projectId: string) => {
  if (!projectId) {
    return projectStore.formMode.value === 'create'
  }

  return route.name === 'editProject' && route.params.id === projectId
}

const isActive = (project: Project) => activeProject.value?.id === project.id

const withAlpha = (hex: string, alpha: string) => {
  const value = hex.startsWith('#') ? hex : `#${hex}`

  if (value.length === 4) {
    const [, r, g, b] = value
    return `#${r}${r}${g}${g}${b}${b}${alpha}`
  }

  return `${value}${alpha}`
}

const itemStyle = (project: Project) => {
  if (isSelected(project.id) || !isActive(project) || !project.color) return undefined

  return {
    borderColor: withAlpha(project.color, '99'),
    backgroundColor: withAlpha(project.color, '50'),
  }
}

const handleDoubleClick = (project: Project) => {
  setStoredActiveProject({
    id: project.id,
    name: project.name,
    color: project.color,
  })
}
</script>

<template>
  <aside
    v-show="drawerOpen"
    class="shrink-0 flex flex-col w-40 sm:w-52 md:w-72
      bg-white dark:bg-[#111] border-r border-black/10 dark:border-white/10
      shadow-xl md:shadow-none overflow-hidden"
    :class="isProjectRoute
      ? 'relative z-auto min-h-[calc(100dvh-80px)]'
      : 'fixed md:relative inset-y-0 left-0 z-40 md:z-auto h-full md:h-auto md:min-h-[calc(100dvh-80px)]'"
  >
    <div class="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/10">
      <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-200">
        Proyectos
      </h2>
      <button
        type="button"
        class="cursor-pointer text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2 py-1 rounded-md"
        @click="handleClose"
      >
        ✕
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-3 space-y-2">
      <button
        type="button"
        class="w-full cursor-pointer rounded-lg bg-brand-mint/70 hover:bg-brand-mint text-gray-900 font-medium py-2 px-3 transition-colors"
        @click="handleCreateClick"
      >
        + Crear
      </button>

      <button
        v-for="project in projects"
        :key="project.id"
        type="button"
        class="w-full cursor-pointer rounded-lg border overflow-hidden px-3 py-2 text-left transition-colors"
        :class="{
          'border-brand-orange/60 bg-brand-orange/10': isSelected(project.id),
          'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5':
            !isSelected(project.id) && !isActive(project),
        }"
        :style="itemStyle(project)"
        @dblclick="handleDoubleClick(project)"
      >
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2 min-w-0">
            <span
              class="w-4 h-4 rounded-md shrink-0 border border-black/10"
              :style="{ backgroundColor: project.color }"
            />
            <span class="truncate text-sm font-medium"
              :class="
              !project.id
              ? 'text-gray-400 dark:text-gray-400' 
              : 'text-gray-800 dark:text-gray-100'"
            >
              {{ project.name || 'Nuevo Proyecto' }}
            </span>
          </div>
          <div>
            <button
              type="button"
              class="cursor-pointer text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-1 rounded-md
                hover:scale-112 transition-transform duration-200
              "
              @click="handleSelectProject(project)"
            >
            <span
              style="font-size: 22px;"
              class="material-symbols-outlined align-middle">
              expand_circle_right
              </span>
            </button>
          </div>
        </div>
      </button>

      <p
        v-if="projects.length === 0"
        class="text-sm text-gray-500 dark:text-gray-400 px-1 py-4"
      >
        Aún no tienes proyectos. Crea uno para empezar.
      </p>
    </div>
  </aside>
</template>
