import { createRouter, createWebHistory } from 'vue-router'

import { getAuthToken } from '@/utils/cookies'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/logs/LogsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/logger',
    name: 'logger',
    component: () => import('@/views/logs/LogsView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const isAuthenticated = Boolean(getAuthToken())

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login' }
  }

  if (!to.meta.requiresAuth && isAuthenticated) {
    return { name: 'home' }
  }
})

export default router
