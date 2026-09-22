<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ColorPicker from '@/components/Project/ColorPicker.vue'
import ConfirmModal from '@/commons/ConfirmModal.vue'
import CardProjectSelect from '@/components/Card/CardProjectSelect.vue'
import CardSectionList from '@/components/Card/CardSectionList.vue'
import NotFoundView from '@/views/NotFoundView.vue'

import { projectStore } from '@/store/projectStore'
import { useProject } from '@/composables/useProject'
import { useCard } from '@/composables/useCard'
import { useShowStates } from '@/composables/useShowStates'
import { errorToast } from '@/composables/useAlerts'

import { DEFAULT_PROJECT_COLOR } from '@/constants/projectColors'
import { cardSurfaceStyle, isLightHex } from '@/helpers/cardColor'
import { fitTextarea } from '@/helpers/fitTextarea'

import type { CardDraft, CardWritePayload } from '@/interfaces/card'

const route = useRoute()
const router = useRouter()

const { activeProject, projects } = projectStore
const { getProjects } = useProject()
const { createCard, getCardById, updateCard, loading } = useCard()
const { modalConfirm, onModalConfirm, offModalConfirm } = useShowStates('modalConfirm')

const draft = ref<CardDraft | null>(null)
const notFound = ref(false)

const emptyDraft = (): CardDraft => ({
  name: '',
  description: '',
  color: DEFAULT_PROJECT_COLOR,
  isPrompt: false,
  flMeeting: false,
  projectId: activeProject.value?.id ?? null,
  sections: [{ title: '', description: '' }],
})

const toPayload = (current: CardDraft): CardWritePayload => ({
  name: current.name.trim(),
  description: current.description,
  color: current.color,
  isPrompt: current.isPrompt,
  flMeeting: current.flMeeting,
  projectId: current.projectId,
  sections: current.isPrompt
    ? []
    : current.sections.filter((section) => section.title.trim()),
})

const loadProjects = async () => {
  if (projects.value.length) return

  const { success, data } = await getProjects()
  if (success && data) {
    projects.value = data
  }
}

const startView = async () => {
  const id = route.params.id

  if (!id) {
    draft.value = emptyDraft()
    return
  }

  const { success, data } = await getCardById(id as string)
  if (!success || !data) {
    notFound.value = true
    return
  }

  draft.value = {
    id: data.id,
    name: data.name,
    description: data.description,
    color: data.color,
    isPrompt: data.isPrompt,
    flMeeting: data.flMeeting,
    projectId: data.projectId,
    sections: data.sections ?? [],
  }
}

startView()
loadProjects()


const setPrompt = (value: boolean) => {
  if (!draft.value) return

  draft.value.isPrompt = value
  if (value) {
    draft.value.sections = []
  }
}

const handleSaveClick = () => {
  if (!draft.value) return

  if (!draft.value.name.trim()) {
    errorToast('El título es requerido')
    return
  }

  onModalConfirm()
}

const handleConfirmSave = async () => {
  if (!draft.value) return

  const payload = toPayload(draft.value)

  if (draft.value.id) {
    const { success, data } = await updateCard(draft.value.id, payload)
    if (!success || !data) return

    draft.value = {
      ...draft.value,
      ...payload,
      id: data.id,
      sections: data.sections,
    }
    offModalConfirm()
    return
  }

  const { success, data } = await createCard(payload)
  if (!success || !data) return

  draft.value = {
    ...payload,
    id: data.id,
    sections: data.sections,
  }
  offModalConfirm()
  await router.replace({ name: 'editCard', params: { id: data.id } })
}

const openPublicCard = () => {
  if (!draft.value?.id) return

  const href = router.resolve({ name: 'publicCard', params: { id: draft.value.id } }).href
  window.open(href, '_blank', 'noopener,noreferrer')
}



</script>

