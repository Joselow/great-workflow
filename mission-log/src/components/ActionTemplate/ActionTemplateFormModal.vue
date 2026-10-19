<script setup lang="ts">
import { ref } from 'vue'

import ColorPicker from '@/components/Project/ColorPicker.vue'
import ModalBase from '@/commons/ModalBase.vue'

import type { ActionTemplateDraft, ActionTemplateModule } from '@/interfaces/actionTemplate'

const open = defineModel<boolean>({ required: true })
const draft = defineModel<ActionTemplateDraft>('draft', { required: true })

defineProps<{
  saving?: boolean
}>()

const emit = defineEmits<{
  save: []
  associate: []
  editCard: [id: string]
}>()

const modules: { value: ActionTemplateModule; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'log', label: 'Logs' },
  { value: 'meeting', label: 'Reuniones' },
  { value: 'requirement', label: 'Requerimientos' },
  { value: 'task', label: 'Tareas' },
]

const formError = ref('')

const fieldClass = 'w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 outline-none dark:border-white/15 dark:bg-white/5 dark:text-white'

const clearCard = () => {
  draft.value = {
    ...draft.value,
    contentMode: 'text',
    card: null,
  }
}

const onSubmit = () => {
  formError.value = ''

  if (!draft.value.name.trim()) {
    formError.value = 'El nombre es obligatorio'
    return
  }

  if (draft.value.contentMode === 'text' && !draft.value.template.trim()) {
    formError.value = 'La plantilla es obligatoria'
    return
  }

  if (draft.value.contentMode === 'card' && !draft.value.card) {
    formError.value = 'Elige una card prompt'
    return
  }

  emit('save')
}
</script>

<template>
  <ModalBase v-model="open" maxWidth="lg">
    <form class="px-4 py-4" @submit.prevent="onSubmit">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ draft.id ? 'Editar acción' : 'Nueva acción' }}
      </h2>

      <label class="mt-3 block text-sm text-gray-700 dark:text-gray-200">
        Nombre
        <input v-model="draft.name" type="text" :class="fieldClass" />
      </label>

      <div class="mt-3">
        <p class="mb-1 text-sm text-gray-700 dark:text-gray-200">Color</p>
        <ColorPicker v-model="draft.color" variant="button" />
      </div>

      <label class="mt-3 block text-sm text-gray-700 dark:text-gray-200">
        Acción
        <textarea v-model="draft.action" rows="2" :class="fieldClass" placeholder="Opcional" />
      </label>

      <label class="mt-3 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
        <input v-model="draft.isActive" type="checkbox" />
        Activa
      </label>

      <label class="mt-3 block text-sm text-gray-700 dark:text-gray-200">
        Módulo
        <select v-model="draft.module" :class="fieldClass">
          <option v-for="option in modules" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>

      <div class="mt-3 flex gap-2">
        <button
          type="button"
          class="rounded-md border px-3 py-1 text-sm"
          :class="draft.contentMode === 'text' ? 'border-brand-orange text-brand-orange' : 'border-black/10 text-gray-600 dark:border-white/15 dark:text-gray-300'"
          @click="draft.contentMode = 'text'"
        >
          Texto
        </button>
        <button
          type="button"
          class="rounded-md border px-3 py-1 text-sm"
          :class="draft.contentMode === 'card' ? 'border-brand-orange text-brand-orange' : 'border-black/10 text-gray-600 dark:border-white/15 dark:text-gray-300'"
          @click="draft.contentMode = 'card'"
        >
          Card
        </button>
      </div>

      <label v-if="draft.contentMode === 'text'" class="mt-3 block text-sm text-gray-700 dark:text-gray-200">
        Plantilla
        <textarea v-model="draft.template" rows="5" :class="fieldClass" />
      </label>

      <div v-else class="mt-3">
        <button
          type="button"
          class="rounded-md border border-black/10 px-3 py-1 text-sm dark:border-white/15"
          @click="emit('associate')"
        >
          Asociar card
        </button>

        <div v-if="draft.card" class="mt-3 rounded-md border border-black/10 p-3 dark:border-white/15">
          <p class="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white">
            <span class="material-symbols-outlined text-[16px] leading-none">link</span>
            {{ draft.card.name }}
          </p>
          <p class="mt-1 max-h-16 overflow-hidden text-sm text-gray-600 dark:text-gray-300">
            {{ draft.card.description }}
          </p>
          <div class="mt-2 flex gap-2">
            <button type="button" class="text-sm text-gray-600 dark:text-gray-300" @click="clearCard">
              Quitar
            </button>
            <button
              type="button"
              class="text-sm text-brand-orange"
              @click="emit('editCard', draft.card.id)"
            >
              Editar card
            </button>
          </div>
        </div>
      </div>

      <p v-if="formError" class="mt-3 text-sm text-rose-500">{{ formError }}</p>

      <div class="mt-4 flex justify-end">
        <button
          type="submit"
          class="cursor-pointer rounded-lg bg-brand-orange px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
          :disabled="saving"
        >
          Guardar
        </button>
      </div>
    </form>
  </ModalBase>
</template>
