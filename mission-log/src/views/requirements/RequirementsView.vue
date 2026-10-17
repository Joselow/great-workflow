<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import CommonLoader from '@/commons/CommonLoader.vue'
import RequirementForm from '@/components/Requirement/RequirementForm.vue'
import RequirementList from '@/components/Requirement/RequirementList.vue'
import TaskForm from '@/components/Task/TaskForm.vue'
import TaskList from '@/components/Task/TaskList.vue'

import { useRequirement } from '@/composables/useRequirement'
import { useTask } from '@/composables/useTask'
import { projectStore } from '@/store/projectStore'

import type { Requirement, RequirementDraft } from '@/interfaces/requirement'
import { emptyTaskDraft, type Task, type TaskDraft } from '@/interfaces/task'

const { activeProject } = projectStore
const {
  loading,
  requirements,
  getRequirements,
  createRequirement,
  updateRequirement,
  deleteRequirement,
} = useRequirement()
const {
  loading: tasksLoading,
  tasks,
  getTasks,
  createTask,
  updateTask,
  patchCompleted,
  deleteTask,
} = useTask()

const draft = ref<RequirementDraft>({ name: '' })
const selectedId = ref<string | null>(null)
const taskDraft = ref<TaskDraft>(emptyTaskDraft())
const editingTaskId = ref<string | null>(null)
const completingIds = ref<string[]>([])

const selected = computed(() =>
  requirements.value.find((requirement) => requirement.id === selectedId.value) ?? null,
)

const resetTaskDraft = (requirementId: string | null) => {
  editingTaskId.value = null
  taskDraft.value = emptyTaskDraft(requirementId)
}

watch(
  () => activeProject.value?.id,
  (projectId) => {
    draft.value = { name: '' }
    selectedId.value = null
    resetTaskDraft(null)
    completingIds.value = []

    if (!projectId) {
      requirements.value = []
      tasks.value = []
      return
    }

    void getRequirements(projectId)
  },
  { immediate: true },
)

const onSelect = (requirement: Requirement) => {
  selectedId.value = requirement.id
  draft.value = { name: requirement.name }
  resetTaskDraft(requirement.id)
  const projectId = activeProject.value?.id
  if (!projectId) return
  void getTasks({ projectId, requirementId: requirement.id })
}

const onSaveRequirement = async () => {
  const projectId = activeProject.value?.id
  if (!projectId || loading.value) return
  if (!draft.value.name.trim()) return

  if (selectedId.value) {
    const result = await updateRequirement(selectedId.value, draft.value.name)
    if (!result.success || !result.data) return
    draft.value = { name: result.data.name }
  } else {
    const result = await createRequirement({
      name: draft.value.name,
      projectId,
    })
    if (!result.success) return
    draft.value = { name: '' }
  }

  await getRequirements(projectId)
}

const onDeleteRequirement = async (requirement: Requirement) => {
  const result = await deleteRequirement(requirement.id)
  if (!result.success) return

  if (selectedId.value === requirement.id) {
    selectedId.value = null
    draft.value = { name: '' }
    resetTaskDraft(null)
    tasks.value = []
  }

  const projectId = activeProject.value?.id
  if (projectId) await getRequirements(projectId)
}

const onSaveTask = async () => {
  const requirement = selected.value
  const projectId = activeProject.value?.id
  if (!requirement || !projectId || tasksLoading.value) return
  if (!taskDraft.value.name.trim()) return

  taskDraft.value.requirementId = requirement.id

  const result = editingTaskId.value
    ? await updateTask(editingTaskId.value, taskDraft.value)
    : await createTask(taskDraft.value)

  if (!result.success) return

  resetTaskDraft(requirement.id)
  await getTasks({ projectId, requirementId: requirement.id })
}

const onEditTask = (task: Task) => {
  editingTaskId.value = task.id
  taskDraft.value = {
    name: task.name,
    description: task.description,
    completed: task.completed,
    requirementId: selected.value?.id ?? task.requirementId,
  }
}

const onCompleteTask = async (task: Task) => {
  if (completingIds.value.includes(task.id)) return

  completingIds.value = [...completingIds.value, task.id]
  const result = await patchCompleted(task.id, !task.completed)
  completingIds.value = completingIds.value.filter((id) => id !== task.id)

  if (!result.success || !result.data) return
  const updated = result.data
  tasks.value = tasks.value.map((item) => item.id === task.id ? updated : item)
}

const onDeleteTask = async (task: Task) => {
  const requirement = selected.value
  const projectId = activeProject.value?.id
  const result = await deleteTask(task.id)
  if (!result.success || !requirement || !projectId) return

  if (editingTaskId.value === task.id) resetTaskDraft(requirement.id)
  await getTasks({ projectId, requirementId: requirement.id })
}
</script>

<template>
  <div class="min-w-0 max-w-full overflow-x-hidden">
    <CommonLoader v-if="loading || tasksLoading" />

    <div class="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-4">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Requerimientos</h2>

      <p v-if="!activeProject?.id" class="text-sm text-gray-500 dark:text-gray-400">
        Selecciona un proyecto para ver los requerimientos.
      </p>

      <template v-else>
        <RequirementForm
          v-model="draft"
          :saving="loading"
          @save="onSaveRequirement"
        />

        <RequirementList
          :requirements="requirements"
          :selected-id="selectedId"
          :pending="loading"
          empty-message="Aún no hay requerimientos"
          @select="onSelect"
          @delete="onDeleteRequirement"
        />

        <div
          v-if="selected"
          class="flex flex-col gap-3 rounded-xl border border-black/10 p-3 dark:border-white/15"
        >
          <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Tareas de {{ selected.name }}
          </h3>

          <TaskForm
            v-model="taskDraft"
            locked
            :requirements="[]"
            :saving="tasksLoading"
            @save="onSaveTask"
          />

          <TaskList
            :tasks="tasks"
            :completing-ids="completingIds"
            :pending="tasksLoading"
            empty-message="Aún no hay tareas"
            @complete="onCompleteTask"
            @edit="onEditTask"
            @delete="onDeleteTask"
          />
        </div>
      </template>
    </div>
  </div>
</template>
