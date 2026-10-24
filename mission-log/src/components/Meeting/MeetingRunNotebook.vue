<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'

import { useRequirement } from '@/composables/useRequirement'
import { useTask } from '@/composables/useTask'

import type { Requirement } from '@/interfaces/requirement'
import type { Task } from '@/interfaces/task'
import { useToast } from '@/composables/useToast'

const props = defineProps<{
  meetingId: string
  projectId: string | null
  readonly?: boolean
  hideAdd?: boolean
  addOnRow?: boolean
}>()

const { requirements, getRequirements, createRequirement, updateRequirement, deleteRequirement } = useRequirement()
const { tasks, getTasks, createTask, updateTask, deleteTask } = useTask()
const { launchToast } = useToast()

const requirementDraft = ref('')
const looseDraft = ref('')
const taskDraft = ref('')
const saving = ref(false)
const ready = ref(false)
const editingRequirementId = ref<string | null>(null)
const editingRequirementName = ref('')
const editingTaskId = ref<string | null>(null)
const editingTaskName = ref('')
const taskComposerFor = ref<string | null>(null)
const looseComposerOpen = ref(false)
const requirementComposerOpen = ref(false)
const requirementInput = ref<HTMLInputElement | null>(null)

const showSuccessToast = () => {
  launchToast({
    msg: '<span class="material-symbols-outlined">check</span>',
    time: 1500,
    css: 'bg-transparent text-green-500 dark:text-green-500',
    html: true,
    showClose: false,
  })
}

  const focusEdit = (element: unknown) => {
  if (element instanceof HTMLInputElement) element.focus()
}

const byCreated = <T extends { id: string; createdAt: string }>(items: T[]) =>
  [...items].sort((left, right) => {
    const byDate = left.createdAt.localeCompare(right.createdAt)
    return byDate === 0 ? left.id.localeCompare(right.id) : byDate
  })

const orderedRequirements = computed(() => byCreated(requirements.value))
const orderedTasks = computed(() => byCreated(tasks.value))
const looseTasks = computed(() => orderedTasks.value.filter((task) => task.requirementId === null))

const tasksFor = (requirementId: string) =>
  orderedTasks.value.filter((task) => task.requirementId === requirementId)

const canEdit = computed(() => Boolean(props.projectId) && !props.readonly && ready.value)
const canAdd = computed(() => canEdit.value && !props.hideAdd)

const rememberTask = (task: Task) => {
  tasks.value = tasks.value.map((item) => (item.id === task.id ? task : item))
}

const focusComposerInput = (element: unknown) => {
  if (element instanceof HTMLInputElement) element.focus()
}

const openTaskComposer = (requirementId: string) => {
  looseComposerOpen.value = false
  taskComposerFor.value = requirementId
  taskDraft.value = ''
}

const openLooseComposer = () => {
  taskComposerFor.value = null
  looseComposerOpen.value = true
  looseDraft.value = ''
}

const openRequirementComposer = async () => {
  requirementComposerOpen.value = true
  requirementDraft.value = ''
  await nextTick()
  requirementInput.value?.focus()
}

const addRequirement = async () => {
  const name = requirementDraft.value.trim()
  if (!name || !props.projectId || saving.value) return

  saving.value = true
  const { success, data } = await createRequirement({
    name,
    projectId: props.projectId,
    meetingId: props.meetingId,
  }, false)
  saving.value = false
  if (!success || !data) return
  showSuccessToast()

  requirementDraft.value = ''
  requirements.value = [...requirements.value.filter((item) => item.id !== data.id), data]
  if (props.addOnRow) {
    requirementComposerOpen.value = false
    return
  }
  await nextTick()
  requirementInput.value?.focus()
}

const startEditRequirement = (requirement: Requirement) => {
  editingTaskId.value = null
  editingRequirementId.value = requirement.id
  editingRequirementName.value = requirement.name
}

const saveRequirement = async (requirement: Requirement) => {
  const name = editingRequirementName.value.trim()
  if (!name || saving.value) return
  if (name === requirement.name) {
    editingRequirementId.value = null
    return
  }

  saving.value = true
  const { success, data } = await updateRequirement(requirement.id, name, false)
  saving.value = false
  if (!success || !data) return
  showSuccessToast()

  requirements.value = requirements.value.map((item) => (item.id === data.id ? data : item))
  editingRequirementId.value = null
}



