import { createRouter, createWebHistory } from 'vue-router'

import { getAuthToken } from '@/utils/cookies'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false, guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { requiresAuth: false, guestOnly: true },
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
  {
    path: '/cards',
    name: 'cards',
    component: () => import('@/views/logs/LogsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/projects/new',
    name: 'newProject',
    component: () => import('@/views/projects/ProjectFormView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/projects/:id',
    name: 'editProject',
    component: () => import('@/views/projects/ProjectFormView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { requiresAuth: false },
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

  if (to.meta.guestOnly && isAuthenticated) {
    return { name: 'home' }
  }
})

export default router
