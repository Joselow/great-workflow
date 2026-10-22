<script setup lang="ts">
import { computed, ref } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'

import ConfirmModal from '@/commons/ConfirmModal.vue'
import Loader from '@/commons/Loader.vue'
import MeetingRunClose from '@/components/Meeting/MeetingRunClose.vue'
import MeetingRunContext from '@/components/Meeting/MeetingRunContext.vue'
import MeetingRunDevelopment from '@/components/Meeting/MeetingRunDevelopment.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useMeeting } from '@/composables/useMeeting'
import { useMeetingClock } from '@/composables/useMeetingClock'
import type { Meeting, MeetingIssue, MeetingNextStep } from '@/interfaces/meeting'
import NotFoundView from '@/views/NotFoundView.vue'

type Act = 'context' | 'development' | 'close'

const route = useRoute()
const router = useRouter()
const { getMeetingById, patchMeeting, finishMeeting, loading } = useMeeting()
const clock = useMeetingClock()

const meeting = ref<Meeting | null>(null)
const notFound = ref(false)
const act = ref<Act>('context')
const openIssue = ref<MeetingIssue | null>(null)
const additionalInfo = ref('')
const finishOpen = ref(false)
const finishing = ref(false)

const meetingId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? id : ''
})

const frozen = computed(() => {
  if (!meeting.value) return true
  return meeting.value.executed || meeting.value.duration !== null
})

const canPrev = computed(() => act.value !== 'context')
const canNext = computed(() => act.value !== 'close')

const loadMeeting = async (id: string) => {
  const { success, data } = await getMeetingById(id)
  if (!success || !data) {
    notFound.value = true
    return
  }

  meeting.value = data
  additionalInfo.value = data.additionalInfo ?? ''
  clock.open(data.id, {
    frozen: data.executed || data.duration !== null,
    duration: data.duration,
  })
}

const load = () => {
  if (!meetingId.value) {
    notFound.value = true
    return
  }

  void loadMeeting(meetingId.value)
}

void load()

onBeforeRouteUpdate((to) => {
  const id = typeof to.params.id === 'string' ? to.params.id : ''
  if (!id || id === meeting.value?.id) return
  meeting.value = null
  notFound.value = false
  act.value = 'context'
  openIssue.value = null
  additionalInfo.value = ''
  void loadMeeting(id)
})

const goBack = () => {
  if (!meeting.value) return
  router.push({ name: 'editMeeting', params: { id: meeting.value.id } })
}

const goNext = () => {
  if (act.value === 'context') {
    act.value = 'development'
    return
  }

  if (act.value === 'development') {
    openIssue.value = null
    act.value = 'close'
  }
}

const goPrev = () => {
  if (act.value === 'close') {
    openIssue.value = null
    act.value = 'development'
    return
  }

  if (act.value === 'development') {
    openIssue.value = null
    act.value = 'context'
  }
}

const commitAdditionalInfo = async () => {
  if (!meeting.value) return

  const next = additionalInfo.value.trim() ? additionalInfo.value.trim() : null
  if (next === meeting.value.additionalInfo) return

  const { success, data } = await patchMeeting(meeting.value.id, { additionalInfo: next })
  if (!success || !data) return

  meeting.value = data
  additionalInfo.value = data.additionalInfo ?? ''
}

const saveNextSteps = async (steps: MeetingNextStep[]) => {
  if (!meeting.value) return

  const { success, data } = await patchMeeting(meeting.value.id, { nextSteps: steps })
  if (!success || !data) return

  meeting.value = data
}

const handleFinish = async () => {
  if (finishing.value || !meeting.value || frozen.value) return

  finishing.value = true
  finishOpen.value = false
  const duration = clock.flush()
  const { success, data } = await finishMeeting(meeting.value.id, duration)
  finishing.value = false

  if (!success || !data) {
    clock.resume()
    return
  }

  meeting.value = data
  clock.freeze(data.duration)
}
</script>

