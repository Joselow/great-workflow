<script setup lang="ts">
import { ref } from 'vue'

import MeetingCardModal from '@/components/Meeting/MeetingCardModal.vue'
import { cardTileStyle } from '@/helpers/cardColor'

import type { CardListItem } from '@/interfaces/card'

const cards = defineModel<CardListItem[]>({ required: true })
const modalOpen = ref(false)

const addCard = (card: CardListItem) => {
  if (cards.value.some((item) => item.id === card.id)) return
  cards.value = [...cards.value, card]
}

const removeCard = (id: string) => {
  cards.value = cards.value.filter((card) => card.id !== id)
}
</script>

<template>
  <div class="rounded-lg border border-gray-500 border-2 dark:border-white/15 p-4">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-100">
        <span class="material-symbols-outlined align-middle"> cards_stack </span>
        Cards asociadas</h3>
      <button
        type="button"
        class="cursor-pointer inline-flex h-7 w-7 items-center justify-center rounded-md border border-sky-500/40 bg-sky-500/50 
        text-sky-700 dark:text-sky-300"
        title="Agregar card"
        @click="modalOpen = true"
      >
        <span class="material-symbols-outlined" style="font-size: 1.1rem;">add</span>
      </button>
    </div>

    <p
      v-if="!cards.length"
      class="text-xs text-gray-500 dark:text-gray-400"
    >
      Sin cards asociadas.
    </p>

    <ul v-else class="space-y-2">
      <li
        v-for="card in cards"
        :key="card.id"
        class="flex items-start justify-between gap-2 rounded-lg border px-3 py-1"
        :style="cardTileStyle(card.color)"
      >
        <p class="min-w-0 truncate text-sm font-medium text-gray-900 dark:text-white">
          <span class="material-symbols-outlined align-middle " 
          style="font-size: 1.2rem;">credit_score</span>
          {{ card.name || 'Sin título' }}
        </p>
        <button
          type="button"
          class="cursor-pointer text-gray-400 hover:text-rose-500"
          title="Quitar de la reunión"
          @click="removeCard(card.id)"
        >
          <span class="material-symbols-outlined" style="font-size: 1rem;">close</span>
        </button>
      </li>
    </ul>

    <MeetingCardModal v-model="modalOpen" @pick="addCard" />
  </div>
</template>
