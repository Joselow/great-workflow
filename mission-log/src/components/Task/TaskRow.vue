<script setup lang="ts">
import type { Task } from '@/interfaces/task'

defineProps<{
  task: Task
  completing: boolean
}>()

const emit = defineEmits<{
  complete: []
  edit: []
  delete: []
}>()
</script>

<template>
  <article class="rounded-xl border border-black/10 px-3 py-3 dark:border-white/15">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <p
          class="break-words font-semibold text-gray-900 dark:text-white"
          :class="task.completed ? 'text-gray-500 line-through dark:text-gray-400' : ''"
        >
          {{ task.name }}
        </p>
        <p
          v-if="task.description"
          class="mt-1 whitespace-pre-wrap break-words text-sm text-gray-500 dark:text-gray-400"
        >
          {{ task.description }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-black/10 px-2 py-1 text-xs font-semibold text-gray-700 disabled:opacity-60 dark:border-white/15 dark:text-gray-200"
          :disabled="completing"
          :aria-pressed="task.completed"
          @click="emit('complete')"
        >
          <span
            class="material-symbols-outlined text-[18px]"
            :class="completing ? 'animate-spin' : ''"
          >
            {{ completing ? 'progress_activity' : task.completed ? 'check_circle' : 'radio_button_unchecked' }}
          </span>
          {{ task.completed ? 'Hecha' : 'Pendiente' }}
        </button>

        <button
          type="button"
          class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-black/10 px-2 py-1 text-gray-600 dark:border-white/15 dark:text-gray-200"
          title="Editar"
          aria-label="Editar"
          @click="emit('edit')"
        >
          <span class="material-symbols-outlined text-[18px]">edit</span>
        </button>

        <button
          type="button"
          class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-rose-500/40 px-2 py-1 text-rose-600 dark:text-rose-300"
          title="Eliminar"
          aria-label="Eliminar"
          @click="emit('delete')"
        >
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  </article>
</template>
