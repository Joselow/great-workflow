<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import MeetingRunNotebook from '@/components/Meeting/MeetingRunNotebook.vue'
import { errorToast } from '@/composables/useAlerts'
import { markersToHtml } from '@/helpers/richText'
import type { Meeting, MeetingNextStep } from '@/interfaces/meeting'

const props = defineProps<{
  meeting: Meeting
  frozen: boolean
}>()

const additionalInfo = defineModel<string>('additionalInfo', { required: true })

const emit = defineEmits<{
  commit: []
  saveSteps: [steps: MeetingNextStep[]]
  finish: []
}>()

const editingStepId = ref<string | null>(null)
const editingStepDescription = ref('')

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
  if (!current) return
  if (description === current.description) {
    editingStepId.value = null
    return
  }
  if (description.length < 2) {
    errorToast('Cada siguiente paso necesita al menos 2 caracteres')
    return
  }

  emit('saveSteps', stepPayload({ id, description }))
}

const removeStep = (id: string) => {
  if (editingStepId.value === id) editingStepId.value = null
  emit('saveSteps', stepPayload({ id, description: '' }))
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
        hide-add
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
    </div>

    <div class="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
      <p class="shrink-0 text-sm font-semibold leading-5 text-orange-600 sm:w-36 dark:text-orange-400">
        
        <span class="material-symbols-outlined align-middle">handshake</span>
        Muchas gracias<br>Participantes
      </p>
      <div class="min-w-0 flex-1 whitespace-pre-wrap rounded-xl border border-orange-500/50 px-4 py-3 text-center text-sm text-orange-600 dark:border-orange-400/60 dark:text-orange-400">
        {{ meeting.participants.trim() || 'Sin participantes' }}
      </div>
    </div>

    <div v-if="!frozen" class="mt-10 flex justify-center">
      <button
        type="button"
        class="inline-flex cursor-pointer items-center gap-1 rounded-md border border-emerald-600/40 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200"
        @click="emit('finish')"
      >
        <span class="material-symbols-outlined" style="font-size: 1.1rem;">task_alt</span>
        Finalizar
      </button>
    </div>
  </section>
</template>
