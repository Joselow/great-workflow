<script setup lang="ts">
import { computed } from 'vue'

import type { CardListProjectFilter, CardListViewFilters } from '@/interfaces/card'
import type { Project } from '@/interfaces/project'

const props = defineProps<{
  filters: CardListViewFilters
  projects: Project[]
}>()

const q = defineModel<string>('q', { required: true })

const emit = defineEmits<{
  update: [filters: CardListViewFilters]
}>()

const patch = (partial: Partial<CardListViewFilters>) => {
  emit('update', { ...props.filters, ...partial })
}

const selectedProject = computed(() =>
  props.filters.projectFilter !== 'all' && props.filters.projectFilter !== 'null'
    ? props.projects.find((project) => project.id === props.filters.projectFilter) ?? null
    : null
)

const selectedColor = computed(() => selectedProject.value?.color ?? '#a1a1aa')

const onProjectChange = (event: Event) => {
  patch({ projectFilter: (event.target as HTMLSelectElement).value as CardListProjectFilter })
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <label
      class="inline-flex items-center gap-2 max-w-full rounded-lg border px-3 py-1 text-xs font-semibold
        dark:text-gray-100
      "
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
        :value="filters.projectFilter"
        class="min-w-0 max-w-[12rem] cursor-pointer bg-transparent text-xs font-semibold outline-none dark:text-gray-100"
        @change="onProjectChange"
      >
        <option value="all">Todos</option>
        <option value="null">Global cards</option>
        <option
          v-for="project in projects"
          :key="project.id"
          :value="project.id"
        >
          {{ project.name }}
        </option>
      </select>
    </label>

    <input
      v-model="q"
      type="search"
      placeholder="search name..."
      class="min-w-0 flex-1 rounded-lg border border-black/10 dark:border-white/15 bg-white/50 dark:bg-white/5 px-4 py-1.5 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none focus:border-brand-orange/60"
    />

    <button
      type="button"
      class="cursor-pointer rounded-lg border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors"
      :class="filters.isPrompt
        ? 'border-emerald-500/70 bg-emerald-500 text-white'
        : 'bg-white border-black/10 dark:border-white/15 dark:bg-white/4 text-gray-500 dark:text-gray-200 hover:border-emerald-500/40'"
      @click="patch({ isPrompt: !filters.isPrompt })"
    >
    <span class="material-symbols-outlined align-middle" style="font-size: 18px;">
inbox_text_asterisk
</span>
      Prompt
    </button>
    <button
      type="button"
      class="cursor-pointer rounded-lg border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors"
      :class="filters.flMeeting
        ? 'border-brand-orange/60 bg-brand-orange text-white'
        : 'bg-white border-black/10 dark:border-white/15  dark:bg-white/4 text-gray-500 dark:text-gray-200 hover:border-brand-orange/40'"
      @click="patch({ flMeeting: !filters.flMeeting })"
    >
    <span class="material-symbols-outlined align-middle" style="font-size: 18px;">
co_present
</span>
      Meeting
    </button>
  </div>
</template>
