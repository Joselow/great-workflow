<script setup lang="ts">
import { ref } from 'vue'

import ConfirmModal from '@/commons/ConfirmModal.vue'
import EmptyRecords from '@/commons/EmptyRecords.vue'
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
  <div class="flex flex-col gap-2">
    <EmptyRecords v-if="!tasks.length && !pending" :message="emptyMessage" />

    <TaskRow
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      :completing="completingIds.includes(task.id)"
      @complete="emit('complete', task)"
      @edit="emit('edit', task)"
      @delete="askDelete(task)"
    />

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
