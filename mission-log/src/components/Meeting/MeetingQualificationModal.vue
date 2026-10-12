<script setup lang="ts">
import { ref, watch } from 'vue'

import ModalBase from '@/commons/ModalBase.vue'

import type { MeetingQualificationPayload } from '@/interfaces/meeting'

const props = defineProps<{
  summary: string | null
  lessons: string | null
  objectiveAchieved: boolean | null
  loading?: boolean
}>()

const emit = defineEmits<{
  save: [payload: MeetingQualificationPayload]
}>()

const show = defineModel<boolean>({ default: false })

const choice = ref<boolean | null>(null)
const summaryText = ref('')
const lessonsText = ref('')
const error = ref('')

const syncFromProps = () => {
  choice.value = props.objectiveAchieved
  summaryText.value = props.summary ?? ''
  lessonsText.value = props.lessons ?? ''
  error.value = ''
}

watch(show, (open) => {
  if (open) syncFromProps()
}, { immediate: true })

const close = () => {
  show.value = false
}

const save = () => {
  if (choice.value === null) {
    error.value = 'Selecciona si el objetivo se logró'
    return
  }

  if (choice.value === false && !lessonsText.value.trim()) {
    error.value = 'Las lecciones son obligatorias si el objetivo no se logró'
    return
  }

  error.value = ''
  emit('save', {
    objectiveAchieved: choice.value,
    summary: summaryText.value.trim() || null,
    lessons: lessonsText.value.trim() || null,
  })
}
</script>

<template>
  <ModalBase v-model="show" max-width="md">
    <div class="px-6 py-5 text-gray-800 dark:text-gray-100">
      <h2 class="text-center text-lg font-semibold">
        ¿Objetivo logrado?
      </h2>

      <div class="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          class="cursor-pointer rounded-md border px-3 py-2 text-sm font-semibold"
          :class="choice === true
            ? 'border-green-600 bg-green-500/15 text-green-700 dark:text-green-300'
            : 'border-green-600/35 text-green-700 dark:text-green-300'"
          @click="choice = true"
        >
          <span class="material-symbols-outlined align-middle">
            trophy
          </span>
          Objetivo logrado
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-md border px-3 py-2 text-sm font-semibold"
          :class="choice === false
            ? 'border-rose-600 bg-rose-500/15 text-rose-700 dark:text-rose-300'
            : 'border-rose-600/35 text-rose-700 dark:text-rose-300'"
          @click="choice = false"
        >

        <span class="material-symbols-outlined align-middle">
          mood_bad
        </span>

          No logrado
        </button>
      </div>

      <label class="mt-5 block text-sm font-semibold">
        ¿Cómo te fue en la reunión? ¿Cómo se desarrolló la reunión?
        <textarea
          v-model="summaryText"
          rows="4"
          class="mt-1 w-full rounded-md border border-black/10 bg-white/70 px-2 py-1.5 text-sm font-normal outline-none dark:border-white/15 dark:bg-white/5"
        />
      </label>

      <label class="mt-4 block text-sm font-semibold">
        ¿Qué lecciones te llevas o sacas de esta reunión?
        <textarea
          v-model="lessonsText"
          rows="4"
          class="mt-1 w-full rounded-md border border-black/10 bg-white/70 px-2 py-1.5 text-sm font-normal outline-none dark:border-white/15 dark:bg-white/5"
        />
      </label>

      <p
        v-if="error"
        class="mt-3 text-center text-sm text-rose-600 dark:text-rose-400"
      >
        {{ error }}
      </p>

      <div class="mt-6 flex justify-end gap-3">
        <button
          type="button"
          class="cursor-pointer rounded-md border border-rose-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide 
          dark:border-white/15
           dark:hover:bg-rose-800
          hover:text-rose-600 dark:hover:text-rose-100
          text-rose-700 dark:text-rose-300
          bg-rose-200 dark:bg-rose-800
          hover:bg-rose-100
          "
          @click="close"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-md 
          bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white disabled:opacity-50 
          dark:bg-white dark:text-gray-900"
          :disabled="loading"
          @click="save"
        >
          <span class="material-symbols-outlined align-middle"
          style="font-size: 18px;"
          >
            save
          </span>
          Guardar
        </button>
      </div>
    </div>
  </ModalBase>
</template>
