<script setup lang="ts">
import { computed } from 'vue'

import { monthLabel, shiftMonth, weekCountForMonth } from '@/helpers/logPeriod'
import type { LogViewFilters } from '@/interfaces/Log'

const props = defineProps<{
  filters: LogViewFilters
}>()

const emit = defineEmits<{
  update: [filters: LogViewFilters]
}>()

const patch = (partial: Partial<LogViewFilters>) => {
  emit('update', { ...props.filters, ...partial })
}

const weeks = computed(() => Array.from({ length: weekCountForMonth() }, (_, index) => index + 1))

const idleClass =
  'border-black/10 dark:border-white/15 text-gray-700 dark:text-gray-200 bg-transparent hover:bg-black/5 dark:hover:bg-white/10'

const toggleStatus = (value: boolean) => {
  patch({ status: props.filters.status === value ? null : value })
}

const statusClass = (value: boolean) => {
  const selected = props.filters.status === value
  if (!selected) return idleClass

  return value
    ? 'border-green-500/60 dark:border-green-500/50 bg-green-500/20 dark:bg-green-500/25 text-gray-900 dark:text-gray-100'
    : 'border-brand-pink/60 dark:border-brand-pink/50 bg-brand-pink/20 dark:bg-brand-pink/25 text-gray-900 dark:text-gray-100'
}

const periodClass = (selected: boolean) =>
  selected
    ? 'border-blue-500/60 dark:border-blue-500/50 bg-blue-500/30 dark:bg-blue-900/80 text-gray-900 dark:text-white'
    : idleClass

const onFromDate = (event: Event) => {
  patch({ from: (event.target as HTMLInputElement).value })
}

const onToDate = (event: Event) => {
  patch({ to: (event.target as HTMLInputElement).value })
}
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-x-4 md:gap-x-8 gap-y-2 rounded-2xl 
     dark:border-white/10  dark:bg-white/3
     backdrop-blur-sm px-4 py-3 text-sm shadow-sm"
  >
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition-colors"
        :class="statusClass(true)"
        :aria-pressed="filters.status === true"
        @click="toggleStatus(true)"
      >
      <span class="material-symbols-outlined align-middle ">
      check_circle
      </span>
        Completado
      </button>
      <button
        type="button"
        class="cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition-colors"
        :class="statusClass(false)"
        :aria-pressed="filters.status === false"
        @click="toggleStatus(false)"
      >
      <span class="material-symbols-outlined align-middle !text-[20px]">
      app_badging
      </span>
        No Completado
      </button>
    </div>

    <div 
      class="flex flex-wrap items-center gap-1"
      v-if="!filters.advanced"
    >
      <div  class="flex items-center gap-1.5">
        <button
          type="button"
          class="cursor-pointer inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors"
          :class="idleClass"
          aria-label="Mes anterior"
          @click="patch({ month: shiftMonth(filters.month, -1) })"
        >
          <span class="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        <span
          class="rounded-lg border px-6 py-1 text-xs font-semibold uppercase tracking-wide"
          :class="periodClass(true)"
        >
          <span class="material-symbols-outlined align-middle !text-[18px]">
          calendar_today
          </span>
          {{ monthLabel(filters.month) }}
        </span>
        <button
          type="button"
          class="cursor-pointer inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors"
          :class="idleClass"
          aria-label="Mes siguiente"
          @click="patch({ month: shiftMonth(filters.month, 1) })"
        >
          <span class="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
  
      <div  class="flex flex-wrap items-center gap-2">
        <button
          v-for="weekNumber in weeks"
          :key="weekNumber"
          type="button"
          class="cursor-pointer rounded-lg border px-3 py-1 text-xs font-semibold transition-colors"
          :class="periodClass(filters.week === weekNumber)"
          :aria-pressed="filters.week === weekNumber"
          @click="patch({ week: weekNumber })"
        >
        <span class="material-symbols-outlined align-middle !text-[18px]">
        event
        </span>
          Week {{ weekNumber }}
        </button>
      </div>
  
    </div>
    <div v-else class="flex flex-wrap items-center gap-2">
      <label class="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
        <span class=" ">
          Inicio
        </span>
        <input
          type="date"
          :value="filters.from"
          aria-label="Fecha de inicio"
          class="rounded-full border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-1 text-xs font-medium text-gray-800 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:border-brand-orange/60"
          @change="onFromDate"
        >
      </label>
      <label class="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
        <span class="">
          Fin
        </span>
        <input
          type="date"
          :value="filters.to"
          aria-label="Fecha de fin"
          class="rounded-full border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-1 text-xs font-medium text-gray-800 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:border-brand-orange/60"
          @change="onToDate"
        >
      </label>
    </div>

    <div class="ms-4">
      <button
        v-if="filters.advanced"
        title="Cambiar a mes"
        type="button"
        class="cursor-pointer mr-1"
        @click="patch({ advanced: false })"
      >
        <span  
        class="inline-block cursor-pointer hover:bg-red-900/60 hover:text-white text-red-500 border border-red-600/60 rounded-lg px-2 py-1">
  
        <span class="material-symbols-outlined align-middle !text-[20px]">
        free_cancellation
        </span>
  
        </span>
      </button>
      <button
        type="button"
        class="cursor-pointer rounded-lg border px-3 py-1 text-xs font-semibold transition-colors"
        :class="
        filters.advanced ? 'border-yellow-500/60 dark:border-yellow-500/50 bg-yellow-500/30 dark:bg-yellow-500/30 text-gray-900 dark:text-gray-100' : idleClass
        "
        :aria-pressed="filters.advanced"
        @click="patch({ advanced: true })"
      >
        <span class="material-symbols-outlined align-middle !text-[20px]">
        event_upcoming
        </span>
        Rango de fechas
      </button>
     
    </div>

  </div>
</template>
