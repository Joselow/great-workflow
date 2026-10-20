<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, watch, } from 'vue'

import ModalBase from '@/commons/ModalBase.vue'
import CardForm from '@/components/Card/CardForm.vue'
import EmptyRecords from '@/commons/EmptyRecords.vue'

import { projectStore } from '@/store/projectStore'

import { useCard } from '@/composables/useCard'
import { errorToast, successToast } from '@/composables/useAlerts'

import { debounce } from '@/utils/debounce'

import { DEFAULT_PROJECT_COLOR } from '@/constants/projectColors'

import type { CardDraft, CardListItem, CardWritePayload } from '@/interfaces/card'

const open = defineModel<boolean>({ required: true })

const props = withDefaults(defineProps<{
  promptsOnly?: boolean
}>(), {
  promptsOnly: false,
})

const emit = defineEmits<{
  pick: [card: CardListItem]
}>()

const router = useRouter()


const { activeProject } = projectStore
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
    isPrompt: props.promptsOnly,
    flMeeting: !props.promptsOnly,
    projectId: activeProject.value?.id ?? null,
    sections: props.promptsOnly ? [] : [{ title: '', description: '' }],
  }
}

const loadCards = async () => {
  const { success, data } = await getCards({
    q: q.value.trim() || undefined,
    isPrompt: props.promptsOnly ? true : undefined,
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
  successToast('Agregadp', 1000)
  // open.value = false
}

const toPayload = (current: CardDraft): CardWritePayload => {
  const isPrompt = props.promptsOnly ? true : current.isPrompt

  return {
    name: current.name.trim(),
    description: current.description,
    color: current.color,
    isPrompt,
    flMeeting: current.flMeeting,
    projectId: current.projectId,
    sections: isPrompt
      ? []
      : current.sections.filter((section) => section.title.trim()),
  }
}

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

const showCard = (card: CardListItem) => {
  window.open(router.resolve({
      name: 'publicCard',
      params: { id: card.id }
    }).href, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <ModalBase v-model="open" max-width="lg">
    <div class="p-4 md:p-5">
      <div class="mb-4 flex items-center justify-between gap-2">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
          <span class="material-symbols-outlined align-middle">cards_stack</span>
          Asociar Card
        </h3>
        <div class="flex gap-1">
          <button class="cursor-pointer inline-flex h-8 w-9 items-center justify-center rounded-md border 
            border-red-500/40 bg-red-500/10 
            text-red-700 dark:text-red-300"
            title="Cerrar"
            @click="open = false"
            >
            <span class="material-symbols-outlined">close</span>
          </button>
        
        </div>
      </div>

      <div class="mb-4 flex justify-end gap-2">
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold"
          :class="mode === 'pick'
            ? 'border-gray-900 bg-gray-900 text-white dark:border-white/30 dark:bg-white/15'
            : 'border-black/10 bg-white text-gray-700 hover:bg-black/5 dark:border-white/15 dark:bg-white/5 dark:text-gray-200'"
          @click="openPicker"
        >
          <span class="material-symbols-outlined leading-none">credit_card_heart</span>
          Existente
        </button>
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold"
          :class="mode === 'create'
            ? 'border-gray-900 bg-gray-900 text-white dark:border-white/30 dark:bg-white/15'
            : 'border-black/10 bg-white text-gray-700 hover:bg-black/5 dark:border-white/15 dark:bg-white/5 dark:text-gray-200'"
          @click="mode = 'create'"
        >
          <span class="material-symbols-outlined leading-none">add_card</span>
          Nueva
        </button>
      </div>

      <div v-if="mode === 'pick'" class="space-y-3">
        <input
          v-model="q"
          type="search"
          placeholder="Buscar cards..."
          class="w-full rounded-md border border-black/50 dark:border-white/15 
          bg-white dark:bg-white/5 px-3 py-1.5 text-sm outline-none
          text-gray-500 dark:text-gray-200
          "
          @input="onSearch"
        />
        <p v-if="loading && !items.length" class="text-sm text-gray-400">Cargando...</p>
        <div v-else-if="!items.length">
          <EmptyRecords>
            <p class="text-md text-gray-900 dark:text-gray-200">
              <span class="material-symbols-outlined align-middle">cards_stack</span>
              No hay cards.</p>
          </EmptyRecords>
        </div>
        <ul v-else class="max-h-72 space-y-1 overflow-y-auto
         grid grid-cols-1 gap-2
         md:grid-cols-2
         lg:grid-cols-3
        ">
          <li
            v-for="card in items"
            :key="card.id"
          >
            <button
              type="button"
              class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-1 text-left hover:brightness-95 dark:hover:brightness-110"
              :style="{ borderColor: card.color, backgroundColor: card.color + '22' }"
              @dblclick="showCard(card)"
            >
              <div class="flex min-w-0 flex-1 items-center">
                <span
                  class="mr-2 inline-block h-3 w-3 shrink-0 rounded-full"
                  :style="{ backgroundColor: card.color }"
                />
                <span class="truncate text-sm text-gray-800 dark:text-gray-100">{{ card.name }}</span>
              </div>
              <div class="flex items-center justify-end gap-1">
                <span
                  title="Ver card(dblclick card)"
                  class="inline-flex items-center justify-center rounded-md text-gray-500 
                  hover:bg-black/10 hover:text-indigo-500
                    px-2  py-1
                  "
                  @click.stop="showCard(card)"
                >
                  <span class="material-symbols-outlined leading-none" >visibility</span>
                </span>
                <span
                  title="Asociar card(click card)"
                  class="
                                      px-1  py-1

                  inline-flex items-center justify-center rounded-md text-gray-500 hover:bg-black/10 hover:text-sky-600"
                  @click.stop="pick(card)"
                >
                  <span class="material-symbols-outlined leading-none" >add_link</span>
                </span>
              </div>
            </button>
          </li>
        </ul>
      </div>

      <div
      class="px-6"
        v-else
      >
        <CardForm
          v-model="cardDraft"
          save-label="Crear card"
          @save="handleCreate"
        />
      </div>
    </div>
  </ModalBase>
</template>
