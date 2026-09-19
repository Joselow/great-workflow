<script setup lang="ts">
import { cardTileStyle } from '@/helpers/cardColor'

import type { CardListItem } from '@/interfaces/card'

const props = defineProps<{
  card: CardListItem
}>()

const emit = defineEmits<{
  select: [id: string]
  view: [id: string]
}>()
</script>

<template>
  <div
    class="relative flex min-h-36 w-full flex-col rounded-2xl border px-4 py-4"
    :style="cardTileStyle(props.card.color)"
  >
    <button
      type="button"
      class="absolute top-3 right-3 z-10 cursor-pointer rounded-lg border border-black/10 dark:border-white/15 
      bg-white/50 dark:bg-zinc-900/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-200 
      hover:bg-white/90 dark:hover:bg-zinc-900/80
      hover:scale-105 transition-all duration-100

      "
      @click.stop="emit('view', props.card.id)"
    >
    <span class="material-symbols-outlined align-middle" style="font-size: 18px;">
          share_reviews
        </span>
    </button>

    <button
      type="button"
      class="flex min-h-28 w-full cursor-pointer flex-col items-start text-left"
      @click="emit('select', props.card.id)"
    >
      <div class="mb-3 flex flex-wrap gap-1.5 pr-12">
        <span
          v-if="card.isPrompt"
          class="rounded-md border border-emerald-500/70 bg-emerald-500 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
        >
          <!-- Prompt -->
          <span class="material-symbols-outlined align-middle" style="font-size: 18px;">
inbox_text_asterisk
</span>
        </span>
        <span
          v-if="card.flMeeting"
          class="rounded-md border border-brand-orange/60 bg-brand-orange px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
        >
          <!-- Meeting -->
          <span class="material-symbols-outlined align-middle" style="font-size: 18px;">
co_present
</span>
        </span>
      </div>

      <p class="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">
        {{ card.name }}
      </p>

      <p
        v-if="card.description"
        class="mt-2 line-clamp-3 text-xs text-gray-600 dark:text-gray-300"
      >
        {{ card.description }}
      </p>
    </button>
  </div>
</template>
