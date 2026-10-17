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
</script>

<template>
  <form
    class="rounded-xl border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-white/5"
    @submit.prevent="onSubmit"
  >
    <div class="flex flex-col gap-3">
      <input
        v-model="draft.name"
        type="text"
        placeholder="Nombre de la tarea"
        class="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 outline-none dark:border-white/15 dark:bg-white/5 dark:text-white"
      />

      <textarea
        v-model="draft.description"
        rows="3"
        placeholder="Descripción"
        class="w-full resize-y rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-gray-800 outline-none dark:border-white/15 dark:bg-white/5 dark:text-gray-100"
      />

      <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
        <input v-model="draft.completed" type="checkbox" class="size-4" />
        Hecha
      </label>

      <label v-if="!locked" class="flex flex-col gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
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
      </label>

      <div>
        <button
          type="submit"
          class="cursor-pointer rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="saving"
        >
          <span class="material-symbols-outlined align-middle text-[18px]">save</span>
          Guardar
        </button>
      </div>
    </div>
  </form>
</template>
