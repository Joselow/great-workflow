<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'

import ConfirmModal from '@/commons/ConfirmModal.vue'
import Loader from '@/commons/Loader.vue'
import MeetingRunClose from '@/components/Meeting/MeetingRunClose.vue'
import MeetingRunContext from '@/components/Meeting/MeetingRunContext.vue'
import MeetingRunDevelopment from '@/components/Meeting/MeetingRunDevelopment.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { keyboardCommands } from '@/composables/useKeyboardCommands'
import { useMeeting } from '@/composables/useMeeting'
import { useMeetingClock } from '@/composables/useMeetingClock'
import type { Meeting, MeetingIssue, MeetingNextStep } from '@/interfaces/meeting'
import NotFoundView from '@/views/NotFoundView.vue'

type Act = 'context' | 'development' | 'close'

const route = useRoute()
const router = useRouter()
const {
  getMeetingById,
  patchMeeting,
  resumeMeetingClock,
  pauseMeetingClock,
  finishMeetingClock,
} = useMeeting()

const meeting = ref<Meeting | null>(null)
const notFound = ref(false)
const act = ref<Act>('context')
const openIssue = ref<MeetingIssue | null>(null)
const additionalInfo = ref('')
const finishOpen = ref(false)
const startOpen = ref(false)
const startAsked = ref(false)
const pausedForFinish = ref(false)
const clockBusy = ref(false)
let startConfirmed = false
let ignoreStartClose = false
let disposed = false

const clock = useMeetingClock()

const meetingId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? id : ''
})

const clockFinished = computed(() => Boolean(meeting.value?.finishedAt))
const segmentOpen = computed(() => Boolean(meeting.value?.runningSince) && !clockFinished.value)
const clockStarted = computed(() => {
  if (!meeting.value) return false
  return meeting.value.startedAt != null
    || meeting.value.duration != null
    || meeting.value.finishedAt != null
})
const showStart = computed(() => !meeting.value?.executed && !segmentOpen.value && !clockStarted.value)
const showResume = computed(() => !segmentOpen.value && clockStarted.value)
const showPause = computed(() => segmentOpen.value)
const showFinish = computed(() => !clockFinished.value && clockStarted.value)

const canPrev = computed(() => act.value !== 'context')
const canNext = computed(() => act.value !== 'close')

