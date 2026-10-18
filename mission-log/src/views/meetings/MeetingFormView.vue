<script setup lang="ts">
import { defineAsyncComponent, ref, useTemplateRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ConfirmModal from '@/commons/ConfirmModal.vue'
import DangerZone from '@/commons/DangerZone.vue'
import ProjectSelect from '@/components/Project/ProjectSelect.vue'
import MeetingIssueList from '@/components/Meeting/MeetingIssueList.vue'
import MeetingNextStepList from '@/components/Meeting/MeetingNextStepList.vue'
import MeetingCardPanel from '@/components/Meeting/MeetingCardPanel.vue'
import RichTextEditor from '@/components/RichTextEditor.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import Loader from '@/commons/Loader.vue'

import { projectStore } from '@/store/projectStore'
import { useProject } from '@/composables/useProject'
import { useMeeting } from '@/composables/useMeeting'
import { useShowStates } from '@/composables/useShowStates'
import { errorToast, successToast } from '@/composables/useAlerts'
import { textDataStore } from '@/store/textDataStore'
import { generateMeetingSummary } from '@/helpers/meetingSummary'

import { COLOR_ISSUE, DEFAULT_PROJECT_COLOR } from '@/constants/projectColors'
import { cardSurfaceStyle, isLightHex } from '@/helpers/cardColor'

import type { MeetingDraft, MeetingLogLink, MeetingNextStep, MeetingQualificationPayload, MeetingWriteLogLink, MeetingWritePayload } from '@/interfaces/meeting'

const MeetingQualificationModal = defineAsyncComponent(
  () => import('@/components/Meeting/MeetingQualificationModal.vue'),
)
const MeetingRequirementsTasks = defineAsyncComponent(
  () => import('@/components/Meeting/MeetingRequirementsTasks.vue'),
)
import { formatHours } from '@/utils/date'

const route = useRoute()
const router = useRouter()

const { activeProject, projects } = projectStore
const { ensureProjects } = useProject()
const { createMeeting, getMeetingById, updateMeeting, qualifyMeeting, deleteMeeting, loading } = useMeeting()
const { modalConfirm, onModalConfirm, offModalConfirm } = useShowStates('modalConfirm')

const draft = ref<MeetingDraft | null>(null)
const persistedProjectId = ref<string | null>(null)
const notFound = ref(false)
const qualificationMounted = ref(false)
const qualificationOpen = ref(false)

const emptyToNull = (value: string | null) => {
  const trimmed = value?.trim() ?? ''
  return trimmed ? trimmed : null
}

const nextStepsFromLogs = (logs: MeetingLogLink[]): MeetingNextStep[] => {
  const steps = logs
    .filter((log) => log.source === 'meeting')
    .map((log) => ({ logId: log.id, description: log.description }))

  return steps.length ? steps : [{ description: '' }]
}

const attachedLogLinks = (logs: MeetingLogLink[]): MeetingWriteLogLink[] =>
  logs
    .filter((log) => log.source === 'log')
    .map((log) => ({ logId: log.id, source: 'log' }))

const pad = (value: number) => String(value).padStart(2, '0')

const toDatetimeLocal = (value?: string) => {
  const date = value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) return ''

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const emptyDraft = (): MeetingDraft => ({
  title: '',
  date: toDatetimeLocal(),
  estimatedDuration: 30,
  topicStatus: '',
  objective: '',
  participants: '',
  color: DEFAULT_PROJECT_COLOR,
  projectId: activeProject.value?.id ?? null,
  issues: [{ name: '', color: COLOR_ISSUE }],
  cardIds: [],
  logLinks: [],
  nextSteps: [{ description: '' }],
  cards: [],
  lessons: null,
  summary: null,
  executed: false,
  objectiveAchieved: null,
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
  logLinks: current.logLinks.filter((link) => link.source === 'log'),
  nextSteps: current.nextSteps
    .map((step) => ({
      ...(step.logId ? { logId: step.logId } : {}),
      description: step.description.trim(),
    }))
    .filter((step) => step.description.length > 0),
  lessons: emptyToNull(current.lessons),
  summary: emptyToNull(current.summary),
  executed: current.executed,
  objectiveAchieved: current.objectiveAchieved,
})

const startView = async () => {
  const id = route.params.id

  if (!id) {
    draft.value = emptyDraft()
    persistedProjectId.value = null
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
    logLinks: attachedLogLinks(data.logs),
    nextSteps: nextStepsFromLogs(data.logs),
    cards: data.cards,
    lessons: data.lessons,
    summary: data.summary,
    executed: data.executed,
    objectiveAchieved: data.objectiveAchieved,
  }
  persistedProjectId.value = data.projectId
}

startView()
void ensureProjects()

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

  if (draft.value.objectiveAchieved === false && !draft.value.lessons?.trim()) {
    errorToast('Las lecciones son obligatorias si el objetivo no se logró')
    return
  }

  const keptSteps = draft.value.nextSteps
    .map((step) => step.description.trim())
    .filter((description) => description.length > 0)

  if (keptSteps.some((description) => description.length < 2)) {
    errorToast('Cada siguiente paso necesita al menos 2 caracteres')
    return
  }

  if (keptSteps.length && !draft.value.projectId) {
    errorToast('Elige un proyecto para guardar los siguientes pasos')
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
      logLinks: attachedLogLinks(data.logs),
      nextSteps: nextStepsFromLogs(data.logs),
      executed: data.executed,
      objectiveAchieved: data.objectiveAchieved,
      summary: data.summary,
      lessons: data.lessons,
    }
    persistedProjectId.value = data.projectId
    offModalConfirm()
    return
  }

  const { success, data } = await createMeeting(payload)
  if (!success || !data) return

  draft.value = {
    ...draft.value,
    id: data.id,
    issues: data.issues,
    cards: data.cards,
    logLinks: attachedLogLinks(data.logs),
    nextSteps: nextStepsFromLogs(data.logs),
  }
  persistedProjectId.value = data.projectId
  offModalConfirm()
  await router.replace({ name: 'editMeeting', params: { id: data.id } })
}

