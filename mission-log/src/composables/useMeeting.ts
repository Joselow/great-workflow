import { ref } from 'vue'

import apiApp from '@/utils/axios/apiApp'
import { successToast } from '@/composables/useAlerts'

import type {
  Meeting,
  MeetingListFilters,
  MeetingListResponse,
  MeetingQualificationPayload,
  MeetingWritePayload,
} from '@/interfaces/meeting'

import type { ResponseComposables } from '@/interfaces/request'

export function useMeeting() {
  const loading = ref(false)

  const createMeeting = async (payload: MeetingWritePayload): Promise<ResponseComposables<Meeting>> => {
    loading.value = true

    try {
      const { data } = await apiApp.post('/meeting', payload)
      successToast('Reunión guardada')
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const getMeetingById = async (id: string): Promise<ResponseComposables<Meeting>> => {
    loading.value = true

    try {
      const { data } = await apiApp.get(`/meeting/${id}`)
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const updateMeeting = async (
    id: string,
    payload: MeetingWritePayload,
  ): Promise<ResponseComposables<Meeting>> => {
    loading.value = true

    try {
      const { data } = await apiApp.put(`/meeting/${id}`, payload)
      successToast('Reunión actualizada')
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const getMeetings = async (
    filters: MeetingListFilters = {},
  ): Promise<ResponseComposables<MeetingListResponse>> => {
    loading.value = true

    try {
      const params: Record<string, string | number> = {}

      if (filters.projectId !== undefined) params.projectId = filters.projectId
      if (filters.from) params.from = filters.from
      if (filters.to) params.to = filters.to
      if (filters.page !== undefined) params.page = filters.page
      if (filters.limit !== undefined) params.limit = filters.limit

      const { data } = await apiApp.get('/meeting', { params })
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const qualifyMeeting = async (
    id: string,
    payload: MeetingQualificationPayload,
  ): Promise<ResponseComposables<Meeting>> => {
    loading.value = true

    try {
      const { data } = await apiApp.put(`/meeting/${id}`, {
        objectiveAchieved: payload.objectiveAchieved,
        summary: payload.summary,
        lessons: payload.lessons,
      })
      successToast('Reunión calificada')
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const deleteMeeting = async (id: string): Promise<ResponseComposables<null>> => {
    loading.value = true

    try {
      await apiApp.delete(`/meeting/${id}`)
      successToast('Reunión eliminada')
      return { success: true }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    createMeeting,
    getMeetingById,
    getMeetings,
    updateMeeting,
    qualifyMeeting,
    deleteMeeting,
  }
}
