import { ref } from 'vue'
import type { User } from '../interfaces'

const user = ref<User | null>(null)
const isAuthenticated = ref(false)

export const useAuthStore = () => {
  const setUser = (userData: User) => {
    user.value = userData
    isAuthenticated.value = true
  }

  const setLogout = () => {
    user.value = null
    isAuthenticated.value = false
  }

  const getUser = () => user.value
  const getIsAuthenticated = () => isAuthenticated.value

  return {
    user: user.value,
    isAuthenticated: isAuthenticated.value,
    setUser,
    setLogout,
    getUser,
    getIsAuthenticated
  }
}

export const authStore = useAuthStore()
