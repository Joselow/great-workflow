<script setup lang="ts">
import { defineAsyncComponent, onMounted, onUnmounted } from 'vue';
import { RouterView, useRoute,    } from 'vue-router';

import Header from './components/Header.vue';
import ToastLauncher from './commons/ToastLauncher.vue';
import SideBarText from './commons/SideBarText.vue';

const ProjectDrawer = defineAsyncComponent(() => import('./components/Project/ProjectDrawer.vue'));

import { projectStore } from './store/projectStore';

import { useAuth } from './composables/useAuth';
import { useProjectSelected } from './composables/useProjectSelected';
import { useProject } from './composables/useProject';
import { getAuthToken } from './utils/cookies';
import FullScreenLoader from './commons/FullScreenLoader.vue';

const { setActiveProject, renderProjectDrawer, drawerOpen, closeDrawer } = projectStore;

const route = useRoute();
const { fetchMe, loading: isInitializing } = useAuth();
const { getStoredActiveProject } = useProjectSelected();
const { showProjectsDrawer } = useProject();


const checkAuth = async () => {
  const token = getAuthToken()

  if (token) {
    await fetchMe();
  }
}

const getActiveProject = async () => {
  const storedProject = getStoredActiveProject()

  if (!storedProject || !storedProject.id) {
    showProjectsDrawer(route.path)
  } else {
    setActiveProject(storedProject)
  }
}

const startApp = async () => {
  checkAuth()
  getActiveProject()
}

startApp()



const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false

  const tag = target.tagName

  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  )
}

const handleKeydown = (event: KeyboardEvent) => {
  if (isTypingTarget(event.target)) return

  const isShiftP =
        event.shiftKey &&
        event.key.toLowerCase() === 'p'

  if (!isShiftP) return
  event.preventDefault()

  if (drawerOpen.value) {
      closeDrawer()
  } else {
      showProjectsDrawer(route.path)
  }
}


onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="min-h-screen max-w-full transition-colors mx-auto">
    <ToastLauncher/>

    <FullScreenLoader
      v-if="isInitializing" />

    <template v-if="!isInitializing && route.meta.requiresAuth">
      <Header
        class="max-w-6xl mx-auto"
        :full="true" />

      <div class="flex min-w-0 max-w-full relative">
        <ProjectDrawer v-if="renderProjectDrawer" />

        <main class="flex-1 w-full min-w-0 p-6 md:pr-0">
          <RouterView />
        </main>

        <SideBarText />
      </div>
    </template>

    <RouterView v-else />
  </div>
</template>
