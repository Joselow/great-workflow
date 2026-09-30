<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ColorPicker from '@/components/Project/ColorPicker.vue'
import ConfirmModal from '@/commons/ConfirmModal.vue'
import DangerZone from '@/commons/DangerZone.vue'
import CardProjectSelect from '@/components/Card/CardProjectSelect.vue'
import CardSectionList from '@/components/Card/CardSectionList.vue'
import NotFoundView from '@/views/NotFoundView.vue'

import { projectStore } from '@/store/projectStore'
import { useProject } from '@/composables/useProject'
import { useCard } from '@/composables/useCard'
import { useCopyCardText } from '@/composables/useCopyCardText'
import { useShowStates } from '@/composables/useShowStates'
import { useTextareaFit } from '@/composables/useTextareaFit'
import { errorToast } from '@/composables/useAlerts'

import { DEFAULT_PROJECT_COLOR } from '@/constants/projectColors'
import { cardSurfaceStyle, isLightHex } from '@/helpers/cardColor'

import type { CardDraft, CardWritePayload } from '@/interfaces/card'

const route = useRoute()
const router = useRouter()

const { activeProject, projects } = projectStore
const { getProjects } = useProject()
const { createCard, getCardById, updateCard, deleteCard, loading } = useCard()
const { copied: textCopied, copyFromCard } = useCopyCardText()
const { modalConfirm, onModalConfirm, offModalConfirm } = useShowStates('modalConfirm')

const draft = ref<CardDraft | null>(null)
const notFound = ref(false)
const textsExpanded = ref(false)
const cardFields = ref<HTMLElement | null>(null)
const { onFocus, onBlur, onInput, sync } = useTextareaFit(textsExpanded)

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

const handleCopyText = async () => {
  if (!draft.value) return
  await copyFromCard(draft.value)
}

const toggleTexts = async () => {
  textsExpanded.value = !textsExpanded.value
  await nextTick()
  sync(cardFields.value)
}

watch(
  () => draft.value?.sections.length,
  async () => {
    if (!textsExpanded.value) return
    await nextTick()
    sync(cardFields.value)
  },
)

const handleConfirmDelete = async (id: string) => {
  const { success } = await deleteCard(id)
  if (!success) return

  await router.push({ name: 'cards' })
}


</script>

<template>
  <div
  class="max-w-5xl mx-auto"

  >
      <button
        type="button"
        class="
        cursor-pointer bg-rose-600 
        dark:bg-rose-700
       text-white
        w-auto rounded-lg 
          hover:bg-rose-500 
          border border-rose-500/60 
          dark:border-white/15 px-3 py-1 text-xs font-semibold 
          tracking-wide 
          dark:text-white  
          dark:hover:bg-rose-800"
        @click="router.push({ name: 'cards' })"
      >
        <span class="material-symbols-outlined align-middle" style="font-size: 18px;">
          arrow_back
        </span>
        Volver a cards
      </button>
    </div>
  <NotFoundView v-if="notFound" />

  

  <div
    v-else-if="draft"
    class="min-w-0 max-w-3xl mx-auto px-1 pb-2 md:pb-6"
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

    <div class="flex flex-wrap items-center justify-end gap-3 mb-3">
      <div class="flex w-auto shrink-0 items-center gap-2"
        v-if="draft.id"
      >
        <button
          type="button"
          class="cursor-pointer bg-blue-500/5 w-auto rounded-lg 
            hover:bg-blue-500/10 text-blue-600
            hover:scale-105 transition-all duration-100
            border border-blue-500/60 dark:border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide 
            dark:text-white  dark:hover:bg-blue-500/40"
          @click="handleCopyText"
        >
          <template v-if="!textCopied">
            <span class="material-symbols-outlined align-middle" style="font-size: 18px;">
              content_copy
            </span>
            Copiar

          </template>
          <template v-else>
            <span class="material-symbols-outlined align-middle" style="font-size: 18px;">
              check
            </span>
            Copiado
          </template>

        </button>
        <button
          type="button"
          class="cursor-pointer bg-red-500/5 w-auto rounded-lg 
            hover:bg-red-500/10 text-rose-600
            hover:scale-105 transition-all duration-100
            border border-rose-500/60 dark:border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide 
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
    <div>
      <div class="flex w-full items-center gap-2">
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
      <button
        type="button"
        class="ml-auto cursor-pointer shrink-0 rounded-lg border px-2 py-1 transition-colors"
        :class="textsExpanded
          ? 'border-green-400/40 bg-green-500/10 text-green-600 dark:border-green-300/25 dark:bg-green-400/10 dark:text-green-200'
          : ' border-black/10 text-gray-400 dark:border-white/15 dark:bg-white/4 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'"
        :title="textsExpanded ? 'Encoger textos' : 'Expandir textos'"
        :aria-label="textsExpanded ? 'Encoger textos' : 'Expandir textos'"
        :aria-pressed="textsExpanded"
        @mousedown.prevent
        @click="toggleTexts"
      >
        <span class="material-symbols-outlined align-middle" style="font-size: 18px;">
          {{ textsExpanded ? 'arrows_more_up' : 'arrows_more_down' }}
        </span>
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

      <div ref="cardFields" class="min-w-0 space-y-5">
        <input
          v-model="draft.name"
          type="text"
          placeholder="Título de la card"
          class="w-full bg-transparent text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white border-0 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
        />

        <textarea
          v-model.trim="draft.description"
          rows="4"
          placeholder="Descripción..."
          class="w-full min-h-24 resize-y overflow-hidden bg-transparent text-sm text-gray-600 dark:text-gray-300 placeholder:text-gray-400 border-0 focus:outline-none"
          @focus="onFocus"
          @blur="onBlur"
          @input="onInput"
        />

        <CardSectionList
          v-if="!draft.isPrompt"
          v-model="draft.sections"
          :expanded="textsExpanded"
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

    <DangerZone
      v-if="draft.id"
      :id="draft.id"
      description="Eliminar la card de forma permanente."
      action-label="Eliminar card"
      confirm-title="¿Eliminar esta card?"
      confirm-description="Se eliminará la card y no se puede deshacer."
      :loading="loading"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>
