<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import MeetingDateFiltersControl from '@/components/Meeting/MeetingDateFilters.vue'
import MeetingTable from '@/components/Meeting/MeetingTable.vue'
import { useMeeting } from '@/composables/useMeeting'
import { deleteFromArray } from '@/utils/array'
import { endOfMonth } from '@/utils/date'
import dayjs from 'dayjs'

import type { MeetingDateFilters, MeetingListItem } from '@/interfaces/meeting'

const PAGE_LIMIT = 24

const router = useRouter()
const { getMeetings, deleteMeeting, loading } = useMeeting()

const currentMonthFilters = (): MeetingDateFilters => ({
  from: dayjs().startOf('month').format('YYYY-MM-DD'),
  to: endOfMonth(),
})

const filters = ref<MeetingDateFilters>(currentMonthFilters())
const items = ref<MeetingListItem[]>([])
const total = ref(0)

const rangeIsQueryable = (value: MeetingDateFilters) => {
  const hasFrom = value.from !== ''
  const hasTo = value.to !== ''
  if (!hasFrom && !hasTo) return true
  return hasFrom && hasTo && value.from <= value.to
}

const loadMeetings = async () => {
  if (!rangeIsQueryable(filters.value)) return

  const { from, to } = filters.value
  const query = from && to
    ? { from, to, page: 1, limit: PAGE_LIMIT }
    : { page: 1, limit: PAGE_LIMIT }

  const { success, data } = await getMeetings(query)
  if (!success || !data) return

  items.value = data.items
  total.value = data.total
}

const handleFiltersUpdate = (next: MeetingDateFilters) => {
  filters.value = next
  void loadMeetings()
}

const openNew = () => {
  void router.push({ name: 'newMeeting' })
}

const openMeeting = (meeting: MeetingListItem) => {
  void router.push({ name: 'editMeeting', params: { id: meeting.id } })
}

const handleDelete = async (meeting: MeetingListItem) => {
  const { success } = await deleteMeeting(meeting.id)
  if (!success) return

  items.value = deleteFromArray(items.value, meeting.id)
  total.value = Math.max(0, total.value - 1)
}

const emptyLabel = computed(() => {
  if (!filters.value.from && !filters.value.to) return 'No hay reuniones todavía.'
  return 'No hay reuniones en este rango.'
})

const showTruncation = computed(() => total.value > items.value.length)

loadMeetings()
</script>

<template>
  <div class="min-w-0 max-w-6xl mx-auto px-1 py-2 md:py-6">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
        <span class="material-symbols-outlined align-middle">co_present</span>
        Reuniones
      </h1>
      <button
        type="button"
        class="cursor-pointer rounded-md bg-brand-orange text-white text-xs font-semibold px-6 py-1.5"
        @click="openNew"
      >
        <span class="material-symbols-outlined align-middle" style="font-size: 18px;">add</span>
        Nueva reunión
      </button>
    </div>

    <MeetingDateFiltersControl
      class="mb-4"
      :filters="filters"
      @update="handleFiltersUpdate"
    />

    <p
      v-if="loading && !items.length"
      class="text-sm text-gray-400"
    >
      Cargando...
    </p>
    <template v-else>
      <p
        v-if="showTruncation"
        class="mb-2 text-xs text-gray-500 dark:text-gray-400"
      >
        Mostrando {{ items.length }} de {{ total }}
      </p>

      <MeetingTable
        :meetings="items"
        :empty-label="emptyLabel"
        @open="openMeeting"
        @delete="handleDelete"
      />
    </template>
  </div>
</template>
