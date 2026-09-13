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
      class="absolute top-3 right-3 z-10 cursor-pointer rounded-full border border-black/10 dark:border-white/15 bg-white/70 dark:bg-zinc-900/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-200 hover:border-brand-orange/50"
      @click.stop="emit('view', props.card.id)"
    >
      Ver
    </button>

    <button
      type="button"
      class="flex min-h-28 w-full cursor-pointer flex-col items-start text-left"
      @click="emit('select', props.card.id)"
    >
      <div class="mb-3 flex flex-wrap gap-1.5 pr-12">
        <span
          v-if="card.isPrompt"
          class="rounded-full border border-emerald-500/70 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300"
        >
          Prompt
        </span>
        <span
          v-if="card.flMeeting"
          class="rounded-full border border-brand-orange/60 bg-brand-orange/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-orange dark:text-white"
        >
          Meeting
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
