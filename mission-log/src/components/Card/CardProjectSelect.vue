<script setup lang="ts">
import { computed } from 'vue'

import type { Project } from '@/interfaces/project'

const model = defineModel<string | null>({ required: true })

const props = defineProps<{
  projects: Project[]
}>()

const selected = computed(() =>
  props.projects.find((project) => project.id === model.value) ?? null
)

const selectedColor = computed(() => selected.value?.color ?? '#a1a1aa')

const selectValue = computed({
  get: () => model.value ?? '',
  set: (value: string) => {
    model.value = value || null
  },
})
</script>

<template>
  <label
    class="inline-flex w-auto max-w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold text-gray-800 dark:text-gray-100"
    :style="{
      backgroundColor: `${selectedColor}33`,
      borderColor: `${selectedColor}99`,
    }"
  >
    <span
      class="h-2.5 w-2.5 shrink-0 rounded-full"
      :style="{ backgroundColor: selectedColor }"
    />
    <select
      v-model="selectValue"
      class="w-auto max-w-[10rem] cursor-pointer bg-transparent text-xs font-semibold outline-none text-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
    >
      <option value="">Ningún proyecto</option>
      <option
        v-for="project in projects"
        :key="project.id"
        :value="project.id"
      >
        {{ project.name }}
      </option>
    </select>
  </label>
</template>
