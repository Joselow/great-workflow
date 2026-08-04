<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';

import Header from './components/Header.vue';
import ToastLauncher from './commons/ToastLauncher.vue';

import { useAuth } from './composables/useAuth';
import { getAuthToken } from './utils/cookies';
import FullScreenLoader from './commons/FullScreenLoader.vue';

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

// errorToast(`<div><h3 class="font-semibold text-white">Please correct the following errors</h3>
//         <div class="mb-2">
//         <hr class="py-1 px-0 text-gray-200/50">
//           <p class="font-medium text-gray-100 capitalize">phone</p>
//           <ul class="list-disc list-inside text-gray-100"><li>Too small: expected string to have &gt;=6 characters</li></ul>
//         </div>
//       </div>`)
</script>

<template>
  <div class="min-h-screen transition-colors mx-auto">
    <ToastLauncher/>

    <FullScreenLoader
      v-if="isInitializing" />

    <template v-if="!isInitializing && route.meta.requiresAuth">
      <Header
        class="max-w-6xl mx-auto"
        :full="true" @logout="handleLogout" />

      <main class="p-6  w-full">
          <RouterView />
      </main>
    </template>

    <RouterView v-else />
  </div>
</template>
