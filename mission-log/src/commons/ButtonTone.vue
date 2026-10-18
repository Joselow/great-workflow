<script setup lang="ts">
withDefaults(defineProps<{
  success?: boolean
  loading?: boolean
}>(), {
  success: false,
  loading: false,
})
</script>

<template>
  <button
    type="button"
    class="inline-flex cursor-pointer items-center gap-1 rounded-lg border 
    px-2 py-0 text-xs font-semibold 
    transition-colors disabled:cursor-not-allowed disabled:opacity-60      
    "
    :class="success
      ? 'border-emerald-600/60 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500 hover:text-white dark:text-emerald-300 dark:hover:bg-emerald-600'
      : 'border-rose-600/60 bg-rose-500/10 text-rose-700 hover:bg-rose-500 hover:text-white dark:text-rose-300 dark:hover:bg-rose-600'"
    :disabled="loading"
    :aria-pressed="success"
  >
    <span
      v-if="loading"
      class="material-symbols-outlined animate-spin"
      style="font-size: 18px;"
    >
      progress_activity
    </span>
    <slot v-else-if="success" name="success" />
    <slot v-else name="pending" />
  </button>
</template>
