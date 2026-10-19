<script setup lang="ts">
import { ref, watch } from 'vue'

import CommonLoader from '@/commons/CommonLoader.vue'
import RequirementForm from '@/components/Requirement/RequirementForm.vue'
import RequirementList from '@/components/Requirement/RequirementList.vue'
import RequirementTasksModal from '@/components/Requirement/RequirementTasksModal.vue'

import { useRequirement } from '@/composables/useRequirement'
import { projectStore } from '@/store/projectStore'

import type { Requirement, RequirementDraft } from '@/interfaces/requirement'

const { activeProject } = projectStore
const {
  loading,
  requirements,
  getRequirements,
  createRequirement,
  updateRequirement,
  deleteRequirement,
} = useRequirement()

const draft = ref<RequirementDraft>({ name: '' })
const selectedId = ref<string | null>(null)
const taskRequirement = ref<Requirement | null>(null)
const tasksOpen = ref(false)

watch(
  () => activeProject.value?.id,
  (projectId) => {
    draft.value = { name: '' }
    selectedId.value = null
    tasksOpen.value = false
    taskRequirement.value = null

    if (!projectId) {
      requirements.value = []
      return
    }

    void getRequirements(projectId)
  },
  { immediate: true },
)

const onSelect = (requirement: Requirement) => {
  selectedId.value = requirement.id
  draft.value = { id: requirement.id, name: requirement.name }
}

const onOpenTasks = (requirement: Requirement) => {
  taskRequirement.value = requirement
  tasksOpen.value = true
}

const onTasksOpen = (isOpen: boolean) => {
  tasksOpen.value = isOpen
  if (!isOpen) taskRequirement.value = null
}

const onSaveRequirement = async () => {
  const projectId = activeProject.value?.id
  if (!projectId || loading.value) return
  if (!draft.value.name.trim()) return

  if (selectedId.value) {
    const result = await updateRequirement(selectedId.value, draft.value.name)
    if (!result.success || !result.data) return
    draft.value = { name: result.data.name }
    if (taskRequirement.value?.id === selectedId.value) {
      taskRequirement.value = result.data
    }
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
  }

  if (taskRequirement.value?.id === requirement.id) {
    tasksOpen.value = false
    taskRequirement.value = null
  }

  const projectId = activeProject.value?.id
  if (projectId) await getRequirements(projectId)
}
</script>

<template>
  <div class="min-w-0 max-w-full overflow-x-hidden">
    <CommonLoader v-if="loading" />

    <div class="mx-auto flex w-full min-w-0 max-w-4xl flex-col gap-4">
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
          @tasks="onOpenTasks"
          @delete="onDeleteRequirement"
        />

        <RequirementTasksModal
          :model-value="tasksOpen"
          :requirement="taskRequirement"
          :project-id="activeProject.id"
          @update:model-value="onTasksOpen"
        />
      </template>
    </div>
  </div>
</template>
