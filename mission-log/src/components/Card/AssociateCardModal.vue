<script setup lang="ts">
import { ref, watch } from 'vue'

import ModalBase from '@/commons/ModalBase.vue'

import type { CardListItem } from '@/interfaces/card'

const open = defineModel<boolean>({ required: true })

const props = defineProps<{
  items: CardListItem[]
  loading: boolean
  page: number
  total: number
  pageSize: number
}>()

const emit = defineEmits<{
  search: [query: string]
  page: [page: number]
  select: [card: CardListItem]
}>()

const localQuery = ref('')

watch(open, (value) => {
  if (value) localQuery.value = ''
})

const onInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  localQuery.value = value
  emit('search', value)
}

const choose = (card: CardListItem) => {
  emit('select', card)
  open.value = false
}

const canPrev = () => props.page > 1
const canNext = () => props.page * props.pageSize < props.total
</script>

<template>
  <ModalBase v-model="open" maxWidth="md">
    <div class="px-4 py-4">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Asociar card</h2>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Elige una card prompt. La card no se modifica.</p>

      <input
        :value="localQuery"
        type="search"
        placeholder="Buscar"
        class="mt-3 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 outline-none dark:border-white/15 dark:bg-white/5 dark:text-white"
        @input="onInput"
      />

      <p v-if="loading" class="py-6 text-center text-sm text-gray-500 dark:text-gray-400">Cargando...</p>

      <p
        v-else-if="items.length === 0"
        class="py-6 text-center text-sm text-gray-500 dark:text-gray-400"
      >
        No hay cards prompt
      </p>

      <ul v-else class="mt-3 flex max-h-80 flex-col gap-2 overflow-y-auto">
        <li v-for="item in items" :key="item.id">
          <button
            type="button"
            class="flex w-full min-w-0 items-start gap-2 rounded-md border border-black/10 px-2 py-2 text-left hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
            @click="choose(item)"
          >
            <span
              class="mt-0.5 h-4 w-4 shrink-0 rounded-sm border border-black/10"
              :style="{ backgroundColor: item.color }"
            />
            <span class="min-w-0">
              <span class="block truncate text-sm font-medium text-gray-900 dark:text-white">{{ item.name }}</span>
              <span class="block max-h-10 overflow-hidden text-xs text-gray-500 dark:text-gray-400">{{ item.description }}</span>
            </span>
          </button>
        </li>
      </ul>

      <div v-if="total > pageSize" class="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          class="rounded-md border border-black/10 px-3 py-1 text-xs disabled:opacity-40 dark:border-white/15"
          :disabled="!canPrev()"
          @click="emit('page', page - 1)"
        >
          Anterior
        </button>
        <button
          type="button"
          class="rounded-md border border-black/10 px-3 py-1 text-xs disabled:opacity-40 dark:border-white/15"
          :disabled="!canNext()"
          @click="emit('page', page + 1)"
        >
          Siguiente
        </button>
      </div>
    </div>
  </ModalBase>
</template>
