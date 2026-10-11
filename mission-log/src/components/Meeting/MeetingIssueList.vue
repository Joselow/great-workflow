<script setup lang="ts">
import { nextTick, useTemplateRef } from 'vue'

import ColorPicker from '@/components/Project/ColorPicker.vue'

import { COLOR_ISSUE } from '@/constants/projectColors'
import type { MeetingIssue } from '@/interfaces/meeting'

const issues = defineModel<MeetingIssue[]>({ required: true })
const nameInputs = useTemplateRef<HTMLInputElement[]>('nameInputs')


const addItem = () => {
  issues.value.push({ name: '', color: COLOR_ISSUE })
}

const addFromEnter = async (index: number) => {
  const current = issues.value[index]
  if (!current) return

  const name = current.name.trim()
  if (!name) return

  current.name = name
  addItem()
  await nextTick()
  if (nameInputs.value) {
    nameInputs.value[issues.value.length - 1]?.focus()
  }
}

const removeItem = (index: number) => {
  if (issues.value.length === 1) return
  issues.value = issues.value.filter((_, i) => i !== index)
}

const moveItem = (index: number, direction: -1 | 1) => {
  const next = index + direction
  if (next < 0 || next >= issues.value.length) return

  const copy = [...issues.value]
  const [item] = copy.splice(index, 1)
  copy.splice(next, 0, item)
  issues.value = copy
}
</script>

<template>
  <div class="space-y-2">
    <p class=" text-sm font-semibold 
    text-red-600 dark:text-red-500">
      Agenda / Puntos a tratar
    </p>

    <div
      v-for="(item, index) in issues"
      :key="item.id ?? `new-${index}`"
      class="flex items-center gap-2"
    >
      <span class="w-5 shrink-0 text-md text-gray-500">{{ index + 1 }}.</span>
      <input
        v-model="item.name"
        type="text"
        placeholder="Punto a tratar"
        ref="nameInputs"
        class="px-2 min-w-0 flex-1 rounded-md border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 px-2 py-1 text-sm text-gray-800 dark:text-gray-100 outline-none"
        @keydown.enter.prevent="addFromEnter(index)"

      />
      <ColorPicker v-model="item.color" variant="button" size="small" />
      <button
        type="button"
        class="cursor-pointer text-gray-400 hover:text-gray-600 disabled:opacity-20"
        :disabled="index === 0"
        title="Subir"
        @click="moveItem(index, -1)"
      >
        <span class="material-symbols-outlined" style="font-size: 1rem;">keyboard_arrow_up</span>
      </button>
      <button
        type="button"
        class="cursor-pointer text-gray-400 hover:text-gray-600 disabled:opacity-20"
        :disabled="index === issues.length - 1"
        title="Bajar"
        @click="moveItem(index, 1)"
      >
        <span class="material-symbols-outlined" style="font-size: 1rem;">keyboard_arrow_down</span>
      </button>
      <button
        type="button"
        class="cursor-pointer text-gray-400 hover:text-rose-500"
        title="Quitar"
        @click="removeItem(index)"
      >
        <span class="material-symbols-outlined" style="font-size: 1rem;">close</span>
      </button>
    </div>

    <div class="mt-2 flex justify-end">
      <button
        type="button"
        class="cursor-pointer inline-flex items-center rounded-md border border-rose-500/40 bg-rose-500/15 px-2 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300"
        @click="addItem"
      >
        <span class="material-symbols-outlined align-middle" style="font-size: 1rem;">add</span>
      </button>
    </div>
  </div>
</template>
