<script setup lang="ts">
import { ref, watch } from 'vue'

import ModalBase from '@/commons/ModalBase.vue'
import TaskForm from '@/components/Task/TaskForm.vue'
import TaskList from '@/components/Task/TaskList.vue'

import { useTask } from '@/composables/useTask'

import type { Requirement } from '@/interfaces/requirement'
import { emptyTaskDraft, type Task, type TaskDraft } from '@/interfaces/task'

const open = defineModel<boolean>({ required: true })

const props = defineProps<{
  requirement: Requirement | null
  projectId: string
}>()

const { loading, tasks, getTasks, createTask, updateTask, patchCompleted, deleteTask } = useTask()

type StatusFilter = 'all' | 'pending' | 'done'

const statusFilter = ref<StatusFilter>('all')
const draft = ref<TaskDraft>(emptyTaskDraft())
const editingId = ref<string | null>(null)
const completingIds = ref<string[]>([])

const statusOptions: { value: StatusFilter; label: string; icon: string }[] = [
  { value: 'all', label: 'Todos', icon: 'list_alt' },
  { value: 'pending', label: 'Pendientes', icon: 'radio_button_unchecked' },
  { value: 'done', label: 'Completadas', icon: 'check_circle' },
]

const filterClass = (active: boolean) => active
  ? 'border-brand-orange bg-brand-orange text-white'
  : 'border-black/10 bg-white text-gray-600 dark:border-white/15 dark:bg-white/5 dark:text-gray-200'

const resetDraft = () => {
  editingId.value = null
  draft.value = emptyTaskDraft(props.requirement?.id ?? null)
}

const loadTasks = async () => {
  const requirementId = props.requirement?.id
  if (!open.value || !requirementId || !props.projectId) return

  const filters: { projectId: string; requirementId: string; completed?: boolean } = {
    projectId: props.projectId,
    requirementId,
  }

  if (statusFilter.value === 'pending') filters.completed = false
  if (statusFilter.value === 'done') filters.completed = true

  await getTasks(filters)
}

const matchesStatus = (task: Task) => {
  if (statusFilter.value === 'pending' && task.completed) return false
  if (statusFilter.value === 'done' && !task.completed) return false
  return task.requirementId === props.requirement?.id
}

watch(
  () => [open.value, props.requirement?.id, props.projectId] as const,
  ([isOpen]) => {
    if (!isOpen || !props.requirement?.id || !props.projectId) return
    statusFilter.value = 'all'
    completingIds.value = []
    resetDraft()
    void loadTasks()
  },
)

const setStatus = (value: StatusFilter) => {
  statusFilter.value = value
  void loadTasks()
}

const onEdit = (task: Task) => {
  editingId.value = task.id
  draft.value = {
    id: task.id,
    name: task.name,
    description: task.description,
    completed: task.completed,
    requirementId: props.requirement?.id ?? task.requirementId,
  }
}

const onCancel = () => {
  resetDraft()
}

const onSave = async () => {
  const requirementId = props.requirement?.id
  if (!requirementId || !props.projectId || loading.value) return
  if (!draft.value.name.trim()) return

  draft.value.requirementId = requirementId

  const result = editingId.value
    ? await updateTask(editingId.value, draft.value)
    : await createTask(draft.value)

  if (!result.success) return

  resetDraft()
  await loadTasks()
}

const onComplete = async (task: Task) => {
  if (completingIds.value.includes(task.id)) return

  completingIds.value = [...completingIds.value, task.id]
  const result = await patchCompleted(task.id, !task.completed)
  completingIds.value = completingIds.value.filter((id) => id !== task.id)

  if (!result.success || !result.data) return

  const updated = result.data

  if (!matchesStatus(updated)) {
    tasks.value = tasks.value.filter((item) => item.id !== task.id)
    return
  }

  tasks.value = tasks.value.map((item) => item.id === task.id ? updated : item)
}

const onDelete = async (task: Task) => {
  const result = await deleteTask(task.id)
  if (!result.success) return

  tasks.value = tasks.value.filter((item) => item.id !== task.id)
  if (editingId.value === task.id) resetDraft()
}
</script>

<template>
  <ModalBase v-model="open" max-width="xl">
    <div class="p-4 md:p-5">
      <div class="mb-4 flex items-start justify-between gap-3">
        <h3 class="min-w-0 text-lg font-semibold text-gray-900 dark:text-white">
          <span class="material-symbols-outlined align-middle">task_alt</span>
          {{ requirement?.name }}
        </h3>
        <button
          type="button"
          class="inline-flex h-8 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
          title="Cerrar"
          aria-label="Cerrar"
          @click="open = false"
        >
          <span class="material-symbols-outlined" style="font-size: 1.1rem;">close</span>
        </button>
      </div>

      <div class="grid min-w-0 grid-cols-1 items-start gap-6 md:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
        <TaskForm
          v-model="draft"
          locked
          :requirements="[]"
          :saving="loading"
          @save="onSave"
          @cancel="onCancel"
        />

        <div class="flex min-w-0 flex-col gap-3">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              type="button"
              class="cursor-pointer rounded-lg border px-3 py-1 text-xs"
              :class="filterClass(statusFilter === option.value)"
              @click="setStatus(option.value)"
            >
              <span
                class="material-symbols-outlined align-middle"
                style="font-size: 14px;"
              >{{ option.icon }}</span>
              {{ option.label }}
            </button>
          </div>

          <TaskList
            :tasks="tasks"
            :completing-ids="completingIds"
            :pending="loading"
            empty-message="Aún no hay tareas"
            @complete="onComplete"
            @edit="onEdit"
            @delete="onDelete"
          />
        </div>
      </div>
    </div>
  </ModalBase>
</template>