<template>
  <Loader v-if="!notFound && !meeting" />
  <NotFoundView v-else-if="notFound || !meeting" />

  <div v-else class="flex h-dvh min-h-0 flex-col overflow-hidden bg-white text-gray-900 dark:bg-zinc-950 dark:text-gray-100">
    <header class="flex items-center gap-3 border-b border-black/10 px-3 py-3 dark:border-white/10">
      <button
        type="button"
        class="inline-flex cursor-pointer items-center rounded-md border border-black/10 px-2 py-1 text-xs font-semibold dark:border-white/15"
        aria-label="Volver a la reunión"
        @click="goBack"
      >
        <span class="material-symbols-outlined" style="font-size: 1.1rem;">arrow_back</span>
      </button>
      <h1 class="min-w-0 flex-1 truncate text-lg font-semibold">Reunión {{ meeting.title }}</h1>
      <div class="flex shrink-0 items-center gap-2">
        <ThemeToggle single />
        <p class="font-mono text-lg tabular-nums" aria-live="polite">{{ clock.label }}</p>
      </div>
    </header>

    <div class="relative min-h-0 flex-1">
      <button
        type="button"
        class="absolute top-1/2 left-2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-black/10 bg-white/80 md:inline-flex dark:border-white/15 dark:bg-zinc-950/80"
        :class="canPrev ? 'cursor-pointer' : 'cursor-default opacity-30'"
        :disabled="!canPrev"
        aria-label="Acto anterior"
        @click="goPrev"
      >
        <span class="material-symbols-outlined">chevron_left</span>
      </button>

      <main class="pretty-scroll flex h-full min-h-0 flex-col overflow-y-auto px-4 py-6 pb-24 md:px-16 md:pb-6">
        <MeetingRunContext
          v-if="act === 'context'"
          :meeting="meeting"
        />
        <MeetingRunDevelopment
          v-else-if="act === 'development'"
          v-model:open-issue="openIssue"
          v-model:additional-info="additionalInfo"
          :meeting="meeting"
          @commit="commitAdditionalInfo"
        />
        <MeetingRunClose
          v-else
          v-model:additional-info="additionalInfo"
          :meeting="meeting"
          :frozen="frozen"
          @commit="commitAdditionalInfo"
          @save-steps="saveNextSteps"
          @finish="finishOpen = true"
        />
      </main>

      <button
        type="button"
        class="absolute top-1/2 right-3 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-black/10 bg-white/80 md:inline-flex dark:border-white/15 dark:bg-zinc-950/80"
        :class="canNext ? 'cursor-pointer' : 'cursor-default opacity-30'"
        :disabled="!canNext"
        aria-label="Acto siguiente"
        @click="goNext"
      >
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    </div>

    <div class="fixed inset-x-0 bottom-0 z-20 flex justify-between border-t border-black/10 bg-white px-3 py-2 md:hidden dark:border-white/10 dark:bg-zinc-950">
      <button
        type="button"
        class="inline-flex items-center rounded-md border border-black/10 px-3 py-2 text-xs font-semibold dark:border-white/15"
        :class="canPrev ? 'cursor-pointer' : 'cursor-default opacity-30'"
        :disabled="!canPrev"
        aria-label="Acto anterior"
        @click="goPrev"
      >
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
      <button
        type="button"
        class="inline-flex items-center rounded-md border border-black/10 px-3 py-2 text-xs font-semibold dark:border-white/15"
        :class="canNext ? 'cursor-pointer' : 'cursor-default opacity-30'"
        :disabled="!canNext"
        aria-label="Acto siguiente"
        @click="goNext"
      >
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    </div>

    <ConfirmModal
      v-model="finishOpen"
      title="¿Finalizar la reunión?"
      :loading="loading || finishing"
      @confirm="handleFinish"
    >
      <p class="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
        Se guardará el tiempo que la sala estuvo abierta.
      </p>
    </ConfirmModal>
  </div>
</template>
