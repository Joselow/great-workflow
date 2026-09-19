<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import CardListFilters from '@/components/Card/CardListFilters.vue'
import CardTile from '@/components/Card/CardTile.vue'

import { projectStore } from '@/store/projectStore'
import { useProject } from '@/composables/useProject'
import { useCard } from '@/composables/useCard'
import { debounce } from '@/utils/debounce'

import type { CardListItem, CardListViewFilters } from '@/interfaces/card'

const PAGE_SIZE = 9

const router = useRouter()
const { projects } = projectStore
const { getProjects } = useProject()
const { getCards, loading } = useCard()

const filters = ref<CardListViewFilters>({
  projectFilter: 'all',
  q: '',
  isPrompt: false,
  flMeeting: false,
})
const page = ref(1)
const total = ref(0)
const items = ref<CardListItem[]>([])

const canPrev = computed(() => page.value > 1)
const canNext = computed(() => page.value * PAGE_SIZE < total.value)

const loadProjects = async () => {
  if (projects.value.length) return

  const { success, data } = await getProjects()
  if (success && data) {
    projects.value = data
  }
}

const loadCards = async () => {
  const { success, data } = await getCards({
    q: filters.value.q.trim() || undefined,
    projectId: filters.value.projectFilter === 'all' ? undefined : filters.value.projectFilter,
    isPrompt: filters.value.isPrompt || undefined,
    flMeeting: filters.value.flMeeting || undefined,
    page: page.value,
    limit: PAGE_SIZE,
  })

  if (!success || !data) {
    items.value = []
    total.value = 0
    return
  }

  if (data.items.length === 0 && page.value > 1) {
    page.value = 1
    await loadCards()
    return
  }

  items.value = data.items
  total.value = data.total
}

const loadCardsDebounced = debounce(() => {
  void loadCards()
}, 300)

watch(() => filters.value.q, () => {
  page.value = 1
  loadCardsDebounced()
})

const handleFiltersUpdate = (next: CardListViewFilters) => {
  filters.value = next
  page.value = 1
  void loadCards()
}

const openCard = (id: string) => {
  void router.push({ name: 'editCard', params: { id } })
}

const openPublicCard = (id: string) => {
  void router.push({ name: 'publicCard', params: { id } })
}

const openNew = () => {
  void router.push({ name: 'newCard' })
}

const goPrev = () => {
  if (!canPrev.value) return
  page.value -= 1
  void loadCards()
}

const goNext = () => {
  if (!canNext.value) return
  page.value += 1
  void loadCards()
}

loadProjects()
loadCards()
</script>

<template>
  <div class="min-w-0 max-w-5xl mx-auto px-1 py-2 md:py-6">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
        Cards
      </h1>

      <button
        type="button"
        class="cursor-pointer rounded-md bg-brand-orange hover:bg-brand-orange text-white text-xs font-semibold px-6 py-1.5 transition-colors"
        @click="openNew"
      >
        <span class="material-symbols-outlined align-middle" 
        style="font-size: 18px;">
add_card
</span>
        Nueva card
      </button>
    </div>

    <CardListFilters
      v-model:q="filters.q"
      :filters="filters"
      :projects="projects"
      @update="handleFiltersUpdate"
    />

    <div class="mt-8 flex items-center gap-3 md:gap-5">
      <button
        type="button"
        class="shrink-0 rounded-full border border-2 border-black dark:border-white px-3 py-2 text-xl text-black dark:text-gray-200 disabled:opacity-30"
        :disabled="!canPrev"
        aria-label="Anterior"
        @click="goPrev"
      >
        ‹
      </button>

      <div class="min-w-0 flex-1">
        <p
          v-if="loading && !items.length"
          class="text-sm text-gray-400"
        >
          Cargando...
        </p>

        <p
          v-else-if="!items.length"
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          No hay cards con estos filtros.
        </p>

        <div
          v-else
          class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <CardTile
            v-for="card in items"
            :key="card.id"
            :card="card"
            @select="openCard"
            @view="openPublicCard"
          />
        </div>
      </div>

      <button
        type="button"
        class="shrink-0 rounded-full border border-2 border-black dark:border-white px-3 py-2 text-xl text-black dark:text-gray-200 disabled:opacity-30"
        :disabled="!canNext"
        aria-label="Siguiente"
        @click="goNext"
      >
        ›
      </button>
    </div>
  </div>
</template>
