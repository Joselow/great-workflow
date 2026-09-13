import { ref } from 'vue'

import apiApp from '@/utils/axios/apiApp'
import api from '@/utils/axios/api'

import { successToast } from '@/composables/useAlerts'

import type { Card, CardListFilters, CardListResponse, CardWritePayload, PublicCard } from '@/interfaces/card'
import type { ResponseComposables } from '@/interfaces/request'

export function useCard() {
  const loading = ref(false)

  const createCard = async (payload: CardWritePayload): Promise<ResponseComposables<Card>> => {
    loading.value = true

    try {
      const { data } = await apiApp.post('/card', payload)
      successToast('Card guardada')
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const getCardById = async (id: string): Promise<ResponseComposables<Card>> => {
    loading.value = true

    try {
      const { data } = await apiApp.get(`/card/${id}`)
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const updateCard = async (id: string, payload: CardWritePayload): Promise<ResponseComposables<Card>> => {
    loading.value = true

    try {
      const { data } = await apiApp.put(`/card/${id}`, payload)
      successToast('Card actualizada')
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const getCards = async (filters: CardListFilters = {}): Promise<ResponseComposables<CardListResponse>> => {
    loading.value = true

    try {
      const params: Record<string, string | number> = {}

      if (filters.q) params.q = filters.q
      if (filters.projectId !== undefined) params.projectId = filters.projectId
      if (filters.isPrompt !== undefined) params.isPrompt = String(filters.isPrompt)
      if (filters.flMeeting !== undefined) params.flMeeting = String(filters.flMeeting)
      if (filters.page !== undefined) params.page = filters.page
      if (filters.limit !== undefined) params.limit = filters.limit

      const { data } = await apiApp.get('/card', { params })
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const getPublicCard = async (id: string): Promise<ResponseComposables<PublicCard>> => {
    loading.value = true

    try {
      const { data } = await api.get(`/public/card/${id}`)
      return { success: true, data }
    } catch {
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    createCard,
    getCardById,
    getCards,
    updateCard,
    getPublicCard,
  }
}