const loadMeeting = async (id: string) => {
  const { success, data } = await getMeetingById(id)
  if (!success || !data) {
    notFound.value = true
    return
  }

  if (meetingId.value !== id) return

  meeting.value = data
  additionalInfo.value = data.additionalInfo ?? ''
  clock.apply({
    duration: data.duration,
    runningSince: data.finishedAt ? null : data.runningSince,
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

onBeforeRouteUpdate(async (to) => {
  const id = typeof to.params.id === 'string' ? to.params.id : ''
  if (!id || id === meeting.value?.id) return

  const previousId = meeting.value?.id
  const held = pausedForFinish.value
  pausedForFinish.value = false
  finishOpen.value = false
  ignoreStartClose = true
  startOpen.value = false
  startAsked.value = false
  clock.stop()
  meeting.value = null
  notFound.value = false
  act.value = 'context'
  openIssue.value = null
  additionalInfo.value = ''
  if (held && previousId) await resumeMeetingClock(previousId)
  void nextTick(() => {
    ignoreStartClose = false
  })
  void loadMeeting(id)
})

onBeforeRouteLeave(async () => {
  const id = meeting.value?.id
  const held = pausedForFinish.value
  pausedForFinish.value = false
  finishOpen.value = false
  if (held && id) await resumeMeetingClock(id)
})

const goBack = () => {
  if (!meeting.value) return
  router.push({ name: 'editMeeting', params: { id: meeting.value.id } })
}

const goNext = () => {
  if (startOpen.value || finishOpen.value) return

  if (act.value === 'context') {
    if (showStart.value && !startAsked.value) {
      startAsked.value = true
      startOpen.value = true
      return
    }

    act.value = 'development'
    return
  }

  if (act.value === 'development') {
    openIssue.value = null
    act.value = 'close'
  }
}

const goPrev = () => {
  if (startOpen.value || finishOpen.value) return

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

const confirmStart = async () => {
  if (clockBusy.value || startConfirmed) return
  startConfirmed = true
  await runClockAction(resumeMeetingClock)
  act.value = 'development'
  startOpen.value = false
  void nextTick(() => {
    startConfirmed = false
  })
}

watch(startOpen, (open) => {
  if (open || startConfirmed || ignoreStartClose || act.value !== 'context') return
  act.value = 'development'
})

onMounted(() => {
  keyboardCommands.setRoomActArrows({
    prev: goPrev,
    next: goNext,
    enabled: () => Boolean(meeting.value) && !finishOpen.value && !startOpen.value,
  })
})

onUnmounted(() => {
  disposed = true
  keyboardCommands.setRoomActArrows(null)
})

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
  if (!meeting.value) return false

  const { success, data } = await patchMeeting(meeting.value.id, { nextSteps: steps })
  if (!success || !data) return false

  meeting.value = data
  return true
}

const applyClock = (data: Meeting) => {
  meeting.value = data
  clock.apply(data)
}

const runClockAction = async (action: (id: string) => Promise<{ success: boolean; data?: Meeting }>) => {
  if (clockBusy.value || !meeting.value) return false
  const id = meeting.value.id
  clockBusy.value = true
  const { success, data } = await action(id)
  clockBusy.value = false
  if (!success || !data || meeting.value?.id !== id) return false
  applyClock(data)
  return true
}

const clockLocked = () => clockBusy.value || finishOpen.value || startOpen.value

const handleResume = () => {
  if (clockLocked()) return
  void runClockAction(resumeMeetingClock)
}

const handlePause = () => {
  if (clockLocked()) return
  void runClockAction(pauseMeetingClock)
}

const openFinish = async () => {
  if (clockLocked() || !meeting.value || !showFinish.value) return

  const id = meeting.value.id
  if (!segmentOpen.value) {
    finishOpen.value = true
    return
  }

  clock.hold()
  clockBusy.value = true
  const { success, data } = await pauseMeetingClock(id)
  clockBusy.value = false

  if (disposed || meeting.value?.id !== id) {
    if (success) await resumeMeetingClock(id)
    return
  }

  if (!success || !data) {
    clock.release()
    return
  }

  applyClock(data)
  pausedForFinish.value = true
  finishOpen.value = true
}

const handleFinish = async () => {
  if (clockBusy.value || !meeting.value || !showFinish.value) return
  pausedForFinish.value = false
  finishOpen.value = false
  await runClockAction(finishMeetingClock)
}

watch(finishOpen, (open) => {
  if (open || !pausedForFinish.value || !meeting.value) return
  pausedForFinish.value = false
  void runClockAction(resumeMeetingClock)
})
</script>

<template>
  <Loader v-if="!notFound && !meeting" />
  <NotFoundView v-else-if="notFound || !meeting" />

  <div v-else class="flex h-dvh min-h-0 flex-col overflow-hidden bg-white text-gray-900 dark:bg-zinc-950 dark:text-gray-100">
    <header class="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-black/10 px-3 py-3 dark:border-white/10">
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          class="inline-flex cursor-pointer items-center rounded-md border border-black/10 px-2 py-1 text-xs font-semibold dark:border-white/15"
          aria-label="Volver a la reunión"
          @click="goBack"
        >
          <span class="material-symbols-outlined" style="font-size: 1.1rem;">arrow_back</span>
        </button>
        <h1 class="min-w-0 flex-1 truncate text-lg font-semibold">Reunión {{ meeting.title }}</h1>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <ThemeToggle single />
        <p class="font-mono text-lg tabular-nums" aria-live="polite">{{ clock.label }}</p>
        <button
          v-if="showStart || showResume"
          type="button"
          class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-black/10 disabled:cursor-default disabled:opacity-40 dark:border-white/15"
          :disabled="clockBusy || finishOpen || startOpen"
          :aria-label="showStart ? 'Iniciar' : 'Reanudar'"
          @click="handleResume"
        >
          <span class="material-symbols-outlined" style="font-size: 1.35rem;">play_arrow</span>
        </button>
        <button
          v-if="showPause"
          type="button"
          class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-black/10 disabled:cursor-default disabled:opacity-40 dark:border-white/15"
          :disabled="clockBusy || finishOpen || startOpen"
          aria-label="Pausar"
          @click="handlePause"
        >
          <span class="material-symbols-outlined" style="font-size: 1.35rem;">pause</span>
        </button>
        <button
          v-if="showFinish"
          type="button"
          class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-black/10 disabled:cursor-default disabled:opacity-40 dark:border-white/15"
          :disabled="clockBusy || finishOpen || startOpen"
          aria-label="Finalizar"
          @click="openFinish"
        >
          <span class="material-symbols-outlined" style="font-size: 1.35rem;">stop</span>
        </button>
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
          :save-steps="saveNextSteps"
          :can-finish="showFinish"
          @commit="commitAdditionalInfo"
          @finish="openFinish"
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
      v-model="startOpen"
      title="¿Iniciar la reunión?"
      :loading="clockBusy"
      @confirm="confirmStart"
    >
      <p class="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
        Confirmar empieza el contador. Cancelar sigue sin iniciarlo.
      </p>
    </ConfirmModal>

    <ConfirmModal
      v-model="finishOpen"
      title="¿Finalizar la reunión?"
      :loading="clockBusy"
      @confirm="handleFinish"
    >
      <p class="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
        {{ pausedForFinish
          ? 'El tiempo ya está detenido. Confirmar deja la reunión ejecutada. Cancelar continúa el contador.'
          : 'Se guarda el tiempo y la reunión queda ejecutada.' }}
      </p>
    </ConfirmModal>
  </div>
</template>
