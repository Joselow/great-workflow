import { ref } from 'vue'

import apiApp from '@/utils/axios/apiApp'
import { successToast } from '@/composables/useAlerts'

import type { Requirement, RequirementCreatePayload } from '@/interfaces/requirement'
import type { ResponseComposables } from '@/interfaces/request'

export function useRequirement() {
  const loading = ref(false)
  const requirements = ref<Requirement[]>([])

  const getRequirements = async (
    projectId: string,
    meetingId?: string,
  ): Promise<ResponseComposables<Requirement[]>> => {
    loading.value = true

    try {
      const params: Record<string, string> = { projectId }
      if (meetingId) params.meetingId = meetingId

      const { data } = await apiApp.get<Requirement[]>('/requirement', { params })
      requirements.value = data
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const createRequirement = async (
    payload: RequirementCreatePayload,
    showMessage = true,
  ): Promise<ResponseComposables<Requirement>> => {
    loading.value = true

    try {
      const body: RequirementCreatePayload = {
        name: payload.name.trim(),
        projectId: payload.projectId,
      }
      if (payload.meetingId) body.meetingId = payload.meetingId

      const { data } = await apiApp.post<Requirement>('/requirement', body)
      if (showMessage) successToast('Requerimiento guardado')
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const updateRequirement = async (
    id: string,
    name: string, 
    showMessage = false,
  ): Promise<ResponseComposables<Requirement>> => {
    loading.value = true

    try {
      const { data } = await apiApp.put<Requirement>(`/requirement/${id}`, {
        name: name.trim(),
      })
      if (showMessage) successToast('Requerimiento actualizado')

      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const deleteRequirement = async (id: string, showMessage = false): Promise<ResponseComposables<null>> => {
    loading.value = true

    try {
      await apiApp.delete(`/requirement/${id}`)
      if (showMessage) successToast('Requerimiento eliminado')
      return { success: true }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    requirements,
    getRequirements,
    createRequirement,
    updateRequirement,
    deleteRequirement,
  }
}
