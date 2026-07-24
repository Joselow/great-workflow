import { ref } from 'vue'
import api from '@/utils/axios.ts'

import { setAuthToken, deleteAuthToken, getAuthToken } from '../utils/cookies'
import { authStore } from '../store/authStore'

import type { LoginCredentials, LoginResponse, User } from '../interfaces'

export function useAuth() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.post<LoginResponse>('/login', credentials)

      
      const { user: userData, token } = data

      setAuthToken(token)
      authStore.setUser(userData)

      

      return true
    } catch (err: any) {      
      error.value = err.response?.data?.message || 'Error al iniciar sesión'
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    deleteAuthToken()
    authStore.setLogout()
    window.location.href = '/login'
  }

  const fetchMe = async (): Promise<boolean> => {
    const token = getAuthToken()
    if (!token) return false

    try {
      const { data } = await api.get<User>('/me')
      const userData = data
      authStore.setUser(userData)
      return true
    } catch (err) {
      deleteAuthToken()
      authStore.setLogout()
      return false
    }
  }

  return {
    loading,
    error,
    login,
    logout,
    fetchMe
  }
}
