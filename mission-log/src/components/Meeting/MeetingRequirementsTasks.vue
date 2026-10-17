<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import RequirementForm from '@/components/Requirement/RequirementForm.vue'
import RequirementList from '@/components/Requirement/RequirementList.vue'
import TaskForm from '@/components/Task/TaskForm.vue'
import TaskList from '@/components/Task/TaskList.vue'

import { useRequirement } from '@/composables/useRequirement'
import { useTask } from '@/composables/useTask'

import type { Requirement, RequirementDraft } from '@/interfaces/requirement'
import { emptyTaskDraft, type Task, type TaskDraft } from '@/interfaces/task'

const props = defineProps<{
  meetingId: string
  projectId: string
}>()

const {
  loading: requirementsLoading,
  requirements,
  getRequirements,
  createRequirement,
  updateRequirement,
  deleteRequirement,
} = useRequirement()

const {
  loading: meetingTasksLoading,
  tasks: meetingTasks,
  getTasks: getMeetingTasks,
  createTask,
  updateTask,
  deleteTask,
  patchCompleted,
} = useTask()

const {
  loading: requirementTasksLoading,
  tasks: requirementTasks,
  getTasks: getRequirementTasks,
} = useTask()

const requirementDraft = ref<RequirementDraft>({ name: '' })
const selectedRequirementId = ref<string | null>(null)
const requirementTaskDraft = ref<TaskDraft>(emptyTaskDraft())
const meetingTaskDraft = ref<TaskDraft>(emptyTaskDraft())
const editingRequirementTaskId = ref<string | null>(null)
const editingMeetingTaskId = ref<string | null>(null)
const completingIds = ref<string[]>([])

const selectedRequirement = computed(() =>
  requirements.value.find((requirement) => requirement.id === selectedRequirementId.value) ?? null,
)

const loading = computed(() =>
  requirementsLoading.value || meetingTasksLoading.value || requirementTasksLoading.value,
)

const refreshTasks = async () => {
  await getMeetingTasks({
    projectId: props.projectId,
    meetingId: props.meetingId,
  })

  if (!selectedRequirementId.value) {
    requirementTasks.value = []
    return
  }

  await getRequirementTasks({
    projectId: props.projectId,
    requirementId: selectedRequirementId.value,
  })
}

const loadAll = async () => {
  await Promise.all([
    getRequirements(props.projectId, props.meetingId),
    getMeetingTasks({
      projectId: props.projectId,
      meetingId: props.meetingId,
    }),
  ])

  if (selectedRequirementId.value) {
    await getRequirementTasks({
      projectId: props.projectId,
      requirementId: selectedRequirementId.value,
    })
  }
}

watch(
  () => [props.meetingId, props.projectId] as const,
  () => {
    requirementDraft.value = { name: '' }
    selectedRequirementId.value = null
    requirementTaskDraft.value = emptyTaskDraft()
    meetingTaskDraft.value = emptyTaskDraft()
    editingRequirementTaskId.value = null
    editingMeetingTaskId.value = null
    completingIds.value = []
    void loadAll()
  },
  { immediate: true },
)

const onSelectRequirement = (requirement: Requirement) => {
  selectedRequirementId.value = requirement.id
  requirementDraft.value = { name: requirement.name }
  editingRequirementTaskId.value = null
  requirementTaskDraft.value = emptyTaskDraft(requirement.id)
  requirementTasks.value = []
  void getRequirementTasks({
    projectId: props.projectId,
    requirementId: requirement.id,
  })
}

const onSaveRequirement = async () => {
  if (requirementsLoading.value || !requirementDraft.value.name.trim()) return

  if (selectedRequirementId.value) {
    const result = await updateRequirement(selectedRequirementId.value, requirementDraft.value.name)
    if (!result.success || !result.data) return
    requirementDraft.value = { name: result.data.name }
  } else {
    const result = await createRequirement({
      name: requirementDraft.value.name,
      projectId: props.projectId,
      meetingId: props.meetingId,
    })
    if (!result.success) return
    requirementDraft.value = { name: '' }
  }

  await getRequirements(props.projectId, props.meetingId)
}

const onDeleteRequirement = async (requirement: Requirement) => {
  const result = await deleteRequirement(requirement.id)
  if (!result.success) return

  if (selectedRequirementId.value === requirement.id) {
    selectedRequirementId.value = null
    requirementDraft.value = { name: '' }
    editingRequirementTaskId.value = null
    requirementTaskDraft.value = emptyTaskDraft()
  }

  await getRequirements(props.projectId, props.meetingId)
  await refreshTasks()
}

