import { computed, onScopeDispose, ref } from 'vue'

export function formatClock(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60

  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':')
}

function storageKey(meetingId: string) {
  return `meeting-run:${meetingId}`
}

function readAccumulated(meetingId: string) {
  try {
    const raw = localStorage.getItem(storageKey(meetingId))
    if (!raw) return 0

    const parsed = JSON.parse(raw) as { accumulatedSec?: unknown }
    const value = parsed.accumulatedSec
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return 0
    return Math.floor(value)
  } catch {
    return 0
  }
}

export function useMeetingClock() {
  const seconds = ref(0)
  const label = computed(() => formatClock(seconds.value))

  let meetingId = ''
  let accumulatedSec = 0
  let segmentStartedAt: number | null = null
  let frozen = false
  let active = false
  let disposed = false
  let tickTimer = 0
  let flushTimer = 0

  const publish = () => {
    const live = segmentStartedAt === null
      ? 0
      : Math.max(0, Math.floor((Date.now() - segmentStartedAt) / 1000))
    seconds.value = accumulatedSec + live
  }

  const persist = () => {
    if (!meetingId || frozen) return

    try {
      localStorage.setItem(storageKey(meetingId), JSON.stringify({
        accumulatedSec,
        segmentStartedAt: null,
      }))
    } catch {
      // The readout stays in memory when storage is unavailable.
    }
  }

  const clearStored = () => {
    if (!meetingId) return

    try {
      localStorage.removeItem(storageKey(meetingId))
    } catch {
      // A frozen room only displays the stored duration.
    }
  }

  const stopTimers = () => {
    window.clearInterval(tickTimer)
    window.clearInterval(flushTimer)
    tickTimer = 0
    flushTimer = 0
  }

  const commit = (restart: boolean) => {
    if (segmentStartedAt !== null) {
      const elapsedMs = Math.max(0, Date.now() - segmentStartedAt)
      accumulatedSec += Math.floor(elapsedMs / 1000)
      segmentStartedAt = restart ? Date.now() - (elapsedMs % 1000) : null
    } else if (restart) {
      segmentStartedAt = Date.now()
    }

    persist()
    publish()
  }

  const startTimers = () => {
    stopTimers()
    tickTimer = window.setInterval(publish, 1000)
    flushTimer = window.setInterval(() => {
      if (document.hidden || frozen) return
      commit(true)
    }, 5000)
  }

  const onVisibility = () => {
    if (!active || frozen) return

    if (document.hidden) {
      commit(false)
      stopTimers()
      return
    }

    segmentStartedAt = Date.now()
    startTimers()
    publish()
  }

  const onPageHide = () => {
    if (!active || frozen) return
    commit(false)
    stopTimers()
  }

  const removeListeners = () => {
    window.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('pagehide', onPageHide)
  }

  const close = () => {
    if (!active) return
    if (!frozen) commit(false)
    active = false
    segmentStartedAt = null
    stopTimers()
    removeListeners()
  }

  const open = (
    id: string,
    options: { frozen: boolean; duration: number | null },
  ) => {
    if (disposed) return

    close()
    meetingId = id
    frozen = options.frozen
    segmentStartedAt = null

    if (options.frozen) {
      clearStored()
      seconds.value = options.duration ?? 0
      return
    }

    // A previous visit may have left a segment start. That gap is closed time.
    accumulatedSec = readAccumulated(id)
    active = true
    window.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onPageHide)

    if (document.hidden) {
      publish()
      return
    }

    segmentStartedAt = Date.now()
    persist()
    startTimers()
    publish()
  }

  const flush = () => {
    if (!active || frozen) return Math.max(0, seconds.value)
    commit(false)
    stopTimers()
    return accumulatedSec
  }

  const resume = () => {
    if (!active || frozen || document.hidden || segmentStartedAt !== null) return
    segmentStartedAt = Date.now()
    startTimers()
    publish()
  }

  const freeze = (duration: number | null) => {
    frozen = true
    active = false
    segmentStartedAt = null
    stopTimers()
    removeListeners()
    clearStored()
    seconds.value = duration ?? 0
  }

  onScopeDispose(() => {
    disposed = true
    close()
  })

  return {
    label,
    seconds,
    open,
    flush,
    resume,
    freeze,
  }
}
