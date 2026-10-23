<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

import MeetingRunNotebook from '@/components/Meeting/MeetingRunNotebook.vue'

import { errorToast } from '@/composables/useAlerts'
import { markersToHtml } from '@/helpers/richText'
import type { Meeting, MeetingNextStep } from '@/interfaces/meeting'

const props = defineProps<{
  meeting: Meeting
  saveSteps: (steps: MeetingNextStep[]) => Promise<boolean>
  canFinish: boolean
}>()

const additionalInfo = defineModel<string>('additionalInfo', { required: true })

const emit = defineEmits<{
  commit: []
  finish: []
}>()

const editingStepId = ref<string | null>(null)
const editingStepDescription = ref('')
const nextStepDraft = ref('')
const nextStepComposerOpen = ref(false)
const savingStep = ref(false)
const nextStepInput = ref<HTMLInputElement | null>(null)

const nextSteps = computed(() =>
  props.meeting.logs.filter((log) => log.source === 'meeting'),
)

const canEditSteps = computed(() => Boolean(props.meeting.projectId))

const stepPayload = (descriptionFor?: { id: string; description: string }): MeetingNextStep[] =>
  nextSteps.value
    .filter((step) => step.id !== descriptionFor?.id || descriptionFor.description)
    .map((step) => ({
      logId: step.id,
      description: step.id === descriptionFor?.id ? descriptionFor.description : step.description,
    }))

const focusStep = (element: unknown) => {
  if (element instanceof HTMLInputElement) element.focus()
}

const startEditStep = (id: string, description: string) => {
  editingStepId.value = id
  editingStepDescription.value = description
}

const saveStep = (id: string) => {
  const description = editingStepDescription.value.trim()
  const current = nextSteps.value.find((step) => step.id === id)
  if (!current || savingStep.value) return
  if (description === current.description) {
    editingStepId.value = null
    return
  }
  if (description.length < 2) {
    errorToast('Cada siguiente paso necesita al menos 2 caracteres')
    return
  }

  void props.saveSteps(stepPayload({ id, description }))
}

const removeStep = (id: string) => {
  if (savingStep.value) return
  if (editingStepId.value === id) editingStepId.value = null
  void props.saveSteps(stepPayload({ id, description: '' }))
}

const openNextStepComposer = async () => {
  nextStepComposerOpen.value = true
  nextStepDraft.value = ''
  await nextTick()
  nextStepInput.value?.focus()
}

const addNextStep = async () => {
  if (!canEditSteps.value || savingStep.value) return

  const description = nextStepDraft.value.trim()
  if (description.length < 2) {
    errorToast('Cada siguiente paso necesita al menos 2 caracteres')
    return
  }

  savingStep.value = true
  const saved = await props.saveSteps([
    ...nextSteps.value.map((step) => ({ logId: step.id, description: step.description })),
    { description },
  ])
  savingStep.value = false
  if (!saved) return

  nextStepDraft.value = ''
  nextStepComposerOpen.value = false
}

watch(nextSteps, () => {
  if (!editingStepId.value) return
  const step = nextSteps.value.find((item) => item.id === editingStepId.value)
  if (!step || step.description === editingStepDescription.value.trim()) {
    editingStepId.value = null
  }
})
</script>

