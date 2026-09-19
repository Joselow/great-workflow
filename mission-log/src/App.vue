<script setup lang="ts">
import { defineAsyncComponent, onMounted, onUnmounted } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';

import Header from './components/Header.vue';
import ToastLauncher from './commons/ToastLauncher.vue';
import SideBarText from './commons/SideBarText.vue';
import FullScreenLoader from './commons/FullScreenLoader.vue';

const ProjectDrawer = defineAsyncComponent(() => import('./components/Project/ProjectDrawer.vue'));

import { projectStore } from './store/projectStore';
import { authStore } from './store/authStore';
import { useProject } from './composables/useProject';

const { renderProjectDrawer, drawerOpen, closeDrawer } = projectStore;
const { user } = authStore;

const route = useRoute();
const router = useRouter();

const { showProjectsDrawer } = useProject();

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

  const isShiftC =
        event.shiftKey &&
        event.key.toLowerCase() === 'c'

  const isShiftP =
        event.shiftKey &&
        event.key.toLowerCase() === 'p'


  if (isShiftP) {
    event.preventDefault()
    if (drawerOpen.value) {
      closeDrawer()
    }
    else {
      showProjectsDrawer(route.path)
    } 
  }
  if (isShiftC) {
    event.preventDefault()
    router.push({ name: 'cards' })
    return
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
      v-if="route.meta.requiresAuth && !user" />

    <template v-else-if="route.meta.requiresAuth">
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
