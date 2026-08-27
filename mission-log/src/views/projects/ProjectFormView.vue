<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ColorPicker from '@/components/Project/ColorPicker.vue'
import ConfirmModal from '@/commons/ConfirmModal.vue'

import { projectStore } from '@/store/projectStore'
import { useProjectSelected } from '@/composables/useProjectSelected'
import { useProject } from '@/composables/useProject'
import { errorToast } from '@/composables/useAlerts'
import { useShowStates } from '@/composables/useShowStates'

import { debounce } from '@/utils/debounce'

import type { PartialProject } from '@/interfaces/project'

const { setStoredActiveProject, clearStoredActiveProject } = useProjectSelected()

const route = useRoute()
const router = useRouter()

const { saveDraft, getProjectById, deleteProject, loading, showProjectsDrawer } = useProject()

const {
  draftProject,
  projects,
  startNewDraft,
  activeProject,
} = projectStore

const { modalDelete, onModalDelete, offModalDelete } = useShowStates('modalDelete')

const isCurrentSelected = computed(
  () => Boolean(draftProject.value?.id && activeProject.value?.id === draftProject.value.id)
)

const  {  id: projectId } = route.params

const startView = async () => {
  if (!projectId) {
    startNewDraft()
    return
  }

  const { success, data } = await getProjectById(projectId as string)
  if (!success || !data) return

  draftProject.value = {
    id: data.id,
    name: data.name,
    description: data.description,
    color: data.color,
  }
}

startView()

const projectNameInput = ref<HTMLInputElement | null>(null)



  
const handleSaveDebounced = debounce(() => {
  if (!draftProject.value) return
  saveDraft(draftProject.value as PartialProject)
}, 400)


const handleConfirmSelection = () => {
  const draft = draftProject.value
  if (!draft?.id) return

  if (isCurrentSelected.value) {
    clearStoredActiveProject()
    return
  }

  setStoredActiveProject({
    id: draft.id,
    name: draft.name!,
    color: draft.color!,
  })
}

const handleConfirmDelete = async () => {
  const id = draftProject.value?.id
  if (!id) return

  const { success } = await deleteProject(id)
  if (!success) return

  const wasActive = activeProject.value?.id === id

  draftProject.value = null
  offModalDelete()
  router.push({ name: 'home' })

  if (wasActive) {
    clearStoredActiveProject()
    showProjectsDrawer('/')
  }
}

watch(
  () => draftProject.value
    ? [
        draftProject.value.id,
        draftProject.value.name,
        draftProject.value.description,
        draftProject.value.color,
      ]
    : null,
  (current, previous) => {

    console.log('current', current)
    if (!current || !draftProject.value || !previous) return


    if (!previous[0] && !previous[1] && !draftProject.value?.id && !draftProject.value.name?.trim()) {
      // errorToast('El nombre del proyecto es requerido')
      return
    }
    if (draftProject.value.id && !draftProject.value.name?.trim()) {
      errorToast('El nombre del proyecto es requerido')
      return
    }

    if (draftProject.value.color !== previous[3]) {
      const project = projects.value.find(p => p.id === draftProject.value?.id)

    if (project && draftProject.value.color) {
        project.color = draftProject.value.color
      }
    }
    draftProject.value.color
    handleSaveDebounced()
  }
)

onMounted(() => {
  if (projectNameInput.value) {
    projectNameInput.value.focus()
  }
})
</script>

<template>
  <div class="min-w-0 max-w-3xl md:max-w-2xl px-1 py-2 md:py-4 mx-auto">
    <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
    </h1>

    <div v-if="draftProject" class="space-y-5">
      <div>
        <label class="sr-only" for="project-name">Nombre</label>
        <input
          ref="projectNameInput"
          id="project-name"
          v-model="draftProject.name"
          type="text"
          placeholder="Nuevo proyecto..."
          class="placeholder:text-gray-400  dark:placeholder:text-gray-500  w-full bg-transparent text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white border-0 focus:outline-none"
        />
      </div>

      <div>
        <textarea
          id="project-description"
          v-model="draftProject.description"
          rows="4"
          placeholder="Descripción del proyecto..."
          class="w-full text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-orange/60 resize-none bg-white/50 dark:bg-white/5"
        />
      </div>

      <ColorPicker v-model="draftProject.color!" />

      <div class="pt-4 text-center">
        <button
          type="button"
          class="cursor-pointer rounded-lg border-2 font-semibold px-6 py-2.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :class="isCurrentSelected
            ? 'border-brand-orange bg-transparent text-brand-orange hover:bg-brand-orange/10'
            : 'border-brand-orange bg-brand-orange text-white hover:bg-brand-orange/80'"
          :disabled="!draftProject.id"
          @click="handleConfirmSelection"
        >
        <span class="material-symbols-outlined align-middle">
          {{ isCurrentSelected ? 'remove_selection' : 'drag_click' }}
        </span>
          {{ isCurrentSelected ? 'Deseleccionar proyecto' : 'Seleccionar proyecto' }}
        </button>
      </div>


      <template v-if="draftProject.id">
        <ConfirmModal
          v-model="modalDelete"
          title="¿Eliminar este proyecto?"
          :loading="loading"
          @confirm="handleConfirmDelete"
        >
          <p class="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
            Se eliminará el proyecto y no se puede deshacer.
          </p>
        </ConfirmModal>
        <section
          class="mt-10 pt-6 border-t border-rose-400 dark:border-white/10
          
          flex justify-between items-center flex-wrap
          "
        >
          <div>
            <h2 class="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Zona de peligro
            </h2>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Eliminar el proyecto de forma permanente.
            </p>
          </div>
          <button
            type="button"
            class="mt-4 cursor-pointer rounded-lg border border-brand-pink/90 bg-brand-pink/10 text-brand-pink hover:bg-brand-pink hover:text-white font-semibold px-6 py-2.5 transition-colors"
            @click="onModalDelete"
          >
            <span class="material-symbols-outlined align-middle text-base">
              delete
            </span>
            Eliminar proyecto
          </button>
        </section>
      </template>

    </div>
  </div>
</template>