<template>
  <section class="mx-auto flex w-full max-w-3xl flex-1 flex-col rounded-2xl 
  border border-black/10 p-6 md:p-8 dark:border-white/15">
    <h2 class="text-lg font-semibold tracking-wide">
      <span class="material-symbols-outlined align-middle">text_snippet</span>
      Resumen de la reunión</h2>

    <div class="mt-8">
      <p class="text-sm font-semibold">Puntos tratados</p>
      <p v-if="!meeting.issues.length" class="mt-2 text-sm text-gray-500">Sin temas.</p>
      <ul v-else class="mt-2 list-inside list-disc space-y-1 text-sm">
        <li
          v-for="issue in meeting.issues"
          :key="issue.id ?? issue.name"
          v-html="markersToHtml(issue.name, true)"
        />
      </ul>
    </div>

    <div class="mt-8">
      <MeetingRunNotebook
        :meeting-id="meeting.id"
        :project-id="meeting.projectId"
        :hide-add="!meeting.projectId"
        add-on-row
      />
    </div>

    <label class="mt-8 block text-sm font-semibold">
      Información adicional
      <textarea
        v-model="additionalInfo"
        rows="3"
        class="mt-2 w-full rounded-md border border-black/15 bg-white px-2 py-1.5 text-sm outline-none transition-colors hover:border-gray-500 focus:border-gray-900 focus:ring-1 focus:ring-gray-400 dark:border-white/20 dark:bg-zinc-900 dark:hover:border-white/40 dark:focus:border-white"
        @blur="emit('commit')"
      />
    </label>

    <div class="mt-8 space-y-2">
      <p class="text-sm font-semibold">Próximos pasos</p>
      <p v-if="!nextSteps.length" class="text-sm text-gray-500">Sin próximos pasos.</p>
      <div
        v-for="step in nextSteps"
        :key="step.id"
        class="flex min-w-0 items-center gap-1 rounded-md border border-black/15 bg-white px-2 py-1 text-xs text-gray-800 transition-colors hover:border-gray-500 focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-400 dark:border-white/20 dark:bg-zinc-900 dark:text-gray-100 dark:hover:border-white/40 dark:focus-within:border-white"
      >
        <input
          v-if="editingStepId === step.id"
          v-model="editingStepDescription"
          :ref="focusStep"
          type="text"
          class="min-w-0 flex-1 bg-transparent text-xs outline-none"
          @keydown.enter.prevent="saveStep(step.id)"
          @keydown.esc.prevent="editingStepId = null"
        />
        <p v-else class="min-w-0 flex-1">{{ step.description }}</p>
        <button
          v-if="canEditSteps && editingStepId === step.id"
          type="button"
          class="inline-flex cursor-pointer rounded-md p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="Guardar siguiente paso"
          @click="saveStep(step.id)"
        >
          <span class="material-symbols-outlined" style="font-size: 1rem;">check</span>
          Actualizar
        </button>
        <button
          v-if="canEditSteps && editingStepId !== step.id"
          type="button"
          class="inline-flex cursor-pointer rounded-md p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="Editar siguiente paso"
          @click="startEditStep(step.id, step.description)"
        >
          <span class="material-symbols-outlined" style="font-size: 1rem;">edit</span>
        </button>
        <button
          v-if="canEditSteps"
          type="button"
          class="inline-flex cursor-pointer rounded-md p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="Eliminar siguiente paso"
          @click="removeStep(step.id)"
        >
          <span class="material-symbols-outlined" style="font-size: 1rem;">delete</span>
        </button>
      </div>
      <div v-if="canEditSteps && nextStepComposerOpen" class="flex items-center gap-2">
        <input
          ref="nextStepInput"
          v-model="nextStepDraft"
          type="text"
          class="min-w-0 flex-1 rounded-md border border-black/15 bg-white px-2 py-1 text-xs text-gray-800 outline-none transition-colors hover:border-gray-500 focus:border-gray-900 focus:ring-1 focus:ring-gray-400 dark:border-white/20 dark:bg-zinc-900 dark:text-gray-100 dark:hover:border-white/40 dark:focus:border-white"
          placeholder="Próximo paso"
          @keydown.enter.prevent="addNextStep"
          @keydown.esc.prevent="nextStepComposerOpen = false"
        />
        <button
          type="button"
          class="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-black/15 bg-white text-gray-700 dark:border-white/20 dark:bg-zinc-900 dark:text-gray-200"
          aria-label="Guardar siguiente paso"
          @click="addNextStep"
        >
          <span class="material-symbols-outlined" style="font-size: 1rem;">add</span>
        </button>
      </div>
      <div class="text-end"
        v-else-if="canEditSteps"
      >
        <button
          type="button"
          class="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-black/15 bg-white text-gray-700 transition-colors hover:border-gray-500 hover:bg-gray-50 dark:border-white/20 dark:bg-zinc-900 dark:text-gray-200 dark:hover:bg-white/10"
          aria-label="Agregar siguiente paso"
          @click="openNextStepComposer"
        >
          <span class="material-symbols-outlined" style="font-size: 1rem;">add</span>
        </button>
      </div>
    </div>

    <div class="mt-16 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
      <p class="shrink-0 text-md font-semibold leading-5 text-orange-600 sm:w-36 dark:text-orange-400">
        
        <span class="material-symbols-outlined align-middle">handshake</span>
        Muchas gracias<br>Participantes
      </p>
      <div class="min-w-0 flex-1 whitespace-pre-wrap rounded-xl border border-orange-500/50 px-4 py-3 text-center text-sm text-orange-600 dark:border-orange-400/60 dark:text-orange-400">
        {{ meeting.participants.trim() || 'Sin participantes' }}
      </div>
    </div>

    <div v-if="canFinish" class="mt-10 flex justify-end">
      <button
        type="button"
        class="inline-flex cursor-pointer items-center rounded-md border border-emerald-600/40 bg-emerald-500/15 px-3 py-1.5 text-sm font-semibold text-emerald-800 dark:text-emerald-200"
        @click="emit('finish')"
      >
        Finalizar
      </button>
    </div>

  </section>
</template>