const onSaveRequirementTask = async () => {
  const requirement = selectedRequirement.value
  if (!requirement || meetingTasksLoading.value) return
  if (!requirementTaskDraft.value.name.trim()) return

  requirementTaskDraft.value.requirementId = requirement.id

  const result = editingRequirementTaskId.value
    ? await updateTask(editingRequirementTaskId.value, requirementTaskDraft.value)
    : await createTask(requirementTaskDraft.value)

  if (!result.success) return

  editingRequirementTaskId.value = null
  requirementTaskDraft.value = emptyTaskDraft(requirement.id)
  await refreshTasks()
}

const onSaveMeetingTask = async () => {
  if (meetingTasksLoading.value || !meetingTaskDraft.value.name.trim()) return

  const result = editingMeetingTaskId.value
    ? await updateTask(editingMeetingTaskId.value, meetingTaskDraft.value)
    : await createTask(meetingTaskDraft.value, {
        projectId: props.projectId,
        meetingId: props.meetingId,
      })

  if (!result.success) return

  editingMeetingTaskId.value = null
  meetingTaskDraft.value = emptyTaskDraft()
  await refreshTasks()
}

const onEditRequirementTask = (task: Task) => {
  editingRequirementTaskId.value = task.id
  requirementTaskDraft.value = {
    name: task.name,
    description: task.description,
    completed: task.completed,
    requirementId: selectedRequirement.value?.id ?? task.requirementId,
  }
}

const onEditMeetingTask = (task: Task) => {
  editingMeetingTaskId.value = task.id
  meetingTaskDraft.value = {
    name: task.name,
    description: task.description,
    completed: task.completed,
    requirementId: task.requirementId,
  }
}

const onComplete = async (task: Task) => {
  if (completingIds.value.includes(task.id)) return

  completingIds.value = [...completingIds.value, task.id]
  const result = await patchCompleted(task.id, !task.completed)
  completingIds.value = completingIds.value.filter((id) => id !== task.id)
  if (!result.success) return
  await refreshTasks()
}

const onDeleteTask = async (task: Task) => {
  const result = await deleteTask(task.id)
  if (!result.success) return

  if (editingRequirementTaskId.value === task.id) {
    editingRequirementTaskId.value = null
    requirementTaskDraft.value = emptyTaskDraft(selectedRequirement.value?.id ?? null)
  }

  if (editingMeetingTaskId.value === task.id) {
    editingMeetingTaskId.value = null
    meetingTaskDraft.value = emptyTaskDraft()
  }

  await refreshTasks()
}
</script>

<template>
  <section class="mt-8 flex flex-col gap-8">
    <div v-if="loading" class="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <span class="inline-block size-4 animate-spin rounded-full border-2 border-brand-orange border-b-transparent" />
      Cargando
    </div>

    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Requerimientos</h3>

      <RequirementForm
        v-model="requirementDraft"
        :saving="requirementsLoading"
        @save="onSaveRequirement"
      />

      <RequirementList
        :requirements="requirements"
        :selected-id="selectedRequirementId"
        :pending="requirementsLoading"
        empty-message="Aún no hay requerimientos"
        @select="onSelectRequirement"
        @delete="onDeleteRequirement"
      />

      <div
        v-if="selectedRequirement"
        class="flex flex-col gap-3 rounded-xl border border-black/10 p-3 dark:border-white/15"
      >
        <h4 class="text-sm font-semibold text-gray-800 dark:text-gray-100">
          Tareas de {{ selectedRequirement.name }}
        </h4>

        <TaskForm
          v-model="requirementTaskDraft"
          locked
          :requirements="[]"
          :saving="meetingTasksLoading"
          @save="onSaveRequirementTask"
        />

        <TaskList
          :tasks="requirementTasks"
          :completing-ids="completingIds"
          :pending="requirementTasksLoading"
          empty-message="Aún no hay tareas"
          @complete="onComplete"
          @edit="onEditRequirementTask"
          @delete="onDeleteTask"
        />
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Tareas</h3>

      <TaskForm
        v-model="meetingTaskDraft"
        :requirements="requirements"
        :saving="meetingTasksLoading"
        @save="onSaveMeetingTask"
      />

      <TaskList
        :tasks="meetingTasks"
        :completing-ids="completingIds"
        :pending="meetingTasksLoading"
        empty-message="Aún no hay tareas"
        @complete="onComplete"
        @edit="onEditMeetingTask"
        @delete="onDeleteTask"
      />
    </div>
  </section>
</template>
