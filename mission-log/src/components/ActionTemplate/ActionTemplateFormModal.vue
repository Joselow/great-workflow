<script setup lang="ts">
import { nextTick, ref } from 'vue'

import ColorPicker from '@/components/Project/ColorPicker.vue'
import MeetingCardModal from '@/components/Meeting/MeetingCardModal.vue'
import ModalBase from '@/commons/ModalBase.vue'
import PopoverBase from '@/commons/PopoverBase.vue'
import { actionRowStyle } from '@/helpers/cardColor'

import type { CardListItem } from '@/interfaces/card'
import type { ActionTemplateDraft } from '@/interfaces/actionTemplate'

const open = defineModel<boolean>({ required: true })
const draft = defineModel<ActionTemplateDraft>('draft', { required: true })

defineProps<{
  saving?: boolean
}>()

const emit = defineEmits<{
  save: []
}>()

const promptVariables = [
  { label: 'Proyecto', token: '{{proyecto}}' },
  { label: 'Fecha', token: '{{fecha}}' },
  { label: 'Módulo', token: '{{modulo}}' },
]

const cardModalOpen = ref(false)
const variablesOpen = ref(false)
const formError = ref('')
const promptRef = ref<HTMLTextAreaElement | null>(null)

const fieldClass = 'w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-brand-orange/60 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500'

const labelClass = 'mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400'

const clearCard = () => {
  draft.value = {
    ...draft.value,
    card: null,
  }
}

const onPickCard = (card: CardListItem) => {
  draft.value = {
    ...draft.value,
    contentMode: 'card',
    card: {
      id: card.id,
      name: card.name,
      color: card.color,
      description: card.description,
    },
  }
  cardModalOpen.value = false
}