<template>
  <NotFoundView v-if="notFound" />

  <div
    v-else-if="draft"
    class="min-w-0 max-w-3xl mx-auto px-1 py-2 md:py-6"
  >
    <ConfirmModal
      v-model="modalConfirm"
      title="¿Guardar esta card?"
      :loading="loading"
      @confirm="handleConfirmSave"
    >
      <p class="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
        {{ draft.isPrompt
          ? 'Se guardará como prompt. Las secciones no se conservan.'
          : 'Se guardará el título, la descripción y las secciones.' }}
      </p>
    </ConfirmModal>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div class="flex items-center gap-2">
        <h2 class="text-2xl font-bold mb-4">
          <span class="material-symbols-outlined align-middle"
            v-if="draft.id"
          >
          edit
          </span>
          <span class="material-symbols-outlined align-middle"
          v-else
          >
add_circle
</span>
        </h2>
        <CardProjectSelect v-model="draft.projectId" :projects="projects" />
        <div class="flex w-auto shrink-0 items-center gap-2">
          
        
        <button
          type="button"
          class="cursor-pointer w-auto rounded-lg border px-6 py-1 text-xs font-semibold uppercase tracking-wide transition-colors"
          :class="draft.isPrompt
           ? 'border-emerald-500/70 bg-emerald-500 text-white'
        : 'bg-white border-black/10 dark:border-white/15 dark:bg-white/4 text-gray-500 dark:text-gray-200 hover:border-emerald-500/40'"
          @click="setPrompt(!draft.isPrompt)"
        >
        <span class="material-symbols-outlined align-middle" style="font-size: 18px;">inbox_text_asterisk</span>
          Prompt
        </button>

        <button
          type="button"
          class="cursor-pointer w-auto rounded-lg border px-6 py-1 text-xs font-semibold uppercase tracking-wide transition-colors"
          :class="draft.flMeeting
          ? 'border-brand-orange/60 bg-brand-orange text-white'
        : 'bg-white border-black/10 dark:border-white/15  dark:bg-white/4 text-gray-500 dark:text-gray-200 hover:border-brand-orange/40'"
          @click="draft.flMeeting = !draft.flMeeting"
        >
        <span class="material-symbols-outlined align-middle" style="font-size: 18px;">co_present</span>
          Meeting
        </button>

     
      </div>
      </div>
      

      <div class="flex w-auto shrink-0 items-center gap-2">
        <button
          v-if="draft.id"
          type="button"
          class="cursor-pointer bg-red-500/5 w-auto rounded-lg 
            hover:bg-red-500/10 text-rose-600
            hover:scale-105 transition-all duration-100
            border border-rose-500/60 dark:border-white/15 px-6 py-1 text-xs font-semibold uppercase tracking-wide 
            dark:text-white  dark:hover:bg-rose-500/40"
          @click="openPublicCard"
        >
          <span class="material-symbols-outlined align-middle" style="font-size: 18px;">
            share_reviews
          </span>
          Compartir
        </button>
      
     
      </div>
    </div>

    <div
      class="relative rounded-2xl border p-6 md:p-8"
      :style="cardSurfaceStyle(draft.color)"
    >
      <div class="absolute top-5 right-5 z-20">
        <ColorPicker v-model="draft.color" variant="button" />
      </div>

      <div class="min-w-0 space-y-5">
        <input
          v-model="draft.name"
          type="text"
          placeholder="Título de la card"
          class="w-full bg-transparent text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white border-0 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
        />

        <textarea
          ref="descriptionEl"
          v-model="draft.description"
          rows="4"
          placeholder="Descripción..."
          class="w-full min-h-24 resize-y overflow-hidden bg-transparent text-sm text-gray-600 dark:text-gray-300 placeholder:text-gray-400 border-0 focus:outline-none"
          @input="fitTextarea($event.target)"
        />

        <CardSectionList
          v-if="!draft.isPrompt"
          v-model="draft.sections"
        />
      </div>

      <div class="mt-10 flex justify-center">
        <button
          type="button"
          class="cursor-pointer rounded-lg font-semibold px-8 py-2.5 transition-opacity hover:opacity-90"
          :style="{
            backgroundColor: draft.color,
            color: isLightHex(draft.color) ? '#1f2937' : '#fff',
          }"
          @click="handleSaveClick"
        >
        <span class="material-symbols-outlined align-middle" style="font-size: 18px;">
save
</span>
          Guardar 
        </button>
      </div>
    </div>
  </div>
</template>