const removeRequirement = async (id: string) => {
  if (saving.value) return
  saving.value = true
  const { success } = await deleteRequirement(id, false)
  saving.value = false
  if (!success) return
  showSuccessToast()

  requirements.value = requirements.value.filter((item) => item.id !== id)
  if (taskComposerFor.value === id) taskComposerFor.value = null
}

const addRequirementTask = async (requirementId: string) => {
  const name = taskDraft.value.trim()
  if (!name || !props.projectId || saving.value) return

  saving.value = true
  const { success, data } = await createTask(
    {
      name,
      description: '',
      completed: false,
      requirementId,
    },
    { projectId: props.projectId, meetingId: props.meetingId },
    false,
  )
  saving.value = false
  if (!success || !data) return
  showSuccessToast()

  taskDraft.value = ''
  taskComposerFor.value = null
  tasks.value = [...tasks.value.filter((item) => item.id !== data.id), data]
}

const startEditTask = (task: Task) => {
  editingRequirementId.value = null
  editingTaskId.value = task.id
  editingTaskName.value = task.name
}

const saveTask = async (task: Task) => {
  const name = editingTaskName.value.trim()
  if (!name || saving.value) return
  if (name === task.name) {
    editingTaskId.value = null
    return
  }

  saving.value = true
  const { success, data } = await updateTask(task.id, {
      name,
      description: task.description,
      completed: task.completed,
      requirementId: task.requirementId,
    },
    false,
  )
  saving.value = false
  if (!success || !data) return
  showSuccessToast()

  rememberTask(data)
  editingTaskId.value = null
}

const removeTask = async (id: string) => {
  if (saving.value) return
  saving.value = true
  const { success } = await deleteTask(id, false)
  saving.value = false
  if (!success) return
  showSuccessToast()

  tasks.value = tasks.value.filter((item) => item.id !== id)
}

const addLooseTask = async () => {
  const name = looseDraft.value.trim()
  if (!name || !props.projectId || saving.value) return

  saving.value = true
  const { success, data } = await createTask(
    {
      name,
      description: '',
      completed: false,
      requirementId: null,
    },
    { projectId: props.projectId, meetingId: props.meetingId },
    false,
  )
  saving.value = false
  if (!success || !data) return
  showSuccessToast()

  looseDraft.value = ''
  looseComposerOpen.value = false
  tasks.value = [...tasks.value.filter((item) => item.id !== data.id), data]
}

onMounted(async () => {
  if (!props.projectId) return

  await Promise.all([
    getRequirements(props.projectId, props.meetingId),
    getTasks({ projectId: props.projectId, meetingId: props.meetingId }),
  ])
  ready.value = true
})
</script>

