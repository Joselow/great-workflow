<script setup lang="ts">
import MeetingRowActions from './MeetingRowActions.vue'

import type { MeetingListItem } from '@/interfaces/meeting'

defineProps<{
  meetings: MeetingListItem[]
  emptyLabel: string
}>()

const emit = defineEmits<{
  open: [meeting: MeetingListItem]
  delete: [meeting: MeetingListItem]
}>()

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-black/10 dark:border-white/15">
    <table class="w-full min-w-[720px] border-collapse text-left text-sm">
      <thead>
        <tr class="border-b border-black/10 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:border-white/10 dark:text-gray-400">
          <th class="px-3 py-2 font-semibold">Título</th>
          <th class="px-3 py-2 font-semibold">Fecha</th>
          <th class="px-3 py-2 font-semibold">Duración</th>
          <th class="px-3 py-2 font-semibold">Proyecto</th>
          <th class="px-3 py-2 font-semibold">Participantes</th>
          <th class="w-12 px-3 py-2">
            <span class="sr-only">Acciones</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!meetings.length">
          <td
            colspan="6"
            class="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
          >
            {{ emptyLabel }}
          </td>
        </tr>
        <tr
          v-for="meeting in meetings"
          :key="meeting.id"
          tabindex="0"
          class="cursor-pointer border-b border-black/5 last:border-b-0 hover:bg-black/[0.03] focus:outline-none focus:bg-black/[0.04] dark:border-white/5 dark:hover:bg-white/[0.04] dark:focus:bg-white/[0.06]"
          @click="emit('open', meeting)"
          @keydown.enter="emit('open', meeting)"
          @keydown.space.prevent="emit('open', meeting)"
        >
          <td class="px-3 py-2.5">
            <span class="inline-flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <span
                class="inline-block size-2.5 shrink-0 rounded-full border border-black/10"
                :style="{ backgroundColor: meeting.color }"
                aria-hidden="true"
              />
              {{ meeting.title }}
            </span>
          </td>
          <td class="whitespace-nowrap px-3 py-2.5 text-gray-700 dark:text-gray-200">
            {{ formatDate(meeting.date) }}
          </td>
          <td class="whitespace-nowrap px-3 py-2.5 text-gray-700 dark:text-gray-200">
            {{ meeting.estimatedDuration }} min
          </td>
          <td class="px-3 py-2.5 text-gray-700 dark:text-gray-200">
            {{ meeting.project?.name ?? 'Sin proyecto' }}
          </td>
          <td class="max-w-56 px-3 py-2.5 text-gray-700 dark:text-gray-200">
            <span class="line-clamp-2 break-words">{{ meeting.participants }}</span>
          </td>
          <td
            class="px-3 py-2.5 text-right"
            @click.stop
            @keydown.stop
          >
            <MeetingRowActions @delete="emit('delete', meeting)" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
