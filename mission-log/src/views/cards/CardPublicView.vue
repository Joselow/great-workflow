<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import NotFoundView from '@/views/NotFoundView.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

import { useCard } from '@/composables/useCard'
import { cardSurfaceStyle } from '@/helpers/cardColor'

import type { PublicCard } from '@/interfaces/card'

const route = useRoute()
const { getPublicCard, loading } = useCard()

const card = ref<PublicCard | null>(null)
const notFound = ref(false)

onMounted(async () => {
  const id = route.params.id as string
  const { success, data } = await getPublicCard(id)

  if (!success || !data) {
    notFound.value = true
    return
  }

  card.value = data
})
</script>

<template>
  <NotFoundView v-if="notFound" />

  <div
    v-else
    class="relative min-h-screen w-full flex items-start justify-center px-4 py-12 bg-white dark:bg-zinc-950"
  >
    <ThemeToggle
      single
      class="absolute top-4 right-4"
    />

    <div
      v-if="loading && !card"
      class="text-sm text-gray-400"
    >
      Cargando...
    </div>

    <article
      v-else-if="card"
      class="w-full max-w-3xl rounded-2xl border p-6 md:p-10"
      :style="cardSurfaceStyle(card.color)"
    >
      <div class="flex flex-wrap items-center gap-2 mb-6">
        <span
          v-if="card.project"
          class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold text-gray-800 dark:text-gray-100"
          :style="{
            backgroundColor: `${card.project.color}33`,
            borderColor: `${card.project.color}99`,
          }"
        >
          <span
            class="h-2.5 w-2.5 rounded-full"
            :style="{ backgroundColor: card.project.color }"
          />
          {{ card.project.name }}
        </span>

        <span
          v-if="card.isPrompt"
          class="rounded-full border border-emerald-500/70 bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300"
        >
          Prompt
        </span>

        <span
          v-if="card.flMeeting"
          class="rounded-full border border-brand-orange/60 bg-brand-orange/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-orange dark:text-white"
        >
          Meeting
        </span>
      </div>

      <h1 class="mb-4 text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white">
        {{ card.name }}
      </h1>

      <p
        v-if="card.description"
        class="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300"
      >
        {{ card.description }}
      </p>

      <div
        v-if="!card.isPrompt && card.sections.length"
        class="mt-8 space-y-6"
      >
        <section
          v-for="(section, index) in card.sections"
          :key="index"
        >
          <h2 class="text-base font-semibold text-gray-900 dark:text-white border-b border-black/10 dark:border-white/15 pb-1">
            {{ section.title }}
          </h2>
          <p
            v-if="section.description"
            class="mt-2 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300"
          >
            {{ section.description }}
          </p>
        </section>
      </div>
    </article>
  </div>
</template>
