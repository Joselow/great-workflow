<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

import ColorPicker from '@/components/Project/ColorPicker.vue'
import CardProjectSelect from '@/components/Card/CardProjectSelect.vue'
import CardSectionList from '@/components/Card/CardSectionList.vue'

import { useTextareaFit } from '@/composables/useTextareaFit'

import { cardSurfaceStyle, isLightHex } from '@/helpers/cardColor'

import type { CardDraft } from '@/interfaces/card'
import type { Project } from '@/interfaces/project'

const draft = defineModel<CardDraft>({ required: true })

defineProps<{
  projects: Project[]
  saveLabel?: string
}>()

const emit = defineEmits<{
  save: []
}>()

const textsExpanded = ref(false)
const cardFields = ref<HTMLElement | null>(null)
const { onFocus, onBlur, onInput, sync } = useTextareaFit(textsExpanded)

const setPrompt = (value: boolean) => {
  draft.value.isPrompt = value
  if (value) {
    draft.value.sections = []
  }
}

const toggleTexts = async () => {
  textsExpanded.value = !textsExpanded.value
  await nextTick()
  sync(cardFields.value)
}

watch(
  () => draft.value.sections.length,
  async () => {
    if (!textsExpanded.value) return
    await nextTick()
    sync(cardFields.value)
  },
)
</script>

<template>
  <div>
    <div class="flex w-full items-center gap-2">
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

    <div
      class="relative mt-3 rounded-2xl border p-6 md:p-8"
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
          @click="emit('save')"
        >
          <span class="material-symbols-outlined align-middle" style="font-size: 18px;">
            save
          </span>
          {{ saveLabel ?? 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>
