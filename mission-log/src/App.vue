<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';

import Header from './components/Header.vue';
import ToastLauncher from './commons/ToastLauncher.vue';

import { useAuth } from './composables/useAuth';
import { getAuthToken } from './utils/cookies';
import FullScreenLoader from './commons/FullScreenLoader.vue';
import { errorToast } from './composables/useAlerts.ts';

const route = useRoute();
const { logout, fetchMe, loading: isInitializing } = useAuth();

const handleLogout = () => {
  logout();
};


const checkAuth = async () => {
  const token = getAuthToken()

  if (token) {
    fetchMe();
  }
}

checkAuth()
</script>

<template>
  <div class="min-h-screen max-w-full transition-colors mx-auto">
    <ToastLauncher/>

    <FullScreenLoader
      v-if="isInitializing" />

    <template v-if="!isInitializing && route.meta.requiresAuth">
      <Header
        class="max-w-6xl mx-auto"
        :full="true" @logout="handleLogout" />

      <main class="w-full min-w-0 overflow-x-hidden p-6 md:pr-0">
          <RouterView />
      </main>
    </template>

    <RouterView v-else />
  </div>
</template>
