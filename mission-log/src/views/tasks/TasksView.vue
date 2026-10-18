<script setup lang="ts">
import { ref, watch } from 'vue'

import CommonLoader from '@/commons/CommonLoader.vue'
import TaskForm from '@/components/Task/TaskForm.vue'
import TaskList from '@/components/Task/TaskList.vue'

import { useRequirement } from '@/composables/useRequirement'
import { useTask } from '@/composables/useTask'
import { projectStore } from '@/store/projectStore'

import { emptyTaskDraft, type Task, type TaskDraft, type TaskListFilters } from '@/interfaces/task'

type StatusFilter = 'all' | 'pending' | 'done'
type RequirementFilter = 'all' | 'none' | string

const { activeProject } = projectStore
const { loading: requirementsLoading, requirements, getRequirements } = useRequirement()
const { loading, tasks, getTasks, createTask, updateTask, patchCompleted, deleteTask } = useTask()

const draft = ref<TaskDraft>(emptyTaskDraft())
const editingId = ref<string | null>(null)
const completingIds = ref<string[]>([])
const statusFilter = ref<StatusFilter>('all')
const requirementFilter = ref<RequirementFilter>('all')

const statusOptions: { value: StatusFilter; label: string; icon: string }[] = [
  { value: 'all', label: 'Todos', icon: 'list_alt' },
  { value: 'pending', label: 'Pendientes', icon: 'radio_button_unchecked' },
  { value: 'done', label: 'Completadas', icon: 'check_circle' },
]

const taskFilters = (projectId: string): TaskListFilters => {
  const filters: TaskListFilters = { projectId }

  if (statusFilter.value === 'pending') filters.completed = false
  if (statusFilter.value === 'done') filters.completed = true
  if (requirementFilter.value === 'none') filters.requirementId = null
  else if (requirementFilter.value !== 'all') filters.requirementId = requirementFilter.value

  return filters
}

const matchesFilters = (task: Task) => {
  if (statusFilter.value === 'pending' && task.completed) return false
  if (statusFilter.value === 'done' && !task.completed) return false
  if (requirementFilter.value === 'none' && task.requirementId !== null) return false
  if (requirementFilter.value !== 'all' && requirementFilter.value !== 'none' && task.requirementId !== requirementFilter.value) {
    return false
  }
  return true
}

const loadTasks = async (projectId: string) => {
  await getTasks(taskFilters(projectId))
}

const resetDraft = () => {
  editingId.value = null
  draft.value = emptyTaskDraft()
}

watch(
  () => activeProject.value?.id,
  (projectId) => {
    resetDraft()
    statusFilter.value = 'all'
    requirementFilter.value = 'all'
    completingIds.value = []

    if (!projectId) {
      tasks.value = []
      requirements.value = []
      return
    }

    void getRequirements(projectId)
    void loadTasks(projectId)
  },
  { immediate: true },
)

const setStatus = (value: StatusFilter) => {
  statusFilter.value = value
  const projectId = activeProject.value?.id
  if (!projectId) return
  void loadTasks(projectId)
}

const setRequirement = (value: RequirementFilter) => {
  requirementFilter.value = value
  const projectId = activeProject.value?.id
  if (!projectId) return
  void loadTasks(projectId)
}

const onEdit = (task: Task) => {
  editingId.value = task.id
  draft.value = {
    id: task.id,
    name: task.name,
    description: task.description,
    completed: task.completed,
    requirementId: task.requirementId,
  }
}

const onSave = async () => {
  const projectId = activeProject.value?.id
  if (!projectId || loading.value) return
  if (!draft.value.name.trim()) return

  if (editingId.value) {
    const result = await updateTask(editingId.value, draft.value)
    if (!result.success) return
    resetDraft()
  } else {
    const result = await createTask(draft.value, { projectId })
    if (!result.success) return
    resetDraft()
  }

  await loadTasks(projectId)
}

const onComplete = async (task: Task) => {
  if (completingIds.value.includes(task.id)) return

  completingIds.value = [...completingIds.value, task.id]
  const result = await patchCompleted(task.id, !task.completed)
  completingIds.value = completingIds.value.filter((id) => id !== task.id)

  if (!result.success || !result.data) return

  const updated = result.data

  if (!matchesFilters(updated)) {
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

const filterClass = (active: boolean) => active
  ? 'border-brand-orange bg-brand-orange text-white'
  : 'border-black/10 bg-white text-gray-600 dark:border-white/15 dark:bg-white/5 dark:text-gray-200'
</script>

<template>
  <div class="min-w-0 max-w-6xl overflow-x-hidden m-auto">
    <CommonLoader v-if="loading || requirementsLoading" />

    <div class="mx-auto flex w-full min-w-0 flex-col gap-4">
      <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
        <span class="material-symbols-outlined align-middle">task</span>
        Tareas
      </h1>

      <p v-if="!activeProject?.id" class="text-sm text-gray-500 dark:text-gray-400">
        Selecciona un proyecto para ver las tareas.
      </p>

      <div
        v-else
        class="grid min-w-0 grid-cols-1 items-start gap-10 md:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]"
      >
        <TaskForm
          v-model="draft"
          :requirements="requirements"
          :saving="loading"
          @save="onSave"
        />

        <div class="flex min-w-0 flex-col gap-3">
          <div class="flex flex-col gap-2">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="option in statusOptions"
                :key="option.value"
                type="button"
                class="cursor-pointer rounded-lg border px-3 py-1 text-xs 
                "
                :class="filterClass(statusFilter === option.value)"
                @click="setStatus(option.value)"
              >
                <span class="material-symbols-outlined align-middle"
                  style="font-size: 14px;"
                >{{ option.icon }}</span>
                {{ option.label }}
              </button>
            </div>

            <!-- <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="cursor-pointer rounded-lg border px-3 py-1 text-xs font-semibold"
                :class="filterClass(requirementFilter === 'all')"
                @click="setRequirement('all')"
              >
                Todos
              </button>
              <button
                type="button"
                class="cursor-pointer rounded-lg border px-3 py-1 text-xs font-semibold"
                :class="filterClass(requirementFilter === 'none')"
                @click="setRequirement('none')"
              >
                Sin requerimiento
              </button>
              <button
                v-for="requirement in requirements"
                :key="requirement.id"
                type="button"
                class="cursor-pointer rounded-lg border px-3 py-1 text-xs font-semibold"
                :class="filterClass(requirementFilter === requirement.id)"
                @click="setRequirement(requirement.id)"
              >
                {{ requirement.name }}
              </button>
            </div> -->
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
  </div>
</template>
