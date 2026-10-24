import { computed, onScopeDispose, ref } from 'vue'

export function formatClock(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60

  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':')
}

export interface ClockSnapshot {
  duration: number | null
  runningSince: string | null
}

export function useMeetingClock() {
  const seconds = ref(0)
  const running = ref(false)
  const label = computed(() => formatClock(seconds.value))

  let closed = 0
  let runningSinceMs: number | null = null
  let timer = 0

  const publish = () => {
    if (runningSinceMs === null) {
      running.value = false
      seconds.value = closed
      return
    }

    const live = Math.max(0, Math.floor((Date.now() - runningSinceMs) / 1000))
    running.value = true
    seconds.value = closed + live
  }

  const stop = () => {
    window.clearInterval(timer)
    timer = 0
    runningSinceMs = null
    running.value = false
    seconds.value = closed
  }

  const hold = () => {
    publish()
    window.clearInterval(timer)
    timer = 0
    running.value = false
  }

  const release = () => {
    if (runningSinceMs === null) {
      publish()
      return
    }

    publish()
    window.clearInterval(timer)
    timer = window.setInterval(publish, 1000)
  }

  const apply = (snapshot: ClockSnapshot) => {
    closed = snapshot.duration ?? 0
    const parsed = snapshot.runningSince ? Date.parse(snapshot.runningSince) : Number.NaN
    runningSinceMs = Number.isNaN(parsed) ? null : parsed
    publish()
    window.clearInterval(timer)
    timer = 0
    if (runningSinceMs === null) return
    timer = window.setInterval(publish, 1000)
  }

  onScopeDispose(() => {
    window.clearInterval(timer)
  })

  return {
    label,
    seconds,
    running,
    apply,
    stop,
    hold,
    release,
  }
}