const insertVariable = async (token: string) => {
  const current = draft.value.template
  const start = promptRef.value?.selectionStart ?? current.length
  const end = promptRef.value?.selectionEnd ?? current.length

  draft.value.template = `${current.slice(0, start)}${token}${current.slice(end)}`
  variablesOpen.value = false

  await nextTick()
  const caret = start + token.length
  promptRef.value?.focus()
  promptRef.value?.setSelectionRange(caret, caret)
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
  <ModalBase v-model="open" maxWidth="md" :closeable="!cardModalOpen">
    <form @submit.prevent="onSubmit">
      <header class="flex items-center gap-3 px-5 py-4">
        <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-orange/30 bg-brand-orange/15 text-brand-orange">
          <span class="material-symbols-outlined leading-none" style="font-size: 18px;">edit_note</span>
        </span>
        <h2 class="min-w-0 flex-1 truncate text-base font-semibold text-gray-900 dark:text-white">
          {{ draft.id ? 'Editar plantilla de acción' : 'Nueva plantilla de acción' }}
        </h2>
        <button
          type="button"
          class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-black/10 text-gray-500 hover:bg-black/5 dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/10"
          title="Cerrar"
          aria-label="Cerrar"
          @click="open = false"
        >
          <span class="material-symbols-outlined leading-none" style="font-size: 18px;">close</span>
        </button>
      </header>

      <div class="space-y-4 px-5 pb-5">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_11.5rem]">
          <div>
            <label for="action-template-name" :class="labelClass">
              Nombre de la plantilla
            </label>
            <div class="relative">
              <input
                id="action-template-name"
                v-model="draft.name"
                type="text"
                autocomplete="off"
                placeholder="Resumen de correos"
                :class="[fieldClass, 'pr-10']"
              />
              <span class="color-dot absolute top-1/2 right-2.5 flex -translate-y-1/2">
                <ColorPicker v-model="draft.color" variant="button" size="small" placement="bottom" />
              </span>
            </div>
          </div>

          <div>
            <span :class="labelClass">Estado</span>
            <div
              class="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
              :class="draft.isActive
                ? 'border-[#8fbf73] bg-[#e8f6df] dark:border-emerald-400/40 dark:bg-emerald-500/15'
                : 'border-[#e7a090] bg-[#ffe8e0] dark:border-rose-400/40 dark:bg-rose-500/15'"
            >
              <span
                class="text-sm font-medium"
                :class="draft.isActive ? 'text-[#3d6b32] dark:text-emerald-100' : 'text-[#9a4034] dark:text-rose-100'"
              >
                {{ draft.isActive ? 'Activa' : 'Inactiva' }}
              </span>
              <button
                type="button"
                role="switch"
                class="relative h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors"
                :class="draft.isActive
                  ? 'border-[#6aa356] bg-[#8fbf73]'
                  : 'border-[#e7a090] bg-[#f3c7bc] dark:border-rose-300/40 dark:bg-rose-400/40'"
                :aria-checked="draft.isActive"
                :aria-label="draft.isActive ? 'Plantilla activa' : 'Plantilla inactiva'"
                @click="draft.isActive = !draft.isActive"
              >
                <span
                  class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full border border-black/10 bg-white transition-transform dark:border-white/30"
                  :class="draft.isActive ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </div>
          </div>
        </div>

        <div>
          <label for="action-template-action" :class="labelClass">
            Descripción de la función
          </label>
          <input
            id="action-template-action"
            v-model="draft.action"
            type="text"
            autocomplete="off"
            placeholder="Genera correos comunes"
            :class="fieldClass"
          />
        </div>

        <div>
          <p :class="labelClass">Formato de salida</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
              :class="draft.contentMode === 'text'
                ? 'border-brand-orange/60 bg-brand-orange/15 text-gray-900 dark:text-white'
                : 'border-black/10 bg-white text-gray-500 hover:bg-black/5 dark:border-white/15 dark:bg-white/5 dark:text-gray-300'"
              :aria-pressed="draft.contentMode === 'text'"
              @click="draft.contentMode = 'text'"
            >
              <span class="material-symbols-outlined leading-none" style="font-size: 18px;">notes</span>
              Texto
            </button>
            <button
              type="button"
              class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
              :class="draft.contentMode === 'card'
                ? 'border-brand-orange/60 bg-brand-orange/15 text-gray-900 dark:text-white'
                : 'border-black/10 bg-white text-gray-500 hover:bg-black/5 dark:border-white/15 dark:bg-white/5 dark:text-gray-300'"
              :aria-pressed="draft.contentMode === 'card'"
              @click="draft.contentMode = 'card'"
            >
              <span class="material-symbols-outlined leading-none" style="font-size: 18px;">cards_stack</span>
              Tarjeta / Card
            </button>
          </div>
        </div>

        <div v-if="draft.contentMode === 'text'">
          <div class="mb-1.5 flex items-center justify-between gap-3">
            <label for="action-template-prompt" class="text-xs font-medium text-gray-500 dark:text-gray-400">
              Prompt / instrucción
            </label>
            <PopoverBase v-model="variablesOpen" placement="bottom">
              <template #trigger="{ toggle }">
                <button
                  type="button"
                  class="inline-flex cursor-pointer items-center gap-0.5 text-xs font-semibold text-brand-orange hover:underline"
                  @click="toggle"
                >
                  <span class="material-symbols-outlined leading-none" style="font-size: 14px;">add</span>
                  Insertar variable
                </button>
              </template>
              <div class="-mx-1 flex min-w-44 flex-col">
                <button
                  v-for="variable in promptVariables"
                  :key="variable.token"
                  type="button"
                  class="flex cursor-pointer items-center justify-between gap-4 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                  @click="insertVariable(variable.token)"
                >
                  <span>{{ variable.label }}</span>
                  <span class="font-mono text-[11px] text-gray-400">{{ variable.token }}</span>
                </button>
              </div>
            </PopoverBase>
          </div>
          <textarea
            id="action-template-prompt"
            ref="promptRef"
            v-model="draft.template"
            rows="4"
            placeholder="Genera un resumen para correo formal. Lenguaje técnico, profesional y cordial."
            :class="[fieldClass, 'resize-y']"
          />
        </div>

        <div v-else>
          <p :class="labelClass">Tarjeta vinculada</p>
          <button
            v-if="!draft.card"
            type="button"
            class="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-6 text-sm font-medium text-gray-600 hover:border-brand-orange/50 hover:bg-brand-orange/10 dark:border-white/15 dark:bg-white/5 dark:text-gray-300"
            @click="cardModalOpen = true"
          >
            <span class="material-symbols-outlined leading-none" style="font-size: 18px;">add_link</span>
            Asociar card
          </button>
          <div
            v-else
            class="flex items-center gap-2 rounded-lg border px-3 py-2.5"
            :style="actionRowStyle(draft.card.color)"
          >
            <div class="min-w-0 flex-1">
              <p class="flex items-center gap-1 text-sm font-medium text-gray-900">
                <span class="material-symbols-outlined leading-none" style="font-size: 18px;">link</span>
                <span class="truncate">{{ draft.card.name }}</span>
              </p>
              <p class="mt-0.5 line-clamp-2 text-xs text-gray-700">
                {{ draft.card.description }}
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-1">
              <button
                type="button"
                class="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-gray-700 hover:bg-white/80 hover:text-sky-700"
                title="Cambiar card"
                aria-label="Cambiar card"
                @click="cardModalOpen = true"
              >
                <span class="material-symbols-outlined leading-none" style="font-size: 18px;">swap_horiz</span>
              </button>
              <button
                type="button"
                class="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-gray-700 hover:bg-white/80 hover:text-rose-600"
                title="Quitar card"
                aria-label="Quitar card"
                @click="clearCard"
              >
                <span class="material-symbols-outlined leading-none" style="font-size: 18px;">delete</span>
              </button>
            </div>
          </div>
        </div>

        <p v-if="formError" class="text-sm text-rose-500">{{ formError }}</p>
      </div>

      <footer class="flex items-center justify-end gap-2 border-t border-black/10 px-5 py-3 dark:border-white/10">
        <button
          type="button"
          class="cursor-pointer rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-black/5 dark:border-white/15 dark:bg-white/5 dark:text-gray-200"
          @click="open = false"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-brand-orange bg-brand-orange px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-orange/90 disabled:opacity-60"
          :disabled="saving"
        >
          <span
            v-if="saving"
            class="inline-block size-3.5 animate-spin rounded-full border-2 border-white border-b-transparent"
          />
          <span v-else class="material-symbols-outlined leading-none" style="font-size: 18px;">check</span>
          {{ saving ? 'Guardando' : 'Guardar cambios' }}
        </button>
      </footer>
    </form>

    <MeetingCardModal v-model="cardModalOpen" prompts-only @pick="onPickCard" />
  </ModalBase>
</template>

<style scoped>
.color-dot :deep(button) {
  width: 1.15rem;
  height: 1.15rem;
  border-radius: 9999px;
  box-shadow: none;
}
</style>
