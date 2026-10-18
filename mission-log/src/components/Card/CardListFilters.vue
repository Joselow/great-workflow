<script setup lang="ts">
import ProjectSelect from '@/components/Project/ProjectSelect.vue'

import type { CardListProjectFilter, CardListViewFilters } from '@/interfaces/card'

const props = defineProps<{
  filters: CardListViewFilters
}>()

const q = defineModel<string>('q', { required: true })

const emit = defineEmits<{
  update: [filters: CardListViewFilters]
}>()

const patch = (partial: Partial<CardListViewFilters>) => {
  emit('update', { ...props.filters, ...partial })
}

const onProjectChange = (value: string | null) => {
  patch({ projectFilter: (value ?? 'all') as CardListProjectFilter })
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <ProjectSelect
      :model-value="filters.projectFilter"
      empty-value="all"
      empty-label="Todos"
      @update:model-value="onProjectChange"
    />

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
