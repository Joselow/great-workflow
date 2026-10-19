import { ref } from 'vue'

import apiApp from '@/utils/axios/apiApp'
import { successToast } from '@/composables/useAlerts'

import type { ActionTemplate, ActionTemplateWritePayload } from '@/interfaces/actionTemplate'
import type { ResponseComposables } from '@/interfaces/request'

export function useActionTemplate() {
  const loading = ref(false)
  const templates = ref<ActionTemplate[]>([])

  const getActionTemplates = async (): Promise<ResponseComposables<ActionTemplate[]>> => {
    loading.value = true

    try {
      const { data } = await apiApp.get<ActionTemplate[]>('/action-template')
      templates.value = data
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const createActionTemplate = async (
    payload: ActionTemplateWritePayload,
  ): Promise<ResponseComposables<ActionTemplate>> => {
    loading.value = true

    try {
      const { data } = await apiApp.post<ActionTemplate>('/action-template', payload)
      successToast('Acción guardada')
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const updateActionTemplate = async (
    id: number,
    payload: ActionTemplateWritePayload,
  ): Promise<ResponseComposables<ActionTemplate>> => {
    loading.value = true

    try {
      const { data } = await apiApp.put<ActionTemplate>(`/action-template/${id}`, payload)
      successToast('Acción actualizada')
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const deleteActionTemplate = async (id: number): Promise<ResponseComposables<null>> => {
    loading.value = true

    try {
      await apiApp.delete(`/action-template/${id}`)
      successToast('Acción eliminada')
      return { success: true }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    templates,
    getActionTemplates,
    createActionTemplate,
    updateActionTemplate,
    deleteActionTemplate,
  }
}
