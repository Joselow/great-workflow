<script setup lang="ts">
import { markersToHtml } from '@/helpers/richText'
import type { MeetingIssue } from '@/interfaces/meeting'

defineProps<{
  issue: MeetingIssue
  interactive?: boolean
}>()

const emit = defineEmits<{
  open: []
}>()
</script>

<template>
  <div
    class="flex select-text items-center justify-between rounded-xl border-2 px-3 py-2 text-sm"
    :style="{ borderColor: issue.color, color: issue.color }"
    @dblclick="interactive && emit('open')"
  >
    <span v-html="markersToHtml(issue.name, true)" />
    <button
      v-if="interactive"
      type="button"
      class="rounded-lg bg-gray-100 text-sm font-semibold 
      px-1
      hover:text-gray-500 dark:bg-gray-800 
      dark:hover:text-gray-400"
      @click="emit('open')"
    >
      <span class="material-symbols-outlined align-middle">chevron_right</span>
    </button>
  </div>
</template>
