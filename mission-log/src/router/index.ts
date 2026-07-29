import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/logs/LogsView.vue'),
  },
  {
    path: '/logger',
    name: 'logger',
    component: () => import('@/pages/logs/LogsView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