<template>
  <div v-if="projectId" class="space-y-3">
    <p class="text-sm font-semibold">Requerimientos</p>
    <div
      v-for="(requirement, index) in orderedRequirements"
      :key="requirement.id"
      class="space-y-2"
    >
      <div class="flex items-center gap-2">
        <div
          class="flex min-w-0 flex-1 items-center gap-1 rounded-md border 
          border-black/40 bg-white px-2 py-1 text-xs text-gray-800 transition-colors hover:border-gray-500 focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-400 dark:border-white/20 dark:bg-zinc-900 dark:text-gray-100 dark:hover:border-white/40 dark:focus-within:border-white"
        >
        <span class=" rounded-full text-gray-800 dark:text-white 
          text-center font-semibold mt-1 mr-1">
          {{ index + 1 }}.
        </span>
          <input
            v-if="editingRequirementId === requirement.id"
            v-model="editingRequirementName"
            type="text"
            maxlength="255"
            :ref="focusEdit"
            class="min-w-0 flex-1 bg-transparent text-xs outline-none"
            @keydown.enter.prevent="saveRequirement(requirement)"
            @keydown.esc.prevent="editingRequirementId = null"
          />
          <p v-else class="min-w-0 flex-1">{{ requirement.name }}</p>
          <button
            v-if="addOnRow && canAdd"
            type="button"
            class="inline-flex cursor-pointer rounded-md p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            aria-label="Agregar tarea del requerimiento"
            @click="openTaskComposer(requirement.id)"
          >
            <span class="material-symbols-outlined" style="font-size: 1rem;">add</span>
          </button>
          <button
            v-if="canEdit && editingRequirementId === requirement.id"
            type="button"
            class="inline-flex cursor-pointer rounded-md p-0.5 transition-colors
            bg-gray-200 px-1
            dark:bg-gray-800
            hover:bg-black/10 dark:hover:bg-white/10
              text-xs
            "
            aria-label="Guardar requerimiento"
            @click="saveRequirement(requirement)"
          >
            <span class="material-symbols-outlined mr-1" style="font-size: 1rem;">check</span>
            Actualizar
          </button>
          <button
            v-if="canEdit && editingRequirementId !== requirement.id"
            type="button"
            class="inline-flex cursor-pointer rounded-md p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            aria-label="Editar requerimiento"
            @click="startEditRequirement(requirement)"
          >
            <span class="material-symbols-outlined" style="font-size: 1rem;">edit</span>
          </button>
          <button
            v-if="canEdit"
            type="button"
            class="inline-flex cursor-pointer rounded-md p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            aria-label="Eliminar requerimiento"
            @click="removeRequirement(requirement.id)"
          >
            <span class="material-symbols-outlined" style="font-size: 1rem;">delete</span>
          </button>
        </div>
        <button
          v-if="canAdd && !addOnRow && taskComposerFor !== requirement.id"
          type="button"
          class="inline-flex h-7 shrink-0 cursor-pointer items-center rounded-md border border-black/15 bg-white px-2 text-xs font-semibold text-gray-700 transition-colors hover:border-gray-500 hover:bg-gray-50 dark:border-white/20 dark:bg-zinc-900 dark:text-gray-200 dark:hover:bg-white/10"
          @click="openTaskComposer(requirement.id)"
        >
          <span class="material-symbols-outlined " style="font-size: 1rem;">add</span>
          Tarea
        </button>
      </div>

      <div v-if="tasksFor(requirement.id).length || taskComposerFor === requirement.id" class="ms-6 space-y-2">
        <div
          v-for="task in tasksFor(requirement.id)"
          :key="task.id"
          class="flex items-center gap-2"
        >
          <div
            class="flex min-w-0 flex-1 items-center justify-center gap-1 rounded-md border border-black/30 bg-white px-2 py-1 text-xs text-gray-800 transition-colors hover:border-gray-500 focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-400 dark:border-white/20 dark:bg-zinc-900 dark:text-gray-100 dark:hover:border-white/40 dark:focus-within:border-white"
          >
          <span class="text-red-500 h-[7px] w-[7px] rounded-full bg-gray-800 dark:bg-gray-100 
          text-center font-bold mt-1 mr-[2px]"></span>
            <input
              v-if="editingTaskId === task.id"
              v-model="editingTaskName"
              type="text"
              maxlength="255"
              :ref="focusEdit"
              class="min-w-0 flex-1 bg-transparent text-xs outline-none"
              @keydown.enter.prevent="saveTask(task)"
              @keydown.esc.prevent="editingTaskId = null"
            />
            <p v-else class="min-w-0 flex-1">{{ task.name }}</p>
            <button
              v-if="addOnRow && canAdd"
              type="button"
              class="inline-flex cursor-pointer rounded-md p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
              aria-label="Agregar otra tarea"
              @click="openTaskComposer(requirement.id)"
            >
              <span class="material-symbols-outlined" style="font-size: 1rem;">add</span>
            </button>
            <button
              v-if="canEdit && editingTaskId === task.id"
              type="button"
              class="inline-flex cursor-pointer rounded-md p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
              aria-label="Guardar tarea"
              @click="saveTask(task)"
            >
              <span class="material-symbols-outlined" style="font-size: 1rem;">check</span>
              Actualizar
            </button>
            <button
              v-if="canEdit && editingTaskId !== task.id"
              type="button"
              class="inline-flex cursor-pointer rounded-md p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
              aria-label="Editar tarea"
              @click="startEditTask(task)"
            >
              <span class="material-symbols-outlined" style="font-size: 1rem;">edit</span>
            </button>
            <button
              v-if="canEdit"
              type="button"
              class="inline-flex cursor-pointer rounded-md p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
              aria-label="Eliminar tarea"
              @click="removeTask(task.id)"
            >
              <span class="material-symbols-outlined" style="font-size: 1rem;">delete</span>
            </button>
          </div>
          <button
            v-if="canAdd && !addOnRow"
            type="button"
            class="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-black/15 bg-white text-gray-700 transition-colors hover:border-gray-500 hover:bg-gray-50 dark:border-white/20 dark:bg-zinc-900 dark:text-gray-200 dark:hover:bg-white/10"
            aria-label="Agregar otra tarea"
            @click="openTaskComposer(requirement.id)"
          >
            <span class="material-symbols-outlined" style="font-size: 1rem;">add</span>
          </button>
        </div>
        <div v-if="canAdd && taskComposerFor === requirement.id" class="flex items-center gap-2">
          <input
            :ref="focusComposerInput"
            v-model="taskDraft"
            type="text"
            maxlength="255"
            placeholder="Agregar tarea"
            class="min-w-0 flex-1 rounded-md border border-black/15 bg-white px-2 py-1 text-xs text-gray-800 outline-none transition-colors hover:border-gray-500 focus:border-gray-900 focus:ring-1 focus:ring-gray-400 dark:border-white/20 dark:bg-zinc-900 dark:text-gray-100 dark:hover:border-white/40 dark:focus:border-white"
            @keydown.enter.prevent="addRequirementTask(requirement.id)"
            @keydown.esc.prevent="taskComposerFor = null"
          />
          <button
            type="button"
            class="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-black/15 bg-white text-gray-700 transition-colors hover:border-gray-500 hover:bg-gray-50 dark:border-white/20 dark:bg-zinc-900 dark:text-gray-200 dark:hover:bg-white/10"
            aria-label="Guardar tarea"
            @click="addRequirementTask(requirement.id)"
          >
            <span class="material-symbols-outlined" style="font-size: 1rem;">add</span>
          </button>
        </div>
      </div>
    </div>

    <div class="text-end"
    v-if="canAdd && addOnRow && !requirementComposerOpen"
    >
      <button
        
        type="button"
        class="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-black/15 bg-white text-gray-700 transition-colors hover:border-gray-500 hover:bg-gray-50 dark:border-white/20 dark:bg-zinc-900 dark:text-gray-200 dark:hover:bg-white/10"
        aria-label="Agregar requerimiento"
        @click="openRequirementComposer"
      >
        <span class="material-symbols-outlined" style="font-size: 1rem;">add</span>
      </button>
    </div>
    <div v-if="canAdd && (!addOnRow || requirementComposerOpen)" class="flex items-center gap-2">
      <input
        ref="requirementInput"
        v-model="requirementDraft"
        type="text"
        maxlength="255"
        placeholder="Requerimiento"
        class="min-w-0 flex-1 rounded-md 
        border border-[2px]  border-black/40 bg-white px-2 py-1 text-xs text-gray-800 outline-none transition-colors hover:border-gray-500 focus:border-gray-900 focus:ring-1 focus:ring-gray-400 dark:border-white/20 dark:bg-zinc-900 dark:text-gray-100 dark:hover:border-white/40 dark:focus:border-white"
        @keydown.enter.prevent="addRequirement"
        @keydown.esc.prevent="requirementComposerOpen = false"
      />
      <button
        type="button"
        class="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-black/15 bg-white text-gray-700 transition-colors hover:border-gray-500 hover:bg-gray-50 dark:border-white/20 dark:bg-zinc-900 dark:text-gray-200 dark:hover:bg-white/10"
        aria-label="Agregar requerimiento"
        @click="addRequirement"
      >
        <span class="material-symbols-outlined" style="font-size: 1rem;">add</span>
      </button>
    </div>

    <div class="space-y-2 pt-4">
      <p class="text-sm font-semibold">Tareas</p>
      <div
        v-for="(task, index) in looseTasks"
        :key="task.id"
        class="flex items-center gap-2"
      >
        <div
          class="flex min-w-0 flex-1 items-center gap-1 rounded-md border border-black/15 bg-white px-2 py-1 text-xs text-gray-800 transition-colors hover:border-gray-500 focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-400 dark:border-white/20 dark:bg-zinc-900 dark:text-gray-100 dark:hover:border-white/40 dark:focus-within:border-white"
        >
        <span class=" rounded-full text-gray-800 dark:text-gray-100 
          text-center font-semibold mt-1 mr-[2px]">
          {{ index + 1 }}.
        </span>
          <input
            v-if="editingTaskId === task.id"
            v-model="editingTaskName"
            type="text"
            maxlength="255"
            :ref="focusEdit"
              class="min-w-0 flex-1 bg-transparent text-xs outline-none"
            @keydown.enter.prevent="saveTask(task)"
            @keydown.esc.prevent="editingTaskId = null"
          />
          <p v-else class="min-w-0 flex-1">{{ task.name }}</p>
          <button
            v-if="addOnRow && canAdd"
            type="button"
            class="inline-flex cursor-pointer rounded-md p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            aria-label="Agregar otra tarea suelta"
            @click="openLooseComposer"
          >
            <span class="material-symbols-outlined" style="font-size: 1rem;">add</span>
          </button>
          <button
            v-if="canEdit && editingTaskId === task.id"
            type="button"
            class="inline-flex cursor-pointer rounded-md p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            aria-label="Guardar tarea"
            @click="saveTask(task)"
          >
            <span class="material-symbols-outlined" style="font-size: 1rem;">check</span>
            Actualizar
          </button>
          <button
            v-if="canEdit && editingTaskId !== task.id"
            type="button"
            class="inline-flex cursor-pointer rounded-md p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            aria-label="Editar tarea"
            @click="startEditTask(task)"
          >
            <span class="material-symbols-outlined" style="font-size: 1rem;">edit</span>
          </button>
          <button
            v-if="canEdit"
            type="button"
            class="inline-flex cursor-pointer rounded-md p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            aria-label="Eliminar tarea"
            @click="removeTask(task.id)"
          >
            <span class="material-symbols-outlined" style="font-size: 1rem;">delete</span>
          </button>
        </div>
        <button
          v-if="canAdd && !addOnRow"
          type="button"
          class="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-black/15 bg-white text-gray-700 transition-colors hover:border-gray-500 hover:bg-gray-50 dark:border-white/20 dark:bg-zinc-900 dark:text-gray-200 dark:hover:bg-white/10"
          aria-label="Agregar otra tarea suelta"
          @click="openLooseComposer"
        >
          <span class="material-symbols-outlined" style="font-size: 1rem;">add</span>
        </button>
      </div>
      <div v-if="canAdd && looseComposerOpen" class="flex items-center gap-2">
        <input
          :ref="focusComposerInput"
          v-model="looseDraft"
          type="text"
          maxlength="255"
          placeholder="Agregar tarea"
          class="min-w-0 flex-1 rounded-md border border-black/15 bg-white px-2 py-1 text-xs text-gray-800 outline-none transition-colors hover:border-gray-500 focus:border-gray-900 focus:ring-1 focus:ring-gray-400 dark:border-white/20 dark:bg-zinc-900 dark:text-gray-100 dark:hover:border-white/40 dark:focus:border-white"
          @keydown.enter.prevent="addLooseTask"
          @keydown.esc.prevent="looseComposerOpen = false"
        />
        <button
          type="button"
          class="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-black/15 bg-white text-gray-700 transition-colors hover:border-gray-500 hover:bg-gray-50 dark:border-white/20 dark:bg-zinc-900 dark:text-gray-200 dark:hover:bg-white/10"
          aria-label="Guardar tarea suelta"
          @click="addLooseTask"
        >
          <span class="material-symbols-outlined" style="font-size: 1rem;">add</span>
        </button>
      </div>
      <div
        v-else-if="canAdd && addOnRow && !looseTasks.length"
        class="text-end"
      >
        <button
          type="button"
          class="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-black/15 bg-white text-gray-700 transition-colors hover:border-gray-500 hover:bg-gray-50 dark:border-white/20 dark:bg-zinc-900 dark:text-gray-200 dark:hover:bg-white/10"
          aria-label="Agregar tarea"
          @click="openLooseComposer"
        >
          <span class="material-symbols-outlined" style="font-size: 1rem;">add</span>
        </button>
      </div>
      <button
        v-else-if="canAdd && !looseTasks.length"
        type="button"
        class="inline-flex cursor-pointer items-center rounded-md border border-black/15 px-2 py-1 text-xs font-semibold text-gray-700 transition-colors hover:border-gray-500 hover:bg-gray-50 dark:border-white/20 dark:bg-zinc-900 dark:text-gray-200 dark:hover:bg-white/10"
        @click="openLooseComposer"
      >
        <span class="material-symbols-outlined mr-1" style="font-size: 1rem;">add</span>
        Agregar tarea
      </button>
    </div>
  </div>
</template>
