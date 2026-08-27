<script setup lang="ts">
import { computed } from 'vue'

import { monthLabel, shiftMonth } from '@/helpers/logPeriod'

const props = defineProps<{
  month: string
  week: number
  weekCount: number
  status: boolean | null
  advanced: boolean
  fromDate: string
  toDate: string
}>()

const emit = defineEmits<{
  'update:month': [month: string]
  'update:week': [week: number]
  'update:status': [status: boolean | null]
  'update:advanced': [advanced: boolean]
  'update:fromDate': [fromDate: string]
  'update:toDate': [toDate: string]
}>()

const weeks = computed(() => Array.from({ length: props.weekCount }, (_, index) => index + 1))

const idleClass =
  'border-black/10 dark:border-white/15 text-gray-700 dark:text-gray-200 bg-transparent hover:bg-black/5 dark:hover:bg-white/10'

const toggleStatus = (value: boolean) => {
  emit('update:status', props.status === value ? null : value)
}

const statusClass = (value: boolean) => {
  const selected = props.status === value
  if (!selected) return idleClass

  return value
    ? 'border-brand-cyan/60 dark:border-brand-cyan/50 bg-brand-cyan/20 dark:bg-brand-cyan/25 text-gray-900 dark:text-white'
    : 'border-brand-pink/60 dark:border-brand-pink/50 bg-brand-pink/20 dark:bg-brand-pink/25 text-gray-900 dark:text-white'
}

const periodClass = (selected: boolean) =>
  selected
    ? 'border-brand-orange/60 dark:border-brand-orange/50 bg-brand-orange/20 dark:bg-brand-orange/25 text-gray-900 dark:text-white'
    : idleClass

const onFromDate = (event: Event) => {
  emit('update:fromDate', (event.target as HTMLInputElement).value)
}

const onToDate = (event: Event) => {
  emit('update:toDate', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-3 rounded-2xl border border-black/5 dark:border-white/10  dark:bg-white/5 backdrop-blur-sm px-4 py-3 text-sm shadow-sm"
  >
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition-colors"
        :class="statusClass(true)"
        :aria-pressed="status === true"
        @click="toggleStatus(true)"
      >
        Finalizado
      </button>
      <button
        type="button"
        class="cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition-colors"
        :class="statusClass(false)"
        :aria-pressed="status === false"
        @click="toggleStatus(false)"
      >
        No Finalizado
      </button>
    </div>

    <div v-if="!advanced" class="flex items-center gap-1.5">
      <button
        type="button"
        class="cursor-pointer inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors"
        :class="idleClass"
        aria-label="Mes anterior"
        @click="emit('update:month', shiftMonth(month, -1))"
      >
        <span class="material-symbols-outlined text-[18px]">chevron_left</span>
      </button>
      <span
        class="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide"
        :class="periodClass(true)"
      >
        MES {{ monthLabel(month) }}
      </span>
      <button
        type="button"
        class="cursor-pointer inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors"
        :class="idleClass"
        aria-label="Mes siguiente"
        @click="emit('update:month', shiftMonth(month, 1))"
      >
        <span class="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>
    </div>

    <div v-if="!advanced" class="flex flex-wrap items-center gap-2">
      <button
        v-for="weekNumber in weeks"
        :key="weekNumber"
        type="button"
        class="cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition-colors"
        :class="periodClass(week === weekNumber)"
        :aria-pressed="week === weekNumber"
        @click="emit('update:week', weekNumber)"
      >
        Semana {{ weekNumber }}
      </button>
    </div>

    <div v-else class="flex flex-wrap items-center gap-2">
      <label class="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
        Inicio
        <input
          type="date"
          :value="fromDate"
          aria-label="Fecha de inicio"
          class="rounded-full border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-1 text-xs font-medium text-gray-800 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:border-brand-orange/60"
          @change="onFromDate"
        >
      </label>
      <label class="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
        Fin
        <input
          type="date"
          :value="toDate"
          aria-label="Fecha de fin"
          class="rounded-full border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-1 text-xs font-medium text-gray-800 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:border-brand-orange/60"
          @change="onToDate"
        >
      </label>
    </div>

    <button
      type="button"
      class="cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition-colors"
      :class="periodClass(advanced)"
      :aria-pressed="advanced"
      @click="emit('update:advanced', !advanced)"
    >
      Fechas avanzadas
    </button>
  </div>
</template>
