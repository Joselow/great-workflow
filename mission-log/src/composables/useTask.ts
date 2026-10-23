import { ref } from 'vue'

import apiApp from '@/utils/axios/apiApp'
import { successToast } from '@/composables/useAlerts'

import type { Task, TaskCreateOrigin, TaskDraft, TaskListFilters } from '@/interfaces/task'
import type { ResponseComposables } from '@/interfaces/request'

export function useTask() {
  const loading = ref(false)
  const tasks = ref<Task[]>([])

  const getTasks = async (filters: TaskListFilters): Promise<ResponseComposables<Task[]>> => {
    loading.value = true

    try {
      const params: Record<string, string> = { projectId: filters.projectId }

      if (filters.meetingId) params.meetingId = filters.meetingId
      if (filters.requirementId === null) params.requirementId = 'null'
      else if (filters.requirementId) params.requirementId = filters.requirementId
      if (filters.completed !== undefined) params.completed = String(filters.completed)

      const { data } = await apiApp.get<Task[]>('/task', { params })
      tasks.value = data
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const createTask = async (
    draft: TaskDraft,
    origin: TaskCreateOrigin = {},
    showMessage = true,
  ): Promise<ResponseComposables<Task>> => {
    loading.value = true

    try {
      const body: {
        name: string
        description: string
        completed: boolean
        requirementId?: string
        projectId?: string
        meetingId?: string
      } = {
        name: draft.name.trim(),
        description: draft.description,
        completed: draft.completed,
      }

      if (draft.requirementId) {
        body.requirementId = draft.requirementId
      } else {
        if (origin.projectId) body.projectId = origin.projectId
        if (origin.meetingId) body.meetingId = origin.meetingId
      }

      const { data } = await apiApp.post<Task>('/task', body)
      if (showMessage) successToast('Tarea guardada')
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const updateTask = async (id: string, draft: TaskDraft, showMessage = true): Promise<ResponseComposables<Task>> => {
    loading.value = true

    try {
      const { data } = await apiApp.put<Task>(`/task/${id}`, {
        name: draft.name.trim(),
        description: draft.description,
        completed: draft.completed,
        requirementId: draft.requirementId,
      })
      if (showMessage) successToast('Tarea actualizada')
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const patchCompleted = async (
    id: string,
    completed: boolean,
  ): Promise<ResponseComposables<Task>> => {
    try {
      const { data } = await apiApp.patch<Task>(`/task/${id}`, { completed })
      successToast('Tarea actualizada')
      return { success: true, data }
    } catch {
      return { success: false }
    }
  }

  const deleteTask = async (id: string, showMessage = true): Promise<ResponseComposables<null>> => {
    loading.value = true

    try {
      await apiApp.delete(`/task/${id}`)
      if (showMessage) successToast('Tarea eliminada')
      return { success: true }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    tasks,
    getTasks,
    createTask,
    updateTask,
    patchCompleted,
    deleteTask,
  }
}
