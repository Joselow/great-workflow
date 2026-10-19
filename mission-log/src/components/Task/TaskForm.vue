<script setup lang="ts">
import { computed } from 'vue'

import type { TaskDraft } from '@/interfaces/task'

const draft = defineModel<TaskDraft>({ required: true })

const props = withDefaults(defineProps<{
  requirements: { id: string; name: string }[]
  locked?: boolean
  saving?: boolean
}>(), {
  locked: false,
  saving: false,
})

const emit = defineEmits<{
  save: []
  cancel: []
}>()

const requirementValue = computed({
  get: () => draft.value.requirementId ?? '',
  set: (value: string) => {
    draft.value.requirementId = value || null
  },
})

const onSubmit = () => {
  if (props.saving) return
  emit('save')
}

const cleanForm = () => {
  draft.value = {
    id: undefined,
    name: '',
    description: '',
    completed: false,
    requirementId: props.locked ? draft.value.requirementId : null,
  }
}

const onCancel = () => {
  cleanForm()
  emit('cancel')
}
</script>

<template>
  <form
    class="rounded-xl border border-black/10 bg-white/60 p-4 dark:border-white/15 dark:bg-white/5"
    @submit.prevent="onSubmit"
  >
    <div class="flex justify-between items-center mb-2">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
        <span v-if="draft.id" class="material-symbols-outlined align-middle">edit</span>
        <span v-else class="material-symbols-outlined align-middle">add</span>
        {{ draft.id ? 'Editar tarea' : 'Crear tarea' }}
      </h2>
      
      <button
          v-if="draft.id"
          title="Cancelar"
          aria-label="Cancelar"
          type="button"
          class="cursor-pointer rounded-lg 
            border border-red-300
            text-red-500
             px-3 py-1
             bg-red-500/10
             hover:bg-red-500/20
          text-xs font-semibold  disabled:cursor-not-allowed 
          disabled:opacity-60"
          @click="onCancel"
        >
          Cancelar
        </button>
    </div>

    <div class="flex flex-col gap-3">
      <input
        v-model="draft.name"
        type="text"
        placeholder="Nombre de la tarea"
        class="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 outline-none dark:border-white/15 dark:bg-white/5 dark:text-white"
      />

      <textarea
        v-model="draft.description"
        rows="5"
        placeholder="Descripción"
        class="w-full resize-y rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-gray-800 outline-none dark:border-white/15 dark:bg-white/5 dark:text-gray-100"
      />

      <!-- <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
        <input v-model="draft.completed" type="checkbox" class="size-4" />
        Hecha
      </label> -->

      <!-- <label v-if="!locked" class="flex flex-col gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
        Requerimiento
        <select
          v-model="requirementValue"
          class="rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-normal text-gray-800 outline-none dark:border-white/15 dark:bg-[#1c1c1c] dark:text-gray-100"
        >
          <option value="">Sin requerimiento</option>
          <option
            v-for="requirement in requirements"
            :key="requirement.id"
            :value="requirement.id"
          >
            {{ requirement.name }}
          </option>
        </select>
      </label> -->

      <div class="flex justify-end gap-2"
      >
        <button
          v-if="draft.id"
          title="Cancelar"
          aria-label="Cancelar"
          type="button"
          class="cursor-pointer rounded-lg bg-red-500/85 px-3 py-1.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          @click="onCancel"
        >
          <span class="material-symbols-outlined align-middle">cancel</span>
          Cancelar
        </button>

        <button
          title="Guardar"
          aria-label="Guardar"
          type="submit"
          class="cursor-pointer rounded-lg bg-brand-orange px-3 py-1.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="saving"
        >
          <span class="material-symbols-outlined align-middle">save</span>
          {{ draft.id ? 'Actualizar' : 'Guardar' }}
        </button>
      </div>
      
    </div>
  </form>
</template>
