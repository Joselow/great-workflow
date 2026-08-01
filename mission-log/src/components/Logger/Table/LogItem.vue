<script setup lang="ts">
import { computed } from 'vue';

import LogItemActions from './LogItemActions.vue';

import { logStore } from '@/store/logStore';

import { getPastelPalette } from '@/helpers/pastel';

import type { Log } from '@/interfaces/Log';

const { selectLog, selectedLog } = logStore

interface Props {
  log: Log
}

const props = defineProps<Props>()

const emits = defineEmits<{
  delete: [log: Log]
}>()

const isSelected = computed(() => selectedLog.value?.id === props.log.id)
const palette = computed(() => getPastelPalette(props.log.responsible || props.log.description))

const handleSelectLog = (log: Log) => {
    selectLog(log)
}
</script>

<template>
    <div class="group flex items-center justify-between gap-3 rounded-lg border border-1 px-3 py-2 transition-colors duration-100
      shadow-lg
    "
      :class="isSelected
        ? 'bg-brand-orange/25 dark:bg-brand-orange/20 border-brand-orange dark:border-brand-orange/70'
        : 'border-black/30 dark:border-white/40 hover:border-black/60 dark:hover:border-white/60'"
        @dblclick="handleSelectLog(log)"
    >
      <div class="flex min-w-0 items-center gap-3">
        <div class="flex min-w-0 flex-col gap-1">
          <span class="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
            {{ log.description }}
          </span>

          <div class="flex flex-wrap items-center gap-1.5 text-xs">
            <span v-if="log.responsible" class="text-gray-500 dark:text-gray-400">
              {{ log.responsible }}
            </span>
            <span v-if="log.responsible && log.tags" class="text-gray-300 dark:text-gray-600">·</span>
            <span v-if="log.tags" class="rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-white"
              :class="palette.bg"
            >
              {{ log.tags }}
            </span>
            <span v-if="log.completed" class="flex items-center gap-1 font-medium text-emerald-500 ">
              ✓ Finalizado
            </span>
          </div>
        </div>
      </div>

      <LogItemActions
        :log="log"
        @delete="emits('delete', $event)"
      />
    </div>
</template>
