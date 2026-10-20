import { h } from 'vue'
import { RouterView, createRouter, createWebHistory } from 'vue-router'

import { authGuard } from '@/guards/authGuard'
import { projectGuard } from '@/guards/projectGuard'

const sectionOutlet = {
  name: 'SectionOutlet',
  render: () => h(RouterView),
}

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
    alias: '/logger',
    component: () => import('@/views/logs/LogsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/meetings',
    component: sectionOutlet,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'meetings',
        component: () => import('@/views/meetings/MeetingsView.vue'),
      },
      {
        path: 'new',
        name: 'newMeeting',
        component: () => import('@/views/meetings/MeetingFormView.vue'),
      },
      {
        path: ':id',
        name: 'editMeeting',
        component: () => import('@/views/meetings/MeetingFormView.vue'),
      },
    ],
  },
  {
    path: '/cards',
    component: sectionOutlet,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'cards',
        component: () => import('@/views/cards/CardsView.vue'),
      },
      {
        path: 'new',
        name: 'newCard',
        component: () => import('@/views/cards/CardFormView.vue'),
      },
      {
        path: ':id',
        name: 'editCard',
        component: () => import('@/views/cards/CardFormView.vue'),
      },
    ],
  },
  {
    path: '/requirements',
    name: 'requirements',
    component: () => import('@/views/requirements/RequirementsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: () => import('@/views/tasks/TasksView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/action-templates',
    name: 'actionTemplates',
    component: () => import('@/views/actionTemplates/ActionTemplatesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/share-data/:id',
    name: 'publicCard',
    component: () => import('@/views/cards/CardPublicView.vue'),
    meta: { requiresAuth: false },
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

router.beforeEach(authGuard)
router.beforeEach(projectGuard)

export default router
