<script setup lang="ts">
import { computed } from 'vue'

import type { CardListProjectFilter } from '@/interfaces/card'
import type { Project } from '@/interfaces/project'

const projectFilter = defineModel<CardListProjectFilter>('projectFilter', { required: true })
const q = defineModel<string>('q', { required: true })
const isPrompt = defineModel<boolean>('isPrompt', { required: true })
const flMeeting = defineModel<boolean>('flMeeting', { required: true })

const props = defineProps<{
  projects: Project[]
}>()

const selectedProject = computed(() =>
  projectFilter.value !== 'all' && projectFilter.value !== 'null'
    ? props.projects.find((project) => project.id === projectFilter.value) ?? null
    : null
)

const selectedColor = computed(() => selectedProject.value?.color ?? '#a1a1aa')
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <label
      class="inline-flex items-center gap-2 max-w-full rounded-full border px-3 py-1 text-xs font-semibold"
      :style="{
        backgroundColor: `${selectedColor}33`,
        borderColor: `${selectedColor}99`,
        color: '#1f2937',
      }"
    >
      <span
        class="h-2.5 w-2.5 shrink-0 rounded-full"
        :style="{ backgroundColor: selectedColor }"
      />
      <select
        v-model="projectFilter"
        class="min-w-0 max-w-[12rem] cursor-pointer bg-transparent text-xs font-semibold outline-none dark:text-gray-100"
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
      class="min-w-0 flex-1 rounded-full border border-black/10 dark:border-white/15 bg-white/50 dark:bg-white/5 px-4 py-1.5 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none focus:border-brand-orange/60"
    />

    <button
      type="button"
      class="cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors"
      :class="isPrompt
        ? 'border-emerald-500/70 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
        : 'border-black/10 dark:border-white/15 text-gray-500 dark:text-gray-400 hover:border-emerald-500/40'"
      @click="isPrompt = !isPrompt"
    >
      Prompt
    </button>

    <button
      type="button"
      class="cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors"
      :class="flMeeting
        ? 'border-brand-orange/60 bg-brand-orange/20 text-brand-orange dark:text-white'
        : 'border-black/10 dark:border-white/15 text-gray-500 dark:text-gray-400 hover:border-brand-orange/40'"
      @click="flMeeting = !flMeeting"
    >
      Meeting
    </button>
  </div>
</template>
