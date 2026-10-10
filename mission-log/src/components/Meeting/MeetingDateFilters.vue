<script setup lang="ts">
import { computed } from 'vue'

import type { MeetingDateFilters } from '@/interfaces/meeting'

const props = defineProps<{
  filters: MeetingDateFilters
}>()

const emit = defineEmits<{
  update: [filters: MeetingDateFilters]
}>()

const inputClass =
  'rounded-full border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-1 text-xs font-medium text-gray-800 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:border-brand-orange/60'

const onFrom = (event: Event) => {
  emit('update', {
    ...props.filters,
    from: (event.target as HTMLInputElement).value,
  })
}

const onTo = (event: Event) => {
  emit('update', {
    ...props.filters,
    to: (event.target as HTMLInputElement).value,
  })
}

const clear = () => {
  emit('update', { from: '', to: '' })
}

const rangeNote = computed(() => {
  const { from, to } = props.filters
  const hasFrom = from !== ''
  const hasTo = to !== ''

  if (hasFrom !== hasTo) return 'El rango no se aplica: indica las dos fechas.'
  if (hasFrom && hasTo && from > to) {
    return 'El rango no se aplica: la fecha de inicio es posterior a la fecha fin.'
  }

  return ''
})
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-black/10 px-4 py-3 text-sm dark:border-white/15">
    <label class="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
      Desde
      <input
        type="date"
        :value="filters.from"
        aria-label="Desde"
        :class="inputClass"
        @change="onFrom"
      >
    </label>
    <label class="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
      Hasta
      <input
        type="date"
        :value="filters.to"
        aria-label="Hasta"
        :class="inputClass"
        @change="onTo"
      >
    </label>
    <button
      type="button"
      class="cursor-pointer rounded-lg border border-black/10 px-3 py-1 text-xs font-semibold text-gray-700 transition-colors hover:bg-black/5 dark:border-white/15 dark:text-gray-200 dark:hover:bg-white/10"
      @click="clear"
    >
      Limpiar
    </button>
    <p
      v-if="rangeNote"
      class="text-xs text-brand-pink"
    >
      {{ rangeNote }}
    </p>
  </div>
</template>
