<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ColorPicker from '@/components/Project/ColorPicker.vue'
import ConfirmModal from '@/commons/ConfirmModal.vue'
import DangerZone from '@/commons/DangerZone.vue'
import CardProjectSelect from '@/components/Card/CardProjectSelect.vue'
import MeetingIssueList from '@/components/Meeting/MeetingIssueList.vue'
import MeetingCardPanel from '@/components/Meeting/MeetingCardPanel.vue'
import NotFoundView from '@/views/NotFoundView.vue'

import { projectStore } from '@/store/projectStore'
import { useProject } from '@/composables/useProject'
import { useMeeting } from '@/composables/useMeeting'
import { useShowStates } from '@/composables/useShowStates'
import { errorToast } from '@/composables/useAlerts'

import { DEFAULT_PROJECT_COLOR } from '@/constants/projectColors'
import { cardSurfaceStyle, isLightHex } from '@/helpers/cardColor'

import type { MeetingDraft, MeetingWritePayload } from '@/interfaces/meeting'

const route = useRoute()
const router = useRouter()

const { activeProject, projects } = projectStore
const { getProjects } = useProject()
const { createMeeting, getMeetingById, updateMeeting, deleteMeeting, loading } = useMeeting()
const { modalConfirm, onModalConfirm, offModalConfirm } = useShowStates('modalConfirm')

const draft = ref<MeetingDraft | null>(null)
const notFound = ref(false)

const pad = (value: number) => String(value).padStart(2, '0')

const toDatetimeLocal = (value?: string) => {
  const date = value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) return ''

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const queryLogLinks = () => {
  const raw = route.query.logs
  const value = Array.isArray(raw) ? raw.join(',') : raw
  if (!value) return []

  return value
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .map((logId) => ({ logId, source: 'log' as const }))
}

const emptyDraft = (): MeetingDraft => ({
  title: '',
  date: toDatetimeLocal(),
  estimatedDuration: 40,
  topicStatus: '',
  objective: '',
  participants: '',
  color: DEFAULT_PROJECT_COLOR,
  projectId: activeProject.value?.id ?? null,
  issues: [{ name: '', color: DEFAULT_PROJECT_COLOR }],
  cardIds: [],
  logLinks: queryLogLinks(),
  cards: [],
})

const toPayload = (current: MeetingDraft): MeetingWritePayload => ({
  title: current.title.trim(),
  date: new Date(current.date).toISOString(),
  estimatedDuration: Number(current.estimatedDuration),
  topicStatus: current.topicStatus,
  objective: current.objective,
  participants: current.participants,
  color: current.color,
  projectId: current.projectId,
  issues: current.issues.filter((item) => item.name.trim()),
  cardIds: current.cards.map((card) => card.id),
  logLinks: current.logLinks,
})

const loadProjects = async () => {
  if (projects.value.length) return

  const { success, data } = await getProjects()
  if (success && data) {
    projects.value = data
  }
}

const startView = async () => {
  const id = route.params.id

  if (!id) {
    draft.value = emptyDraft()
    return
  }

  const { success, data } = await getMeetingById(id as string)
  if (!success || !data) {
    notFound.value = true
    return
  }

  draft.value = {
    id: data.id,
    title: data.title,
    date: toDatetimeLocal(data.date),
    estimatedDuration: data.estimatedDuration,
    topicStatus: data.topicStatus,
    objective: data.objective,
    participants: data.participants,
    color: data.color,
    projectId: data.projectId,
    issues: data.issues?.length ? data.issues : [{ name: '', color: DEFAULT_PROJECT_COLOR }],
    cardIds: data.cards.map((card) => card.id),
    logLinks: data.logs.map((log) => ({ logId: log.id, source: log.source })),
    cards: data.cards,
  }
}

startView()
loadProjects()

const handleSaveClick = () => {
  if (!draft.value) return

  if (!draft.value.title.trim()) {
    errorToast('El título es requerido')
    return
  }

  if (!draft.value.date || Number.isNaN(new Date(draft.value.date).getTime())) {
    errorToast('La fecha es requerida')
    return
  }

  if (!draft.value.estimatedDuration || draft.value.estimatedDuration < 1) {
    errorToast('El tiempo estimado es requerido')
    return
  }

  onModalConfirm()
}

const handleConfirmSave = async () => {
  if (!draft.value) return

  const payload = toPayload(draft.value)

  if (draft.value.id) {
    const { success, data } = await updateMeeting(draft.value.id, payload)
    if (!success || !data) return

    draft.value = {
      ...draft.value,
      ...payload,
      id: data.id,
      date: toDatetimeLocal(data.date),
      issues: data.issues,
      cards: data.cards,
      logLinks: data.logs.map((log) => ({ logId: log.id, source: log.source })),
    }
    offModalConfirm()
    return
  }

  const { success, data } = await createMeeting(payload)
  if (!success || !data) return

  offModalConfirm()
  await router.replace({ name: 'editMeeting', params: { id: data.id } })
}

