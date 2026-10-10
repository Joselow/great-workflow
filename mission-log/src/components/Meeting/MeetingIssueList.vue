<script setup lang="ts">
import ColorPicker from '@/components/Project/ColorPicker.vue'
import { DEFAULT_PROJECT_COLOR } from '@/constants/projectColors'

import type { MeetingIssue } from '@/interfaces/meeting'

const issues = defineModel<MeetingIssue[]>({ required: true })

const addItem = () => {
  issues.value.push({ name: '', color: DEFAULT_PROJECT_COLOR })
}

const removeItem = (index: number) => {
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
    text-green-600 dark:text-green-500">
      Agenda / Puntos
    </p>

    <div
      v-for="(item, index) in issues"
      :key="item.id ?? `new-${index}`"
      class="flex items-center gap-2"
    >
      <span class="w-5 shrink-0 text-xs text-gray-400">{{ index + 1 }}.</span>
      <input
        v-model="item.name"
        type="text"
        placeholder="Punto a tratar"
        class="min-w-0 flex-1 rounded-md border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 px-2 py-1 text-sm text-gray-800 dark:text-gray-100 outline-none"
      />
      <ColorPicker v-model="item.color" variant="button" />
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

    <button
      type="button"
      class="cursor-pointer inline-flex items-center rounded-md border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
      @click="addItem"
    >
      <span class="material-symbols-outlined align-middle" style="font-size: 1rem;">add</span>
      Agregar punto
    </button>
  </div>
</template>
