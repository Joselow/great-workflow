import { ref } from 'vue'
import api from '@/utils/axios.ts'

import { setAuthToken, deleteAuthToken, getAuthToken } from '../utils/cookies'
import { authStore } from '../store/authStore'

import type { LoginCredentials, LoginResponse, RegisterCredentials, User } from '../interfaces/auth'

export function useAuth() {
  const route = '/auth'
  const loading = ref(false)
  const error = ref<string | null>(null)

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.post<LoginResponse>(route+'/login', credentials)

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

  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.post<LoginResponse>(route+'/register', credentials)

      const { user: userData, token } = data

      setAuthToken(token)
      authStore.setUser(userData)

      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al registrar la cuenta'
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

    loading.value = true

    try {
      const { data } = await api.get<User>(route+'/me')
      const userData = data
      authStore.setUser(userData)
      return true
    } catch (err) {
      deleteAuthToken()
      authStore.setLogout()
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    login,
    register,
    logout,
    fetchMe
  }
}
