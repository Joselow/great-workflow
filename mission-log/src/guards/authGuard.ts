import type { NavigationGuard } from 'vue-router'

import { useAuth } from '@/composables/useAuth'
import { authStore } from '@/store/authStore'
import { getAuthToken } from '@/utils/cookies'

const { fetchMe } = useAuth()

export const authGuard: NavigationGuard = async (to) => {
  const hasToken = Boolean(getAuthToken())

  if (!to.meta.requiresAuth) {
    if (to.meta.guestOnly && hasToken) {
      return { name: 'home' }
    }

    return true
  }

  if (!hasToken) {
    return { name: 'login' }
  }

  if (authStore.getUser()) {
    return true
  }

  const sessionLoaded = await fetchMe()

  if (!sessionLoaded) {
    return { name: 'login' }
  }

  return true
}