const objectiveEditor = useTemplateRef<InstanceType<typeof RichTextEditor>>('objectiveEditor')
const statusEditor = useTemplateRef<InstanceType<typeof RichTextEditor>>('statusEditor')

const focusEditor = (editor: InstanceType<typeof RichTextEditor> | null, event: MouseEvent) => {
  if (event.target instanceof HTMLElement && event.target.closest('.editor')) return
  editor?.focus()
}

const copyMeetingSummary = async () => {
  if (!draft.value) return


  const projectName = projects.value.find((project) => project.id === draft.value?.projectId)?.name ?? ''
  const text = generateMeetingSummary({
    title: draft.value.title,
    projectName,
    date: draft.value.date,
    estimatedDuration: draft.value.estimatedDuration,
    topicStatus: draft.value.topicStatus,
    objective: draft.value.objective,
    issues: draft.value.issues,
    participants: draft.value.participants,
    nextSteps: draft.value.nextSteps,
  })

  textDataStore.setTextData(text, 'markdown')

  try {
    await navigator.clipboard.writeText(text)
    successToast('✓ Copiado')
    // document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
    document.documentElement.scrollTop = 0
  } catch {
    errorToast('No se pudo copiar el texto')
  }


}

const openQualification = () => {
  qualificationMounted.value = true
  qualificationOpen.value = true
}

const handleQualify = async (payload: MeetingQualificationPayload) => {
  if (!draft.value?.id) return

  const { success, data } = await qualifyMeeting(draft.value.id, payload)
  if (!success || !data) return

  draft.value.executed = data.executed
  draft.value.objectiveAchieved = data.objectiveAchieved
  draft.value.summary = data.summary
  draft.value.lessons = data.lessons
  qualificationOpen.value = false
}


const handleConfirmDelete = async (id: string) => {
  const { success } = await deleteMeeting(id)
  if (!success) return

  await router.push({ name: 'meetings' })
}

