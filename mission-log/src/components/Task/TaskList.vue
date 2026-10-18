<script setup lang="ts">
import { ref } from 'vue'

import EmptyRecords from '@/commons/EmptyRecords.vue'

import ConfirmModal from '@/commons/ConfirmModal.vue'
import TaskRow from '@/components/Task/TaskRow.vue'

import type { Task } from '@/interfaces/task'

withDefaults(defineProps<{
  tasks: Task[]
  completingIds?: string[]
  pending?: boolean
  emptyMessage?: string
}>(), {
  completingIds: () => [],
  pending: false,
  emptyMessage: 'Aún no hay tareas',
})

const emit = defineEmits<{
  complete: [task: Task]
  edit: [task: Task]
  delete: [task: Task]
}>()

const confirmOpen = ref(false)
const pendingDelete = ref<Task | null>(null)

const askDelete = (task: Task) => {
  pendingDelete.value = task
  confirmOpen.value = true
}

const confirmDelete = () => {
  const task = pendingDelete.value
  confirmOpen.value = false
  pendingDelete.value = null
  if (!task) return
  emit('delete', task)
}
</script>

<template>
  <div class="min-w-0">
    <div class="overflow-x-auto rounded-xl border border-black/10 dark:border-white/15">
      <table class="w-full border-collapse text-left text-sm">
        <thead>
          <tr class="border-b border-black/10 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:border-white/10 dark:text-gray-400">
            <th class="px-3 py-2 font-semibold">Tarea</th>
            <th class="w-36 px-3 py-2 font-semibold">Estado</th>
            <th class="w-24 px-3 py-2">
              <span class="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!tasks.length && !pending">
            <td
              colspan="3"
              class="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
            >
              <EmptyRecords :message="emptyMessage" />
            </td>
          </tr>
          <TaskRow
            v-for="task in tasks"
            :key="task.id"
            :task="task"
            :completing="completingIds.includes(task.id)"
            @complete="emit('complete', task)"
            @edit="emit('edit', task)"
            @delete="askDelete(task)"
          />
        </tbody>
      </table>
    </div>

    <ConfirmModal
      v-model="confirmOpen"
      title="¿Eliminar esta tarea?"
      @confirm="confirmDelete"
    >
      <p class="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
        Esta acción no se puede deshacer.
      </p>
    </ConfirmModal>
  </div>
</template>
