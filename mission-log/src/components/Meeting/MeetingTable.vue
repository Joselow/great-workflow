<script setup lang="ts">
import { ref } from 'vue'
import MeetingRowActions from './MeetingRowActions.vue'
import ActionTemplateButton from '@/components/ActionTemplate/ActionTemplateButton.vue'
import ConfirmModal from '@/commons/ConfirmModal.vue'
import { useMeeting } from '@/composables/useMeeting'
import { applyActionTemplate } from '@/helpers/applyActionTemplate'
import { generateMeetingSummary } from '@/helpers/meetingSummary'

import type { ActionTemplate } from '@/interfaces/actionTemplate'
import type { MeetingListItem } from '@/interfaces/meeting'

withDefaults(defineProps<{
  meetings: MeetingListItem[]
  emptyLabel: string
  templates?: ActionTemplate[]
}>(), {
  templates: () => [],
})

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

const { getMeetingById } = useMeeting()
const confirmOpen = ref(false)
const pendingDelete = ref<MeetingListItem | null>(null)
const applyingId = ref<string | null>(null)

const applyMeetingTemplate = async (meeting: MeetingListItem, template: ActionTemplate) => {
  if (applyingId.value) return
  applyingId.value = meeting.id

  const { success, data } = await getMeetingById(meeting.id)
  applyingId.value = null
  if (!success || !data) return

  const entity = generateMeetingSummary({
    title: data.title,
    projectName: meeting.project?.name ?? '',
    date: data.date,
    estimatedDuration: data.estimatedDuration,
    topicStatus: data.topicStatus,
    objective: data.objective,
    issues: data.issues,
    participants: data.participants,
    nextSteps: data.logs.filter((log) => log.source === 'meeting'),
  })

  await applyActionTemplate(template, entity)
}

const askDelete = (meeting: MeetingListItem) => {
  pendingDelete.value = meeting
  confirmOpen.value = true
}

const confirmDelete = () => {
  const meeting = pendingDelete.value
  confirmOpen.value = false
  pendingDelete.value = null
  if (!meeting) return
  emit('delete', meeting)
}
</script>

<template>
  <div>
    <div class="overflow-x-auto rounded-xl border border-black/10 dark:border-white/15">
      <table class="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr class="border-b border-black/10 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:border-white/10 dark:text-gray-400">
            <th class="px-3 py-2 font-semibold">Título</th>
            <th class="px-3 py-2 font-semibold">Fecha</th>
            <th class="px-3 py-2 font-semibold">Duración Estimada</th>
            <th class="px-3 py-2 font-semibold">Proyecto</th>
            <th class="px-3 py-2 font-semibold">Participantes</th>
            <th class="w-20 px-3 py-2">
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
            @keydown.enter="emit('open', meeting)"
            @keydown.space.prevent="emit('open', meeting)"
          >
            <td class="px-3 py-2.5">
              <span class="inline-flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <span v-if="meeting.executed" class="material-symbols-outlined align-middle text-green-600">
                  verified
                </span>
                <span v-if="meeting.objectiveAchieved" class="material-symbols-outlined align-middle text-yellow-400">
                  rocket_launch
                </span>
                <span
                  v-if="!meeting.executed"
                  class="inline-block size-2.5 shrink-0 rounded-full border border-black/10
                    dark:bg-white
                    bg-gray-700
                  "
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
              class="px-3 py-2.5 "
              @click.stop
              @keydown.stop
            >
            <div class="flex gap-2 align-center">
              <button class="px-4 cursor-pointer inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-500/40 bg-rose-500/50 
                text-rose-700 dark:text-rose-300 px-4
                hover:bg-rose-500 hover:text-white
                "
                title="Ver reunión"
                @click="emit('open', meeting)"
                >
                <span class="material-symbols-outlined" style="font-size: 1.1rem;">
                  visibility
                </span>
              </button>
  
              <MeetingRowActions
                class="text-right">
                <ActionTemplateButton
                  v-for="template in templates"
                  :key="template.id"
                  :template="template"
                  @click="applyMeetingTemplate(meeting, template)"
                />
                <button
                  type="button"
                  class="w-full cursor-pointer break-words px-3 py-1.5 text-left text-xs font-semibold text-red-600 hover:bg-red-500/10 dark:text-red-400"
                  role="menuitem"
                  @click="askDelete(meeting)"
                >
                  <span class="material-symbols-outlined align-middle" style="font-size: 1.1rem;">delete</span>
                  Eliminar
                </button>
              </MeetingRowActions>
            </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <ConfirmModal
      v-model="confirmOpen"
      title="¿Eliminar esta reunión?"
      @confirm="confirmDelete"
    >
      <p class="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
        Esta acción no se puede deshacer.
      </p>
    </ConfirmModal>
  </div>
</template>