const handleConfirmDelete = async (id: string) => {
  const { success } = await deleteMeeting(id)
  if (!success) return

  await router.push({ name: 'meetings' })
}
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <button
      type="button"
      class="cursor-pointer bg-rose-600 dark:bg-rose-700 text-white w-auto rounded-lg hover:bg-rose-500 border border-rose-500/60 dark:border-white/15 px-3 py-1 text-xs font-semibold tracking-wide dark:hover:bg-rose-800"
      @click="router.push({ name: 'meetings' })"
    >
      <span class="material-symbols-outlined align-middle" style="font-size: 18px;">arrow_back</span>
      Volver a reuniones
    </button>
  </div>

  <NotFoundView v-if="notFound" />

  <div
    v-else-if="draft"
    class="min-w-0 max-w-3xl mx-auto px-1 pb-2 md:pb-6"
  >
    <ConfirmModal
      v-model="modalConfirm"
      title="¿Guardar esta reunión?"
      :loading="loading"
      @confirm="handleConfirmSave"
    >
      <p class="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
        Se guardará la planificación y las cards asociadas.
      </p>
    </ConfirmModal>

    <div class="mt-4 mb-3 flex items-center gap-2">
      <h2 class="text-2xl font-bold">
        <span class="material-symbols-outlined align-middle">
          {{ draft.id ? 'edit' : 'add_circle' }}
        </span>
      </h2>
      <CardProjectSelect v-model="draft.projectId" :projects="projects" />
    </div>

    <div
      class="relative rounded-2xl border p-6 md:p-8"
      :style="cardSurfaceStyle(draft.color)"
    >
      <div class="grid gap-6 md:grid-cols-[1fr_14rem]">
        <div class="min-w-0 space-y-4">
          <input
            v-model="draft.title"
            type="text"
            maxlength="100"
            placeholder="Título de la reunión"
            class="w-full bg-transparent text-3xl font-semibold text-gray-900 dark:text-white border-0 focus:outline-none placeholder:text-gray-400"
          />

          <label class="block text-xs font-semibold text-gray-500">
            Fecha
            <input
              v-model="draft.date"
              type="datetime-local"
              class="mt-1 w-full rounded-md border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 px-2 py-1 text-sm text-gray-800 dark:text-gray-100 outline-none"
            />
          </label>

          <label class="block text-xs font-semibold text-gray-500">
            Estado actual
            <textarea
              v-model="draft.topicStatus"
              rows="3"
              class="mt-1 w-full rounded-md border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 px-2 py-1.5 text-sm text-gray-800 dark:text-gray-100 outline-none"
            />
          </label>

          <label class="text-red-600 dark:text-red-400 block text-xs font-semibold 
          ">
            Objectivo de la reunión
            <textarea
              v-model="draft.objective"
              rows="2"
              maxlength="255"
              class="mt-1 w-full rounded-md border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 px-2 py-1.5 text-sm text-gray-800 dark:text-gray-100 outline-none"
            />
          </label>

          <MeetingIssueList v-model="draft.issues" />

          <label class="block text-xs font-semibold text-gray-500">
            Tiempo estimado (min)
            <input
              v-model.number="draft.estimatedDuration"
              type="number"
              min="1"
              class="mt-1 w-28 rounded-md border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 px-2 py-1 text-sm outline-none"
            />
          </label>

          <label class="block text-xs font-semibold text-gray-500">
            Participantes
            <textarea
              v-model="draft.participants"
              rows="2"
              class="mt-1 w-full rounded-md border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 px-2 py-1.5 text-sm outline-none"
            />
          </label>
        </div>

        <div class="space-y-4">
          <div class="flex justify-end">
            <ColorPicker v-model="draft.color" variant="button" />
          </div>
          <MeetingCardPanel v-model="draft.cards" />
        </div>
      </div>

      <div class="mt-10 flex justify-center">
        <button
          type="button"
          class="cursor-pointer rounded-lg font-semibold px-8 py-2.5 transition-opacity hover:opacity-90"
          :style="{
            backgroundColor: draft.color,
            color: isLightHex(draft.color) ? '#1f2937' : '#fff',
          }"
          @click="handleSaveClick"
        >
          <span class="material-symbols-outlined align-middle" style="font-size: 18px;">save</span>
          Guardar
        </button>
      </div>
    </div>

    <DangerZone
      v-if="draft.id"
      :id="draft.id"
      description="Eliminar la reunión de forma permanente."
      action-label="Eliminar reunión"
      confirm-title="¿Eliminar esta reunión?"
      confirm-description="Se eliminará la reunión. Las cards y logs no se borran."
      :loading="loading"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>
