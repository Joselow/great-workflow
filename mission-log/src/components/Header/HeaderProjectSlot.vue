<script setup lang="ts">
import { useRoute } from 'vue-router'

import ConfirmModal from '@/commons/ConfirmModal.vue'

import { projectStore } from '@/store/projectStore'
import { useProject } from '@/composables/useProject'
import { useProjectSelected } from '@/composables/useProjectSelected'
import { useShowStates } from '@/composables/useShowStates'

const route = useRoute()
const { activeProject } = projectStore

const { showProjectsDrawer } = useProject()
const { clearStoredActiveProject } = useProjectSelected()
const { modalConfirm, onModalConfirm, offModalConfirm } = useShowStates('modalConfirm')

const handleClick = () => {
  showProjectsDrawer(route.fullPath)
}

const handleDeselect = () => {
  onModalConfirm()
}

const handleConfirmDeselect = () => {
  clearStoredActiveProject()
  offModalConfirm()
}
</script>

<template>
  <div class="inline-flex items-center min-w-0">
    <ConfirmModal
      v-model="modalConfirm"
      title="¿Deseleccionar este proyecto?"
      @confirm="handleConfirmDeselect"
    >
      <p class="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
        No se elimina. Solo dejarás de usarlo como proyecto activo.
      </p>
    </ConfirmModal>

    <span
      v-if="activeProject"
      class="inline-flex items-center gap-1 max-w-[16rem] sm:max-w-xs pl-4 pr-1.5 py-1 rounded-lg text-sm font-semibold border shadow-sm"
      :style="{
        backgroundColor: activeProject.color,
        borderColor: `${activeProject.color}99`,
        color: '#1f2937',
      }"
    >
      <button
        type="button"
        class="cursor-pointer truncate min-w-0 hover:opacity-80 px-4"
        @click="handleClick"
      >
      <span  
      style="font-size: 1.2rem;"
      class="material-symbols-outlined align-middle">
rocket_launch
</span>
        {{ activeProject.name }}
      </button>
      <button
        type="button"
        class="cursor-pointer text-red-700 shrink-0 rounded-md p-0.5 bg-black/10 hover:bg-black/20 transition-colors"
        title="Deseleccionar proyecto"
        @click="handleDeselect"
      >
        <span class=" material-symbols-outlined align-middle text-lg"
        style="font-size: 1.3rem;"

        >
          remove_selection
        </span>
      </button>
    </span>

    <button
      v-else
      type="button"
      class="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-brand-orange dark:hover:text-brand-orange underline-offset-4 hover:underline"
      @click="handleClick"
    >
      Seleccionar o crear proyecto
    </button>
  </div>
</template>