</script>

<template>
  <div class="max-w-5xl mx-auto">
    <Loader v-if="loading" />

    <button
      type="button"
      class="cursor-pointer text-red-600 dark:text-red-400 w-auto rounded-lg 
      hover:bg-rose-100 border border-rose-500 px-3 py-1 text-xs font-semibold tracking-wide 
      dark:hover:bg-rose-500/30
      hover:text-red-500
      "
      @click="router.push({ name: 'meetings' })"
    >
      <span class="material-symbols-outlined align-middle" style="font-size: 18px;">arrow_back</span>
      Volver a reuniones
    </button>
  </div>

  <NotFoundView v-if="notFound" />

  <div
    v-else-if="draft"
    class="min-w-0 max-w-4xl mx-auto px-1 pb-2 md:pb-6"
  >
    <MeetingQualificationModal
      v-if="qualificationMounted && draft.id"
      v-model="qualificationOpen"
      :summary="draft.summary"
      :lessons="draft.lessons"
      :objective-achieved="draft.objectiveAchieved"
      :loading="loading"
      @save="handleQualify"
    />

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

    <div class="mt-4 mb-3 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <h2 class="text-2xl font-bold">
          <span class="material-symbols-outlined align-middle">
            {{ draft.id ? 'edit' : 'add_circle' }}
          </span>
        </h2>
        <ProjectSelect v-model="draft.projectId" />
      </div>
      <div class="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm font-semibold">
        <div v-if="draft.executed === true"
        class="text-green-500">
          <span class="material-symbols-outlined align-middle"
          style="font-size: 30px;"
          >verified</span>
          Ejecutada
        </div>
        <div
          v-if="draft.objectiveAchieved === true"
          class="text-yellow-500"
        >
          <span class="material-symbols-outlined align-middle"  
          style="font-size: 30px;"
          >rocket_launch</span>
          Objetivo logrado
        </div>

        <button
          v-if="draft.id"
          type="button"
          class="cursor-pointer rounded-lg border border-2 border-sky-600/40 px-3 py-1 text-xs font-semibold 
          hover:scale-105 transition-all duration-200
              text-sky-700 
              bg-sky-200/60 
              hover:bg-sky-300/60
              dark:bg-sky-600/40 dark:text-sky-200
              dark:hover:bg-sky-600/70 dark:hover:text-sky-100
          "
          @click="openQualification"
        >
          <span class="material-symbols-outlined align-middle">checklist</span>
          <span v-show="!draft.executed">
            Calificar reunión
          </span>
        </button>
      </div>
    </div>

    <div
      class="relative rounded-2xl border p-6 md:p-8"
      :style="cardSurfaceStyle(draft.color)"
    >
      <div class="grid gap-6 md:grid-cols-[1fr_18rem]">
        <div class="min-w-0 space-y-6">
          <p
            class="text-3xl font-semibold"
            :class="draft.title.trim() ? 'text-gray-900 dark:text-white' : 'text-gray-400'"
          >
            {{ draft.title.trim() || 'Título de la reunión' }}
          </p>

          <label
            class="block text-xs font-semibold text-green-600 dark:text-green-400"
            @click="focusEditor(objectiveEditor, $event)"
          >
            Objectivo de la reunión
            <RichTextEditor
              ref="objectiveEditor"
              v-model="draft.objective"
              class="mt-1"
              multiline
              :rows="2"
              :maxlength="255"
            />
            <span class="mt-1.5 flex items-center gap-1.5 text-[11px] font-normal leading-none text-gray-400 dark:text-gray-500">
              <span class="font-semibold text-gray-500 dark:text-gray-400">Ctrl+B</span>
              <span class="opacity-40">·</span>
              <span class="italic">Ctrl+I</span>
            </span>
          </label>

          <label
            class="block text-xs font-semibold text-blue-600 dark:text-blue-400"
            @click="focusEditor(statusEditor, $event)"
          >
            Estado actual
            <RichTextEditor
              ref="statusEditor"
              v-model="draft.topicStatus"
              class="mt-1"
              multiline
              :rows="3"
            />
          </label>

          <label class="block text-xs font-semibold">
            Título
            <input
              v-model="draft.title"
              type="text"
              maxlength="100"
              placeholder="Título de la reunión"
              class="mt-1 w-full rounded-md border border-black/10 bg-white/70 px-2 py-1.5 text-sm text-gray-800 outline-none dark:border-white/15 dark:bg-white/5 dark:text-gray-100"
            />
          </label>

          <MeetingIssueList v-model="draft.issues" />

          <MeetingNextStepList v-model="draft.nextSteps" />

          <label class="block text-xs font-semibold 
          text-sky-600 dark:text-sky-400"
          >
            Tiempo estimado (min)
            <input
              v-model.number="draft.estimatedDuration"
              type="number"
              min="1"
              class="
              ms-2
              mt-1 w-20 rounded-md border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 px-2 py-1 
              text-lg outline-none"
            />
          </label>

          <label class="block text-xs font-semibold text-orange-500
          dark:text-orange-300
          ">
            Participantes
            <textarea
              v-model="draft.participants"
              rows="2"
              class="mt-1 w-full rounded-md border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 px-2 py-1.5 text-sm outline-none"
            />
          </label>

          <label class="block text-xs font-semibold 
          ">
            Fecha y Hora
            
            <div class="relative mt-2 flex items-center justify-between rounded-md border border-2 
              border-black/60 p-2 py-1 dark:border-white/35">
              <span class="text-[.9rem] font-bold">
                {{ formatHours(draft.date) }}
              </span>

              <span class="material-symbols-outlined align-middle">
                date_range
              </span>

              <input
                v-model="draft.date"
                type="datetime-local"
                aria-label="Fecha y hora"
                class="absolute inset-0 cursor-pointer opacity-0 px-3
                "
              />
            </div>
          </label>
        </div>

        <div class="space-y-4">
          <!-- <div class="flex justify-end">
            <ColorPicker v-model="draft.color" variant="button" />
          </div> -->
          <MeetingCardPanel v-model="draft.cards" />

          <div 
            class="mt-2 border border-2 border-gray-200 dark:border-gray-800 rounded-md p-2"
          >
          <label class="block text-md font-semibold 
          ">
            Resumen de la reunión
          </label>
            <textarea
              v-model="draft.summary"
              rows="2"
              placeholder="Resumen de la reunión..."
              class="mt-1 w-full rounded-md border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 px-2 py-1.5 text-sm outline-none"
            />
          </div>
          <div 
            class="mt-2 border border-2 border-gray-200 dark:border-gray-800 rounded-md p-2"
          >
            <label class="block text-md font-semibold 
            ">
              Lecciones aprendidas
            </label>

            <textarea
              v-model="draft.lessons"
              rows="2"
              placeholder="Lecciones aprendidas..."
              class="mt-1 w-full rounded-md border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 px-2 py-1.5 text-sm outline-none"
            />
          </div>
       
          <div 
            class="mt-2 border border-2 border-gray-200 dark:border-gray-800 rounded-md p-2"
          >
           <button
            type="button"
            class="w-full cursor-pointer rounded-md border px-3 py-1 text-xs font-semibold"
            @click="copyMeetingSummary"
           >
            <span class="material-symbols-outlined align-middle">file_copy</span>
            Copiar Resumen 
           </button>
           <!-- <button
            type="button"
            class="cursor-pointer rounded-md border px-3 py-1 text-xs font-semibold"
           >
            <span class="material-symbols-outlined align-middle">add</span>
            Generar resumen para correo
           </button>
           <button
            type="button"
            class="cursor-pointer rounded-md border px-3 py-1 text-xs font-semibold"
           >
            <span class="material-symbols-outlined align-middle">add</span>
            Generar resumen para whatsapp
           </button> -->
          </div>
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

    <MeetingRequirementsTasks
      v-if="draft.id && persistedProjectId"
      :meeting-id="draft.id"
      :project-id="persistedProjectId"
    />

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
