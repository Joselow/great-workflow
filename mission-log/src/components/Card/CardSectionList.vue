<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

import { fitTextarea } from '@/helpers/fitTextarea'

import type { CardSection } from '@/interfaces/card'

const sections = defineModel<CardSection[]>({ required: true })
const rootEl = ref<HTMLElement | null>(null)

const addSection = () => {
  sections.value = [...sections.value, { title: '', description: '' }]
}

const removeSection = (index: number) => {
  sections.value = sections.value.filter((_, i) => i !== index)
}

const moveSection = (index: number, direction: -1 | 1) => {
  const next = index + direction
  if (next < 0 || next >= sections.value.length) return

  const copy = [...sections.value]
  const [item] = copy.splice(index, 1)
  copy.splice(next, 0, item)
  sections.value = copy
}

const updateSection = (index: number, field: keyof CardSection, value: string) => {
  sections.value = sections.value.map((section, i) =>
    i === index ? { ...section, [field]: value } : section
  )
}

const fitSectionTextareas = async () => {
  await nextTick()
  rootEl.value?.querySelectorAll('textarea').forEach(fitTextarea)
}

watch(() => sections.value.length, fitSectionTextareas, { immediate: true })
</script>

<template>
  <div ref="rootEl" class="space-y-6">
    <div
      v-for="(section, index) in sections"
      :key="index"
      class="group relative pr-8"
    >
      <input
        :value="section.title"
        type="text"
        placeholder="Título de sección"
        class="w-full bg-transparent text-base font-semibold text-gray-900 dark:text-white border-0 border-b border-black/10 dark:border-white/15 pb-1 focus:outline-none focus:border-brand-orange/60"
        @input="updateSection(index, 'title', ($event.target as HTMLInputElement).value)"
      />
      <textarea
        :value="section.description"
        rows="2"
        placeholder="Descripción..."
        class="mt-2 w-full min-h-16 resize-y overflow-hidden bg-transparent text-sm text-gray-600 dark:text-gray-300 placeholder:text-gray-400 border-0 focus:outline-none"
        @input="(event) => {
          updateSection(index, 'description', (event.target as HTMLTextAreaElement).value)
          fitTextarea(event.target)
        }"
      />

      <div class="absolute top-0 right-0 flex flex-col items-center gap-0.5">
        <button
          type="button"
          class="cursor-pointer rounded-md p-0.5 text-gray-400/70 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-20"
          :disabled="index === 0"
          title="Subir"
          @click="moveSection(index, -1)"
        >
          <span class="material-symbols-outlined align-middle" style="font-size: 1rem;">
            keyboard_arrow_up
          </span>
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-md p-0.5 text-gray-400/0 group-hover:text-gray-400 hover:!text-gray-500 dark:hover:!text-gray-300"
          title="Quitar sección"
          @click="removeSection(index)"
        >
          <span class="material-symbols-outlined align-middle" style="font-size: 0.95rem;">
            close
          </span>
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-md p-0.5 text-gray-400/70 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-20"
          :disabled="index === sections.length - 1"
          title="Bajar"
          @click="moveSection(index, 1)"
        >
          <span class="material-symbols-outlined align-middle" style="font-size: 1rem;">
            keyboard_arrow_down
          </span>
        </button>
      </div>
    </div>

    <div class="flex justify-end">
      <button
        type="button"
        class="cursor-pointer inline-flex items-center justify-center 
        rounded-md border  text-emerald-500 
        bg-emerald-500/25  h-8 px-6
        border-emerald-500/40
        dark:border-emerald-500/10 
        dark:bg-emerald-500/4
        hover:bg-emerald-500/20
        "

        

        title="Agregar sección"
        @click="addSection"
      >
        <span class="material-symbols-outlined align-middle" style="font-size: 1.15rem;">
          add
        </span>
        Agregar sección
      </button>
    </div>
  </div>
</template>
