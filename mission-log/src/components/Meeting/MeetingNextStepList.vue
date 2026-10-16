<script setup lang="ts">
import { nextTick, useTemplateRef } from 'vue'

import type { MeetingNextStep } from '@/interfaces/meeting'

const steps = defineModel<MeetingNextStep[]>({ required: true })
const descriptionInputs = useTemplateRef<HTMLInputElement[]>('descriptionInputs')

const addItem = () => {
  steps.value.push({ description: '' })
}

const addFromEnter = async (index: number) => {
  const current = steps.value[index]
  if (!current) return

  const description = current.description.trim()
  if (!description) return

  current.description = description
  addItem()
  await nextTick()
  descriptionInputs.value?.[steps.value.length - 1]?.focus()
}

const removeItem = (index: number) => {
  if (steps.value.length === 1) {
    steps.value = [{ description: '' }]
    return
  }

  steps.value = steps.value.filter((_, i) => i !== index)
}
</script>

<template>
  <div class="space-y-2">
    <p class="text-sm font-semibold text-violet-700 dark:text-violet-300">
      Siguientes pasos
    </p>

    <div
      v-for="(item, index) in steps"
      :key="item.logId ?? `new-${index}`"
      class="flex items-center gap-2"
    >
      <span class="w-5 shrink-0 text-md text-gray-500">
        <span class="material-symbols-outlined" style="font-size: 1.3rem;">arrow_circle_right</span>
      </span>
      <input
        v-model="item.description"
        type="text"
        placeholder="Siguiente paso"
        ref="descriptionInputs"
        class="min-w-0 flex-1 rounded-md border border-black/10 bg-white/70 px-2 py-1 text-sm text-gray-800 outline-none dark:border-white/15 dark:bg-white/5 dark:text-gray-100"
        @keydown.enter.prevent="addFromEnter(index)"
      />
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
        class="inline-flex cursor-pointer items-center rounded-md border border-violet-500/40 bg-violet-500/15 px-2 py-2 text-xs font-semibold text-violet-700 dark:text-violet-300"
        @click="addItem"
      >
        <span class="material-symbols-outlined align-middle" style="font-size: 1rem;">add</span>
      </button>
    </div>
  </div>
</template>
