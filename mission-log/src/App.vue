<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onUnmounted } from 'vue';
import { RouterView, useRoute } from 'vue-router';

import Header from './components/Header.vue';
import ToastLauncher from './commons/ToastLauncher.vue';
import SideBarText from './commons/SideBarText.vue';
import FullScreenLoader from './commons/FullScreenLoader.vue';

import { projectStore } from './store/projectStore';
import { authStore } from './store/authStore';
import { keyboardCommands } from './composables/useKeyboardCommands';

const ProjectDrawer = defineAsyncComponent(() => import('./components/Project/ProjectDrawer.vue'));
const KeyboardShortcutsModal = defineAsyncComponent(() => import('./components/KeyboardShortcutsModal.vue'));

const { renderProjectDrawer } = projectStore;
const { user } = authStore;

const route = useRoute();
const helpOpen = computed(() => keyboardCommands.helpOpen.value);
const { handleKeydown } = keyboardCommands;


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

      <div class="relative flex min-w-0 max-w-full">
        <ProjectDrawer v-if="renderProjectDrawer" />

        <main class="min-w-0 flex-1 overflow-x-hidden p-6 pb-16 md:pb-6 md:pr-0">
          <RouterView />
        </main>

        <SideBarText />
      </div>

      <KeyboardShortcutsModal v-if="helpOpen" />
    </template>

    <RouterView v-else />
  </div>
</template>
