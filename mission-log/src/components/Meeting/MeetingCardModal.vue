<script setup lang="ts">
import { ref, watch } from 'vue'

import ModalBase from '@/commons/ModalBase.vue'
import CardForm from '@/components/Card/CardForm.vue'

import { projectStore } from '@/store/projectStore'
import { useCard } from '@/composables/useCard'
import { errorToast } from '@/composables/useAlerts'
import { debounce } from '@/utils/debounce'

import { DEFAULT_PROJECT_COLOR } from '@/constants/projectColors'

import type { CardDraft, CardListItem, CardWritePayload } from '@/interfaces/card'

const open = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  pick: [card: CardListItem]
}>()

const { activeProject, projects } = projectStore
const { getCards, createCard, loading } = useCard()

const mode = ref<'pick' | 'create'>('pick')
const q = ref('')
const items = ref<CardListItem[]>([])
const cardDraft = ref<CardDraft>(emptyCardDraft())

function emptyCardDraft(): CardDraft {
  return {
    name: '',
    description: '',
    color: DEFAULT_PROJECT_COLOR,
    isPrompt: false,
    flMeeting: true,
    projectId: activeProject.value?.id ?? null,
    sections: [{ title: '', description: '' }],
  }
}

const loadCards = async () => {
  const { success, data } = await getCards({
    q: q.value.trim() || undefined,
    page: 1,
    limit: 12,
  })

  items.value = success && data ? data.items : []
}

const loadCardsDebounced = debounce(() => {
  void loadCards()
}, 300)

const onSearch = () => {
  loadCardsDebounced()
}

const openPicker = () => {
  mode.value = 'pick'
  cardDraft.value = emptyCardDraft()
  void loadCards()
}

watch(open, (isOpen) => {
  if (isOpen) openPicker()
})

const pick = (card: CardListItem) => {
  emit('pick', card)
  open.value = false
}

const toPayload = (current: CardDraft): CardWritePayload => ({
  name: current.name.trim(),
  description: current.description,
  color: current.color,
  isPrompt: current.isPrompt,
  flMeeting: current.flMeeting,
  projectId: current.projectId,
  sections: current.isPrompt
    ? []
    : current.sections.filter((section) => section.title.trim()),
})

const handleCreate = async () => {
  if (!cardDraft.value.name.trim()) {
    errorToast('El título es requerido')
    return
  }

  const { success, data } = await createCard(toPayload(cardDraft.value))
  if (!success || !data) return

  emit('pick', {
    id: data.id,
    name: data.name,
    description: data.description,
    color: data.color,
    isPrompt: data.isPrompt,
    flMeeting: data.flMeeting,
    projectId: data.projectId,
    project: null,
  })
  open.value = false
}
</script>

<template>
  <ModalBase v-model="open" max-width="lg">
    <div class="p-4 md:p-5">
      <div class="mb-4 flex items-center justify-between gap-2">
        <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-100">
          Asociar card
        </h3>
        <div class="flex gap-1">
          <button
            type="button"
            class="cursor-pointer rounded-md border px-3 py-1 text-xs font-semibold"
            :class="mode === 'pick'
              ? 'border-gray-900 bg-gray-900 text-white dark:border-white/40 dark:bg-white/20'
              : 'border-black/10 dark:border-white/15'"
            @click="openPicker"
          >
            Existente
          </button>
          <button
            type="button"
            class="cursor-pointer rounded-md border px-3 py-1 text-xs font-semibold"
            :class="mode === 'create'
              ? 'border-gray-900 bg-gray-900 text-white dark:border-white/40 dark:bg-white/20'
              : 'border-black/10 dark:border-white/15'"
            @click="mode = 'create'"
          >
            Nueva
          </button>
        </div>
      </div>

      <div v-if="mode === 'pick'" class="space-y-3">
        <input
          v-model="q"
          type="search"
          placeholder="Buscar cards..."
          class="w-full rounded-md border border-black/10 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-1.5 text-sm outline-none"
          @input="onSearch"
        />
        <p v-if="loading && !items.length" class="text-sm text-gray-400">Cargando...</p>
        <p v-else-if="!items.length" class="text-sm text-gray-500">No hay cards.</p>
        <ul v-else class="max-h-72 space-y-1 overflow-y-auto">
          <li
            v-for="card in items"
            :key="card.id"
          >
            <button
              type="button"
              class="flex w-full cursor-pointer items-center gap-2 rounded-md border border-black/10 dark:border-white/10 px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5"
              @click="pick(card)"
            >
              <span
                class="h-3 w-3 shrink-0 rounded-sm"
                :style="{ backgroundColor: card.color }"
              />
              <span class="truncate text-sm text-gray-800 dark:text-gray-100">{{ card.name }}</span>
            </button>
          </li>
        </ul>
      </div>

      <CardForm
        v-else
        v-model="cardDraft"
        :projects="projects"
        save-label="Crear card"
        @save="handleCreate"
      />
    </div>
  </ModalBase>
</template>
